import { Field, InputType, ObjectType, Int, registerEnumType } from '@nestjs/graphql';
import { IsString, IsOptional, IsEnum, IsInt, Min } from 'class-validator';
import GraphQLJSON from 'graphql-type-json';

export enum ReportType {
    SCAN = 'SCAN',
    CVE = 'CVE',
    POC = 'POC',
    CUSTOM = 'CUSTOM',
}

registerEnumType(ReportType, { name: 'ReportType' });

@ObjectType()
export class Report {
    @Field()
    id: string;

    @Field()
    title: string;

    @Field(() => ReportType)
    type: ReportType;

    @Field(() => GraphQLJSON)
    content: any;

    @Field({ nullable: true })
    generatedBy?: string;

    @Field(() => Date)
    createdAt: Date;
}

@InputType()
export class CreateReportInput {
    @Field()
    @IsString()
    title: string;

    @Field(() => ReportType)
    @IsEnum(ReportType)
    type: ReportType;

    @Field(() => GraphQLJSON)
    content: any;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    generatedBy?: string;
}

@InputType()
export class ReportFiltersInput {
    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    search?: string;

    @Field(() => ReportType, { nullable: true })
    @IsOptional()
    @IsEnum(ReportType)
    type?: ReportType;

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
export class ReportListResponse {
    @Field(() => [Report])
    reports: Report[];

    @Field(() => Int)
    total: number;
}
