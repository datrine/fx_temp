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

export type AuthUser = {
  email: string;
  id: number;
};

export type AuthRequest = Request & {
  user: AuthUser;
};

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    let httpCtx = context.switchToHttp();
    let req = httpCtx.getRequest<AuthRequest>();
    assert(
      req.headers['authorization'],
      new BadRequestException('Authorization required'),
    );
    let accessToken = req.headers['authorization'].split(' ')[1];
    if (!accessToken) {
      throw new UnauthorizedException('Bearer token is required');
    }

    let payload = this.jwtService.verify<JWTPayload>(accessToken, {
      secret: process.env.JWT_TOKEN_SECRET,
    });
    req.user = {
      id: payload.id,
      email: payload.email,
    };
    return true;
  }
}
