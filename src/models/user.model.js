const { Schema, model, models } = require("mongoose");

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: [true, "email is required"],
      unique: true,
      index: true,
    },
    username: {
      type: String,
      required: [true, "username is required"],
    },
    password: {
      type: String,
    },
    salt: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports.User = model("User", userSchema);
