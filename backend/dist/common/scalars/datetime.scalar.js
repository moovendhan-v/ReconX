"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DateTimeScalar = void 0;
const graphql_1 = require("@nestjs/graphql");
const graphql_2 = require("graphql");
let DateTimeScalar = class DateTimeScalar {
    constructor() {
        this.description = 'Date custom scalar type';
    }
    parseValue(value) {
        if (typeof value === 'string' || typeof value === 'number') {
            return new Date(value);
        }
        throw new Error('Invalid date value');
    }
    serialize(value) {
        if (value instanceof Date) {
            return value.toISOString();
        }
        if (typeof value === 'string') {
            return new Date(value).toISOString();
        }
        throw new Error('Invalid date value for serialization');
    }
    parseLiteral(ast) {
        if (ast.kind === graphql_2.Kind.INT) {
            return new Date(parseInt(ast.value, 10));
        }
        if (ast.kind === graphql_2.Kind.STRING) {
            return new Date(ast.value);
        }
        throw new Error('Invalid date literal');
    }
};
exports.DateTimeScalar = DateTimeScalar;
exports.DateTimeScalar = DateTimeScalar = __decorate([
    (0, graphql_1.Scalar)('DateTime', () => Date)
], DateTimeScalar);
//# sourceMappingURL=datetime.scalar.js.map