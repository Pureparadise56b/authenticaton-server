const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { JWT_SECRET_KEY } = require("../variables");

class TokenUtils {
  key;
  constructor() {
    this.key = JWT_SECRET_KEY;

    this.generateAccessToken = this.generateAccessToken.bind(this);
    this.generateRefreshToken = this.generateRefreshToken.bind(this);
    this.generateBothToken = this.generateBothToken.bind(this);
    this.verifyJwtToken = this.verifyJwtToken.bind(this);
    this.decodeJwtToken = this.decodeJwtToken.bind(this);
    this.generatePasswordResetToken =
      this.generatePasswordResetToken.bind(this);
    this.hashPasswordResetToken = this.hashPasswordResetToken.bind(this);
  }

  /**
   *
   * @param {string} sub
   * @param {string?} key
   * @returns {string | null}
   */
  generateAccessToken(sub, key) {
    try {
      let k = key ? key : this.key;
      return jwt.sign(
        {
          sub,
          iat: Math.floor(Date.now() / 1000),
        },
        k,
        {
          expiresIn: "1h",
        }
      );
    } catch (error) {
      return null;
    }
  }
  /**
   *
   * @param {string} sub
   * @param {string?} key
   * @returns {string | null}
   */
  generateRefreshToken(sub, key) {
    try {
      let k = key ? key : this.key;
      return jwt.sign(
        {
          sub,
          iat: Math.floor(Date.now() / 1000),
        },
        k,
        {
          expiresIn: "1y",
        }
      );
    } catch (error) {
      return null;
    }
  }

  /**
   *
   * @param {string} id
   * @param {string?} key
   * @returns {{accessToken: string, refreshToken: string} | null}
   */

  generateBothToken(id, key) {
    try {
      let k = key ? key : this.key;
      const accessToken = this.generateAccessToken(id, k);
      const refreshToken = this.generateRefreshToken(id, k);

      return { accessToken, refreshToken };
    } catch (error) {
      return null;
    }
  }

  /**
   *
   * @param {string} token
   * @param {string?} key
   * @returns {jwt.JwtPayload | string | null}
   */
  verifyJwtToken(token, key) {
    try {
      let k = key ? key : this.key;
      return jwt.verify(token, k);
    } catch (error) {
      return null;
    }
  }

  /**
   *
   * @param {string} token
   * @returns {jwt.JwtPayload | string}
   */
  decodeJwtToken(token) {
    return jwt.decode(token);
  }

  /**
   *
   * @returns {string}
   */
  generatePasswordResetToken() {
    return crypto.randomBytes(128).toString("base64url");
  }

  /**
   *
   * @param {string} resetToken
   * @returns {string}
   */
  hashPasswordResetToken(resetToken) {
    return crypto.createHash("sha256").update(resetToken).digest("hex");
  }

  /**
   *
   * @returns {string}
   */
  generateCsrfToken() {
    return crypto.randomBytes(64).toString("base64url");
  }

  /**
   *
   * @returns {string}
   */
  generateCsrfTokenId() {
    return crypto.randomBytes(32).toString("base64url");
  }
}

/* Outer Class Methods */

/**
 *
 * @returns {string}
 */
function generateSessionId() {
  return crypto.randomBytes(32).toString("base64url");
}

/**
 *
 * @param {string} password
 * @returns {Promise<{hash: string, salt: string}>}
 */

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const iterations = 100000;
  const keyLength = 64;
  const digest = "sha256";

  return new Promise((resolve, reject) => {
    crypto.pbkdf2(
      password,
      salt,
      iterations,
      keyLength,
      digest,
      (err, derivedKey) => {
        if (err) reject(err);
        resolve({ salt, hash: derivedKey.toString("hex") });
      }
    );
  });
}

/**
 *
 * @param {{password: string, hash: string, salt: string}} param0
 * @returns {Promise<boolean>}
 */

function comparePassword({ password, hash, salt }) {
  const iterations = 100000;
  const keyLength = 64;
  const digest = "sha256";

  return new Promise((resolve, reject) => {
    crypto.pbkdf2(
      password,
      salt,
      iterations,
      keyLength,
      digest,
      (err, derivedKey) => {
        if (err) reject(err);
        resolve(hash === derivedKey.toString("hex"));
      }
    );
  });
}

/**
 *
 * @param {number} length
 * @returns {string}
 */

function generateOtp(length) {
  let otp = "";
  for (let i = 0; i < length; i++) {
    otp += crypto.randomInt(0, 10);
  }
  return otp;
}

module.exports = {
  TokenUtils,
  generateSessionId,
  hashPassword,
  comparePassword,
  generateOtp,
};
