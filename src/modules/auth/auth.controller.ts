import { BadRequestException, Body, Controller, Get, HttpCode, HttpStatus, Post, Query, ValidationPipe } from '@nestjs/common';
import { RegisterRequestBodyDTO, SigninRequestBodyDTO, VerifyEmailRequestBodyDTO } from './dtos/request.dto';
import { AuthService } from './auth.service';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RegisterCreatedResponseBodyDTO, SigninOkResponseBodyDTO, VerifyEmailOKResponseBodyDTO } from './dtos/response.dto';
import { isEmail } from 'class-validator';
import { Throttle } from '@nestjs/throttler';

@Controller('auth')
@ApiTags("AUTH APIs")
export class AuthController {
    constructor(private authService: AuthService) { }
    @Post("register")
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({summary:"Register new user",description:"Register new user"})
    @ApiCreatedResponse({ type: RegisterCreatedResponseBodyDTO })
    async register(@Body(new ValidationPipe({ transform: true, forbidUnknownValues: true })) bodyData: RegisterRequestBodyDTO) {
        let resData = await this.authService.register(bodyData)
        let dto: RegisterCreatedResponseBodyDTO = {
            statusCode: HttpStatus.CREATED,
            message:"User registered successfully",
            data: resData
        }
        return dto
    }

    @Get("send-email-verification")
    @Throttle({ default: { limit: 3, ttl: 60000 } })
    @ApiOperation({summary:"Send email verification token",description:"Send email verification token"})
    @ApiOkResponse({type:VerifyEmailOKResponseBodyDTO})
    async requestEmailVerification(@Query("email")email:string) {
      if (!isEmail(email)) {
        throw new BadRequestException("query parameter must be a valid email")
      }
      let resData=await  this.authService.sendEmailVerificationEmail({email})
      let dto:VerifyEmailOKResponseBodyDTO={
        statusCode:HttpStatus.OK,
        message:"Email verified successfully",
        data:resData
      }
      return dto
    }

    @Post("verify")
    @ApiOperation({summary:"Verify email address",description:"Verify email address"})
    @ApiOkResponse({type:VerifyEmailOKResponseBodyDTO})
    async verifyEmail(@Body(new ValidationPipe({transform:true}))bodyData:VerifyEmailRequestBodyDTO) {
      let resData=await  this.authService.verifyEmail(bodyData)
      let dto:VerifyEmailOKResponseBodyDTO={
        statusCode:HttpStatus.OK,
        message:"Email verified successfully",
        data:resData
      }
      return dto
    }

    @Post("signin")
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({summary:"Register new user",description:"Register new user"})
    @ApiCreatedResponse({ type: SigninOkResponseBodyDTO })
    async signin(@Body(new ValidationPipe({ transform: true, forbidUnknownValues: true })) bodyData: SigninRequestBodyDTO) {
        let resData = await this.authService.signin(bodyData)
        let dto: SigninOkResponseBodyDTO = {
            statusCode: HttpStatus.CREATED,
            message:"User signed in successfully",
            data: resData
        }
        return dto
    }
}
