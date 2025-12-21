import { ObjectType, Field, ID, registerEnumType, InputType, Int } from '@nestjs/graphql';
import { IsEnum, IsOptional, IsString, IsArray, IsDateString, IsNumber, Min, Max } from 'class-validator';
import { POC } from '../../poc/dto/poc.dto';

export enum Severity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

registerEnumType(Severity, {
  name: 'Severity',
  description: 'CVE severity levels',
});

@ObjectType()
export class CVE {
  @Field(() => ID)
  id: string;

  @Field()
  cveId: string;

  @Field()
  title: string;

  @Field()
  description: string;

  @Field(() => Severity)
  severity: Severity;

  @Field({ nullable: true })
  cvssScore?: string;

  @Field(() => Date, { nullable: true })
  publishedDate?: Date;

  @Field(() => [String], { nullable: true })
  affectedProducts?: string[];

  @Field(() => [String], { nullable: true })
  references?: string[];

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @Field(() => [POC], { nullable: true })
  pocs?: POC[];
}

// POC is imported from poc.dto.ts

@InputType()
export class CreateCVEInput {
  @Field()
  @IsString()
  cveId: string;

  @Field()
  @IsString()
  title: string;

  @Field()
  @IsString()
  description: string;

  @Field(() => Severity)
  @IsEnum(Severity)
  severity: Severity;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  cvssScore?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  publishedDate?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  affectedProducts?: string[];

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  references?: string[];
}

@InputType()
export class UpdateCVEInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  title?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => Severity, { nullable: true })
  @IsOptional()
  @IsEnum(Severity)
  severity?: Severity;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  cvssScore?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  publishedDate?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  affectedProducts?: string[];

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  references?: string[];
}

@InputType()
export class CVEFiltersInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  search?: string;

  @Field(() => Severity, { nullable: true })
  @IsOptional()
  @IsEnum(Severity)
  severity?: Severity;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @Field(() => Int, { nullable: true, defaultValue: 1 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  page?: number;

  @Field(() => Int, { nullable: true, defaultValue: 20 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(1000)
  limit?: number;
}

@ObjectType()
export class CVEListResponse {
  @Field(() => [CVE])
  cves: CVE[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  limit: number;

  @Field(() => Int)
  totalPages: number;
}

@ObjectType()
export class CVESeverityStats {
  @Field(() => Int)
  LOW: number;

  @Field(() => Int)
  MEDIUM: number;

  @Field(() => Int)
  HIGH: number;

  @Field(() => Int)
  CRITICAL: number;
}

@ObjectType()
export class CVEStatistics {
  @Field(() => Int)
  total: number;

  @Field(() => CVESeverityStats)
  bySeverity: CVESeverityStats;

  @Field(() => Int)
  recent: number;
}