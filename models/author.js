/** @format */

const mongoose = require("mongoose");
const Book = require("./book");

const authorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    books: [
      { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Book" },
    ],
  },
  {
    timestamps: true,
  }
);

authorSchema.pre("deleteOne", { document: true }, async function (next) {
  try {
    const books = await Book.find({ author: this._id });
    if (books.length > 0) {
      throw new Error("This author has books still");
    }
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model("Author", authorSchema);
