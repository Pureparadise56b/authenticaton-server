const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { REQUEST_LIMIT, CLIENT_URL } = require("./variables");

const DatabaseConfig = require("./configs/db.config");
const AuthRouter = require("./routes/auth.route");
const CsrfMiddleware = require("./middlewares/csrf.middleware");
const ErrorMiddleware = require("./middlewares/error.middleware");

class WebApplication {
  server;
  port;
  dbConfig;
  csrfMiddleware;
  errorMiddleware;
  /**
   *
   * @param {number} port
   */

  constructor(port) {
    this.port = port;
    this.dbConfig = new DatabaseConfig();
    this.csrfMiddleware = new CsrfMiddleware();
    this.errorMiddleware = new ErrorMiddleware();

    this.server = express();
    this.start = this.start.bind(this);
    this.server.use(
      cors({
        origin: function (origin, callback) {
          if (
            !origin ||
            (Array.isArray(CLIENT_URL) && CLIENT_URL.includes(origin))
          ) {
            callback(null, true);
          } else if (!origin || CLIENT_URL === origin) {
            callback(null, true);
          } else {
            callback(null, false);
          }
        },
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE"],
      })
    );

    this.server.use(express.json({ limit: REQUEST_LIMIT }));
    this.server.use(
      express.urlencoded({ extended: true, limit: REQUEST_LIMIT })
    );

    this.server.use(cookieParser());
    this.server.use(this.csrfMiddleware.init);

    // api routes
    this.server.use("/api/auth", new AuthRouter().registerRoutes());

    this.server.use(this.errorMiddleware.handleServerSideErrors);
    this.server.use(this.errorMiddleware.handleUnrecognizedUrlHitErrors);
  }

  /**
   *
   * @param {Function?} callback
   * @param {string} databaseUrl
   */
  start(callback, databaseUrl) {
    this.dbConfig.connectDb(databaseUrl).then((connection) => {
      if (connection != null) {
        this.server.listen(this.port, callback);
      } else {
        process.exit(1);
      }
    });
  }
}

module.exports = WebApplication;
