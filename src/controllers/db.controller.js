//const express = require("express");
const { Pool } = require("pg");
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

const register = async (req, res) => {
  const { usuario, senha } = req.body;
  if (usuario && senha) {
    try {
      const insertar = await pool.query(
        "INSERT INTO usuarios (nombre, password) values ($1,  PGP_SYM_ENCRYPT($2,'AES_KEY'))",
        [usuario, senha]
      );
      console.log(insertar.rows);
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
  console.log(usuario, senha);
  res.send("ok");
};
const book = async (req, res) => {
  const { book_name, genero, precio, resumen } = req.body;
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
};
const getBookResumeByTitle = async (req, res) => {
  const { title } = req.params;
  try {
    const resultado = await pool.query(
      "SELECT resumen from book where book_name = $1",
      [title]
    );
    res.status(404).json(resultado.rows[0].resumen);
  } catch (error) {
    res.json({ message: `${error}` });
  }
};
module.exports = { login, register, book, getBookResumeByTitle };
//select * from information_schema.columns where table_name = 'nombre de la tabla';
