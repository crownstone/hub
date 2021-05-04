"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormatAdData = void 0;
const tslib_1 = require("tslib");
const repository_1 = require("@loopback/repository");
let FormatAdData = class FormatAdData extends repository_1.Entity {
};
tslib_1.__decorate([
    repository_1.property({ required: true }),
    tslib_1.__metadata("design:type", String)
], FormatAdData.prototype, "type", void 0);
tslib_1.__decorate([
    repository_1.property({ type: 'number', required: true }),
    tslib_1.__metadata("design:type", Number)
], FormatAdData.prototype, "adType", void 0);
FormatAdData = tslib_1.__decorate([
    repository_1.model()
], FormatAdData);
exports.FormatAdData = FormatAdData;
//# sourceMappingURL=format-ad-data.model.js.map