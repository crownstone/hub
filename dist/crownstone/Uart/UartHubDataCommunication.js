"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UartHubDataCommunication = void 0;
const HubData_1 = require("../../protocol/rx/HubData");
const HubProtocol_1 = require("../../protocol/HubProtocol");
const DbReference_1 = require("../Data/DbReference");
const crownstone_cloud_1 = require("crownstone-cloud");
const HubDataReply_1 = require("../../protocol/tx/HubDataReply");
const HubEventBus_1 = require("../HubEventBus");
const topics_1 = require("../topics");
const Logger_1 = require("../../Logger");
const CrownstoneUtil_1 = require("../CrownstoneUtil");
const crownstone_core_1 = require("crownstone-core");
const log = Logger_1.Logger(__filename);
class UartHubDataCommunication {
    constructor(uart) {
        this.uart = uart;
    }
    handleIncomingHubData(data) {
        let parsed = new HubData_1.HubDataParser(data);
        if (parsed.valid) {
            if (parsed.result.type === HubProtocol_1.HubDataType.SETUP) {
                this.handleSetup(parsed.result);
            }
            else if (parsed.result.type === HubProtocol_1.HubDataType.REQUEST_DATA) {
                this.handleDataRequest(parsed.result);
            }
            else if (parsed.result.type === HubProtocol_1.HubDataType.FACTORY_RESET) {
                this.handleFactoryResetRequest(parsed.result);
            }
        }
    }
    async handleSetup(setupPacket) {
        if (await DbReference_1.Dbs.hub.isSet() === false) {
            let cloud = new crownstone_cloud_1.CrownstoneCloud();
            try {
                await cloud.hubLogin(setupPacket.cloudId, setupPacket.token);
            }
            catch (e) {
                // could not log in.
                log.warn("Could not setup, Login failed.", e);
                return this.uart.hub.dataReply(HubDataReply_1.HubDataReplyError(HubProtocol_1.HubReplyError.INVALID_TOKEN), crownstone_core_1.ResultValue.SUCCESS);
            }
            try {
                let hubCloudData = await cloud.hub().data();
                await DbReference_1.Dbs.hub.create({
                    name: hubCloudData.name,
                    token: setupPacket.token,
                    cloudId: setupPacket.cloudId,
                    sphereId: hubCloudData.sphereId,
                });
                HubEventBus_1.eventBus.emit(topics_1.topics.HUB_CREATED);
                return this.uart.hub.dataReply(HubDataReply_1.HubDataReplySuccess(), crownstone_core_1.ResultValue.SUCCESS);
            }
            catch (e) {
                // could not log in.
                log.warn("Could not setup, something went wrong.", e);
                return this.uart.hub.dataReply(HubDataReply_1.HubDataReplyError(HubProtocol_1.HubReplyError.UNKNOWN), crownstone_core_1.ResultValue.SUCCESS);
            }
        }
        else {
            log.warn("Could not setup, this hub is already owned.");
            this.uart.hub.dataReply(HubDataReply_1.HubDataReplyError(HubProtocol_1.HubReplyError.NOT_IN_SETUP_MODE), crownstone_core_1.ResultValue.SUCCESS);
        }
    }
    async handleDataRequest(requestPacket) {
        if (requestPacket.requestedType === HubProtocol_1.HubRequestDataType.CLOUD_ID) {
            if (await DbReference_1.Dbs.hub.isSet() === false) {
                return this.uart.hub.dataReply(HubDataReply_1.HubDataReplyError(HubProtocol_1.HubReplyError.IN_SETUP_MODE), crownstone_core_1.ResultValue.SUCCESS);
            }
            else {
                if (await DbReference_1.Dbs.hub.isSet()) {
                    let hub = await DbReference_1.Dbs.hub.get();
                    return this.uart.hub.dataReply(HubDataReply_1.HubDataReplyString(requestPacket.requestedType, String(hub === null || hub === void 0 ? void 0 : hub.cloudId)), crownstone_core_1.ResultValue.SUCCESS);
                }
                // no hub or no cloudId.
                return this.uart.hub.dataReply(HubDataReply_1.HubDataReplyError(HubProtocol_1.HubReplyError.IN_SETUP_MODE), crownstone_core_1.ResultValue.SUCCESS);
            }
        }
    }
    async handleFactoryResetRequest(requestPacket) {
        try {
            await CrownstoneUtil_1.CrownstoneUtil.deleteCrownstoneHub(true);
            return this.uart.hub.dataReply(HubDataReply_1.HubDataReplySuccess(), crownstone_core_1.ResultValue.SUCCESS);
        }
        catch (e) {
            log.warn("Could not factory reset this hub.", e);
            this.uart.hub.dataReply(HubDataReply_1.HubDataReplyError(HubProtocol_1.HubReplyError.NOT_IN_SETUP_MODE), crownstone_core_1.ResultValue.SUCCESS);
        }
    }
}
exports.UartHubDataCommunication = UartHubDataCommunication;
//# sourceMappingURL=UartHubDataCommunication.js.map