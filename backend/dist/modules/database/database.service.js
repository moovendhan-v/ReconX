"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseService = void 0;
const common_1 = require("@nestjs/common");
const postgres_js_1 = require("drizzle-orm/postgres-js");
const postgres = require("postgres");
const schema = require("../../db/schema");
let DatabaseService = class DatabaseService {
    async onModuleInit() {
        const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/bughunting';
        this.client = postgres(connectionString, {
            max: 10,
            idle_timeout: 20,
            connect_timeout: 10,
        });
        this.db = (0, postgres_js_1.drizzle)(this.client, { schema });
        console.log('✓ Database connected');
    }
    async onModuleDestroy() {
        if (this.client) {
            await this.client.end();
            console.log('✓ Database disconnected');
        }
    }
    getDb() {
        return this.db;
    }
};
exports.DatabaseService = DatabaseService;
exports.DatabaseService = DatabaseService = __decorate([
    (0, common_1.Injectable)()
], DatabaseService);
//# sourceMappingURL=database.service.js.map