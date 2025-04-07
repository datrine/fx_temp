import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as assert from 'assert';
import {  Request, } from 'express';
import { JWTPayload } from '../modules/auth/types';
import { AuthRequest } from './auth.guard';

@Injectable()
export class EmailVerifiedGuard implements CanActivate {
  constructor(
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    let httpCtx = context.switchToHttp();
    let req = httpCtx.getRequest<AuthRequest>();
    assert(
      req.user,
      new BadRequestException('Authorization required.'),
    );
    if (!req.user.is_email_verified) {
      throw new UnauthorizedException("email not yet verified")
    } 
    return true
  }
}
