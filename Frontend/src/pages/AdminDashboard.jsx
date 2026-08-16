import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import DemandesList from '../admin/DemandesList';
import PrestationsManager from '../admin/PrestationsManager';

export default function AdminDashboard() {
  const [tab, setTab] = useState('demandes');
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  const seDeconnecter = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="admin-shell">
      <div className="admin-topbar">
        <div className="logo">COUL — Espace administrateur</div>
        <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          <span style={{ color: '#B9C4D8', fontSize: 13 }}>{admin?.nom}</span>
          <button className="admin-logout" onClick={seDeconnecter}>Déconnexion</button>
        </div>
      </div>

      <div className="admin-tabs">
        <button className={`admin-tab ${tab === 'demandes' ? 'active' : ''}`} onClick={() => setTab('demandes')}>Demandes</button>
        <button className={`admin-tab ${tab === 'prestations' ? 'active' : ''}`} onClick={() => setTab('prestations')}>Prestations & tarifs</button>
      </div>

      <div className="admin-content">
        {tab === 'demandes' ? <DemandesList /> : <PrestationsManager />}
      </div>
    </div>
  );
}
