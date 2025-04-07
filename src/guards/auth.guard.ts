import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as assert from 'assert';
import {  Request, } from 'express';
import { JWTPayload } from '../modules/auth/types';
import { Repository } from 'typeorm';
import { UserAccount } from '../entities/user_account.entity';
import { USER_ACCOUNT_REPOSITORY } from '../entity_provider/constant';

export type AuthUser = {
  email: string;
  id: number;
  is_email_verified:boolean
};

export type AuthRequest = Request & {
  user: AuthUser;
};

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
   @Inject(USER_ACCOUNT_REPOSITORY) private userAccountRepository: Repository<UserAccount>,
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
    let user= await this.userAccountRepository.findOne({where:{
      id:payload.id
    }})
    if (!user) {
      throw new UnauthorizedException('User does not match jwt token');
    }
    console.log(user)
    req.user = {
      id: payload.id,
      email: payload.email,
      is_email_verified:user.is_email_verified
    };
    return true;
  }
}
