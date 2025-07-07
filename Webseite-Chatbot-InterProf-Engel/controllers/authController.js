// controllers/authController.js

const bcrypt = require('bcrypt');

module.exports = {
  //Funktion zum Einloggen
  async login(req, res) {
    const { password } = req.body;
    if (!password) {
      return res.status(400).send('Passwort erforderlich');
    }

    const hash = process.env.ADMIN_HASH;
    const match = await bcrypt.compare(password, hash);

    if (!match) {
      return res.status(401).send('Ungültiges Passwort');
    }

    req.session.isAdmin = true;
    res.redirect('/admin.html');
  },

  //Funktion zum Ausloggen
  logout(req, res) {
    req.session.destroy(err => {
      if (err) return res.status(500).send('Logout-Fehler');
      res.redirect('/student.html');
    });
  }
};