import { useEffect, useState } from 'react';
import { api } from '../api/api';
import Nav from '../components/Nav';
import Hero from '../components/Hero';
import PrestationsGrid from '../components/PrestationsGrid';
import Simulateur from '../components/Simulateur';
import Gallery from '../components/Gallery';
import ContactForm from '../components/ContactForm';
import Footer from '../components/Footer';

export default function Home() {
  const [prestations, setPrestations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [prefill, setPrefill] = useState(null);

  useEffect(() => {
    api.getPrestations()
      .then(setPrestations)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const scrollToSimulateur = (id) => {
    setSelectedId(id);
    document.getElementById('simulateur')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToContact = (data) => {
    setPrefill(data);
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) {
    return <div className="loading-msg">Chargement du site...</div>;
  }

  if (error) {
    return (
      <div className="loading-msg">
        Impossible de charger les prestations ({error}).<br />
        Vérifiez que le serveur backend est bien démarré.
      </div>
    );
  }

  return (
    <>
      <Nav />
      <Hero />
      <div className="trust">
        <div className="trust-inner">
          <span>✓ Soins de qualité</span>
          <span>✓ Prix accessibles</span>
          <span>✓ Matériel professionnel</span>
          <span>✓ Bouaké, Dar es Salam Saint Jacques</span>
        </div>
      </div>
      <PrestationsGrid prestations={prestations} onSelectPrestation={scrollToSimulateur} />
      <Simulateur
        prestations={prestations}
        selectedId={selectedId}
        setSelectedId={setSelectedId}
        onDemander={scrollToContact}
      />
      <Gallery />
      <ContactForm prestations={prestations} prefill={prefill} />
      <Footer />
    </>
  );
}
