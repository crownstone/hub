"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnergyData = void 0;
const tslib_1 = require("tslib");
const repository_1 = require("@loopback/repository");
let EnergyData = class EnergyData extends repository_1.Entity {
    constructor(data) {
        super(data);
    }
};
tslib_1.__decorate([
    repository_1.property({ type: 'string', id: true }),
    tslib_1.__metadata("design:type", String)
], EnergyData.prototype, "id", void 0);
tslib_1.__decorate([
    repository_1.property({ type: 'number', required: true, index: true }),
    tslib_1.__metadata("design:type", Number)
], EnergyData.prototype, "stoneUID", void 0);
tslib_1.__decorate([
    repository_1.property({ type: 'number' }),
    tslib_1.__metadata("design:type", Number)
], EnergyData.prototype, "energyUsage", void 0);
tslib_1.__decorate([
    repository_1.property({ type: 'date', index: true }),
    tslib_1.__metadata("design:type", Date)
], EnergyData.prototype, "timestamp", void 0);
tslib_1.__decorate([
    repository_1.property({ type: 'boolean', index: true }),
    tslib_1.__metadata("design:type", Boolean)
], EnergyData.prototype, "uploaded", void 0);
EnergyData = tslib_1.__decorate([
    repository_1.model(),
    tslib_1.__metadata("design:paramtypes", [Object])
], EnergyData);
exports.EnergyData = EnergyData;
//# sourceMappingURL=energy-data.model.js.map