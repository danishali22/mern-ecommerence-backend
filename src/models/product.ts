import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add product name"],
    },
    photos: [
      {
        public_id: {
          type: String,
          required: [true, "Please add public id"],
        },
        url: {
          type: String,
          required: [true, "Please add image url"],
        },
      },
    ],
    price: {
      type: Number,
      required: [true, "Please add product price"],
    },
    stock: {
      type: Number,
      required: [true, "Please add product stock"],
    },
    category: {
      type: String,
      required: [true, "Please add category name"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Please add description"],
    },
    ratings: {
      type: Number,
      default: 0,
    }
  },
  {
    timestamps: true,
  }
);

export const Product = mongoose.model("Product", schema);
