"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processPair = exports.minuteInterval = void 0;
const DbReference_1 = require("../data/DbReference");
const Logger_1 = require("../../Logger");
const log = (0, Logger_1.Logger)(__filename);
const INTERPOLATION_THRESHOLD = 5;
function minuteInterval(timestamp) {
    return new Date(timestamp).setSeconds(0, 0);
}
exports.minuteInterval = minuteInterval;
async function processPair(previousPoint, nextPoint, intervalData, samples) {
    if (previousPoint.processed === false) {
        await processSinglePoint(previousPoint, intervalData.calculateSamplePoint, samples);
    }
    await processDataPairSingleNew(previousPoint, nextPoint, intervalData.calculateSamplePoint, intervalData.intervalMs, samples);
}
exports.processPair = processPair;
/**
 * This method is only used if there is no history available. This is the first point.
 * We only have to check if it is exactly at a sample interval.
 * @param previousPoint
 */
async function processSinglePoint(datapoint, calculateSamplePoint, samples) {
    let prevTime = datapoint.timestamp.valueOf();
    let correspondingSamplePoint = calculateSamplePoint(prevTime);
    if (prevTime === correspondingSamplePoint) {
        samples.push({ stoneUID: Number(datapoint.stoneUID), energyUsage: datapoint.energyUsage, timestamp: new Date(correspondingSamplePoint), uploaded: false });
    }
    datapoint.correctedEnergyUsage = datapoint.energyUsage;
    datapoint.processed = true;
    await DbReference_1.Dbs.energy.update(datapoint).catch((e) => { log.error("Error persisting processed boolean on datapoint", e); });
}
async function processDataPairSingleNew(previouslyProcessedPoint, nextDatapoint, calculateSamplePoint, sampleIntervalMs, samples) {
    let nextTimestamp = nextDatapoint.timestamp.valueOf();
    let nextValue = nextDatapoint.energyUsage;
    let previousTimestamp = previouslyProcessedPoint.timestamp.valueOf();
    let previousRawValue = previouslyProcessedPoint.energyUsage;
    let previousValue = previouslyProcessedPoint.correctedEnergyUsage;
    let offsetValue = previousValue - previouslyProcessedPoint.energyUsage;
    let previousSamplePoint = calculateSamplePoint(previousTimestamp);
    let nextSamplePoint = calculateSamplePoint(nextTimestamp);
    let timeSinceLastSamplePoint = nextTimestamp - previousTimestamp;
    // if energyAtPoint is larger than the offsetValue, we just accept the new measurement.
    // if it is smaller, we will add the energyAtPoint to the offsetValue.
    // The reason here is that we will assume a reset, and that the energy from 0 to energyAtPoint is consumed.
    // This can miss a second reboot when we're not listening.
    // TODO: check if the difference is within the thresold of negative usage, then accept that we have negative usage.
    if (nextValue < previousRawValue * 0.9) { // we compare with raw, since previousValue has the offset included.
        nextValue += previousValue;
    }
    else {
        nextValue += offsetValue;
    }
    // if after the initial correction above the nextValue is still lower than the previous value, ignore the decrease and make them equal.
    // We do not support decreases in energy at this point. Doing this here is important, since it is also sort of handled below in the dJ calculation,
    // because nextValue is used to store the correctedEnergyUsage in the wrap up method.
    if (nextValue < previousValue) {
        nextValue = previousValue;
    }
    async function wrapUp() {
        nextDatapoint.processed = true;
        nextDatapoint.correctedEnergyUsage = nextValue;
        await DbReference_1.Dbs.energy.update(nextDatapoint).catch((e) => { log.error("Error persisting processed boolean on datapoint", e); });
    }
    // we sample every 1 minute, on the minute.
    // we only have to interpolate the point if:
    //   - the previous point is before the minute, and the current is equal or after the minute
    //   - in this case, the previous and the current are both in the same bucket. Process
    if (previousTimestamp > nextSamplePoint) {
        await wrapUp();
        return;
    }
    // We will now check how many sample points have elapsed since last sample time and current sample time.
    // we ceil this since, if we are here, we know that the sample point is in between these points.
    let elapsedSamplePoints = Math.ceil((nextSamplePoint - previousSamplePoint) / sampleIntervalMs); // ms
    // If more than 5 points have elapsed, we do not do anything WITH the prev and mark the prev as processed.
    // We do have to consider if the current is exactly ON the sample interval.
    if (elapsedSamplePoints > INTERPOLATION_THRESHOLD) {
        if (nextTimestamp === nextSamplePoint) {
            samples.push({ stoneUID: nextDatapoint.stoneUID, energyUsage: nextValue, timestamp: new Date(nextSamplePoint), uploaded: false });
        }
        await wrapUp();
        log.debug("Gap is too large. Mark as processed.");
        return;
    }
    // if less than 5 have elapsed, we do a linear interpolation, one for each point
    else {
        // Before processing, we check if the current is larger or equal than the previous.
        // If it is not, we assume that a reset has taken place.
        //       -- IF CURRENT < PREV with more than 1000J (diff is about 20W for a minute) or 25% of the previous value. If the previous value is large, we require a larger jump
        //               -- reset, so dJ = currentJ. Current has started again from 0, so usage is the current value.
        //       -- IF CURRENT < PREV with less than 1000J
        //               -- negative drift, flatten to 0J used.
        //       -- IF CURRENT >= PREV
        //               -- calculate dJ
        let dJ = nextValue - previousValue;
        if (dJ < -1 * Math.max(0.25 * previousValue, 1000)) {
            dJ = nextValue;
        }
        if (dJ <= 0) {
            dJ = 0;
        }
        else {
            // we just use dJ
        }
        let dJms = dJ / timeSinceLastSamplePoint;
        // @IMPROVEMENT:
        // use the pointPowerUsage on prev and on current to more accurately estimate interpolated points.
        // for now, use linear.
        for (let j = 0; j < elapsedSamplePoints; j++) {
            let samplePoint = previousSamplePoint + (1 + j) * sampleIntervalMs;
            let dt = samplePoint - previousTimestamp;
            let energyAtPoint = previousValue + dt * dJms;
            samples.push({ stoneUID: nextDatapoint.stoneUID, energyUsage: Math.round(energyAtPoint), timestamp: new Date(samplePoint), uploaded: false });
        }
    }
    await wrapUp();
}
//# sourceMappingURL=EnergyProcessor.js.map