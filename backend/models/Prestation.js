const pool = require('../config/db');

class Prestation {
  // Récupérer toutes les prestations actives, avec leurs paliers
  static async findAllActive() {
    const [prestations] = await pool.query(
      'SELECT * FROM prestations WHERE actif = TRUE ORDER BY ordre_affichage ASC'
    );

    for (const p of prestations) {
      if (p.type_tarification === 'palier_unitaire' || p.type_tarification === 'palier_forfait') {
        const [paliers] = await pool.query(
          'SELECT * FROM paliers_tarifaires WHERE prestation_id = ? ORDER BY ordre ASC',
          [p.id]
        );
        p.paliers = paliers;
      }
    }
    return prestations;
  }

  static async findById(id) {
    const [rows] = await pool.query('SELECT * FROM prestations WHERE id = ?', [id]);
    if (!rows.length) return null;
    const prestation = rows[0];

    if (prestation.type_tarification === 'palier_unitaire' || prestation.type_tarification === 'palier_forfait') {
      const [paliers] = await pool.query(
        'SELECT * FROM paliers_tarifaires WHERE prestation_id = ? ORDER BY ordre ASC',
        [id]
      );
      prestation.paliers = paliers;
    }
    return prestation;
  }

  static async create(data) {
    const { nom, slug, description, icone, type_tarification, prix_flat, prix_min, prix_max, necessite_meme_cote, ordre_affichage } = data;
    const [result] = await pool.query(
      `INSERT INTO prestations (nom, slug, description, icone, type_tarification, prix_flat, prix_min, prix_max, necessite_meme_cote, ordre_affichage)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [nom, slug, description, icone, type_tarification, prix_flat || null, prix_min || null, prix_max || null, necessite_meme_cote || false, ordre_affichage || 0]
    );
    return result.insertId;
  }

  static async update(id, data) {
    const fields = [];
    const values = [];
    for (const [key, value] of Object.entries(data)) {
      fields.push(`${key} = ?`);
      values.push(value);
    }
    values.push(id);
    await pool.query(`UPDATE prestations SET ${fields.join(', ')} WHERE id = ?`, values);
  }

  static async delete(id) {
    await pool.query('UPDATE prestations SET actif = FALSE WHERE id = ?', [id]);
  }

  // ============================================
  // Ajouter / modifier / supprimer un palier
  // ============================================
  static async addPalier(prestationId, data) {
    const { dents_min, dents_max, prix_unitaire, prix_forfait, ordre } = data;
    const [result] = await pool.query(
      `INSERT INTO paliers_tarifaires (prestation_id, dents_min, dents_max, prix_unitaire, prix_forfait, ordre)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [prestationId, dents_min, dents_max, prix_unitaire || null, prix_forfait || null, ordre || 0]
    );
    return result.insertId;
  }

  static async updatePalier(id, data) {
    const fields = [];
    const values = [];
    for (const [key, value] of Object.entries(data)) {
      fields.push(`${key} = ?`);
      values.push(value);
    }
    values.push(id);
    await pool.query(`UPDATE paliers_tarifaires SET ${fields.join(', ')} WHERE id = ?`, values);
  }

  static async deletePalier(id) {
    await pool.query('DELETE FROM paliers_tarifaires WHERE id = ?', [id]);
  }

  // ============================================
  // CALCUL DE PRIX
  // Logique centrale : reçoit une prestation + des paramètres (nombre de dents, etc.)
  // et retourne le prix estimé. Utilisée à la fois par l'API et vérifiable côté frontend.
  // ============================================
  static calculerPrix(prestation, params = {}) {
    const { nombre_dents } = params;

    switch (prestation.type_tarification) {
      case 'flat':
        return {
          prix_min: prestation.prix_flat,
          prix_max: prestation.prix_flat,
          detail: prestation.nom
        };

      case 'fourchette':
        return {
          prix_min: prestation.prix_min,
          prix_max: prestation.prix_max,
          detail: `Selon évaluation en cabinet`
        };

      case 'palier_unitaire': {
        if (!nombre_dents || nombre_dents < 1) {
          throw new Error('nombre_dents requis pour ce type de prestation');
        }
        const palier = prestation.paliers.find(
          p => nombre_dents >= p.dents_min && nombre_dents <= p.dents_max
        );
        if (!palier) throw new Error('Aucun palier trouvé pour cette quantité');
        const total = palier.prix_unitaire * nombre_dents;
        return {
          prix_min: total,
          prix_max: total,
          detail: `${nombre_dents} dent(s) × ${palier.prix_unitaire} F`
        };
      }

      case 'palier_forfait': {
        if (!nombre_dents || nombre_dents < 1) {
          throw new Error('nombre_dents requis pour ce type de prestation');
        }
        const palier = prestation.paliers.find(
          p => nombre_dents >= p.dents_min && nombre_dents <= p.dents_max
        );
        if (!palier) throw new Error('Aucun palier trouvé pour cette quantité');
        return {
          prix_min: palier.prix_forfait,
          prix_max: palier.prix_forfait,
          detail: `Forfait pour ${nombre_dents} dent(s)`
        };
      }

      default:
        throw new Error('Type de tarification inconnu');
    }
  }
}

module.exports = Prestation;
