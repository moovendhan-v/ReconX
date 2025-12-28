import { Field, InputType, ObjectType, Int, Float, registerEnumType } from '@nestjs/graphql';
import { IsString, IsOptional, IsEnum, IsUUID, IsInt, Min, IsNumber } from 'class-validator';
import GraphQLJSON from 'graphql-type-json';

export enum ScanType {
    QUICK = 'QUICK',
    FULL = 'FULL',
    CUSTOM = 'CUSTOM',
}

export enum ScanStatus {
    PENDING = 'PENDING',
    RUNNING = 'RUNNING',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED',
}

export enum PortState {
    OPEN = 'open',
    CLOSED = 'closed',
    FILTERED = 'filtered',
}

registerEnumType(ScanType, { name: 'ScanType' });
registerEnumType(ScanStatus, { name: 'ScanStatus' });
registerEnumType(PortState, { name: 'PortState' });

@ObjectType()
export class SubdomainResult {
    @Field()
    subdomain: string;

    @Field(() => [String])
    ip: string[];

    @Field()
    discovered_at: string;
}

@ObjectType()
export class PortResult {
    @Field()
    subdomain: string;

    @Field(() => Int)
    port: number;

    @Field()
    service: string;

    @Field(() => PortState)
    state: PortState;

    @Field()
    discovered_at: string;
}

@ObjectType()
export class Scan {
    @Field()
    id: string;

    @Field()
    name: string;

    @Field()
    target: string;

    @Field(() => ScanType)
    type: ScanType;

    @Field(() => ScanStatus)
    status: ScanStatus;

    @Field(() => Float, { nullable: true })
    progress?: number;

    @Field(() => GraphQLJSON, { nullable: true })
    results?: any;

    @Field(() => [SubdomainResult], { nullable: true })
    subdomains?: SubdomainResult[];

    @Field(() => [PortResult], { nullable: true })
    openPorts?: PortResult[];

    @Field({ nullable: true })
    error?: string;

    @Field(() => Date, { nullable: true })
    startedAt?: Date;

    @Field(() => Date, { nullable: true })
    completedAt?: Date;

    @Field(() => Date)
    createdAt: Date;

    @Field(() => Date)
    updatedAt: Date;
}

@InputType()
export class CreateScanInput {
    @Field()
    @IsString()
    name: string;

    @Field()
    @IsString()
    target: string;

    @Field(() => ScanType)
    @IsEnum(ScanType)
    type: ScanType;
}

@InputType()
export class UpdateScanInput {
    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    name?: string;

    @Field(() => ScanStatus, { nullable: true })
    @IsOptional()
    @IsEnum(ScanStatus)
    status?: ScanStatus;

    @Field(() => GraphQLJSON, { nullable: true })
    @IsOptional()
    results?: any;
}

@InputType()
export class ScanFiltersInput {
    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    search?: string;

    @Field(() => ScanStatus, { nullable: true })
    @IsOptional()
    @IsEnum(ScanStatus)
    status?: ScanStatus;

    @Field(() => ScanType, { nullable: true })
    @IsOptional()
    @IsEnum(ScanType)
    type?: ScanType;

    @Field(() => Int, { nullable: true, defaultValue: 20 })
    @IsOptional()
    @IsInt()
    @Min(1)
    limit?: number;

    @Field(() => Int, { nullable: true, defaultValue: 0 })
    @IsOptional()
    @IsInt()
    @Min(0)
    offset?: number;
}

@ObjectType()
export class ScanListResponse {
    @Field(() => [Scan])
    scans: Scan[];

    @Field(() => Int)
    total: number;
}
