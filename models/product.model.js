const mongoose = require("mongoose");
const slug = require("mongoose-slug-updater");

mongoose.plugin(slug);

const productSchema = new mongoose.Schema({
  title: String,
  categoryIds: [
    {
      type: String,
      default: "",
    },
  ],
  description: String,
  price: Number,
  discountPercentage: Number,
  stock: Number,
  thumbnail: String,
  status: String,
  featured: String,
  position: Number,
  activeIngredients: [
    {
      ingredientName: String,
      amount: String,
    }
  ],
  dosage: String,
  createdBy: {
    account_id: String,
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  updatedBy: [
    {
      account_id: String,
      updatedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  slug: {
    type: String,
    slug: "title",
    unique: true,
  },
  deleted: {
    type: Boolean,
    default: false,
  },
  deletedBy: {
    account_id: String,
    deletedAt: Date,
  },
});

const Product = mongoose.model("Product", productSchema, "products");

module.exports = Product;
