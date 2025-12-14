import { pgTable, uuid, varchar, text, timestamp, decimal, jsonb, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const severityEnum = pgEnum('severity', ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);
export const executionStatusEnum = pgEnum('execution_status', ['SUCCESS', 'FAILED', 'TIMEOUT', 'RUNNING']);

// CVEs Table
export const cves = pgTable('cves', {
  id: uuid('id').defaultRandom().primaryKey(),
  cveId: varchar('cve_id', { length: 50 }).notNull().unique(),
  title: varchar('title', { length: 500 }).notNull(),
  description: text('description').notNull(),
  severity: severityEnum('severity').notNull(),
  cvssScore: decimal('cvss_score', { precision: 3, scale: 1 }),
  publishedDate: timestamp('published_date'),
  affectedProducts: jsonb('affected_products').$type<string[]>(),
  references: jsonb('references').$type<string[]>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// POCs Table
export const pocs = pgTable('pocs', {
  id: uuid('id').defaultRandom().primaryKey(),
  cveId: uuid('cve_id').references(() => cves.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description').notNull(),
  language: varchar('language', { length: 50 }).notNull(),
  scriptPath: varchar('script_path', { length: 500 }).notNull(),
  usageExamples: text('usage_examples'),
  author: varchar('author', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Execution Logs Table
export const executionLogs = pgTable('execution_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  pocId: uuid('poc_id').references(() => pocs.id, { onDelete: 'cascade' }).notNull(),
  targetUrl: varchar('target_url', { length: 500 }),
  command: text('command'),
  output: text('output'),
  status: executionStatusEnum('status').notNull(),
  executedAt: timestamp('executed_at').defaultNow().notNull(),
});

// Relations
export const cvesRelations = relations(cves, ({ many }) => ({
  pocs: many(pocs),
}));

export const pocsRelations = relations(pocs, ({ one, many }) => ({
  cve: one(cves, {
    fields: [pocs.cveId],
    references: [cves.id],
  }),
  executionLogs: many(executionLogs),
}));

export const executionLogsRelations = relations(executionLogs, ({ one }) => ({
  poc: one(pocs, {
    fields: [executionLogs.pocId],
    references: [pocs.id],
  }),
}));

// Types
export type CVE = typeof cves.$inferSelect;
export type NewCVE = typeof cves.$inferInsert;
export type POC = typeof pocs.$inferSelect;
export type NewPOC = typeof pocs.$inferInsert;
export type ExecutionLog = typeof executionLogs.$inferSelect;
export type NewExecutionLog = typeof executionLogs.$inferInsert;
