const { Request, Response, NextFunction } = require("express");

/**
 *
 * @param {(req: Request, res: Response, next?: NextFunction)=> void} fn
 * @returns
 */
function AsyncRequestHandler(fn) {
  /**
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   *
   * @returns {Promise<void>}
   */
  return function (req, res, next) {
    return Promise.resolve(fn(req, res)).catch((error) => next(error));
  };
}

module.exports = AsyncRequestHandler;
