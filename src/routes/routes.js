const { Router } = require("express");
const router = Router();
const {
  login,
  register,
  book,
  getBookResumeByTitle,
  getBooks,
} = require("../controllers/db.controller");
router.get("/", (req, res) => {
  res.send("Bienvenido");
});

router.post("/login", login);
router.post("/register", register);
router.post("/book", book);
router.get("/books", getBooks);
router.get("/book/:title", getBookResumeByTitle);

module.exports = router;
