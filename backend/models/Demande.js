const pool = require('../config/db');

class Demande {
  static async create(data) {
    const {
      nom_client, telephone, prestation_id, nombre_dents,
      position_dents, etat_carie, prix_estime_min, prix_estime_max,
      date_souhaitee, message
    } = data;

    const [result] = await pool.query(
      `INSERT INTO demandes
       (nom_client, telephone, prestation_id, nombre_dents, position_dents, etat_carie, prix_estime_min, prix_estime_max, date_souhaitee, message)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [nom_client, telephone, prestation_id, nombre_dents || null, position_dents || null,
       etat_carie || null, prix_estime_min || null, prix_estime_max || null,
       date_souhaitee || null, message || null]
    );
    return result.insertId;
  }

  static async findAll(statut = null) {
    let query = `
      SELECT d.*, p.nom AS prestation_nom, p.icone
      FROM demandes d
      JOIN prestations p ON d.prestation_id = p.id
    `;
    const params = [];
    if (statut) {
      query += ' WHERE d.statut = ?';
      params.push(statut);
    }
    query += ' ORDER BY d.created_at DESC';
    const [rows] = await pool.query(query, params);
    return rows;
  }

  static async updateStatut(id, statut) {
    await pool.query('UPDATE demandes SET statut = ? WHERE id = ?', [statut, id]);
  }
}

module.exports = Demande;
