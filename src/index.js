const express = require("express");

const app = express();
const PUERTO = process.env.PORT || 3000;

const router = require("./routes/routes"); //arquivo de rutas
// conexion a la base de datos se hace en el controlle que lo necesita
app.use(express.text());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(router);

app.listen(PUERTO, () => console.log(`Server on Port ${PUERTO}`));
