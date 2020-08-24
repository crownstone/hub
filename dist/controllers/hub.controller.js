"use strict";
// Uncomment these imports to begin using these cool features!
Object.defineProperty(exports, "__esModule", { value: true });
exports.HubController = void 0;
const tslib_1 = require("tslib");
// import {inject} from '@loopback/context';
const repository_1 = require("@loopback/repository");
const rest_1 = require("@loopback/rest");
const hub_repository_1 = require("../repositories/hub.repository");
const hub_model_1 = require("../models/hub.model");
const EventBus_1 = require("../crownstone/EventBus");
const topics_1 = require("../crownstone/topics");
const repositories_1 = require("../repositories");
const CrownstoneHub_1 = require("../crownstone/CrownstoneHub");
/**
 * This controller will echo the state of the hub.
 */
let HubController = class HubController {
    constructor(hubRepo, userRepo) {
        this.hubRepo = hubRepo;
        this.userRepo = userRepo;
    }
    // returns a list of our objects
    async createHub(newHub) {
        if (await this.hubRepo.isSet() === false) {
            return this.hubRepo.create(newHub)
                .then(() => {
                EventBus_1.eventBus.emit(topics_1.topics.HUB_CREATED);
            });
        }
        else {
            throw new rest_1.HttpErrors.Forbidden("Hub already created and initialized.");
        }
    }
    // returns a list of our objects
    async updateHub(editedHub) {
        let currentHub = await this.hubRepo.get();
        if (currentHub === null) {
            return this.hubRepo.create(editedHub)
                .then(() => {
                EventBus_1.eventBus.emit(topics_1.topics.HUB_CREATED);
            });
        }
        else {
            if (editedHub.cloudId) {
                currentHub.cloudId = editedHub.cloudId;
            }
            if (editedHub.name) {
                currentHub.name = editedHub.name;
            }
            if (editedHub.token) {
                currentHub.token = editedHub.token;
            }
            return this.hubRepo.update(currentHub)
                .then(() => {
                EventBus_1.eventBus.emit(topics_1.topics.HUB_CREATED);
            });
        }
    }
    async delete() {
        if (await this.hubRepo.isSet() === false) {
            EventBus_1.eventBus.emit(topics_1.topics.HUB_DELETED);
            await CrownstoneHub_1.CrownstoneHub.cleanupAndDestroy();
        }
        else {
            throw new rest_1.HttpErrors.Forbidden("Hub already created and initialized.");
        }
    }
};
tslib_1.__decorate([
    rest_1.post('/hub'),
    tslib_1.__param(0, rest_1.requestBody({
        content: { 'application/json': { schema: rest_1.getModelSchemaRef(hub_model_1.Hub, { title: 'newHub', exclude: ['id', 'uartKey', 'accessToken', 'accessTokenExpiration'] }) } },
    })),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], HubController.prototype, "createHub", null);
tslib_1.__decorate([
    rest_1.patch('/hub'),
    tslib_1.__param(0, rest_1.requestBody({
        content: { 'application/json': { schema: rest_1.getModelSchemaRef(hub_model_1.Hub, { title: 'newHub', exclude: ['id', 'uartKey', 'accessToken', 'accessTokenExpiration'] }) } },
    })),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], HubController.prototype, "updateHub", null);
tslib_1.__decorate([
    rest_1.del('/hub'),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", Promise)
], HubController.prototype, "delete", null);
HubController = tslib_1.__decorate([
    tslib_1.__param(0, repository_1.repository(hub_repository_1.HubRepository)),
    tslib_1.__param(1, repository_1.repository(repositories_1.UserRepository)),
    tslib_1.__metadata("design:paramtypes", [hub_repository_1.HubRepository,
        repositories_1.UserRepository])
], HubController);
exports.HubController = HubController;
//# sourceMappingURL=hub.controller.js.map