import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import type { User } from '../../db/schema';

export const CurrentUser = createParamDecorator(
    (data: unknown, context: ExecutionContext): User => {
        const ctx = GqlExecutionContext.create(context);
        return ctx.getContext().req.user;
    },
);
