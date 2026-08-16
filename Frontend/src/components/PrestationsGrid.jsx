function formatPrix(p) {
  if (p.type_tarification === 'flat') {
    return p.prix_flat ? `${p.prix_flat.toLocaleString('fr-FR')} F` : null;
  }
  if (p.type_tarification === 'fourchette') {
    return `${p.prix_min.toLocaleString('fr-FR')} – ${p.prix_max.toLocaleString('fr-FR')} F`;
  }
  return null; // palier_unitaire / palier_forfait -> renvoyer vers le simulateur
}

export default function PrestationsGrid({ prestations, onSelectPrestation }) {
  return (
    <section className="section" id="prestations">
      <div className="container">
        <div className="section-head">
          <div className="section-eyebrow">Nos prestations</div>
          <h2>Des soins complets pour votre sourire</h2>
          <p>Les prix ci-dessous sont indicatifs — utilisez le simulateur pour un montant précis selon votre cas.</p>
        </div>
        <div className="prestations-grid">
          {prestations.map((p) => {
            const prix = formatPrix(p);
            return (
              <div className="prestation-card" key={p.id}>
                <div className="prestation-icon">{p.icone}</div>
                <h3>{p.nom}</h3>
                {prix ? (
                  <div className="price">{prix}</div>
                ) : (
                  <div className="price devis">Sur devis</div>
                )}
                <p>{p.description}</p>
                {(p.type_tarification === 'palier_unitaire' || p.type_tarification === 'palier_forfait') && (
                  <span className="sim-link" onClick={() => onSelectPrestation(p.id)}>
                    Estimer le prix →
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
