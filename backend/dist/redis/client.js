"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redis = void 0;
const redis_1 = require("redis");
class RedisClient {
    constructor() {
        this.isConnected = false;
        const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
        this.client = (0, redis_1.createClient)({ url: redisUrl });
        this.client.on('error', (err) => {
            console.error('Redis Client Error:', err);
            this.isConnected = false;
        });
        this.client.on('connect', () => {
            console.log('✓ Redis connected successfully');
            this.isConnected = true;
        });
    }
    static getInstance() {
        if (!RedisClient.instance) {
            RedisClient.instance = new RedisClient();
        }
        return RedisClient.instance;
    }
    async connect() {
        if (!this.isConnected) {
            await this.client.connect();
        }
    }
    async disconnect() {
        if (this.isConnected) {
            await this.client.quit();
            this.isConnected = false;
        }
    }
    getClient() {
        return this.client;
    }
    async set(key, value, expiryInSeconds) {
        if (expiryInSeconds) {
            await this.client.setEx(key, expiryInSeconds, value);
        }
        else {
            await this.client.set(key, value);
        }
    }
    async get(key) {
        return await this.client.get(key);
    }
    async del(key) {
        await this.client.del(key);
    }
    async exists(key) {
        return (await this.client.exists(key)) === 1;
    }
    async pushToQueue(queue, data) {
        await this.client.rPush(queue, data);
    }
    async popFromQueue(queue) {
        return await this.client.lPop(queue);
    }
}
exports.redis = RedisClient.getInstance();
//# sourceMappingURL=client.js.map