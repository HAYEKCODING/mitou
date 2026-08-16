const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function request(path, options = {}) {
  const token = localStorage.getItem('coul_admin_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || `Erreur ${res.status}`);
  }
  return data;
}

export const api = {
  // Public
  getPrestations: () => request('/prestations'),
  getPrestation: (id) => request(`/prestations/${id}`),
  calculerPrix: (id, body) => request(`/prestations/${id}/calculer-prix`, {
    method: 'POST',
    body: JSON.stringify(body)
  }),
  envoyerDemande: (body) => request('/demandes', {
    method: 'POST',
    body: JSON.stringify(body)
  }),

  // Auth
  login: (email, mot_de_passe) => request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, mot_de_passe })
  }),

  // Admin — demandes
  getDemandes: (statut) => request(`/demandes${statut ? `?statut=${statut}` : ''}`),
  updateDemandeStatut: (id, statut) => request(`/demandes/${id}/statut`, {
    method: 'PATCH',
    body: JSON.stringify({ statut })
  }),

  // Admin — prestations
  creerPrestation: (body) => request('/prestations', {
    method: 'POST',
    body: JSON.stringify(body)
  }),
  modifierPrestation: (id, body) => request(`/prestations/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body)
  }),
  supprimerPrestation: (id) => request(`/prestations/${id}`, { method: 'DELETE' }),

  // Admin — paliers
  ajouterPalier: (prestationId, body) => request(`/prestations/${prestationId}/paliers`, {
    method: 'POST',
    body: JSON.stringify(body)
  }),
  modifierPalier: (palierId, body) => request(`/prestations/paliers/${palierId}`, {
    method: 'PUT',
    body: JSON.stringify(body)
  }),
  supprimerPalier: (palierId) => request(`/prestations/paliers/${palierId}`, { method: 'DELETE' })
};
