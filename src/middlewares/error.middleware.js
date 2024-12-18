const { PROJECT_ENVIRONMENT } = require("../variables");

class ErrorMiddleware {
  /**
   *
   * @param {Error} err
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @param {import("express").NextFunction} next
   */
  handleServerSideErrors(err, req, res, next) {
    const status = err.status || 500;
    const message = err.message || "Something Went Wrong";

    res.status(status).json({
      status,
      error: "Internal Server Error",
      message,
      stack: PROJECT_ENVIRONMENT == "prod" ? undefined : err.stack,
    });
  }

  handleUnrecognizedUrlHitErrors(_, res, __) {
    res.status(404).send();
  }
}

module.exports = ErrorMiddleware;
