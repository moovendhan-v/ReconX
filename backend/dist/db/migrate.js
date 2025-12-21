"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const postgres_js_1 = require("drizzle-orm/postgres-js");
const migrator_1 = require("drizzle-orm/postgres-js/migrator");
const postgres_1 = require("postgres");
const runMigrations = async () => {
    const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/bughunting';
    const sql = (0, postgres_1.default)(connectionString, { max: 1 });
    const db = (0, postgres_js_1.drizzle)(sql);
    console.log('Running migrations...');
    await (0, migrator_1.migrate)(db, { migrationsFolder: './drizzle' });
    console.log('Migrations completed!');
    await sql.end();
    process.exit(0);
};
runMigrations().catch((err) => {
    console.error('Migration failed!', err);
    process.exit(1);
});
//# sourceMappingURL=migrate.js.map