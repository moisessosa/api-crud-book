const { Router } = require("express");
const router = Router();
const jwt = require("jsonwebtoken");
const {
  login,
  loginO,
  register,
  registerO,
  book,
  getBookResumeByTitle,
  getBooks,
} = require("../controllers/db.controller");
router.get("/", (req, res) => {
  res.send("Bienvenido");
});
function checkToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  try {
    const secret = process.env.secret;
    jwt.verify(token, secret);
    next();
  } catch (error) {
    res.status(400).json({ msg: `Token invalido o caducado ${error}` });
  }
}
router.post("/login", login);
router.post("/loginO", loginO);
router.post("/register", register);
router.post("/registerO", registerO);
router.post("/book", book);
router.get("/books", getBooks);
router.get("/book/:title", checkToken, getBookResumeByTitle);

module.exports = router;
