import { useEffect, useState } from 'react';
import { api } from '../api/api';

const TYPES = [
  { value: 'flat', label: 'Prix fixe' },
  { value: 'fourchette', label: 'Fourchette (min–max)' },
  { value: 'palier_unitaire', label: 'Palier — prix/dent selon tranche' },
  { value: 'palier_forfait', label: 'Palier — forfait selon tranche' }
];

function PrestationCard({ prestation, onChange }) {
  const [edit, setEdit] = useState({
    prix_flat: prestation.prix_flat || '',
    prix_min: prestation.prix_min || '',
    prix_max: prestation.prix_max || ''
  });
  const [paliers, setPaliers] = useState(prestation.paliers || []);
  const [savingPrix, setSavingPrix] = useState(false);

  const sauverPrix = async () => {
    setSavingPrix(true);
    try {
      await api.modifierPrestation(prestation.id, {
        prix_flat: edit.prix_flat ? Number(edit.prix_flat) : null,
        prix_min: edit.prix_min ? Number(edit.prix_min) : null,
        prix_max: edit.prix_max ? Number(edit.prix_max) : null
      });
      onChange();
    } finally {
      setSavingPrix(false);
    }
  };

  const majPalier = (id, field, value) => {
    setPaliers((ps) => ps.map((p) => p.id === id ? { ...p, [field]: value } : p));
  };

  const sauverPalier = async (palier) => {
    const body = prestation.type_tarification === 'palier_unitaire'
      ? { dents_min: Number(palier.dents_min), dents_max: Number(palier.dents_max), prix_unitaire: Number(palier.prix_unitaire) }
      : { dents_min: Number(palier.dents_min), dents_max: Number(palier.dents_max), prix_forfait: Number(palier.prix_forfait) };
    await api.modifierPalier(palier.id, body);
    onChange();
  };

  const supprimerPalier = async (id) => {
    if (!confirm('Supprimer ce palier ?')) return;
    await api.supprimerPalier(id);
    onChange();
  };

  const ajouterPalier = async () => {
    const isUnitaire = prestation.type_tarification === 'palier_unitaire';
    await api.ajouterPalier(prestation.id, {
      dents_min: 1,
      dents_max: 1,
      prix_unitaire: isUnitaire ? 1000 : null,
      prix_forfait: isUnitaire ? null : 1000,
      ordre: paliers.length + 1
    });
    onChange();
  };

  const supprimerPrestation = async () => {
    if (!confirm(`Retirer "${prestation.nom}" du site ?`)) return;
    await api.supprimerPrestation(prestation.id);
    onChange();
  };

  return (
    <div className="prestation-admin-card">
      <div className="prestation-admin-head">
        <h4>{prestation.icone} {prestation.nom}</h4>
        <button className="btn-small danger" onClick={supprimerPrestation}>Retirer</button>
      </div>

      {prestation.type_tarification === 'flat' && (
        <div className="inline-edit">
          <span className="field-label" style={{ margin: 0 }}>Prix (F CFA, vide = sur devis)</span>
          <input type="number" value={edit.prix_flat} onChange={(e) => setEdit({ ...edit, prix_flat: e.target.value })} />
          <button className="btn-small gold" onClick={sauverPrix} disabled={savingPrix}>Enregistrer</button>
        </div>
      )}

      {prestation.type_tarification === 'fourchette' && (
        <div className="inline-edit">
          <span className="field-label" style={{ margin: 0 }}>Min</span>
          <input type="number" value={edit.prix_min} onChange={(e) => setEdit({ ...edit, prix_min: e.target.value })} />
          <span className="field-label" style={{ margin: 0 }}>Max</span>
          <input type="number" value={edit.prix_max} onChange={(e) => setEdit({ ...edit, prix_max: e.target.value })} />
          <button className="btn-small gold" onClick={sauverPrix} disabled={savingPrix}>Enregistrer</button>
        </div>
      )}

      {(prestation.type_tarification === 'palier_unitaire' || prestation.type_tarification === 'palier_forfait') && (
        <div className="paliers-list">
          {paliers.map((p) => (
            <div className="palier-row" key={p.id}>
              <input type="number" value={p.dents_min} onChange={(e) => majPalier(p.id, 'dents_min', e.target.value)} placeholder="Dents min" />
              <input type="number" value={p.dents_max} onChange={(e) => majPalier(p.id, 'dents_max', e.target.value)} placeholder="Dents max" />
              {prestation.type_tarification === 'palier_unitaire' ? (
                <input type="number" value={p.prix_unitaire || ''} onChange={(e) => majPalier(p.id, 'prix_unitaire', e.target.value)} placeholder="F / dent" />
              ) : (
                <input type="number" value={p.prix_forfait || ''} onChange={(e) => majPalier(p.id, 'prix_forfait', e.target.value)} placeholder="Forfait F" />
              )}
              <div style={{ display: 'flex', gap: 6 }}>
                <button className="btn-small gold" onClick={() => sauverPalier(p)}>OK</button>
                <button className="btn-small danger" onClick={() => supprimerPalier(p.id)}>✕</button>
              </div>
            </div>
          ))}
          <button className="btn-small" onClick={ajouterPalier} style={{ alignSelf: 'flex-start', marginTop: 6 }}>+ Ajouter une tranche</button>
        </div>
      )}
    </div>
  );
}

