const { validationResult } = require("express-validator");

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
function validate(req, res, next) {
  if (validationResult(req).isEmpty()) return next();

  const errors = validationResult(req).array();

  res.status(400).json({
    status: 400,
    error: "Bad Request",
    message: errors[0].msg,
  });
}

module.exports = validate;
