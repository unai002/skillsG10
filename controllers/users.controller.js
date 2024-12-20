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
        const isFirstUser = Object.keys(mockUsers).length === 0;
        mockUsers[username] = { password: hashedPassword, admin: isFirstUser };

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

exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error al cerrar la sesión:', err);
            if (!res.headersSent) {
                return res.status(500).json({
                    status: 'error',
                    message: 'Error al cerrar la sesión'
                });
            }
        } else {
            if (!res.headersSent) {
                res.redirect('/'); // Redirige al usuario a la página de inicio
            }
        }
    });
};

exports.info = async (req, res) => {
    if (req.session.username) {
        res.json({
            username: req.session.username,
            admin: req.session.admin
        });
    } else {
        res.status(401).json({
            status: 'error',
            message: 'Usuario no autenticado'
        });
    }
};