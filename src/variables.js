module.exports.PROJECT_ENVIRONMENT = process.env.PROJECT_ENVIRONMENT || "dev";

module.exports.CLIENT_URL = process.env.CLIENT_URL || "";
module.exports.CLIENT_DOMAIN = process.env.CLIENT_DOMAIN || "";
module.exports.CLIENT_OTP_VERIFY_PAGE =
  process.env.CLIENT_OTP_VERIFY_PAGE || "";

module.exports.CLIENT_GET_PASSWORD_PAGE =
  process.env.CLIENT_GET_PASSWORD_PAGE || "";

module.exports.PORT = process.env.PORT || 3000;
module.exports.REQUEST_LIMIT = process.env.REQUEST_LIMIT || "500kb";
module.exports.JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || "";

module.exports.DB_URL = process.env.DB_URL || "";

module.exports.REDIS_HOST = process.env.REDIS_HOST || "";
module.exports.REDIS_PORT = process.env.REDIS_PORT || 6379;
module.exports.REDIS_USERNAME = process.env.REDIS_USERNAME || "";
module.exports.REDIS_PASSWORD = process.env.REDIS_PASSWORD || "";

module.exports.REGISTRATION_COOKIE_NAME =
  this.PROJECT_ENVIRONMENT == "prod" ? "X_REG_SID" : "REG_SID";

module.exports.USER_AUTH_COOKIE_NAME =
  this.PROJECT_ENVIRONMENT == "prod" ? "X_AUTH_TOKEN" : "AUTH_TOKEN";
module.exports.USER_REFRESH_TOKEN_NAME =
  this.PROJECT_ENVIRONMENT == "prod" ? "X_REFRESH_TOKEN" : "REFRESH_TOKEN";

module.exports.CSRF_TOKEN_COOKIE_NAME = "_CSRF_TOKEN";

module.exports.CSRF_TOKEN_HEADER_NAME = "X-CSRF-TOKEN";

module.exports.MAIL_USER = process.env.MAIL_USER || "";
module.exports.MAIL_PASSWORD = process.env.MAIL_PASSWORD || "";

module.exports.HTTP_STATUS = {
  // 2xx Success Responses
  OK: "Ok",
  CREATED: "Created",
  ACCEPTED: "Accepted",
  NO_CONTENT: "No Content",

  // 3xx Redirection Responses
  MOVED_PERMANENTLY: "Moved Permanently",
  FOUND: "Found",
  SEE_OTHER: "See Other",
  NOT_MODIFIED: "Not Modified",

  // 4xx Client Error Responses
  BAD_REQUEST: "Bad Request",
  UNAUTHORIZED: "Unauthorized",
  FORBIDDEN: "Forbidden",
  NOT_FOUND: "Not Found",
  METHOD_NOT_ALLOWED: "Method Not Allowed",
  CONFLICT: "Conflict",

  // 5xx Server Error Responses
  INTERNAL_SERVER_ERROR: "Internal Server Error",
  NOT_IMPLEMENTED: "Not Implemented",
  BAD_GATEWAY: "Bad Gateway",
  SERVICE_UNAVAILABLE: "Service Unavailable",
  GATEWAY_TIMEOUT: "Gateway Timeout",
};
