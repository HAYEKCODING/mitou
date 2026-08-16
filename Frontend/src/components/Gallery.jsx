const items = [
  { img: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=500&q=80', label: 'Blanchiment dentaire' },
  { img: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=500&q=80', label: 'Détartrage professionnel' },
  { img: 'https://images.unsplash.com/photo-1601387656963-3aec33e2c2c8?w=500&q=80', label: 'Pose de prothèse' },
  { img: 'https://images.unsplash.com/photo-1609840114035-3c981b782dfe?w=500&q=80', label: 'Réparation prothèse' }
];

export default function Gallery() {
  return (
    <section className="section" id="galerie">
      <div className="container">
        <div className="section-head">
          <div className="section-eyebrow">Résultats</div>
          <h2>Nos réalisations avant / après</h2>
        </div>
        <div className="gallery-strip">
          {items.map((it, i) => (
            <div className="gallery-item" key={i}>
              <img src={it.img} alt={it.label} />
              <div className="gallery-label">{it.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
