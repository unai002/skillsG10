const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');

exports.getAdminDashboard = (req, res) => {
    const username = req.session.username;
    const isAdmin = req.session.admin;
    res.render('admindashboard', { username, isAdmin });
};

exports.getAdminBadges = (req, res) => {
    const username = req.session.username;
    const isAdmin = req.session.admin;
    res.render('adminbadges', {username, admin: isAdmin});
}

exports.getEditBadge = (req, res) => {
    const badgeName = req.params.id;
    const badgesFilePath = path.join(__dirname, '../public/badges/badges.json');

    fs.readFile(badgesFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading badges file:', err);
            return res.status(500).render('error', { message: 'Internal Server Error', error: err });
        }

        const badges = JSON.parse(data);
        const badge = badges.find(b => b.name === badgeName);

        if (!badge) {
            const notFoundError = new Error('Badge not found');
            notFoundError.status = 404;
            return res.status(404).render('error', { message: 'Badge not found', error: notFoundError });
        }

        const username = req.session.username;
        const isAdmin = req.session.admin;

        res.render('editbadge', { badge, username, admin: isAdmin });
    });
};

exports.updateBadge = (req, res) => {
    const { id } = req.params;
    const { badgeName, range, minBitpoints, maxBitpoints, imageUrl } = req.body;
    const badgesFilePath = path.join(__dirname, '../public/badges/badges.json');

    fs.readFile(badgesFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error reading badges file');
        }

        let badges = JSON.parse(data);
        const badgeIndex = badges.findIndex(badge => badge.name === id);

        if (badgeIndex === -1) {
            return res.status(404).send('Badge not found');
        }

        const updatedBadge = {
            ...badges[badgeIndex],
            name: badgeName,
            'bitpoints-min': minBitpoints,
            'bitpoints-max': maxBitpoints,
            image_url: imageUrl
        };

        badges[badgeIndex] = updatedBadge;

        fs.writeFile(badgesFilePath, JSON.stringify(badges, null, 2), 'utf8', (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Error updating badge');
            }

            res.redirect('/admin/badges');
        });
    });
};

exports.deleteBadge = (req, res) => {
    const { id } = req.params;
    const badgesFilePath = path.join(__dirname, '../public/badges/badges.json');

    fs.readFile(badgesFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading badges file:', err);
            return res.status(500).render('error', { message: 'Internal Server Error', error: err });
        }

        let badges = JSON.parse(data);
        const badgeIndex = badges.findIndex(badge => badge.name === id);

        if (badgeIndex === -1) {
            const notFoundError = new Error('Badge not found');
            notFoundError.status = 404;
            return res.status(404).render('error', { message: 'Badge not found', error: notFoundError });
        }

        badges.splice(badgeIndex, 1);

        fs.writeFile(badgesFilePath, JSON.stringify(badges, null, 2), 'utf8', (err) => {
            if (err) {
                console.error('Error deleting badge:', err);
                return res.status(500).render('error', { message: 'Error deleting badge', error: err });
            }

            res.redirect('/admin/badges');
        });
    });
};


// Mock users database
const users = {
    admin: {
        password: '1234',
        admin: true
    },
    user: {
        password: '1234',
        admin: false
    }
};

// Convierte el objeto users en un arreglo
const userList = Object.keys(users).map(key => ({
    id: key, // Usamos el nombre como ID único
    username: key,
    password: users[key].password,
    admin: users[key].admin
}));

exports.changePassword = (req, res) => {
    const { userId, newPassword } = req.body;

    // Validamos que se haya proporcionado un ID de usuario y la nueva contraseña
    if (!userId || !newPassword) {

        return res.status(400).json({ error: 'Se requieren ambos parámetros: userId y newPassword.' });
    }

    // Buscar al usuario por su ID
    const user = userList.find(u => u.id === userId);
    console.log(user);
    if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    // Cambiar la contraseña del usuario
    user.password = newPassword;

    // Enviar respuesta JSON con el resultado del cambio
    res.json({ message: 'Contraseña cambiada con éxito.', user });
};

exports.getUserList = (req, res) => {
        res.render('usercontroller', { users: userList });
};