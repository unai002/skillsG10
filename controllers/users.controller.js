const bcrypt = require('bcrypt');
const User = require('../models/user.model'); // Import the User model

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

    try {
        // Check if the user already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({
                status: 'error',
                message: 'El usuario ya está registrado',
            });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log("register ", hashedPassword)

        // Determine if the user is the first user (admin)
        const isFirstUser = (await User.countDocuments({})) === 0;

        // Create a new user
        const newUser = new User({
            username,
            password: hashedPassword,
            admin: isFirstUser
        });

        // Save the user to the database
        await newUser.save();

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

    try {
        // Find the user in the database
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({
                status: 'error',
                message: 'El usuario no existe.',
            });
        }

        // Compare the provided password with the hashed password in the database
        const isMatch = await bcrypt.compare(password, user.password);
        console.log("login ", user.password)

        if (!isMatch) {
            return res.status(401).json({
                status: 'error',
                message: 'La contraseña es incorrecta.',
            });
        }

        req.session.username = username;
        req.session.admin = user.admin;

        return res.json({
            status: 'success',
            message: 'Usuario autenticado correctamente'
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Error al autenticar el usuario',
        });
    }
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