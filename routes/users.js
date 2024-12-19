var jwt = require('jsonwebtoken');
var express = require('express');
var router = express.Router();

// Definir el mock de usuarios (simula una base de datos en memoria)
const mockUsers = {
  admin: '1234',
  user: 'abcd',
};

// Clave secreta para JWT
const SECRET_KEY = 'my_secret_key';

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

// Ruta para el registro de usuarios
router.post('/register', (req, res) => {
  const { username, password } = req.body;

  // Validar que se envíen las credenciales
  if (!username || !password) {
    return res.status(400).json({
      status: 'error',
      message: 'Se requieren username y password',
    });
  }

  // Verificar si el usuario ya existe
  if (mockUsers[username]) {
    return res.status(400).json({
      status: 'error',
      message: 'El usuario ya está registrado',
    });
  }

  // Registrar el nuevo usuario en el mock
  mockUsers[username] = password;

  return res.status(201).json({
    status: 'success',
    message: 'Usuario registrado exitosamente',
  });
});

// Ruta para el inicio de sesión
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Validar que se envíen las credenciales
  if (!username || !password) {
    return res.status(400).json({
      status: 'error',
      message: 'Se requieren el username y el password',
    });
  }

  // Verificar las credenciales contra el mock
  if (mockUsers[username] && mockUsers[username] === password) {
    // Generar un token JWT con duración de 1 hora
    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' });

    return res.json({
      status: 'success',
      message: 'Usuario autenticado correctamente',
      token,
    });
  }

  // Si las credenciales son incorrectas
  return res.status(401).json({
    status: 'error',
    message: 'Credenciales incorrectas',
  });
});

module.exports = router;
