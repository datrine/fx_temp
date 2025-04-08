import { BadRequestException, ConflictException, Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { UserAccount } from '../../entities/user_account.entity';
import { TOKEN_REPOSITORY, USER_ACCOUNT_REPOSITORY } from '../../entity_provider/constant';
import { Repository } from 'typeorm';
import { comparePasswordWithHash, createPasswordHash, generateToken } from '../../utils/fn';
import { JWTPayload, SiginInUserResult, UserRegisteredEventPayloadType } from './types';
import { JwtService } from '@nestjs/jwt';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { EmailService } from '../dependency/email/email.service';
import { Token, TokenScope } from '../../entities/token.entity';
import { UserRegisteredEvent } from './events';
import { DateTime } from 'luxon';
import { SendEmailDTO } from '../dependency/email/dto';
import { WalletService } from '../wallet/wallet.service';

@Injectable()
export class AuthService {
    constructor(
        @Inject(USER_ACCOUNT_REPOSITORY) private userAccountRepository: Repository<UserAccount>,
        @Inject(TOKEN_REPOSITORY) private tokenRepository: Repository<Token>,
        private eventEmitter: EventEmitter2,
        private jwtService: JwtService, 
        private walletService: WalletService, 
        private emailService: EmailService) { }

    async register({ email, password }: { email: string; password: string }) {
        let user_found = await this.userAccountRepository.findOne({ where: { email } })
        if (user_found) {
            throw new ConflictException("email aleady exists")
        }
        let password_hash = await createPasswordHash(password)
        let user_saved = await this.userAccountRepository.save({
            email,
            password_hash,
            is_email_verified: false
        })
        let event_payload: UserRegisteredEventPayloadType = {
            id:user_saved.id,
            email
        }
        this.eventEmitter.emit(UserRegisteredEvent, event_payload)
        return this.sanitizeUser(user_saved)
    }

    async signin({ email, password }: { email: string; password: string }): Promise<SiginInUserResult> {
        let user_found = await this.userAccountRepository.findOne({ where: { email } })
        if (!user_found) {
            throw new NotFoundException("email/password not found")
        }
        let matched = await comparePasswordWithHash(password, user_found.password_hash);
        if (!matched) {
            throw new NotFoundException("email/password not found")
        }

        let payload: JWTPayload = {
            id: user_found.id,
            email: user_found.email
        }
        let token = this.jwtService.sign(payload)
        let sanitized = this.sanitizeUser(user_found)
        return { access_token: token, ...sanitized }
    }

    // send email verification email
    async sendEmailVerificationEmail({ email, }: { email: string; }) {
        let ttl = 15
        let user_saved = await this.userAccountRepository.findOne({ where: { email } })
        if (!user_saved) {
            throw new NotFoundException("user not found")
        }
        if (user_saved.is_email_verified) {
            throw new ConflictException("user email already verified")
        }
        let token = generateToken(6)
        let expires_at = DateTime.now().plus({ minute: ttl })
        try {
            await this.tokenRepository.save({
                token,
                expires_at,
                scope: TokenScope.EMAIL_VERIFICATION,
                recipient: email
            })
        } catch (error) {
            console.log(error)
            throw new InternalServerErrorException("failed to set up email token")
        }

        let email_payload: SendEmailDTO = {
            to: email,
            subject: "Email verification (Fx Trading)",
            body: `<h1>Hello Customer</h1>,
            <p>Please verify your email with this token<p/>
            <p><strong>${token}</strong></p>
            `
        }
        try {
            let send_res = await this.emailService.send(email_payload)
            if (!send_res) {
                throw new Error("failed to send email")
            }
        } catch (error) {
            console.log(error)
            throw new InternalServerErrorException("failed to send email")
        }
        return this.sanitizeUser(user_saved)
    }

    async verifyEmail({ email, token }: { email: string; token: string }) {
        let token_in_rec=await this.tokenRepository.findOneBy({
            token,
            scope:TokenScope.EMAIL_VERIFICATION,
            recipient:email
        })
        if (!token_in_rec) {
            throw new BadRequestException("token is invalid")
        }
        if (token_in_rec.expires_at.getTime()<new Date().getTime()) {
            throw new BadRequestException("token has expired")
        }
        if (token_in_rec.is_used) {
            throw new BadRequestException("token cannot be reused")
        }
        let user_saved = await this.userAccountRepository.findOne({ where: { email } })
        if (!user_saved) {
            throw new NotFoundException("user not found")
        }
        user_saved.is_email_verified = true
        token_in_rec.is_used=true
        await this.userAccountRepository.save(user_saved)
        await this.tokenRepository.save(token_in_rec)
        return this.sanitizeUser(user_saved)
    }

    sanitizeUser(user: UserAccount): Omit<UserAccount, "password_hash"> {
        let { password_hash, ...rest } = user
        return rest
    }

    @OnEvent(UserRegisteredEvent, { async: true })
    async handleUserRegistered(payload: UserRegisteredEventPayloadType) {
       await this.sendEmailVerificationEmail({ email: payload.email })
       await this.walletService.createUserWallet(payload.id)
    }
}
