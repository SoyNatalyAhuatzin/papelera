

const express = require("express");
const { exec } = require("child_process");
const mysql = require("mysql2");
const app = express();
const port = 3000;

// Middleware para parsear el body de las solicitudes POST
app.use(express.urlencoded({ extended: true }));

// Configuración de la conexión a MySQL
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "TESE",
  database: "papelera_ciclico_prueba_1"
});

// Conectar a MySQL
db.connect((err) => {
  if (err) {
    console.error("Error conectando a MySQL:", err.code, err.message);
    return;
  }
  console.log("Conectado a MySQL!");
});

// Ruta inicial (app.js)
app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Gestión de Papelera</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
      background-color: #d7d2cb;
      border: 100px solid #7a8f7a;
      box-sizing: border-box;
    }
    .container {
      background-color: #ffffff;
      padding: 20px;
      border: 1px solid #ccc;
      text-align: center;
      width: 300px;
    }
    h1 {
      margin: 0 0 20px;
      font-size: 24px;
    }
    button {
      background-color: #ff7043;
      color: white;
      border: none;
      padding: 10px 20px;
      cursor: pointer;
      font-size: 16px;
    }
    button:hover {
      background-color: #e65100;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Gestión de Papelera</h1>
    <button onclick="window.location.href='/inicio'">Entrar</button>
  </div>
</body>
</html>
  `);
});

// Sirve el archivo inicio.html
app.get("/inicio", (req, res) => {
  res.sendFile(__dirname + "/inicio.html");
});

// Sirve el formulario de inicio de sesión
app.get("/login", (req, res) => {
  res.sendFile(__dirname + "/inicio_sesion.html");
});

// Maneja el inicio de sesión
app.post("/login", (req, res) => {
  console.log("Datos recibidos:", req.body); // Depuración
  const { email, password, rol } = req.body || {};

  if (!email || !password || !rol) {
    return res.status(400).send("Faltan correo, contraseña o rol");
  }

  // Consulta a la base de datos (incluye el nombre)
  const query = "SELECT nombre, rol FROM usuarios WHERE email = ? AND password_hash = ?";
  db.query(query, [email, password], (err, results) => {
    if (err) {
      console.error("Error en la consulta:", err.message);
      return res.status(500).send("Error en el servidor");
    }

    console.log("Resultado de la consulta:", results); // Depuración
    if (results.length > 0) {
      const userRol = results[0].rol;
      const userName = results[0].nombre; // Obtiene el nombre
      console.log("Rol de usuario:", userRol, "Rol esperado:", rol); // Depuración
      if (userRol === rol) {
        // Redirige según el rol y pasa el nombre
        switch (userRol) {
          case "admin":
            res.sendFile(__dirname + "/administrador.html", { userName });
            break;
          case "logistico":
            res.sendFile(__dirname + "/logistica.html", { userName });
            break;
          case "contador":
            res.sendFile(__dirname + "/contaduria.html", { userName });
            break;
          case "soporte":
            res.sendFile(__dirname + "/soporte.html", { userName });
            break;
          case "cajero":
            res.sendFile(__dirname + "/cajero.html", { userName });
            break;
          default:
            res.send("Rol no reconocido");
        }
      } else {
        res.send("El rol no coincide con el usuario. Usuario: " + userRol + ", Esperado: " + rol);
      }
    } else {
      res.send("Correo o contraseña incorrectos");
    }
  });
});

// Sirve los archivos HTML estáticos
app.get("/administrador.html", (req, res) => {
  res.sendFile(__dirname + "/administrador.html");
});
app.get("/logistica.html", (req, res) => {
  res.sendFile(__dirname + "/logistica.html");
});
app.get("/contaduria.html", (req, res) => {
  res.sendFile(__dirname + "/contaduria.html");
});
app.get("/soporte.html", (req, res) => {
  res.sendFile(__dirname + "/soporte.html");
});
app.get("/cajero.html", (req, res) => {
  res.sendFile(__dirname + "/cajero.html");
});

// Inicia el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
  exec(`start http://localhost:${port}`, (err) => {
    if (err) {
      console.error("Error al abrir el navegador:", err);
    }
  });
});