const { Schema, model, models, default: mongoose } = require("mongoose");

const accountTypeEnum = {
  values: ["USER", "ADMIN"],
  message: "enum validator failed for path `{PATH}` with value `{VALUE}`",
};

const accountSchema = new Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    accountType: {
      type: String,
      enum: accountTypeEnum,
    },
    isEnabled: {
      type: Boolean,
      default: false,
    },
    refreshToken: {
      type: String,
    },
    lastLogin: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports.UserAccount = model("account", accountSchema);
