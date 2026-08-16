import { useEffect, useState } from 'react';

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`site-nav ${scrolled ? 'scrolled' : ''}`}>
      <div className="logo">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <path d="M12 2C8 2 5 4.5 5 8.5C5 11 6 13 6.5 15.5C7 18 7.5 21 9 21C10.3 21 10 17 12 17C14 17 13.7 21 15 21C16.5 21 17 18 17.5 15.5C18 13 19 11 19 8.5C19 4.5 16 2 12 2Z" fill="#C9A24D"/>
        </svg>
        COUL
      </div>
      <div className="navlinks">
        <a href="#prestations">Prestations</a>
        <a href="#simulateur">Estimer un prix</a>
        <a href="#galerie">Galerie</a>
        <a href="#contact">Contact</a>
      </div>
      <a href="#contact" className="nav-cta">Prendre rendez-vous</a>
    </nav>
  );
}
