const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");

const sendValidationMail = async (receiverMailAddress) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL_ID,
      pass: process.env.MAIL_PASSWORD,
    },
  });
  const email = receiverMailAddress;
  // const expireDate = new Date(new Date().getTime() + 1000 * 10);
  const expireDate = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
  const info = { email, expireDate };
  const token = jwt.sign(info, process.env.JWT_SECRET_KEY);
  const mailOptions = {
    from: `"Upload Download OliveStone" <${process.env.MAIL_ID}>`,
    to: receiverMailAddress,
    subject: "Verification Email",
    html: `<p>Please click the link below to verify your email address:</p>
    <a href="${process.env.HOME_PAGE}/verify?token=${token}">${process.env.HOME_PAGE}/verify?token=${token}</a>`,
  };
  const sentMailInfo = await transporter.sendMail(mailOptions);
  console.log("mail sent", sentMailInfo);
};

module.exports = sendValidationMail;
