const mongoose = require("mongoose");
const generate = require("../helper/generate");

const accountSchema = new mongoose.Schema(
    {
        fullName: String,
        email: String,
        password: String,
        token: {
            type: String,
            default: generate.generateRandomString(20),
            default: generate.generateRandomString(20),
        },
        phone: {
          type: String,
          default: "",
        },
        address: String, 
        avatar: {
          type: String,
          default: "",
        },
        role_id: String,
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

const Account = mongoose.model("Account", accountSchema, "accounts");

module.exports = Account;