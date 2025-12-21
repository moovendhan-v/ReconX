import { Field, InputType, ObjectType, Int, registerEnumType } from '@nestjs/graphql';
import { IsString, IsOptional, IsEnum, IsUUID, IsInt, Min } from 'class-validator';
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

registerEnumType(ScanType, { name: 'ScanType' });
registerEnumType(ScanStatus, { name: 'ScanStatus' });

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

    @Field(() => GraphQLJSON, { nullable: true })
    results?: any;

    @Field({ nullable: true })
    startedAt?: Date;

    @Field({ nullable: true })
    completedAt?: Date;

    @Field()
    createdAt: Date;

    @Field()
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
