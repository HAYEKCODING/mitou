import { useEffect, useState } from 'react';
import { api } from '../api/api';

const STATUTS = [
  { value: 'en_attente', label: 'En attente' },
  { value: 'confirme', label: 'Confirmé' },
  { value: 'termine', label: 'Terminé' },
  { value: 'annule', label: 'Annulé' }
];

export default function DemandesList() {
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtre, setFiltre] = useState('');

  const charger = () => {
    setLoading(true);
    api.getDemandes(filtre || undefined)
      .then(setDemandes)
      .finally(() => setLoading(false));
  };

  useEffect(charger, [filtre]);

  const changerStatut = async (id, statut) => {
    await api.updateDemandeStatut(id, statut);
    charger();
  };

  return (
    <div>
      <div className="admin-section-title">
        <h3>Demandes reçues</h3>
        <select className="status-select" value={filtre} onChange={(e) => setFiltre(e.target.value)}>
          <option value="">Tous les statuts</option>
          {STATUTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      {loading ? (
        <p style={{ color: 'var(--muted)' }}>Chargement...</p>
      ) : demandes.length === 0 ? (
        <p style={{ color: 'var(--muted)' }}>Aucune demande pour le moment.</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Client</th>
              <th>Téléphone</th>
              <th>Prestation</th>
              <th>Détail</th>
              <th>Prix estimé</th>
              <th>Date souhaitée</th>
              <th>Reçu le</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            {demandes.map((d) => (
              <tr key={d.id}>
                <td>{d.nom_client}</td>
                <td>{d.telephone}</td>
                <td>{d.icone} {d.prestation_nom}</td>
                <td>
                  {d.nombre_dents ? `${d.nombre_dents} dent(s)` : ''}
                  {d.position_dents ? ` · ${d.position_dents}` : ''}
                  {d.etat_carie ? ` · ${d.etat_carie}` : ''}
                </td>
                <td>
                  {d.prix_estime_min
                    ? (d.prix_estime_min === d.prix_estime_max
                        ? `${d.prix_estime_min.toLocaleString('fr-FR')} F`
                        : `${d.prix_estime_min.toLocaleString('fr-FR')}–${d.prix_estime_max.toLocaleString('fr-FR')} F`)
                    : '—'}
                </td>
                <td>{d.date_souhaitee ? new Date(d.date_souhaitee).toLocaleDateString('fr-FR') : '—'}</td>
                <td>{new Date(d.created_at).toLocaleDateString('fr-FR')}</td>
                <td>
                  <select
                    className="status-select"
                    value={d.statut}
                    onChange={(e) => changerStatut(d.id, e.target.value)}
                  >
                    {STATUTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
