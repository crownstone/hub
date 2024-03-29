"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.main = exports.CrownstoneHubApplication = void 0;
const application_1 = require("./application");
Object.defineProperty(exports, "CrownstoneHubApplication", { enumerable: true, get: function () { return application_1.CrownstoneHubApplication; } });
const repositories_1 = require("./repositories");
const DbReference_1 = require("./crownstone/data/DbReference");
const CrownstoneHub_1 = require("./crownstone/CrownstoneHub");
// import {MongoDbConnector} from './datasources/mongoDriver';
const server_1 = require("./server");
const Logger_1 = require("./Logger");
const energy_data_processed_repository_1 = require("./repositories/hub-specific/energy-data-processed.repository");
const mongoDriver_1 = require("./datasources/mongoDriver");
const server_public_1 = require("./server_public");
const ConfigUtil_1 = require("./util/ConfigUtil");
const asset_repository_1 = require("./repositories/cloud/asset.repository");
const asset_filter_repository_1 = require("./repositories/cloud/asset-filter.repository");
const asset_filter_set_repository_1 = require("./repositories/cloud/asset-filter-set.repository");
const webhook_repository_1 = require("./repositories/hub-specific/webhook.repository");
const log = (0, Logger_1.Logger)(__filename);
Error.stackTraceLimit = 100;
async function main(options = {}) {
    (0, application_1.updateLoggingBasedOnConfig)();
    log.info(`Creating Server...`);
    const server = new server_1.ExpressServer();
    log.info(`Server Booting...`);
    await server.boot();
    log.info(`Server starting...`);
    await server.start();
    log.info(`Server started.`);
    let portConfig = (0, ConfigUtil_1.getPortConfig)();
    if (portConfig.enableHttp !== false) {
        const httpServer = new server_public_1.PublicExpressServer({}, server.lbApp);
        await httpServer.start();
    }
    log.info(`Creating Database References...`);
    DbReference_1.Dbs.dbInfo = await server.lbApp.getRepository(repositories_1.DatabaseInfoRepository);
    DbReference_1.Dbs.hub = await server.lbApp.getRepository(repositories_1.HubRepository);
    DbReference_1.Dbs.power = await server.lbApp.getRepository(repositories_1.PowerDataRepository);
    DbReference_1.Dbs.energy = await server.lbApp.getRepository(repositories_1.EnergyDataRepository);
    DbReference_1.Dbs.energyProcessed = await server.lbApp.getRepository(energy_data_processed_repository_1.EnergyDataProcessedRepository);
    DbReference_1.Dbs.user = await server.lbApp.getRepository(repositories_1.UserRepository);
    DbReference_1.Dbs.userPermission = await server.lbApp.getRepository(repositories_1.UserPermissionRepository);
    DbReference_1.Dbs.switches = await server.lbApp.getRepository(repositories_1.SwitchDataRepository);
    DbReference_1.Dbs.sphereFeatures = await server.lbApp.getRepository(repositories_1.SphereFeatureRepository);
    DbReference_1.Dbs.assets = await server.lbApp.getRepository(asset_repository_1.AssetRepository);
    DbReference_1.Dbs.assetFilters = await server.lbApp.getRepository(asset_filter_repository_1.AssetFilterRepository);
    DbReference_1.Dbs.assetFilterSets = await server.lbApp.getRepository(asset_filter_set_repository_1.AssetFilterSetRepository);
    DbReference_1.Dbs.webhooks = await server.lbApp.getRepository(webhook_repository_1.WebhookRepository);
    await migrate();
    await maintainIndexes();
    log.info(`Initializing CrownstoneHub...`);
    await CrownstoneHub_1.CrownstoneHub.initialize();
    //
    // console.log(`Server is running at ${host}:${port}`);
    log.info(`Server initialized!`);
    // setTimeout(() => { app.controller(MeshController)}, 10000)
    return server.lbApp;
    ;
}
exports.main = main;
async function migrate() {
    console.time("migrate");
    let databaseInfo = await DbReference_1.Dbs.dbInfo.findOne();
    if (databaseInfo === null) {
        await DbReference_1.Dbs.dbInfo.create({ version: 0 });
        databaseInfo = await DbReference_1.Dbs.dbInfo.findOne();
    }
    // this won't happen but it makes the typescript happy!
    if (databaseInfo === null) {
        return;
    }
    if (databaseInfo.version === 0) {
        let noIntervalCount = await DbReference_1.Dbs.energyProcessed.count();
        if (noIntervalCount.count > 0) {
            await DbReference_1.Dbs.energyProcessed.updateAll({ interval: "1m" });
        }
        databaseInfo.version = 1;
        await DbReference_1.Dbs.dbInfo.update(databaseInfo);
    }
    console.timeEnd("migrate");
}
async function maintainIndexes() {
    const connector = new mongoDriver_1.MongoDbConnector();
    await connector.connect();
    const processedEnergyCollection = connector.db.collection('EnergyDataProcessed');
    console.time('index');
    processedEnergyCollection.createIndexes([
        { key: { stoneUID: 1, interval: 1 } },
        { key: { stoneUID: 1, interval: 1, timestamp: 1 } },
        { key: { stoneUID: 1, interval: 1, timestamp: -1 } },
    ]);
    console.timeEnd('index');
}
//# sourceMappingURL=index.js.map