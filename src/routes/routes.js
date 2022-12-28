const { Router } = require("express");
const router = Router();
const {
  login,
  register,
  book,
  getBookByTitle,
} = require("../controllers/db.controller");
router.get("/", (req, res) => {
  res.send("Bienvenido");
});

router.post("/login", login);
router.post("/register", register);
router.post("/book", book);
router.get("/book/:title", getBookByTitle);

module.exports = router;
