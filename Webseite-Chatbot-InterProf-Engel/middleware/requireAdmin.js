// middleware/requireAdmin.js

module.exports = (req, res, next) => {
  // Admin-Bereich nur bei erfolgreichem Login abrufbar
  if (req.session.isAdmin) {
    return next();
  }
  res.redirect('student.html');
};