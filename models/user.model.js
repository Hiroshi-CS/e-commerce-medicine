const mongoose = require("mongoose");
const generate = require("../helper/generate");

const userSchema = new mongoose.Schema(
  {
    fullName: String,
    email: String,
    password: String,
    tokenUser: {
      type: String,
      default: generate.genarateRandomString(20),
    },
    phone: String,
    address: String,
    avatar: String,
    orders: [
      {
        products: [
          {
            product_id: String,
            quantity: Number,
          },
        ],
        totalPrice: String,
        createAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    status: {
      type: String,
      default: "active",
    },
    deleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: Date,
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema, "users");

module.exports = User;
