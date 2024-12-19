const bcrypt = require('bcrypt');

// Mock users database
const mockUsers = {
    admin: {
        password: bcrypt.hashSync('1234', 10),
        admin: true
    },
    user: {
        password: bcrypt.hashSync('1234', 10),
        admin: false
    }
};

exports.register = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            status: 'error',
            message: 'Se requieren username y password',
        });
    }

    if (mockUsers[username]) {
        return res.status(400).json({
            status: 'error',
            message: 'El usuario ya está registrado',
        });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        mockUsers[username] = { password: hashedPassword, admin: false }; // Set admin to false

        return res.status(201).json({
            status: 'success',
            message: 'Usuario registrado exitosamente',
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Error al registrar el usuario',
        });
    }
};

exports.login = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            status: 'error',
            message: 'Se requieren el username y el password',
        });
    }

    const user = mockUsers[username];
    if (user && await bcrypt.compare(password, user.password)) {

        req.session.username = username;
        req.session.admin = user.admin;

        return res.json({
            status: 'success',
            message: 'Usuario autenticado correctamente'
        });
    }

    return res.status(401).json({
        status: 'error',
        message: 'Credenciales incorrectas',
    });
};