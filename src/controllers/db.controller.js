//const express = require("express");
const { Pool } = require("pg");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

const login = async (req, res) => {
  const { usuario, senha } = req.body;
  const userExist = await pool.query(
    "Select nombre from usuarios where nombre = $1",
    [usuario]
  );

  console.log(userExist.rows);
  if (userExist.rows.length == 0) {
    return res.status(404).send("Usuario no existe");
  }
  const respuesta = await pool.query(
    "SELECT * FROM usuarios WHERE nombre = $1 AND PGP_SYM_DECRYPT(password::bytea, 'AES_KEY') = $2",
    [usuario, senha]
  );
  if (respuesta.rows.length == 0) {
    return res.json({
      nombre: usuario,
      auth: false,
      message: "Contraseña Invalida",
    });
  }
  //console.log(respuesta.rows.length);
  res.json({
    nombre: respuesta.rows[0].nombre,
    auth: true,
    message: "Contraseña valida",
  });
};

const loginO = async (req, res) => {
  const { usuario, senha } = req.body;
  const userExist = await pool.query(
    "Select nombre from usuarios where nombre = $1",
    [usuario]
  );

  console.log(userExist.rows);
  if (userExist.rows.length == 0) {
    return res.status(404).send("Usuario no existe");
  }
  const pass = await pool.query(
    "SELECT password FROM usuarios WHERE nombre = $1",
    [usuario]
  );
  console.log(pass.rows);

  const checkPass = await bcrypt.compare(senha, pass.rows[0].password);
  if (checkPass) {
    const token = jwt.sign(
      {
        nombre: userExist.rows[0].nombre,
        casa: "Brasil",
      },
      process.env.SECRET,
      { expiresIn: 3600 }
    );

    res.json({
      nombre: userExist.rows[0].nombre,
      token: token,
      message: "Contraseña valida",
    });
  } else {
    return res.json({
      nombre: usuario,
      token: "invalido",
      message: "Contraseña Invalida",
    });
  }
};

const register = async (req, res) => {
  const { usuario, senha } = req.body;
  if (usuario && senha) {
    try {
      const insertar = await pool.query(
        "INSERT INTO usuarios (nombre, password) values ($1,  PGP_SYM_ENCRYPT($2,'AES_KEY'))",
        [usuario, senha]
      );

      res.status(201).json({ message: `Usuario ${usuario} Creados` });
    } catch (err) {
      res
        .status(500)
        .json({ message: "ocurrio un erro al crear el usuario", error: err });
    }
  } else {
    res
      .status(403)
      .json({ message: "Datos incompleto o con formato incompleto" });
  }
  //console.log(usuario, senha);
  res.send("ok");
};
const registerO = async (req, res) => {
  const { usuario, senha } = req.body;
  if (usuario && senha) {
    try {
      const salt = await bcrypt.genSalt(12);
      const senhaEnc = await bcrypt.hash(senha, salt);
      const insertar = await pool.query(
        "INSERT INTO usuarios (nombre, password) values ($1, $2)",
        [usuario, senhaEnc]
      );
      console.log(insertar);
      res.status(201).json({ message: `Usuario ${usuario} Creados` });
    } catch (err) {
      res
        .status(500)
        .json({ message: "ocurrio un erro al crear el usuario", error: err });
    }
  } else {
    res
      .status(403)
      .json({ message: "Datos incompleto o con formato incompleto" });
  }
  //console.log(usuario, senha);
  res.send("ok");
};
const book = async (req, res) => {
  const { book_name, genero, precio, resumen } = req.body;

  if (book_name && genero && precio && resumen) {
    try {
      const insertar = pool.query(
        "INSERT INTO book (book_name, genero, precio, resumen) values($1,$2,$3,$4)",
        [book_name, genero, precio, resumen]
      );
      res.json({ message: "Libro subido exitosamente" });
    } catch (error) {
      res
        .status(500)
        .json({ message: "ocurrio un erro al subir el Libro", error: error });
    }
  } else {
    res
      .status(403)
      .json({ message: "Datos incompleto o con formato incompleto" });
  }
};
const getBookResumeByTitle = async (req, res) => {
  const { title } = req.params;
  try {
    const resultado = await pool.query(
      "SELECT resumen from book where book_name = $1",
      [title]
    );
    //res.writeHead(200, { "Content-Type": "text/html" });
    res.status(200).json({ resumen: resultado.rows[0].resumen });
  } catch (error) {
    res.status(404).json({ message: `${error}` });
  }
};
const getBooks = async (req, res) => {
  try {
    const resultado = await pool.query("SELECT * from book");
    res.json(resultado.rows);
  } catch (error) {
    res.json({ message: `${error}` });
  }
};
module.exports = {
  login,
  loginO,
  register,
  registerO,
  book,
  getBookResumeByTitle,
  getBooks,
};
//select * from information_schema.columns where table_name = 'nombre de la tabla';
