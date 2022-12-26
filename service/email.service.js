const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");

class EmailService {
  constructor() {
    //set transporter of nodemailer module
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_ID,
        pass: process.env.MAIL_PASSWORD,
      },
    });
  }
  //send email verification mail
  async sendValidationMail(email) {
    //set expire time
    const expireDate = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
    const info = { email, expireDate };
    //sign info to token
    const token = jwt.sign(info, process.env.JWT_SECRET_KEY);
    //config mail
    const mailOptions = {
      from: `"Upload Download OliveStone" <${process.env.MAIL_ID}>`,
      to: email,
      subject: "인증 요청 이메일",
      html: `<p>아래의 링크를 클릭하여 이메일을 인증해 주세요.</p>
      <a href="${process.env.HOME_PAGE}/verify?token=${token}">${process.env.HOME_PAGE}/verify?token=${token}</a>`,
    };
    //send mail
    const sentMailInfo = await this.transporter.sendMail(mailOptions);
    console.log("mail sent", sentMailInfo);
  }
  //token 안의 내용은 user service로 확인..
  async sendPasswordResetEmail(email, passwordResetToken) {
    //reset token is set from user service and passed as param
    //config mail
    const mailOptions = {
      from: `"Upload Download OliveStone" <${process.env.MAIL_ID}>`,
      to: email,
      subject: "비밀번호 재설정",
      html: `<p>아래의 링크를 클릭하여 비밀번호를 재설정하세요</p>
      <a href="${process.env.HOME_PAGE}/reset-password?token=${passwordResetToken}">${process.env.HOME_PAGE}/reset-password?token=${passwordResetToken}</a>`,
    };
    //send mail
    const sentMailInfo = await this.transporter.sendMail(mailOptions);
    console.log("mail sent", sentMailInfo);
  }
}
const emailService = new EmailService();
module.exports = { emailService };
