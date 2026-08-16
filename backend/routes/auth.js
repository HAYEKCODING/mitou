const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const AdminUser = require('../models/AdminUser');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, mot_de_passe } = req.body;
    if (!email || !mot_de_passe) {
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }

    const admin = await AdminUser.findByEmail(email);
    if (!admin) return res.status(401).json({ error: 'Identifiants incorrects' });

    const valide = await AdminUser.verifierMotDePasse(mot_de_passe, admin.mot_de_passe);
    if (!valide) return res.status(401).json({ error: 'Identifiants incorrects' });

    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: admin.role },
      process.env.JWT_SECRET || 'dev_secret_change_me',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      admin: { id: admin.id, nom: admin.nom, email: admin.email, role: admin.role }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
