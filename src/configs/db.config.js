const { connect, Connection } = require("mongoose");

class DatabaseConfig {
  /**
   *
   * @param {string} url
   * @returns {Promise<Connection>}
   */
  async connectDb(url) {
    try {
      const conn = await connect(url);
      console.log("Database connection established ✅");
      return conn.connection;
    } catch (error) {
      console.log("❌ Database Error: ", error.message);
      return null;
    }
  }
}

module.exports = DatabaseConfig;
