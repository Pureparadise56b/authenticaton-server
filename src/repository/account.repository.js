const { UserAccount } = require("../models/account.model");

class AccountRepo {
  accountModel;
  constructor() {
    this.accountModel = UserAccount;

    this.createAccount = this.createAccount.bind(this);
    this.findAccountByUserId = this.findAccountByUserId.bind(this);
    this.registRefreshTokenToUserAccount =
      this.registRefreshTokenToUserAccount.bind(this);
    this.deregistRefreshTokenFromUserAccount =
      this.deregistRefreshTokenFromUserAccount.bind(this);
  }

  /**
   *
   * @param {{id: string, isEnabled: boolean}} param0
   * @returns {boolean}
   */

  async createAccount({ id, isEnabled }) {
    try {
      this.accountModel.create({
        userId: id,
        accountType: "USER",
        isEnabled,
      });

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   *
   * @param {string} userId
   * @returns {Promise<any>}
   */
  async findAccountByUserId(userId) {
    try {
      return await this.accountModel.findOne({ userId });
    } catch (error) {
      return null;
    }
  }

  /**
   *
   * @param {{userId: string, token: string}} param0
   * @returns {Promise<boolean>}
   */
  async registRefreshTokenToUserAccount({ userId, token }) {
    try {
      await this.accountModel.updateOne(
        { userId },
        {
          $set: {
            refreshToken: token,
            lastLogin: new Date(Date.now()),
          },
        }
      );
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   *
   * @param {string} userId
   * @returns {Promise<boolean>}
   */
  async deregistRefreshTokenFromUserAccount(userId) {
    try {
      const d = await this.accountModel.updateOne(
        { userId },
        {
          $set: {
            refreshToken: null,
          },
        }
      );
      return d.modifiedCount > 0;
    } catch (error) {
      return false;
    }
  }
}

module.exports = AccountRepo;
