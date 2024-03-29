"use strict";
// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/example-express-composition
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpressServer = void 0;
const tslib_1 = require("tslib");
const events_1 = require("events");
const express_1 = tslib_1.__importDefault(require("express"));
const https_1 = tslib_1.__importDefault(require("https"));
const cors_1 = tslib_1.__importDefault(require("cors"));
const path_1 = tslib_1.__importDefault(require("path"));
const application_1 = require("./application");
const fs_1 = tslib_1.__importDefault(require("fs"));
const VerifyCertificates_1 = require("./security/VerifyCertificates");
const Logger_1 = require("./Logger");
const ApplyCustomRoutes_1 = require("./customRoutes/ApplyCustomRoutes");
const HubUtil_1 = require("./util/HubUtil");
const log = (0, Logger_1.Logger)(__filename);
const config = {
    rest: {
        // Use the LB4 application as a route. It should not be listening.
        listenOnStart: false,
    },
};
class ExpressServer {
    constructor(options = {}) {
        this.app = (0, express_1.default)();
        this.lbApp = new application_1.CrownstoneHubApplication(config);
        this.app.use((0, cors_1.default)());
        // Expose the front-end assets via Express, not as LB4 route
        this.app.use('/api', this.lbApp.requestHandler);
        (0, ApplyCustomRoutes_1.applyCustomRoutes)(this.app, this.lbApp);
        // Custom Express routes
        this.app.get('/', function (_req, res) {
            res.sendFile(path_1.default.join(__dirname, '../public/https/index.html'));
        });
        // Serve static files in the public folder
        this.app.use(express_1.default.static(path_1.default.join(__dirname, '../public/https')));
    }
    async boot() {
        await this.lbApp.boot();
    }
    async start() {
        await this.lbApp.start();
        (0, application_1.updateControllersBasedOnConfig)(this.lbApp);
        const port = this.lbApp.restServer.config.port;
        let path = await (0, VerifyCertificates_1.verifyCertificate)();
        let httpsOptions = {
            protocol: 'https',
            key: fs_1.default.readFileSync(path + '/key.pem'),
            cert: fs_1.default.readFileSync(path + '/cert.pem'),
        };
        this.server = https_1.default.createServer(httpsOptions, this.app).listen(port, () => {
            let ipAddress = (0, HubUtil_1.getIpAddress)();
            log.info(`Hub is available at https://${ipAddress}:${port}`);
        });
        await (0, events_1.once)(this.server, 'listening');
    }
    // For testing purposes
    async stop() {
        if (!this.server)
            return;
        await this.lbApp.stop();
        this.server.close();
        await (0, events_1.once)(this.server, 'close');
        this.server = undefined;
    }
}
exports.ExpressServer = ExpressServer;
//# sourceMappingURL=server.js.map