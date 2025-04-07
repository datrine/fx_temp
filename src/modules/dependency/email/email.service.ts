import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { SendEmailDTO } from './dto';

@Injectable()
export class EmailService {
    host: string
    port: number
    username: string
    password: string
    transporter: nodemailer.Transporter
    constructor() {
        let host = process.env.EMAIL_SERVER || "smtp.gmail.com"
        let port = parseInt(process.env.EMAIL_PORT ? process.env.EMAIL_PORT : "587")
        let username = process.env.EMAIL_USERNAME || ""
        let password = process.env.EMAIL_PASSWORD || ""

        this.transporter = nodemailer.createTransport({
            host,
            port,
            secure: true,
            auth: {
                user: username,
                pass: password,
            },
        } as SMTPTransport.Options);
    }
    async verifyConnection() {
        let transporter = nodemailer.createTransport({
            host: this.host,
            port: 465,
            secure: true,
            auth: {
                user: this.username,
                pass: this.password,
            },
        } as SMTPTransport.Options);
        console.log(await transporter.verify());
    }
    async send(payload: SendEmailDTO) {
        try {
            let default_sender = process.env.EMAIL_SENDER
            console.log(await this.transporter.verify());
            console.log({default_sender})
            const info = await this.transporter.sendMail({
                from: payload.from ?? default_sender,
                to: payload.to,
                cc: payload.cc,
                subject: payload.subject,
                html: payload.body, attachments: payload.attachments
            });
            console.log({ info: info.messageId });
            return true;
        } catch (error) {
            console.log(error)
        }
    }
}