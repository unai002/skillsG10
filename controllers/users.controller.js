const bcrypt = require('bcrypt');
const User = require('../models/user.model');
const Badge = require('../models/badge.model');

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

exports.allUsers = async (req, res) => {
    try {
        const users = await User.find({});
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching users',
        });
    }
};

exports.leaderboard = (req, res) => {
    res.render('leaderboard', {username: req.session.username, admin: req.session.admin});
}

exports.badges = async (req, res) => {
    try {
        console.log('Fetching badges...'); // Log the start of the function
        const badges = await Badge.find({}).sort({ bitpoints_min: 1 }); // Sort by bitpoints_min in ascending order
        console.log('Badges fetched:', badges); // Log the fetched badges
        res.json(badges);
    } catch (error) {
        console.error('Error fetching badges:', error); // Log the error
        res.status(500).json({
            status: 'error',
            message: 'Error al obtener los badges',
        });
    }
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