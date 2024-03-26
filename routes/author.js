/** @format */

const express = require("express");
const router = express.Router();
const Author = require("../models/author");
const Book = require("../models/book");
router.get("/", async (req, res) => {
  let searchOptions = {};
  if (
    req.query.name !== undefined &&
    req.query.name !== null &&
    req.query.name !== ""
  ) {
    searchOptions.name = req.query.name;
  }
  try {
    const authors = await Author.find(searchOptions).populate("books");
    res.send({
      authors: authors,
      searchOptions: req.query,
    });
  } catch (error) {
    res.send(error);
  }
});

router.get("/new", async (req, res) => {
  try {
    const authors = await Author.find();
    res.render("authors/new", { author: authors });
  } catch (error) {
    res.send(error);
  }
});

router.post("/", async (req, res) => {
  const author = new Author({
    name: req.body.name,
  });

  try {
    const newAuthor = await author.save();
    res.send(newAuthor);
  } catch (error) {
    res.send(error);
  }
});
router.get("/:id", async (req, res) => {
  try {
    const author = await Author.findById(req.params.id);
    const books = await Book.find({ author: author.id }).limit(6).exec();
    res.render("authors/show", {
      author: author,
      booksByAuthor: books,
      errorMessage: req.query.errorMessage,
    });
  } catch {
    res.redirect("/");
  }
});

router.get("/:id/edit", async (req, res) => {
  try {
    const author = await Author.findById(req.params.id);
    // authors edit view not the route here
    res.render("authors/edit", { author: author });
  } catch {
    res.redirect("/authors");
  }
});

router.put("/:id", async (req, res) => {
  let author;
  try {
    author = await Author.findById(req.params.id);
    author.name = req.body.name;
    await author.save();
    res.send(`author updated.`);
  } catch (error) {
    res.send(error);
  }
});

router.delete("/:id", async (req, res) => {
  let author;
  try {
    author = await Author.findById(req.params.id);
    await author.deleteOne();
    res.send("Authors Deleted SuccessFully");
  } catch (error) {
    console.log(error);
    res.send({
      errors: { [author?.name]: "This Author still has book" },
    });
  }
});
module.exports = router;
