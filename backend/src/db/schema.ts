import { pgTable, uuid, varchar, text, timestamp, decimal, jsonb, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const severityEnum = pgEnum('severity', ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);
export const executionStatusEnum = pgEnum('execution_status', ['SUCCESS', 'FAILED', 'TIMEOUT', 'RUNNING']);
export const scanStatusEnum = pgEnum('scan_status', ['PENDING', 'RUNNING', 'COMPLETED', 'FAILED']);
export const scanTypeEnum = pgEnum('scan_type', ['QUICK', 'FULL', 'CUSTOM']);
export const reportTypeEnum = pgEnum('report_type', ['SCAN', 'CVE', 'POC', 'CUSTOM']);

// Users Table
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: varchar('name', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

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
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
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
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  targetUrl: varchar('target_url', { length: 500 }),
  command: text('command'),
  output: text('output'),
  status: executionStatusEnum('status').notNull(),
  executedAt: timestamp('executed_at').defaultNow().notNull(),
});

// Scans Table
export const scans = pgTable('scans', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  target: varchar('target', { length: 500 }).notNull(),
  type: scanTypeEnum('type').notNull(),
  status: scanStatusEnum('status').notNull().default('PENDING'),
  results: jsonb('results'),
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Reports Table
export const reports = pgTable('reports', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  type: reportTypeEnum('type').notNull(),
  content: jsonb('content').notNull(),
  generatedBy: varchar('generated_by', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Projects Table
export const projects = pgTable('projects', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  status: varchar('status', { length: 50 }).notNull().default('ACTIVE'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Activity Logs Table
export const activityLogs = pgTable('activity_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  action: varchar('action', { length: 255 }).notNull(),
  entity: varchar('entity', { length: 100 }).notNull(),
  entityId: uuid('entity_id'),
  details: jsonb('details'),
  performedBy: varchar('performed_by', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  pocs: many(pocs),
}));

export const cvesRelations = relations(cves, ({ many }) => ({
  pocs: many(pocs),
}));

export const pocsRelations = relations(pocs, ({ one, many }) => ({
  cve: one(cves, {
    fields: [pocs.cveId],
    references: [cves.id],
  }),
  user: one(users, {
    fields: [pocs.userId],
    references: [users.id],
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
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type CVE = typeof cves.$inferSelect;
export type NewCVE = typeof cves.$inferInsert;
export type POC = typeof pocs.$inferSelect;
export type NewPOC = typeof pocs.$inferInsert;
export type ExecutionLog = typeof executionLogs.$inferSelect;
export type NewExecutionLog = typeof executionLogs.$inferInsert;
export type Scan = typeof scans.$inferSelect;
export type NewScan = typeof scans.$inferInsert;
export type Report = typeof reports.$inferSelect;
export type NewReport = typeof reports.$inferInsert;
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type NewActivityLog = typeof activityLogs.$inferInsert;
