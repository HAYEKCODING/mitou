// Usage : node scripts/creer-admin.js
// Crée le premier compte administrateur du cabinet.

require('dotenv').config();
const readline = require('readline');
const AdminUser = require('../models/AdminUser');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (q) => new Promise((resolve) => rl.question(q, resolve));

(async () => {
  console.log('=== Création d\'un compte administrateur COUL ===\n');
  const nom = await question('Nom complet : ');
  const email = await question('Email : ');
  const mot_de_passe = await question('Mot de passe : ');

  try {
    const id = await AdminUser.create({ nom, email, mot_de_passe, role: 'super_admin' });
    console.log(`\n✅ Compte créé avec succès (id: ${id})`);
  } catch (err) {
    console.error('\n❌ Erreur :', err.message);
  }
  rl.close();
  process.exit(0);
})();
