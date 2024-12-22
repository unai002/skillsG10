exports.getAdminDashboard = (req, res) => {
    const username = req.session.username;
    const isAdmin = req.session.admin;
    res.render('admindashboard', { username, isAdmin });
};