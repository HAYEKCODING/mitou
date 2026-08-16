const express = require('express');
const router = express.Router();
const Prestation = require('../models/Prestation');
const auth = require('../middleware/auth');

// GET /api/prestations — liste publique (pour affichage sur le site)
router.get('/', async (req, res) => {
  try {
    const prestations = await Prestation.findAllActive();
    res.json(prestations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/prestations/:id
router.get('/:id', async (req, res) => {
  try {
    const prestation = await Prestation.findById(req.params.id);
    if (!prestation) return res.status(404).json({ error: 'Prestation introuvable' });
    res.json(prestation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/prestations/:id/calculer-prix — utilisé par le simulateur
// body: { nombre_dents }
router.post('/:id/calculer-prix', async (req, res) => {
  try {
    const prestation = await Prestation.findById(req.params.id);
    if (!prestation) return res.status(404).json({ error: 'Prestation introuvable' });

    const resultat = Prestation.calculerPrix(prestation, req.body);
    res.json(resultat);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ============================================
// ROUTES ADMIN (protégées) — gestion des prestations
// ============================================

// POST /api/prestations — créer une prestation
router.post('/', auth, async (req, res) => {
  try {
    const id = await Prestation.create(req.body);
    res.status(201).json({ id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/prestations/:id — modifier une prestation
router.put('/:id', auth, async (req, res) => {
  try {
    await Prestation.update(req.params.id, req.body);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/prestations/:id — désactiver une prestation
router.delete('/:id', auth, async (req, res) => {
  try {
    await Prestation.delete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/prestations/:id/paliers — ajouter un palier tarifaire
router.post('/:id/paliers', auth, async (req, res) => {
  try {
    const id = await Prestation.addPalier(req.params.id, req.body);
    res.status(201).json({ id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/prestations/paliers/:palierId — modifier un palier
router.put('/paliers/:palierId', auth, async (req, res) => {
  try {
    await Prestation.updatePalier(req.params.palierId, req.body);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/prestations/paliers/:palierId
router.delete('/paliers/:palierId', auth, async (req, res) => {
  try {
    await Prestation.deletePalier(req.params.palierId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
