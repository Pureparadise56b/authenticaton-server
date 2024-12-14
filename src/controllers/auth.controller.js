const AsyncRequestHandler = require("../utils/web/RequestHandler.util");
const redisClient = require("../configs/redis.config");
const {
  hashPassword,
  comparePassword,
  generateOtp,
  generateSessionId,
  TokenUtils,
} = require("../utils/miscellaneous.util");
const {
  PROJECT_ENVIRONMENT,
  CLIENT_DOMAIN,
  REGISTRATION_COOKIE_NAME,
  USER_AUTH_COOKIE_NAME,
  USER_REFRESH_TOKEN_NAME,
  CSRF_TOKEN_COOKIE_NAME,
  CSRF_TOKEN_HEADER_NAME,
  CLIENT_GET_PASSWORD_PAGE,
  CLIENT_OTP_VERIFY_PAGE,
  HTTP_STATUS,
} = require("../variables");
const UserRepo = require("../repository/user.repository");
const AccountRepo = require("../repository/account.repository");
const MailUtil = require("../utils/mail.util");

class AuthController {
  registrationCookieName;
  userRepo;
  accountRepo;
  tokenUtils;
  mailUtils;

  constructor() {
    this.userRepo = new UserRepo();
    this.accountRepo = new AccountRepo();
    this.tokenUtils = new TokenUtils();
    this.mailUtils = new MailUtil();

    this.registerUserEmail = this.registerUserEmail.bind(this);
    this.checkEmailExists = this.checkEmailExists.bind(this);
    this.verifyUserEmail = this.verifyUserEmail.bind(this);
    this.createNewUser = this.createNewUser.bind(this);
    this.resendOtpHandler = this.resendOtpHandler.bind(this);
    this.loginUser = this.loginUser.bind(this);
    this.generateNewAccessToken = this.generateNewAccessToken.bind(this);
    this.forgetPasswordHandler = this.forgetPasswordHandler.bind(this);
    this.resetUserPassword = this.resetUserPassword.bind(this);
    this.logoutUser = this.logoutUser.bind(this);
  }

  // creation of an user
  registerUserEmail = AsyncRequestHandler(async (req, res, next) => {
    // get email and username from the request body
    // create a temporary sessionId for the user that wants to register
    // generate an otp and send it to the email of the user
    // store the user details in redis with expiry, and initially set the verified field to false
    // set the sessionId as a cookie to track the users activity
    const { email, username } = req.body;

    const cookieSid = req.cookies[REGISTRATION_COOKIE_NAME];

    if (cookieSid) {
      const userDataString = await redisClient.get(`reg:${cookieSid}`);

      if (userDataString) {
        const { verified } = JSON.parse(userDataString);

        const nextPath = verified
          ? CLIENT_GET_PASSWORD_PAGE
          : CLIENT_OTP_VERIFY_PAGE;

        return res.status(409).json({
          status: 409,
          error: HTTP_STATUS.CONFLICT,
          next_path: nextPath,
        });
      }
    }

    const sessionId = generateSessionId();
    const otp = generateOtp(6);

    await redisClient.setex(
      `reg:${sessionId}`,
      3600,
      JSON.stringify({ email, username, verified: false })
    );

    await redisClient.setex(`otp:${sessionId}`, 1800, otp);

    this.mailUtils.sendOtpMail({
      to: email,
      otp,
      subject: "you one time password is " + otp,
    });

    res.cookie(REGISTRATION_COOKIE_NAME, sessionId, {
      domain: PROJECT_ENVIRONMENT === "prod" ? CLIENT_DOMAIN : "",
      httpOnly: true,
      maxAge: 3600 * 1000,
      path: "/",
      secure: PROJECT_ENVIRONMENT === "prod",
      sameSite: "lax",
    });

    res.status(201).json({
      status: 201,
      message: HTTP_STATUS.CREATED,
      next_path: CLIENT_OTP_VERIFY_PAGE,
    });
  });

  checkEmailExists = AsyncRequestHandler(async (req, res, next) => {
    const { id } = req.query;

    const isEmailExists = await this.userRepo.emailExists(id);

    res.status(200).json({
      status: 200,
      message: HTTP_STATUS.OK,
      email_exists: isEmailExists,
    });
  });

  verifyUserEmail = AsyncRequestHandler(async (req, res, next) => {
    // get the otp from the body
    // get the sessionId from cookies and get the userData
    // verify given otp with userData otp
    // if matched then modify the user data
    // send response

    const { otp } = req.body;
    const sessionId = req.cookies[REGISTRATION_COOKIE_NAME];

    const otpInSession = await redisClient.get(`otp:${sessionId}`);

    if (!otpInSession || otp !== otpInSession)
      return res.status(400).json({
        status: 400,
        error: HTTP_STATUS.BAD_REQUEST,
        message: "Invalid otp provided",
      });

    const userData = JSON.parse(await redisClient.get(`reg:${sessionId}`));

    if (userData.verified)
      return res.status(409).json({
        status: 409,
        error: HTTP_STATUS.CONFLICT,
        next_path: CLIENT_GET_PASSWORD_PAGE,
      });

    await redisClient.setex(
      `reg:${sessionId}`,
      3600,
      JSON.stringify({ ...userData, verified: true })
    );

    res.status(200).json({
      status: 200,
      message: HTTP_STATUS.OK,
      next_path: CLIENT_GET_PASSWORD_PAGE,
    });
  });

