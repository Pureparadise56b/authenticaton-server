const redisClient = require("../configs/redis.config");
const { TokenUtils } = require("../utils/miscellaneous.util");
const {
  CLIENT_DOMAIN,
  CSRF_TOKEN_COOKIE_NAME,
  CSRF_TOKEN_HEADER_NAME,
  PROJECT_ENVIRONMENT,
} = require("../variables");

class CsrfMiddleware {
  tokenUtils;
  constructor() {
    this.tokenUtils = new TokenUtils();
    this.init = this.init.bind(this);
  }

  /**
   *
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @param {import("express").NextFunction} next
   */
  async init(req, res, next) {
    try {
      const csrfTokenId = req.cookies[CSRF_TOKEN_COOKIE_NAME];
      let newCsrfId;

      if (!csrfTokenId) {
        newCsrfId = this.tokenUtils.generateCsrfTokenId();
        res.cookie(CSRF_TOKEN_COOKIE_NAME, newCsrfId, {
          domain: PROJECT_ENVIRONMENT == "prod" ? CLIENT_DOMAIN : "",
          httpOnly: true,
          maxAge: 1000 * 3600,
          path: "/",
          secure: PROJECT_ENVIRONMENT === "prod",
          sameSite: "lax",
        });
      }

      const csrfTokenInSession = await redisClient.get(`csrf:${csrfTokenId}`);

      if (!csrfTokenInSession && !csrfTokenId) {
        const newCsrfToken = this.tokenUtils.generateCsrfToken();
        await redisClient.setex(`csrf:${newCsrfId}`, 3600, newCsrfToken);
      }

      if (!csrfTokenInSession && csrfTokenId) {
        const newCsrfToken = this.tokenUtils.generateCsrfToken();
        await redisClient.setex(`csrf:${csrfTokenId}`, 3600, newCsrfToken);
      }

      next();
    } catch (error) {
      next(error);
    }
  }

  /**
   *
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @param {import("express").NextFunction} next
   */
  async preventCsrf(req, res, next) {
    try {
      if (["POST", "PUT", "DELETE"].includes(req.method.toUpperCase())) {
        const clientCsrf = req.get(CSRF_TOKEN_HEADER_NAME);
        const csrfTokenId = req.cookies[CSRF_TOKEN_COOKIE_NAME];
        const csrfTokenInSession = await redisClient.get(`csrf:${csrfTokenId}`);

        if (!clientCsrf || clientCsrf !== csrfTokenInSession) {
          return res.status(401).json({
            status: 401,
            error: "Unauthorized",
            message: "Invalid csrf token",
          });
        }
      }
      next();
    } catch (error) {
      next(error);
    }
  }
}

module.exports = CsrfMiddleware;
