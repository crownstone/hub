"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Uart = void 0;
const crownstone_uart_1 = require("crownstone-uart");
const PromiseManager_1 = require("./PromiseManager");
const HubEventBus_1 = require("../HubEventBus");
const config_1 = require("../../config");
const Logger_1 = require("../../Logger");
const topics_1 = require("../topics");
const UartHubDataCommunication_1 = require("./UartHubDataCommunication");
const DbReference_1 = require("../Data/DbReference");
const log = Logger_1.Logger(__filename);
class Uart {
    constructor(cloud) {
        this.ready = false;
        this.queue = new PromiseManager_1.PromiseManager();
        this.cloud = cloud;
        this.uart = new crownstone_uart_1.CrownstoneUart();
        this.uart.uart.setMode("HUB");
        this.hubDataHandler = new UartHubDataCommunication_1.UartHubDataCommunication(this.uart);
        this.forwardEvents();
    }
    forwardEvents() {
        // generate a list of topics that can be remapped from uart to lib.
        let eventsToForward = [
            { uartTopic: crownstone_uart_1.UartTopics.MeshServiceData, moduleTopic: topics_1.topics.MESH_SERVICE_DATA },
        ];
        // forward all required events to the module eventbus.
        eventsToForward.forEach((event) => {
            let moduleEvent = event.moduleTopic;
            if (!event.moduleTopic) {
                moduleEvent = event.uartTopic;
            }
            this.uart.on(event.uartTopic, (data) => { HubEventBus_1.eventBus.emit(moduleEvent, data); });
        });
        this.uart.on(crownstone_uart_1.UartTopics.HubDataReceived, (data) => { this.hubDataHandler.handleIncomingHubData(data); });
        this.uart.on(crownstone_uart_1.UartTopics.KeyRequested, () => { this.refreshUartEncryption(); });
    }
    async initialize() {
        try {
            await this.uart.start(config_1.CONFIG.uartPort);
            log.info("Uart is ready");
            this.ready = true;
        }
        catch (err) {
            this.ready = false;
            throw err;
        }
    }
    async refreshUartEncryption() {
        if (!DbReference_1.Dbs.hub) {
            return;
        }
        let hub = await DbReference_1.Dbs.hub.get();
        if (hub) {
            if (hub.uartKey) {
                this.uart.uart.setKey(hub.uartKey);
            }
            // this is done regardless since we might require a new key.
            let macAddress = await this.uart.getMacAddress();
            let uartKey = await this.cloud.hub().getUartKey(macAddress);
            if (uartKey !== (hub === null || hub === void 0 ? void 0 : hub.uartKey) && hub) {
                hub.uartKey = uartKey;
                await DbReference_1.Dbs.hub.save(hub);
            }
            this.uart.uart.setKey(uartKey);
        }
    }
    async switchCrownstones(switchPairs) {
        if (!this.ready) {
            throw "NOT_READY";
        }
        return this.queue.register(() => {
            log.info("Dispatching switchAction", switchPairs);
            return this.uart.switchCrownstones(switchPairs);
        }, "switchCrownstones from Uart" + JSON.stringify(switchPairs));
    }
    registerTrackedDevice(trackingNumber, locationUID, profileId, rssiOffset, ignoreForPresence, tapToToggleEnabled, deviceToken, ttlMinutes) {
        if (!this.ready) {
            throw "NOT_READY";
        }
        this.queue.register(() => {
            return this.uart.registerTrackedDevice(trackingNumber, locationUID, profileId, rssiOffset, ignoreForPresence, tapToToggleEnabled, deviceToken, ttlMinutes);
        });
    }
}
exports.Uart = Uart;
//# sourceMappingURL=Uart.js.map