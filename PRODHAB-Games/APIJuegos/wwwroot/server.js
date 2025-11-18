const express = require("express");
const path = require("path");

const app = express();
const PORT = 8080;
const ROOT_DIR = path.resolve(process.argv[2] || ".");

app.use(express.static(ROOT_DIR));

app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
