const pool = require('../config/db');
const bcrypt = require('bcryptjs');

class AdminUser {
  static async findByEmail(email) {
    const [rows] = await pool.query('SELECT * FROM admin_users WHERE email = ?', [email]);
    return rows[0] || null;
  }

  static async create({ nom, email, mot_de_passe, role }) {
    const hash = await bcrypt.hash(mot_de_passe, 10);
    const [result] = await pool.query(
      'INSERT INTO admin_users (nom, email, mot_de_passe, role) VALUES (?, ?, ?, ?)',
      [nom, email, hash, role || 'admin']
    );
    return result.insertId;
  }

  static async verifierMotDePasse(motDePasseClair, hash) {
    return bcrypt.compare(motDePasseClair, hash);
  }
}

module.exports = AdminUser;
