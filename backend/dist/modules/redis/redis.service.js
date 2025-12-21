"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisService = void 0;
const common_1 = require("@nestjs/common");
const redis_1 = require("redis");
let RedisService = class RedisService {
    async onModuleInit() {
        try {
            this.client = (0, redis_1.createClient)({
                url: process.env.REDIS_URL || 'redis://localhost:6379',
            });
            this.client.on('error', (err) => {
                console.warn('Redis Client Error:', err.message);
            });
            this.client.on('connect', () => {
                console.log('✓ Redis connected');
            });
            await this.client.connect();
        }
        catch (error) {
            console.warn('⚠ Redis is not available. Running without Redis caching.');
            console.warn('  To enable Redis, start a Redis server on localhost:6379');
            this.client = null;
        }
    }
    async onModuleDestroy() {
        if (this.client) {
            await this.client.disconnect();
            console.log('✓ Redis disconnected');
        }
    }
    getClient() {
        return this.client;
    }
    async get(key) {
        if (!this.client)
            return null;
        return this.client.get(key);
    }
    async set(key, value, ttl) {
        if (!this.client)
            return;
        if (ttl) {
            await this.client.setEx(key, ttl, value);
        }
        else {
            await this.client.set(key, value);
        }
    }
    async del(key) {
        if (!this.client)
            return;
        await this.client.del(key);
    }
    async exists(key) {
        if (!this.client)
            return false;
        return (await this.client.exists(key)) === 1;
    }
};
exports.RedisService = RedisService;
exports.RedisService = RedisService = __decorate([
    (0, common_1.Injectable)()
], RedisService);
//# sourceMappingURL=redis.service.js.map