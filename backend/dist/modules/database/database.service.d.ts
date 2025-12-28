import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/postgres-js';
export declare class DatabaseService implements OnModuleInit, OnModuleDestroy {
    private client;
    db: ReturnType<typeof drizzle>;
    constructor();
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    getDb(): import("drizzle-orm/postgres-js").PostgresJsDatabase<Record<string, unknown>>;
}
