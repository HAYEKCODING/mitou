import { useEffect, useState } from 'react';
import { api } from '../api/api';

export default function Simulateur({ prestations, selectedId, setSelectedId, onDemander }) {
  const [nombreDents, setNombreDents] = useState(1);
  const [position, setPosition] = useState('haut');
  const [resultat, setResultat] = useState(null);
  const [erreur, setErreur] = useState(null);
  const [loading, setLoading] = useState(false);

  const selected = prestations.find((p) => p.id === selectedId) || null;

  // reset champs quand on change de prestation
  useEffect(() => {
    setNombreDents(1);
    setPosition('haut');
    setResultat(null);
    setErreur(null);
  }, [selectedId]);

  // recalcul du prix (débattu à chaque changement pertinent)
  useEffect(() => {
    if (!selected) return;

    // Cas "sur devis" : pas de prix à calculer
    if (selected.type_tarification === 'flat' && !selected.prix_flat) {
      setResultat(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setErreur(null);

    const timeout = setTimeout(async () => {
      try {
        const body = {};
        if (selected.type_tarification === 'palier_unitaire' || selected.type_tarification === 'palier_forfait') {
          body.nombre_dents = nombreDents;
        }
        const data = await api.calculerPrix(selected.id, body);
        if (!cancelled) setResultat(data);
      } catch (err) {
        if (!cancelled) setErreur(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 200);

    return () => { cancelled = true; clearTimeout(timeout); };
  }, [selected, nombreDents]);

  const needsCount = selected && (selected.type_tarification === 'palier_unitaire' || selected.type_tarification === 'palier_forfait');
  const needsSide = selected && selected.necessite_meme_cote;

  const fmt = (n) => n.toLocaleString('fr-FR');

  return (
    <section className="section" id="simulateur" style={{ paddingTop: 0 }}>
      <div className="container">
        <div className="sim-wrap">
          <div className="sim-grid">
            <div className="sim-intro">
              <div className="section-eyebrow" style={{ color: 'var(--gold-light)' }}>Simulateur de prix</div>
              <h2>Estimez le coût de votre soin en 10 secondes</h2>
              <p>Choisissez votre besoin, indiquez le nombre de dents concernées, et obtenez un prix indicatif immédiat.</p>
            </div>

            <div className="sim-panel">
              <span className="field-label">Choisissez une prestation</span>
              <div className="service-grid">
                {prestations.map((p) => (
                  <div
                    key={p.id}
                    className={`service-opt ${selectedId === p.id ? 'active' : ''}`}
                    onClick={() => setSelectedId(p.id)}
                  >
                    <span>{p.icone}</span> {p.nom}
                  </div>
                ))}
              </div>

              {selected && (needsCount || selected.type_tarification === 'fourchette') && (
                <div className="subfields">
                  {needsCount && (
                    <div>
                      <span className="field-label">Nombre de dents</span>
                      <div className="stepper">
                        <button type="button" onClick={() => setNombreDents((n) => Math.max(1, n - 1))}>−</button>
                        <div className="count">{nombreDents}<span>dent(s)</span></div>
                        <button type="button" onClick={() => setNombreDents((n) => Math.min(14, n + 1))}>+</button>
                      </div>
                    </div>
                  )}

                  {needsSide && (
                    <div>
                      <span className="field-label">Position</span>
                      <div className="radio-row">
                        <div className={`radio-opt ${position === 'haut' ? 'active' : ''}`} onClick={() => setPosition('haut')}>Haut 👆</div>
                        <div className={`radio-opt ${position === 'bas' ? 'active' : ''}`} onClick={() => setPosition('bas')}>Bas 👇</div>
                      </div>
                    </div>
                  )}

                  {needsSide && (
                    <div className="warning">⚠️ Les dents doivent être du même côté (toutes en haut ou toutes en bas), même si elles ne sont pas alignées.</div>
                  )}
                  {selected.type_tarification === 'fourchette' && (
                    <div className="warning">ℹ️ Prix exact évalué en cabinet.</div>
                  )}
                </div>
              )}

              {!selected && (
                <div className="placeholder-msg">Sélectionnez une prestation pour voir le prix estimé.</div>
              )}

              {selected && selected.type_tarification === 'flat' && !selected.prix_flat && (
                <div className="result">
                  <div className="result-label">Prix</div>
                  <div className="result-amount">Sur devis</div>
                  <div className="result-detail">Contactez-nous pour une évaluation</div>
                </div>
              )}

              {selected && resultat && (
                <div className="result">
                  <div className="result-label">Prix estimé</div>
                  <div className="result-amount">
                    {resultat.prix_min === resultat.prix_max
                      ? <>{fmt(resultat.prix_min)} <span>F CFA</span></>
                      : <>{fmt(resultat.prix_min)}–{fmt(resultat.prix_max)} <span>F CFA</span></>}
                  </div>
                  <div className="result-detail">{resultat.detail}</div>
                </div>
              )}

              {erreur && <div className="warning">{erreur}</div>}

              <button
                className="btn-cta-full"
                disabled={!selected}
                onClick={() => onDemander({
                  prestation_id: selected?.id,
                  nombre_dents: needsCount ? nombreDents : null,
                  position_dents: needsSide ? position : null,
                  etat_carie: selected?.slug === 'soin-carie' ? 'legere' : (selected?.slug === 'carie-avancee' ? 'avancee' : null),
                  prix_estime_min: resultat?.prix_min ?? selected?.prix_flat ?? selected?.prix_min ?? null,
                  prix_estime_max: resultat?.prix_max ?? selected?.prix_flat ?? selected?.prix_max ?? null
                })}
              >
                Demander ce service →
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
