"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const graphql_1 = require("@nestjs/graphql");
const apollo_1 = require("@nestjs/apollo");
const config_1 = require("@nestjs/config");
const path_1 = require("path");
const cve_module_1 = require("./modules/cve/cve.module");
const poc_module_1 = require("./modules/poc/poc.module");
const database_module_1 = require("./modules/database/database.module");
const redis_module_1 = require("./modules/redis/redis.module");
const health_module_1 = require("./modules/health/health.module");
const notifications_module_1 = require("./modules/notifications/notifications.module");
const scans_module_1 = require("./modules/scans/scans.module");
const reports_module_1 = require("./modules/reports/reports.module");
const projects_module_1 = require("./modules/projects/projects.module");
const activity_module_1 = require("./modules/activity/activity.module");
const auth_module_1 = require("./modules/auth/auth.module");
const datetime_scalar_1 = require("./common/scalars/datetime.scalar");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            graphql_1.GraphQLModule.forRoot({
                driver: apollo_1.ApolloDriver,
                autoSchemaFile: (0, path_1.join)(process.cwd(), 'src/schema.gql'),
                sortSchema: true,
                playground: true,
                introspection: true,
                context: ({ req, res }) => ({ req, res }),
                formatError: (error) => {
                    console.error('GraphQL Error:', error);
                    return {
                        message: error.message,
                        code: error.extensions?.code,
                        path: error.path,
                    };
                },
            }),
            database_module_1.DatabaseModule,
            redis_module_1.RedisModule,
            auth_module_1.AuthModule,
            cve_module_1.CveModule,
            poc_module_1.PocModule,
            scans_module_1.ScansModule,
            reports_module_1.ReportsModule,
            projects_module_1.ProjectsModule,
            activity_module_1.ActivityModule,
            health_module_1.HealthModule,
            notifications_module_1.NotificationsModule,
        ],
        providers: [datetime_scalar_1.DateTimeScalar],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map