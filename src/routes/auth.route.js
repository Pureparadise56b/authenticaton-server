const { Router } = require("express");
const AuthController = require("../controllers/auth.controller");
const {
  registerEmailValidator,
  verifyUserEmailValidator,
  createUserValidator,
  checkEmailExistsValidator,
  loginUserValidator,
  resendOtpHandlerValidator,
  forgetPasswordHandlerValidator,
  resetUserPasswordValidator,
} = require("../validator");

const validate = require("../validator/validate");
const AuthMiddleware = require("../middlewares/auth.middleware");
const CsrfMiddleware = require("../middlewares/csrf.middleware");

class AuthRouter {
  router;
  controller;
  authMiddleware;
  csrfMiddleware;
  constructor() {
    this.controller = new AuthController();
    this.authMiddleware = new AuthMiddleware();
    this.csrfMiddleware = new CsrfMiddleware();
    this.router = Router();
    this.registerRoutes = this.registerRoutes.bind(this);
  }

  registerRoutes() {
    this.router.route("/csrf").get(this.controller.getCsrfToken);

    this.router
      .route("/email/check")
      .get(
        checkEmailExistsValidator(),
        validate,
        this.controller.checkEmailExists
      );

    this.router
      .route("/email/register")
      .post(
        this.csrfMiddleware.preventCsrf,
        registerEmailValidator(),
        validate,
        this.controller.registerUserEmail
      );

    this.router
      .route("/email/verify")
      .post(
        this.csrfMiddleware.preventCsrf,
        verifyUserEmailValidator(),
        validate,
        this.controller.verifyUserEmail
      );

    this.router
      .route("/email/resend")
      .post(
        this.csrfMiddleware.preventCsrf,
        resendOtpHandlerValidator(),
        validate,
        this.controller.resendOtpHandler
      );

    this.router
      .route("/challenge/pwd")
      .post(
        this.csrfMiddleware.preventCsrf,
        createUserValidator(),
        validate,
        this.controller.createNewUser
      );

    this.router
      .route("/login/email")
      .post(
        this.csrfMiddleware.preventCsrf,
        loginUserValidator(),
        validate,
        this.controller.loginUser
      );

    this.router
      .route("/pwd/forget")
      .post(
        this.csrfMiddleware.preventCsrf,
        forgetPasswordHandlerValidator(),
        validate,
        this.controller.forgetPasswordHandler
      );

    this.router
      .route("/pwd/reset")
      .post(
        this.csrfMiddleware.preventCsrf,
        resetUserPasswordValidator(),
        validate,
        this.controller.resetUserPassword
      );

    this.router
      .route("/token/renew")
      .post(
        this.csrfMiddleware.preventCsrf,
        this.controller.generateNewAccessToken
      );

    this.router
      .route("/logout")
      .post(
        this.csrfMiddleware.preventCsrf,
        this.authMiddleware.forAuthenticatedUser,
        this.controller.logoutUser
      );

    return this.router;
  }
}

module.exports = AuthRouter;
