import { ObjectType, Field, ID, InputType, registerEnumType, Int } from '@nestjs/graphql';
import { IsString, IsOptional, IsEnum, IsUrl, IsObject, IsInt, Min } from 'class-validator';
import { CVE } from '../../cve/dto/cve.dto';

// Forward reference to avoid circular dependency
// CVE is imported from cve.dto.ts

export enum ExecutionStatus {
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  TIMEOUT = 'TIMEOUT',
  RUNNING = 'RUNNING',
}

registerEnumType(ExecutionStatus, {
  name: 'ExecutionStatus',
  description: 'POC execution status',
});

@ObjectType()
export class POC {
  @Field(() => ID)
  id: string;

  @Field()
  cveId: string;

  @Field()
  name: string;

  @Field()
  description: string;

  @Field()
  language: string;

  @Field()
  scriptPath: string;

  @Field({ nullable: true })
  usageExamples?: string;

  @Field({ nullable: true })
  author?: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => CVE, { nullable: true })
  cve?: CVE;

  @Field(() => [ExecutionLog], { nullable: true })
  executionLogs?: ExecutionLog[];
}

@ObjectType()
export class ExecutionLog {
  @Field(() => ID)
  id: string;

  @Field()
  pocId: string;

  @Field({ nullable: true })
  targetUrl?: string;

  @Field({ nullable: true })
  command?: string;

  @Field({ nullable: true })
  output?: string;

  @Field(() => ExecutionStatus)
  status: ExecutionStatus;

  @Field()
  executedAt: Date;

  @Field(() => POC, { nullable: true })
  poc?: POC;
}

@InputType()
export class CreatePOCInput {
  @Field()
  @IsString()
  cveId: string;

  @Field()
  @IsString()
  name: string;

  @Field()
  @IsString()
  description: string;

  @Field()
  @IsString()
  language: string;

  @Field()
  @IsString()
  scriptPath: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  usageExamples?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  author?: string;
}

@InputType()
export class UpdatePOCInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  language?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  scriptPath?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  usageExamples?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  author?: string;
}

@InputType()
export class ExecutePOCInput {
  @Field()
  @IsString()
  targetUrl: string;

  @Field()
  @IsString()
  command: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsObject()
  additionalParams?: string; // JSON string
}

@ObjectType()
export class ExecutionResult {
  @Field()
  success: boolean;

  @Field()
  output: string;

  @Field({ nullable: true })
  error?: string;
}

@ObjectType()
export class ExecuteResponse {
  @Field()
  message: string;

  @Field(() => ExecutionResult)
  result: ExecutionResult;

  @Field(() => ExecutionLog)
  log: ExecutionLog;
}

@InputType()
export class POCFiltersInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  cveId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  language?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  author?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  search?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  offset?: number;
}

@ObjectType()
export class POCListResponse {
  @Field(() => [POC])
  pocs: POC[];

  @Field(() => Int)
  total: number;
}