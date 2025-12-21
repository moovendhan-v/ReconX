export declare class HealthController {
    check(): {
        status: string;
        timestamp: string;
        uptime: number;
    };
}
export declare class HealthResolver {
    health(): string;
}
