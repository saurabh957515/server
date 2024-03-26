/** @format */

const express = require("express");
const router = express.Router();
const Author = require("../models/author");
const Book = require("../models/book");
const multer = require("multer");
const { queryByRole } = require("@testing-library/react");
// const upload = multer({ dest: "public/images" });
const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      if (file.fieldname === "coverImage") {
        cb(null, "public/images");
      } else if (file.fieldname === "book") {
        cb(null, "public/books");
      } else {
        cb(new Error("Invalid field name"));
      }
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(
        null,
        file.fieldname +
          "-" +
          uniqueSuffix +
          "." +
          file.originalname.split(".").pop()
      );
    },
  }),
});

router.get("/", async (req, res) => {
  const { dateOptions, title, author } = req.query;
  let authorOptions = await Author?.find();
  authorOptions = authorOptions.map((author) => ({
    label: author?.name,
    value: author?._id,
  }));

  let query = Book.find();
  if (dateOptions?.endDate) {
    if (dateOptions?.startDate === dateOptions?.endDate) {
      query = query.where("publishDate").eq(dateOptions?.endDate);
    } else if (dateOptions?.endDate) {
      query
        .where("publishDate")
        .gte(dateOptions?.startDate)
        .lte(dateOptions?.endDate);
    }
  }
  if (author) {
    query = query.where("author").eq(author);
  }
  if (title) {
    query = query.regex("title", new RegExp(req.query.title, "i"));
  }

  try {
    const books = await query.exec();
    res.send({
      books: books,
      searchOptions: authorOptions,
    });
  } catch (error) {
    res.send(error);
  }
});

router.post(
  "/",
  upload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "book", maxCount: 1 },
  ]),
  async (req, res) => {
    const { title, author, publishDate, pageCount, description } = req.body;
    const book = new Book({
      title: title,
      author: author,
      publishDate: new Date(publishDate),
      pageCount: pageCount,
      description: description,
      coverImage: req?.files["coverImage"]?.[0]?.filename || null,
      book: req?.files["book"]?.[0]?.filename || null,
    });

    const newAuthor = await Author.findById(author);
    newAuthor.books.push(book._id);

    try {
      // Save the updated author document
      await newAuthor.save();

      // Save the book document
      const newBook = await book.save();
      res.send(newBook);
    } catch (error) {
        console.log(error)
      res.status(500).send(error);
    }
  }
);

// Show Book Route
router.get("/:id", async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate("author").exec();
    res.render("books/show", { book: book });
  } catch {
    res.redirect("/");
  }
});

// Update Book Route
router.put("/:id", upload.single("coverImage"), async (req, res) => {
  let book;

  try {
    book = await Book.findById(req.params.id);
    book.title = req.body.title;
    book.author = req.body.author;
    book.publishDate = new Date(req.body.publishDate);
    book.pageCount = req.body.pageCount;
    book.description = req.body.description;
    (book.coverImage = req?.file?.filename || null), await book.save();
    res.send("book updated successfully");
  } catch {
    res.send("book updated successfully");
  }
});

// Delete Book Page
router.delete("/:id", async (req, res) => {
  let book;
  try {
    book = await Book.findById(req.params.id);
    await book.deleteOne();
    res.send("books deleted successfully");
  } catch (error) {
    res.send({ errors: error });
  }
});
// one  comment added

module.exports = router;
