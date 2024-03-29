"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HubDataParser = void 0;
const crownstone_core_1 = require("crownstone-core");
const HubProtocol_1 = require("../HubProtocol");
const HubDataParsers_1 = require("./HubDataParsers");
class HubDataParser {
    constructor(data) {
        this.valid = true;
        this.raw = data;
        this.parse();
    }
    parse() {
        let stepper = new crownstone_core_1.DataStepper(this.raw);
        this.protocol = stepper.getUInt8();
        this.dataType = stepper.getUInt16();
        switch (this.dataType) {
            case HubProtocol_1.HubDataType.SETUP:
                return (0, HubDataParsers_1.parseHubSetup)(this, stepper);
            case HubProtocol_1.HubDataType.REQUEST_DATA:
                return (0, HubDataParsers_1.parseRequestData)(this, stepper);
            case HubProtocol_1.HubDataType.FACTORY_RESET:
                return (0, HubDataParsers_1.parseFactoryResetData)(this, stepper);
            case HubProtocol_1.HubDataType.FACTORY_RESET_HUB_ONLY:
                return (0, HubDataParsers_1.parseFactoryResetHubOnlyData)(this, stepper);
        }
    }
}
exports.HubDataParser = HubDataParser;
//# sourceMappingURL=HubData.js.map