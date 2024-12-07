const { body, cookie, query } = require("express-validator");
const { REGISTRATION_COOKIE_NAME } = require("../variables");

function registerEmailValidator() {
  return [
    body("email")
      .isEmail()
      .withMessage("Invalid email")
      .notEmpty()
      .withMessage("Email is required"),
    body("username").notEmpty().withMessage("Username is required"),
  ];
}

function checkEmailExistsValidator() {
  return [
    query("id")
      .isEmail()
      .withMessage("Invalid email id")
      .notEmpty()
      .withMessage("email is required"),
  ];
}

function verifyUserEmailValidator() {
  return [
    body("otp")
      .notEmpty()
      .withMessage("Otp is required")
      .isLength({
        min: 6,
        max: 6,
      })
      .withMessage("Invalid Otp"),
    cookie(REGISTRATION_COOKIE_NAME)
      .notEmpty()
      .withMessage("Invalid session id"),
  ];
}

function createUserValidator() {
  return [
    body("password").notEmpty().withMessage("password is required"),
    cookie(REGISTRATION_COOKIE_NAME)
      .notEmpty()
      .withMessage("Invalid session id"),
  ];
}

function loginUserValidator() {
  return [
    body("password").notEmpty().withMessage("password is required"),
    body("email")
      .isEmail()
      .withMessage("Invalid email")
      .notEmpty()
      .withMessage("Email is required"),
  ];
}

function resendOtpHandlerValidator() {
  return [
    cookie(REGISTRATION_COOKIE_NAME)
      .notEmpty()
      .withMessage("Invalid session id"),
  ];
}

function forgetPasswordHandlerValidator() {
  return [
    body("email")
      .isEmail()
      .withMessage("Invalid email")
      .notEmpty()
      .withMessage("Email is required"),
  ];
}

function resetUserPasswordValidator() {
  return [
    body("resetToken").notEmpty().withMessage("reset token is required"),
    body("newPassword").notEmpty().withMessage("new password is required"),
  ];
}

module.exports = {
  registerEmailValidator,
  verifyUserEmailValidator,
  createUserValidator,
  checkEmailExistsValidator,
  loginUserValidator,
  resendOtpHandlerValidator,
  forgetPasswordHandlerValidator,
  resetUserPasswordValidator,
};
