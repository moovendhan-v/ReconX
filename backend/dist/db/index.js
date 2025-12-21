"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.schema = exports.db = void 0;
const postgres_js_1 = require("drizzle-orm/postgres-js");
const postgres_1 = require("postgres");
const schema = require("./schema");
exports.schema = schema;
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/bughunting';
const client = (0, postgres_1.default)(connectionString, { max: 10 });
exports.db = (0, postgres_js_1.drizzle)(client, { schema });
//# sourceMappingURL=index.js.map