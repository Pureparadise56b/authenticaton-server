const { createTransport } = require("nodemailer");
const { MAIL_USER, MAIL_PASSWORD, CLIENT_URL } = require("../variables");
const { readFileSync } = require("fs");
const { resolve } = require("path");

class MailUtil {
  /**
   * @type {import("nodemailer").Transporter}
   */
  transporter;

  /**
   * @type {string}
   */
  otpTemplate;

  /**
   * @type {string}
   */
  forgetPasswordTemplate;

  constructor() {
    this.otpTemplate = readFileSync(
      resolve(__dirname, "..", "template", "otp.html"),
      {
        encoding: "utf-8",
      }
    );

    this.forgetPasswordTemplate = readFileSync(
      resolve(__dirname, "..", "template", "forget-password.html"),
      {
        encoding: "utf-8",
      }
    );

    this.transporter = createTransport({
      service: "gmail",
      auth: {
        user: MAIL_USER,
        pass: MAIL_PASSWORD,
      },
    });

    this.sendOtpMail = this.sendOtpMail.bind(this);
    this.sendForgetPasswordMail = this.sendForgetPasswordMail.bind(this);
  }

  /**
   *
   * @param {{to: string, subject:string, otp: string}} param0
   * @returns {Promise<boolean>}
   */
  async sendOtpMail({ to, subject, otp }) {
    try {
      const modifiedTemplate = this.otpTemplate
        .replace("{{otp}}", otp)
        .replace("{{email}}", to);

      await this.transporter.sendMail({
        to,
        from: MAIL_USER,
        subject,
        text: `your otp is ${otp}`,
        html: modifiedTemplate,
      });

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   *
   * @param {{to: string, subject:string, resetToken: string}} param0
   * @returns {Promise<boolean>}
   */
  async sendForgetPasswordMail({ to, subject, resetToken }) {
    try {
      const resetLink = `${CLIENT_URL}/auth/reset-password/${resetToken}`;

      const modifiedTemplate = this.forgetPasswordTemplate
        .replace("{{email}}", to)
        .replace("{{resetLink}}", resetLink);

      await this.transporter.sendMail({
        to,
        subject,
        from: MAIL_USER,
        text: `your reset token link is ${resetLink}`,
        html: modifiedTemplate,
      });
      return true;
    } catch (error) {
      return false;
    }
  }
}

module.exports = MailUtil;