  createNewUser = AsyncRequestHandler(async (req, res, next) => {
    const { password } = req.body;
    const sessionId = req.cookies[REGISTRATION_COOKIE_NAME];

    const userDataString = await redisClient.get(`reg:${sessionId}`);

    if (!userDataString)
      return res.status(400).json({
        status: 400,
        error: "Bad Request",
        message: "Invalid session id or expired",
      });

    const userData = JSON.parse(userDataString);

    if (!userData.verified)
      return res.status(400).json({
        status: 400,
        error: HTTP_STATUS.BAD_REQUEST,
        message: "User not verified",
      });

    const { hash, salt } = await hashPassword(password);

    const createdId = await this.userRepo.createNewUser({
      email: userData.email,
      username: userData.username,
      password: hash,
      salt,
    });

    const accountCreated = await this.accountRepo.createAccount({
      id: createdId,
      isEnabled: userData.verified,
    });

    if (accountCreated) {
      await redisClient.del(`reg:${sessionId}`);
      res.clearCookie(REGISTRATION_COOKIE_NAME);
    }

    return !accountCreated
      ? res.status(500).json({
          status: 400,
          error: "Internal Server Error",
          message: "Failed to create user",
        })
      : res.status(201).json({
          status: 201,
          message: HTTP_STATUS.CREATED,
        });
  });

  resendOtpHandler = AsyncRequestHandler(async (req, res, next) => {
    const sessionId = req.cookies[REGISTRATION_COOKIE_NAME];

    const otpInSession = await redisClient.get(`otp:${sessionId}`);

    if (!otpInSession)
      return res.status(400).json({
        status: 400,
        error: HTTP_STATUS.BAD_REQUEST,
        message: "Invalid otp provided",
      });

    const userData = JSON.parse(await redisClient.get(`reg:${sessionId}`));

    await this.mailUtils.sendOtpMail({
      to: userData.email,
      otp: otpInSession,
      subject: "you one time password is " + otpInSession,
    });

    res.status(200).json({ status: 200, message: HTTP_STATUS.OK });
  });

  // authenticating user
  loginUser = AsyncRequestHandler(async (req, res, next) => {
    // check email exists or not
    // if exists then hash the password and match both
    // generate tokens and send it via cookie

    const { email, password } = req.body;

    const user = await this.userRepo.getUserPassword(email);

    if (!user)
      return res.status(400).json({
        status: 400,
        error: HTTP_STATUS.BAD_REQUEST,
        message: "Bad credentials",
      });

    const isPasswordMatched = await comparePassword({
      password,
      hash: user.password,
      salt: user.salt,
    });

    if (!isPasswordMatched)
      return res.status(400).json({
        status: 400,
        error: HTTP_STATUS.BAD_REQUEST,
        message: "Bad credentials",
      });

    const tokens = this.tokenUtils.generateBothToken(user._id);

    if (!tokens)
      return res.status(500).json({
        status: 500,
        error: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        message: "Error while generating token",
      });

    const isUpdate = await this.accountRepo.registRefreshTokenToUserAccount({
      userId: user._id,
      token: tokens.refreshToken,
    });

    if (!isUpdate)
      return res.status(500).json({
        status: 500,
        error: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        message: "Error while serializing user",
      });

    res.cookie(USER_AUTH_COOKIE_NAME, tokens.accessToken, {
      domain: PROJECT_ENVIRONMENT === "prod" ? CLIENT_DOMAIN : "",
      httpOnly: true,
      maxAge: 1000 * 3600,
      path: "/",
      secure: PROJECT_ENVIRONMENT === "prod",
      sameSite: "lax",
    });

    res.cookie(USER_REFRESH_TOKEN_NAME, tokens.refreshToken, {
      domain: PROJECT_ENVIRONMENT === "prod" ? CLIENT_DOMAIN : "",
      httpOnly: true,
      maxAge: 365 * 24 * 60 * 60 * 1000,
      path: "/",
      secure: PROJECT_ENVIRONMENT === "prod",
      sameSite: "lax",
    });

    res.status(200).json({ status: 200, message: HTTP_STATUS.OK, tokens });
  });

