"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.executionLogsRelations = exports.pocsRelations = exports.cvesRelations = exports.usersRelations = exports.activityLogs = exports.projects = exports.reports = exports.scans = exports.executionLogs = exports.pocs = exports.cves = exports.users = exports.reportTypeEnum = exports.scanTypeEnum = exports.scanStatusEnum = exports.executionStatusEnum = exports.severityEnum = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
exports.severityEnum = (0, pg_core_1.pgEnum)('severity', ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);
exports.executionStatusEnum = (0, pg_core_1.pgEnum)('execution_status', ['SUCCESS', 'FAILED', 'TIMEOUT', 'RUNNING']);
exports.scanStatusEnum = (0, pg_core_1.pgEnum)('scan_status', ['PENDING', 'RUNNING', 'COMPLETED', 'FAILED']);
exports.scanTypeEnum = (0, pg_core_1.pgEnum)('scan_type', ['QUICK', 'FULL', 'CUSTOM']);
exports.reportTypeEnum = (0, pg_core_1.pgEnum)('report_type', ['SCAN', 'CVE', 'POC', 'CUSTOM']);
exports.users = (0, pg_core_1.pgTable)('users', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    email: (0, pg_core_1.varchar)('email', { length: 255 }).notNull().unique(),
    passwordHash: (0, pg_core_1.text)('password_hash').notNull(),
    name: (0, pg_core_1.varchar)('name', { length: 255 }),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
exports.cves = (0, pg_core_1.pgTable)('cves', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    cveId: (0, pg_core_1.varchar)('cve_id', { length: 50 }).notNull().unique(),
    title: (0, pg_core_1.varchar)('title', { length: 500 }).notNull(),
    description: (0, pg_core_1.text)('description').notNull(),
    severity: (0, exports.severityEnum)('severity').notNull(),
    cvssScore: (0, pg_core_1.decimal)('cvss_score', { precision: 3, scale: 1 }),
    publishedDate: (0, pg_core_1.timestamp)('published_date'),
    affectedProducts: (0, pg_core_1.jsonb)('affected_products').$type(),
    references: (0, pg_core_1.jsonb)('references').$type(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
exports.pocs = (0, pg_core_1.pgTable)('pocs', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    cveId: (0, pg_core_1.uuid)('cve_id').references(() => exports.cves.id, { onDelete: 'cascade' }).notNull(),
    userId: (0, pg_core_1.uuid)('user_id').references(() => exports.users.id, { onDelete: 'cascade' }),
    name: (0, pg_core_1.varchar)('name', { length: 255 }).notNull(),
    description: (0, pg_core_1.text)('description').notNull(),
    language: (0, pg_core_1.varchar)('language', { length: 50 }).notNull(),
    scriptPath: (0, pg_core_1.varchar)('script_path', { length: 500 }).notNull(),
    usageExamples: (0, pg_core_1.text)('usage_examples'),
    author: (0, pg_core_1.varchar)('author', { length: 255 }),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
exports.executionLogs = (0, pg_core_1.pgTable)('execution_logs', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    pocId: (0, pg_core_1.uuid)('poc_id').references(() => exports.pocs.id, { onDelete: 'cascade' }).notNull(),
    userId: (0, pg_core_1.uuid)('user_id').references(() => exports.users.id, { onDelete: 'cascade' }).notNull(),
    targetUrl: (0, pg_core_1.varchar)('target_url', { length: 500 }),
    command: (0, pg_core_1.text)('command'),
    output: (0, pg_core_1.text)('output'),
    status: (0, exports.executionStatusEnum)('status').notNull(),
    executedAt: (0, pg_core_1.timestamp)('executed_at').defaultNow().notNull(),
});
exports.scans = (0, pg_core_1.pgTable)('scans', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    name: (0, pg_core_1.varchar)('name', { length: 255 }).notNull(),
    target: (0, pg_core_1.varchar)('target', { length: 500 }).notNull(),
    type: (0, exports.scanTypeEnum)('type').notNull(),
    status: (0, exports.scanStatusEnum)('status').notNull().default('PENDING'),
    results: (0, pg_core_1.jsonb)('results'),
    startedAt: (0, pg_core_1.timestamp)('started_at'),
    completedAt: (0, pg_core_1.timestamp)('completed_at'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
exports.reports = (0, pg_core_1.pgTable)('reports', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    title: (0, pg_core_1.varchar)('title', { length: 255 }).notNull(),
    type: (0, exports.reportTypeEnum)('type').notNull(),
    content: (0, pg_core_1.jsonb)('content').notNull(),
    generatedBy: (0, pg_core_1.varchar)('generated_by', { length: 255 }),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
});
exports.projects = (0, pg_core_1.pgTable)('projects', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    name: (0, pg_core_1.varchar)('name', { length: 255 }).notNull(),
    description: (0, pg_core_1.text)('description'),
    status: (0, pg_core_1.varchar)('status', { length: 50 }).notNull().default('ACTIVE'),
    metadata: (0, pg_core_1.jsonb)('metadata'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
exports.activityLogs = (0, pg_core_1.pgTable)('activity_logs', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    action: (0, pg_core_1.varchar)('action', { length: 255 }).notNull(),
    entity: (0, pg_core_1.varchar)('entity', { length: 100 }).notNull(),
    entityId: (0, pg_core_1.uuid)('entity_id'),
    details: (0, pg_core_1.jsonb)('details'),
    performedBy: (0, pg_core_1.varchar)('performed_by', { length: 255 }),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
});
exports.usersRelations = (0, drizzle_orm_1.relations)(exports.users, ({ many }) => ({
    pocs: many(exports.pocs),
}));
exports.cvesRelations = (0, drizzle_orm_1.relations)(exports.cves, ({ many }) => ({
    pocs: many(exports.pocs),
}));
exports.pocsRelations = (0, drizzle_orm_1.relations)(exports.pocs, ({ one, many }) => ({
    cve: one(exports.cves, {
        fields: [exports.pocs.cveId],
        references: [exports.cves.id],
    }),
    user: one(exports.users, {
        fields: [exports.pocs.userId],
        references: [exports.users.id],
    }),
    executionLogs: many(exports.executionLogs),
}));
exports.executionLogsRelations = (0, drizzle_orm_1.relations)(exports.executionLogs, ({ one }) => ({
    poc: one(exports.pocs, {
        fields: [exports.executionLogs.pocId],
        references: [exports.pocs.id],
    }),
}));
//# sourceMappingURL=schema.js.map