import { useRef, useState, useCallback } from 'react';

export default function Hero() {
  const wrapRef = useRef(null);
  const [pct, setPct] = useState(50);
  const dragging = useRef(false);

  const setFromX = useCallback((clientX) => {
    const rect = wrapRef.current.getBoundingClientRect();
    let p = ((clientX - rect.left) / rect.width) * 100;
    p = Math.max(2, Math.min(98, p));
    setPct(p);
  }, []);

  const onMouseMove = (e) => { if (dragging.current) setFromX(e.clientX); };
  const onTouchMove = (e) => { if (dragging.current) setFromX(e.touches[0].clientX); };

  return (
    <section
      className="hero"
      onMouseUp={() => (dragging.current = false)}
      onMouseMove={onMouseMove}
      onTouchEnd={() => (dragging.current = false)}
      onTouchMove={onTouchMove}
    >
      <div className="container hero-grid">
        <div>
          <div className="eyebrow">Cabinet dentaire · Bouaké</div>
          <h1>Redonnez vie à <em>votre sourire</em>, à prix accessible</h1>
          <p>Détartrage, blanchiment, remplacement et réparation de prothèses — réalisés par des professionnels, dans un cadre soigné.</p>
          <div className="hero-ctas">
            <a href="#simulateur" className="btn-primary">Estimer mon prix →</a>
            <a href="#prestations" className="btn-ghost">Voir les prestations</a>
          </div>
        </div>

        <div
          ref={wrapRef}
          style={{
            position: 'relative', borderRadius: 20, overflow: 'hidden',
            boxShadow: '0 30px 60px rgba(0,0,0,0.35)', aspectRatio: '4/3.1',
            border: '1px solid rgba(201,162,77,0.25)'
          }}
        >
          <span style={{position:'absolute',top:16,left:16,padding:'5px 14px',borderRadius:20,fontSize:11,fontWeight:700,color:'#fff',background:'rgba(178,58,52,0.85)'}}>AVANT</span>
          <span style={{position:'absolute',top:16,right:16,padding:'5px 14px',borderRadius:20,fontSize:11,fontWeight:700,color:'#fff',background:'rgba(30,120,90,0.85)'}}>APRÈS</span>
          <img
            src="https://images.unsplash.com/photo-1609840114035-3c981b782dfe?w=800&q=80"
            alt="avant"
            style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover'}}
          />
          <img
            src="https://images.unsplash.com/photo-1581585095852-72e73a4f7c4c?w=800&q=80"
            alt="après"
            style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',clipPath:`inset(0 0 0 ${pct}%)`}}
          />
          <div
            onMouseDown={() => (dragging.current = true)}
            onTouchStart={() => (dragging.current = true)}
            style={{position:'absolute',top:0,bottom:0,left:`${pct}%`,display:'flex',alignItems:'center',justifyContent:'center',cursor:'ew-resize',transform:'translateX(-50%)'}}
          >
            <div style={{position:'absolute',top:0,bottom:0,width:3,background:'var(--gold)',boxShadow:'0 0 12px rgba(201,162,77,0.7)'}}></div>
            <div style={{width:44,height:44,borderRadius:'50%',background:'var(--gold)',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--navy)',fontSize:16,fontWeight:800,boxShadow:'0 6px 18px rgba(0,0,0,0.3)'}}>↔</div>
          </div>
        </div>
      </div>
    </section>
  );
}
