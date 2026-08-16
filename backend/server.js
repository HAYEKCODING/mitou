require('dotenv').config();
const express = require('express');
const cors = require('cors');

const prestationsRoutes = require('./routes/prestations');
const demandesRoutes = require('./routes/demandes');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/prestations', prestationsRoutes);
app.use('/api/demandes', demandesRoutes);
app.use('/api/auth', authRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API COUL Prothèse Dentaire en ligne' });
});

app.listen(PORT, () => {
  console.log(`✅ Serveur démarré sur http://localhost:${PORT}`);
});
