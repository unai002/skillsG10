const bcrypt = require('bcrypt');
const Badge = require('../models/badge.model'); // Ensure the path is correct
const User = require('../models/user.model'); // Ensure the path is correct

exports.getAdminDashboard = (req, res) => {
    const username = req.session.username;
    const isAdmin = req.session.admin;
    res.render('admindashboard', { username, isAdmin });
};

exports.getAdminBadges = async (req, res) => {
    try {
        const badges = await Badge.find().sort({ bitpoints_min: 1 });
        const username = req.session.username;
        const isAdmin = req.session.admin;

        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            res.json(badges);
        } else {
            res.render('adminbadges', { username, admin: isAdmin, badges });
        }
    } catch (err) {
        console.error('Error fetching badges from database:', err);
        res.status(500).render('error', { message: 'Internal Server Error', error: err });
    }
};

exports.getEditBadge = async (req, res) => {
    try {
        const badgeName = req.params.id;
        const badge = await Badge.findOne({ name: badgeName });

        if (!badge) {
            const notFoundError = new Error('Badge not found');
            notFoundError.status = 404;
            return res.status(404).render('error', { message: 'Badge not found', error: notFoundError });
        }

        const username = req.session.username;
        const isAdmin = req.session.admin;
        res.render('editbadge', { badge, username, admin: isAdmin });
    } catch (err) {
        console.error('Error fetching badge from database:', err);
        res.status(500).render('error', { message: 'Internal Server Error', error: err });
    }
};

exports.updateBadge = async (req, res) => {
    try {
        const { id } = req.params;
        const { badgeName, minBitpoints, maxBitpoints, imageUrl } = req.body;

        const updatedBadge = await Badge.findOneAndUpdate(
            { name: id },
            {
                name: badgeName,
                bitpoints_min: minBitpoints,
                bitpoints_max: maxBitpoints,
                image_url: imageUrl
            },
            { new: true }
        );

        if (!updatedBadge) {
            return res.status(404).send('Badge not found');
        }

        res.redirect('/admin/badges');
    } catch (err) {
        console.error('Error updating badge:', err);
        res.status(500).send('Error updating badge');
    }
};

exports.deleteBadge = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedBadge = await Badge.findOneAndDelete({ name: id });

        if (!deletedBadge) {
            const notFoundError = new Error('Badge not found');
            notFoundError.status = 404;
            return res.status(404).render('error', { message: 'Badge not found', error: notFoundError });
        }

        res.redirect('/admin/badges');
    } catch (err) {
        console.error('Error deleting badge:', err);
        res.status(500).render('error', { message: 'Error deleting badge', error: err });
    }
};

exports.changePassword = async (req, res) => {
    const { userId, newPassword } = req.body;

    if (!userId || !newPassword) {
        return res.status(400).json({ error: 'Both userId and newPassword are required.' });
    }

    try {

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;
        await user.save();

        res.redirect('/admin/dashboard');
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.getUserList = async (req, res) => {
    const username = req.session.username;
    const isAdmin = req.session.admin;
    try {
        const users = await User.find();
        console.log('Fetched users:', users);
        res.render('usercontroller', { users, username, admin: isAdmin });
    } catch (error) {
        console.error('Error fetching users from database:', error);
        res.status(500).render('error', { message: 'Internal Server Error', error });
    }
};