export default function PrestationsManager() {
  const [prestations, setPrestations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [nouvelle, setNouvelle] = useState({
    nom: '', description: '', icone: '🦷', type_tarification: 'flat',
    prix_flat: '', prix_min: '', prix_max: '', necessite_meme_cote: false
  });

  const charger = () => {
    setLoading(true);
    api.getPrestations().then(setPrestations).finally(() => setLoading(false));
  };

  useEffect(charger, []);

  const creerPrestation = async (e) => {
    e.preventDefault();
    const slug = nouvelle.nom.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    await api.creerPrestation({
      ...nouvelle,
      slug,
      prix_flat: nouvelle.prix_flat ? Number(nouvelle.prix_flat) : null,
      prix_min: nouvelle.prix_min ? Number(nouvelle.prix_min) : null,
      prix_max: nouvelle.prix_max ? Number(nouvelle.prix_max) : null,
      ordre_affichage: prestations.length + 1
    });
    setShowForm(false);
    setNouvelle({ nom: '', description: '', icone: '🦷', type_tarification: 'flat', prix_flat: '', prix_min: '', prix_max: '', necessite_meme_cote: false });
    charger();
  };

  return (
    <div>
      <div className="admin-section-title">
        <h3>Prestations & tarifs</h3>
        <button className="btn-small gold" onClick={() => setShowForm((s) => !s)}>
          {showForm ? 'Annuler' : '+ Nouvelle prestation'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={creerPrestation} style={{ background: 'var(--ivory)', padding: 20, borderRadius: 14, marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input placeholder="Nom de la prestation" required value={nouvelle.nom} onChange={(e) => setNouvelle({ ...nouvelle, nom: e.target.value })} style={{ background: '#fff', color: 'var(--ink)', border: '1px solid #E4DFD1', padding: 12, borderRadius: 8 }} />
          <input placeholder="Description" value={nouvelle.description} onChange={(e) => setNouvelle({ ...nouvelle, description: e.target.value })} style={{ background: '#fff', color: 'var(--ink)', border: '1px solid #E4DFD1', padding: 12, borderRadius: 8 }} />
          <input placeholder="Icône (emoji)" value={nouvelle.icone} onChange={(e) => setNouvelle({ ...nouvelle, icone: e.target.value })} style={{ background: '#fff', color: 'var(--ink)', border: '1px solid #E4DFD1', padding: 12, borderRadius: 8, width: 100 }} />
          <select value={nouvelle.type_tarification} onChange={(e) => setNouvelle({ ...nouvelle, type_tarification: e.target.value })} style={{ background: '#fff', color: 'var(--ink)', border: '1px solid #E4DFD1', padding: 12, borderRadius: 8 }}>
            {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>

          {nouvelle.type_tarification === 'flat' && (
            <input type="number" placeholder="Prix (F CFA, vide = sur devis)" value={nouvelle.prix_flat} onChange={(e) => setNouvelle({ ...nouvelle, prix_flat: e.target.value })} style={{ background: '#fff', color: 'var(--ink)', border: '1px solid #E4DFD1', padding: 12, borderRadius: 8 }} />
          )}
          {nouvelle.type_tarification === 'fourchette' && (
            <div style={{ display: 'flex', gap: 10 }}>
              <input type="number" placeholder="Prix min" value={nouvelle.prix_min} onChange={(e) => setNouvelle({ ...nouvelle, prix_min: e.target.value })} style={{ background: '#fff', color: 'var(--ink)', border: '1px solid #E4DFD1', padding: 12, borderRadius: 8, flex: 1 }} />
              <input type="number" placeholder="Prix max" value={nouvelle.prix_max} onChange={(e) => setNouvelle({ ...nouvelle, prix_max: e.target.value })} style={{ background: '#fff', color: 'var(--ink)', border: '1px solid #E4DFD1', padding: 12, borderRadius: 8, flex: 1 }} />
            </div>
          )}
          {(nouvelle.type_tarification === 'palier_unitaire') && (
            <label style={{ fontSize: 13, display: 'flex', gap: 8, alignItems: 'center' }}>
              <input type="checkbox" checked={nouvelle.necessite_meme_cote} onChange={(e) => setNouvelle({ ...nouvelle, necessite_meme_cote: e.target.checked })} />
              Nécessite que les dents soient du même côté (haut/bas)
            </label>
          )}
          {(nouvelle.type_tarification === 'palier_unitaire' || nouvelle.type_tarification === 'palier_forfait') && (
            <p style={{ fontSize: 12, color: 'var(--muted)' }}>Les tranches de prix (paliers) pourront être ajoutées juste après la création.</p>
          )}

          <button className="btn-small gold" type="submit" style={{ padding: '12px', alignSelf: 'flex-start' }}>Créer la prestation</button>
        </form>
      )}

      {loading ? (
        <p style={{ color: 'var(--muted)' }}>Chargement...</p>
      ) : (
        prestations.map((p) => (
          <PrestationCard key={p.id} prestation={p} onChange={charger} />
        ))
      )}
    </div>
  );
}
