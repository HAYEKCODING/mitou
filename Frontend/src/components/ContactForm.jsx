import { useEffect, useState } from 'react';
import { api } from '../api/api';

const initialForm = {
  nom_client: '', telephone: '', prestation_id: '', nombre_dents: '',
  position_dents: '', etat_carie: '', date_souhaitee: '', message: ''
};

export default function ContactForm({ prestations, prefill }) {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState(null); // null | 'sending' | 'success' | 'error'
  const [errorMsg, setErrorMsg] = useState('');

  // pré-remplir si l'utilisateur arrive depuis le simulateur
  useEffect(() => {
    if (prefill) {
      setForm((f) => ({
        ...f,
        prestation_id: prefill.prestation_id || '',
        nombre_dents: prefill.nombre_dents || '',
        position_dents: prefill.position_dents || '',
        etat_carie: prefill.etat_carie || ''
      }));
    }
  }, [prefill]);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    setErrorMsg('');
    try {
      await api.envoyerDemande({
        ...form,
        prestation_id: Number(form.prestation_id),
        nombre_dents: form.nombre_dents ? Number(form.nombre_dents) : null,
        prix_estime_min: prefill?.prix_estime_min ?? null,
        prix_estime_max: prefill?.prix_estime_max ?? null
      });
      setStatus('success');
      setForm(initialForm);
    } catch (err) {
      setStatus('error');
      setErrorMsg(err.message);
    }
  };

  return (
    <section className="section" id="contact">
      <div className="container">
        <div className="form-section">
          <div className="form-copy">
            <h2>Demandez votre service en quelques clics</h2>
            <p>Laissez vos coordonnées, notre équipe vous recontacte pour confirmer votre rendez-vous et le prix exact.</p>
            <div className="mini">📍 Bouaké, Dar es Salam Saint Jacques</div>
            <div className="mini">📞 07.99.73.83.52 / 07.69.89.28.62</div>
          </div>

          <form onSubmit={submit}>
            <input type="text" placeholder="Nom complet" required value={form.nom_client} onChange={update('nom_client')} />
            <input type="tel" placeholder="Numéro de téléphone" required value={form.telephone} onChange={update('telephone')} />
            <select required value={form.prestation_id} onChange={update('prestation_id')}>
              <option value="">Choisir une prestation</option>
              {prestations.map((p) => (
                <option key={p.id} value={p.id}>{p.nom}</option>
              ))}
            </select>
            <input type="date" value={form.date_souhaitee} onChange={update('date_souhaitee')} />
            <textarea placeholder="Message (facultatif)" rows="3" value={form.message} onChange={update('message')} />

            {status === 'success' && <div className="form-msg success">Demande envoyée avec succès ✓ Nous vous recontactons rapidement.</div>}
            {status === 'error' && <div className="form-msg error">Erreur : {errorMsg}</div>}

            <button type="submit" disabled={status === 'sending'}>
              {status === 'sending' ? 'Envoi...' : 'Envoyer la demande'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
