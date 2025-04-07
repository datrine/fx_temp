import Mail from "nodemailer/lib/mailer";

export type SendEmailDTO={
    from?: string;
    to: string|string[];
    body: string;
    cc? :string[]
    bcc? :string[]
    subject: string;
    attachments?:Mail.Attachment[]
}