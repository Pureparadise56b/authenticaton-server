const { TokenUtils } = require("../utils/miscellaneous.util");
const { USER_AUTH_COOKIE_NAME } = require("../variables");

class AuthMiddleware {
  tokenUtils;
  constructor() {
    this.tokenUtils = new TokenUtils();
    this.forAuthenticatedUser = this.forAuthenticatedUser.bind(this);
    this.forOnlyAdmin = this.forOnlyAdmin.bind(this);
  }

  /**
   *
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @param {import("express").NextFunction} next
   */
  forAuthenticatedUser(req, res, next) {
    let token;
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer")) {
      token = req.cookies[USER_AUTH_COOKIE_NAME];
    } else {
      token = authHeader.split(" ")[1];
    }

    if (!token)
      return res.status(401).json({
        status: 401,
        error: "Unauthorized",
        message: "Unauthorized request to access this resource",
      });

    const payload = this.tokenUtils.verifyJwtToken(token);

    if (!payload)
      return res.status(401).json({
        status: 401,
        error: "Unauthorized",
        message: "Unauthorized request to access this resource",
      });

    req.userId = payload.sub;
    next();
  }

  /**
   *
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @param {import("express").NextFunction} next
   */
  forOnlyAdmin(req, res, next) {}
}

module.exports = AuthMiddleware;
