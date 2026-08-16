const express = require('express');
const router = express.Router();
const Demande = require('../models/Demande');
const auth = require('../middleware/auth');

// POST /api/demandes — un visiteur envoie une demande de service (public)
router.post('/', async (req, res) => {
  try {
    const { nom_client, telephone, prestation_id } = req.body;
    if (!nom_client || !telephone || !prestation_id) {
      return res.status(400).json({ error: 'Nom, téléphone et prestation sont requis' });
    }
    const id = await Demande.create(req.body);
    res.status(201).json({ id, message: 'Demande envoyée avec succès' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/demandes — liste des demandes (admin uniquement)
// query optionnelle : ?statut=en_attente
router.get('/', auth, async (req, res) => {
  try {
    const demandes = await Demande.findAll(req.query.statut);
    res.json(demandes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/demandes/:id/statut — changer le statut (admin)
router.patch('/:id/statut', auth, async (req, res) => {
  try {
    const { statut } = req.body;
    const valides = ['en_attente', 'confirme', 'termine', 'annule'];
    if (!valides.includes(statut)) {
      return res.status(400).json({ error: 'Statut invalide' });
    }
    await Demande.updateStatut(req.params.id, statut);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
