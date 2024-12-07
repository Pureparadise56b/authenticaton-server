const { Aggregate } = require("mongoose");
const { User } = require("../models/user.model");

class UserRepo {
  userModel;
  constructor() {
    this.userModel = User;

    this.createNewUser = this.createNewUser.bind(this);
    this.emailExists = this.emailExists.bind(this);
    this.getUserPassword = this.getUserPassword.bind(this);
    this.updateUserPassword = this.updateUserPassword.bind(this);
  }

  /**
   *
   * @param {{email: string, username: string, password: string, salt: string}} param0
   * @returns {Promise<String>}
   */
  async createNewUser({ email, username, password, salt }) {
    try {
      const user = await this.userModel.create({
        email,
        username,
        password,
        salt,
      });

      return user._id;
    } catch (error) {
      return null;
    }
  }

  /**
   *
   * @param {string} email
   * @returns {Promise<boolean>}
   */

  async emailExists(email) {
    try {
      const user = await User.exists({ email });
      if (!user) return false;

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   *
   * @param {string} email
   * @returns {Promise<Aggregate<any | null>>}
   */

  async getUserPassword(email) {
    try {
      const users = await User.aggregate([
        {
          $match: {
            email,
          },
        },
        {
          $limit: 1,
        },
        {
          $project: {
            email: 0,
            username: 0,
            createdAt: 0,
            updatedAt: 0,
          },
        },
      ]);

      return users[0];
    } catch (error) {
      return null;
    }
  }

  /**
   *
   * @param {{email: string, passwordHash: string, salt: string}} param0
   * @returns {Promise<boolean>}
   */
  async updateUserPassword({ email, passwordHash, salt }) {
    try {
      await this.userModel.updateOne(
        { email },
        {
          $set: {
            password: passwordHash,
            salt,
          },
        }
      );

      return true;
    } catch (error) {
      return false;
    }
  }
}

module.exports = UserRepo;