  generateNewAccessToken = AsyncRequestHandler(async (req, res, next) => {
    let { refreshToken } = req.body;

    if (!refreshToken) {
      refreshToken = req.cookies[USER_REFRESH_TOKEN_NAME];
    }

    if (!refreshToken)
      return res.status(401).json({
        status: 401,
        error: HTTP_STATUS.UNAUTHORIZED,
        message: "Refresh token missing",
      });

    const payload = this.tokenUtils.verifyJwtToken(refreshToken);

    if (!payload)
      return res.status(401).json({
        status: 401,
        error: HTTP_STATUS.UNAUTHORIZED,
        message: "Invalid Refresh token",
      });

    const userAccount = await this.accountRepo.findAccountByUserId(payload.sub);

    if (!userAccount || refreshToken !== userAccount.refreshToken)
      return res.status(401).json({
        status: 401,
        error: HTTP_STATUS.UNAUTHORIZED,
        message: "Invalid Refresh token",
      });

    const newAccessToken = this.tokenUtils.generateAccessToken(payload.sub);

    res.cookie(USER_AUTH_COOKIE_NAME, newAccessToken, {
      domain: PROJECT_ENVIRONMENT === "prod" ? CLIENT_DOMAIN : "",
      httpOnly: true,
      maxAge: 1000 * 3600,
      path: "/",
      secure: PROJECT_ENVIRONMENT === "prod",
      sameSite: "lax",
    });

    res
      .status(200)
      .json({ status: 200, message: HTTP_STATUS.OK, newAccessToken });
  });

  forgetPasswordHandler = AsyncRequestHandler(async (req, res, next) => {
    const { email } = req.body;
    const isEmailExists = await this.userRepo.emailExists(email);

    if (!isEmailExists)
      return res.status(400).json({
        status: 400,
        error: HTTP_STATUS.BAD_REQUEST,
        message: "Invalid Email",
      });

    const passwordResetToken = this.tokenUtils.generatePasswordResetToken();

    const passwordResetTokenHash =
      this.tokenUtils.hashPasswordResetToken(passwordResetToken);

    await redisClient.setex(
      `reset-tokens:${passwordResetToken}`,
      900,
      JSON.stringify({ user: email, hash: passwordResetTokenHash })
    );

    await this.mailUtils.sendForgetPasswordMail({
      to: email,
      subject: "Please reset your password",
      resetToken: passwordResetToken,
    });

    res.status(200).json({
      status: 200,
      message: HTTP_STATUS.OK,
    });
  });

  checkUserResetPasswordRequestValid = AsyncRequestHandler(
    async (req, res, next) => {
      const { token } = req.query;

      const storedResetTokenDataString = await redisClient.get(
        `reset-tokens:${token}`
      );

      return storedResetTokenDataString === null
        ? res.status(404).json({
            status: 400,
            error: HTTP_STATUS.NOT_FOUND,
            message: "Token Not Found",
          })
        : res.status(200).json({
            status: 200,
            success: true,
          });
    }
  );

  resetUserPassword = AsyncRequestHandler(async (req, res, next) => {
    const { mail } = req.query;
    const { resetToken, newPassword } = req.body;

    if (!mail)
      return res.status(400).json({
        status: 400,
        error: HTTP_STATUS.BAD_REQUEST,
        message: "Invalid request",
      });

    const storedResetTokenDataString = await redisClient.get(
      `reset-tokens:${resetToken}`
    );

    if (!storedResetTokenDataString)
      return res.status(400).json({
        status: 400,
        error: HTTP_STATUS.BAD_REQUEST,
        message: "Invalid resetToken",
      });

    const storedResetTokenData = JSON.parse(storedResetTokenDataString);

    const resetTokenHashed = this.tokenUtils.hashPasswordResetToken(resetToken);

    if (resetTokenHashed !== storedResetTokenData.hash)
      return res.status(400).json({
        status: 400,
        error: HTTP_STATUS.BAD_REQUEST,
        message: "Invalid resetToken",
      });

    const { hash, salt } = await hashPassword(newPassword);

    const isPasswordUpdated = await this.userRepo.updateUserPassword({
      email: storedResetTokenData.user,
      passwordHash: hash,
      salt,
    });

    if (isPasswordUpdated) await redisClient.del(`reset-tokens:${resetToken}`);

    res.status(200).json({ status: 200, message: HTTP_STATUS.OK });
  });

  logoutUser = AsyncRequestHandler(async (req, res, next) => {
    const userId = req.userId;
    const isUpdated =
      await this.accountRepo.deregistRefreshTokenFromUserAccount(userId);

    if (!isUpdated)
      return res.status(400).json({
        status: 500,
        error: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        message: "Something went wrong",
      });

    res.clearCookie(USER_AUTH_COOKIE_NAME);
    res.clearCookie(USER_REFRESH_TOKEN_NAME);

    res.status(200).json({ status: 200, message: HTTP_STATUS.OK });
  });

  getCsrfToken = AsyncRequestHandler(async (req, res, next) => {
    const csrfTokenId = req.cookies[CSRF_TOKEN_COOKIE_NAME];

    const csrfToken = await redisClient.get(`csrf:${csrfTokenId}`);

    res.status(200).json({
      status: 200,
      message: HTTP_STATUS.OK,
      csrf: csrfToken,
      header_name: CSRF_TOKEN_HEADER_NAME,
    });
  });
}

module.exports = AuthController;
