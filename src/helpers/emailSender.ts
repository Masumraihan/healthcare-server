import nodemailer from "nodemailer";
import config from "../config";

const emailSender = async (email: string, html: string) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // Use `true` for port 465, `false` for all other ports
    auth: {
      user: config.emailSender.email,
      pass: config.emailSender.app_pass,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  const info = await transporter.sendMail({
    from: '"Health Care 👻" <masumraihan3667@gmail.email>', // sender address
    to: email, // list of receivers
    subject: "Health Care Reset Password Link", // Subject line
    //text: "Hello world?", // plain text body
    html,
  });

  console.log("Message sent: %s", info.messageId);
};

export default emailSender;
