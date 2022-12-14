const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_ID,
        pass: process.env.MAIL_PASSWORD,
      },
    });
  }
  async sendValidationMail(email) {
    // const expireDate = new Date(new Date().getTime() + 1000 * 10);
    const expireDate = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
    const info = { email, expireDate };
    const token = jwt.sign(info, process.env.JWT_SECRET_KEY);
    const mailOptions = {
      from: `"Upload Download OliveStone" <${process.env.MAIL_ID}>`,
      to: email,
      subject: "Verification Email",
      html: `<p>Please click the link below to verify your email address:</p>
      <a href="${process.env.HOME_PAGE}/verify?token=${token}">${process.env.HOME_PAGE}/verify?token=${token}</a>`,
    };
    const sentMailInfo = await this.transporter.sendMail(mailOptions);
    console.log("mail sent", sentMailInfo);
  }
  //token 안의 내용은 user service로 확인..
  async sendPasswordResetEmail(email, passwordResetToken) {
    const mailOptions = {
      from: `"Upload Download OliveStone" <${process.env.MAIL_ID}>`,
      to: email,
      subject: "Password Reset",
      html: `<p>Follow this link below to reset your password</p>
      <a href="${process.env.HOME_PAGE}/reset-password?token=${passwordResetToken}">${process.env.HOME_PAGE}/reset-password?token=${passwordResetToken}</a>`,
    };
    const sentMailInfo = await this.transporter.sendMail(mailOptions);
    console.log("mail sent", sentMailInfo);
  }
}
const emailService = new EmailService();
module.exports = { emailService };
