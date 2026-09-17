const navigation = [
  { label: "Inici", href: "#inici" },
  { label: "Novetats", href: "#novetats" },
  { label: "Videotutorials", href: "#videotutorials" },
  { label: "Recursos", href: "#recursos" },
  { label: "Consultes", href: "#consultes" },
];

const quickLinks = [
  {
    eyebrow: "Aprendre",
    title: "Videotutorials",
    text: "Guies breus i pràctiques per resoldre necessitats digitals del dia a dia.",
    href: "#videotutorials",
    icon: "play",
  },
  {
    eyebrow: "Trobar",
    title: "Recursos útils",
    text: "Eines, documents i orientacions seleccionades per al claustre.",
    href: "#recursos",
    icon: "folder",
  },
  {
    eyebrow: "Demanar",
    title: "Fes una consulta",
    text: "Un canal clar per compartir un dubte o demanar acompanyament.",
    href: "#consultes",
    icon: "message",
  },
];

function Icon({ name }) {
  const paths = {
    play: <><rect x="3" y="5" width="18" height="14" rx="3"/><path d="m10 9 5 3-5 3Z"/></>,
    folder: <><path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H10l2 2h6.5A2.5 2.5 0 0 1 21 9.5v7A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5Z"/></>,
    message: <><path d="M5.5 5h13A2.5 2.5 0 0 1 21 7.5v8a2.5 2.5 0 0 1-2.5 2.5H11l-5 3v-3.4A2.5 2.5 0 0 1 3 15.5v-8A2.5 2.5 0 0 1 5.5 5Z"/><path d="M8 10h8M8 14h5"/></>,
    arrow: <><path d="M5 12h14M14 7l5 5-5 5"/></>,
  };

  return (
    <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}

function App() {
  return (
    <div className="site-shell">
      <header className="site-header">
        <a className="brand" href="#inici" aria-label="Espai TICE EASEO, inici">
          <img src="/tice-mark.svg" alt="" />
          <span>
            <strong>Espai TICE</strong>
            <small>EASEO · Ordino</small>
          </span>
        </a>

        <nav aria-label="Navegació principal">
          {navigation.map((item) => (
            <a key={item.href} href={item.href}>{item.label}</a>
          ))}
        </nav>

        <span className="building-badge">Primera base</span>
      </header>

      <main>
        <section className="hero" id="inici">
          <div className="hero-copy">
            <span className="kicker">Tecnologia per a l’aprenentatge i el coneixement</span>
            <h1>Un espai digital per avançar amb criteri i acompanyament.</h1>
            <p>
              Novetats, videotutorials, recursos i suport pràctic per integrar la
              tecnologia en el dia a dia del centre.
            </p>
            <div className="hero-actions">
              <a className="button primary" href="#novetats">Veure les novetats <Icon name="arrow" /></a>
              <a className="button secondary" href="#consultes">Fer una consulta</a>
            </div>
          </div>

          <aside className="hero-note" aria-label="Sobre aquesta primera versió">
            <span className="note-label">En construcció</span>
            <h2>Aquesta és la primera peça.</h2>
            <p>
              La base tècnica ja està connectada a Firebase. El contingut, les
              seccions i l’editor es definiran amb el claustre al centre de les decisions.
            </p>
            <div className="progress-track" aria-hidden="true"><span /></div>
            <small>Fonaments preparats · estructura per acordar</small>
          </aside>
        </section>

        <section className="quick-grid" aria-label="Accessos principals">
          {quickLinks.map((item) => (
            <a className="quick-card" href={item.href} key={item.title}>
              <span className="quick-icon"><Icon name={item.icon} /></span>
              <span className="quick-copy">
                <small>{item.eyebrow}</small>
                <strong>{item.title}</strong>
                <span>{item.text}</span>
              </span>
              <Icon name="arrow" />
            </a>
          ))}
        </section>

        <section className="content-layout">
          <div className="main-column">
            <div className="section-heading" id="novetats">
              <div>
                <span className="kicker">Al dia</span>
                <h2>Novetats</h2>
              </div>
              <span className="muted-label">Contingut de mostra</span>
            </div>

            <article className="featured-update">
              <div className="update-date">
                <strong>17</strong><span>SET</span>
              </div>
              <div>
                <span className="content-tag">Posada en marxa</span>
                <h3>Comença a prendre forma el nou Espai TICE de l’EASEO</h3>
                <p>
                  Preparem un punt de trobada per compartir recursos, explicar
                  novetats i facilitar l’acompanyament digital al claustre.
                </p>
              </div>
            </article>

            <div className="placeholder-section" id="videotutorials">
              <span className="content-tag">Properament</span>
              <h2>Videotutorials pensats per resoldre necessitats reals</h2>
              <p>
                Aquest espai enllaçarà amb els vídeos de Drive i permetrà trobar-los
                per tema, eina o nivell de dificultat.
              </p>
            </div>

            <div className="placeholder-section alt" id="recursos">
              <span className="content-tag">Biblioteca</span>
              <h2>Recursos ordenats, explicats i fàcils de recuperar</h2>
              <p>
                No serà un simple catàleg d’enllaços: cada recurs tindrà context,
                finalitat i indicacions pràctiques d’ús.
              </p>
            </div>
          </div>

          <aside className="updates-column">
            <span className="kicker">En un cop d’ull</span>
            <h2>Ara mateix</h2>
            <ol className="timeline">
              <li className="active">
                <span />
                <div><strong>Base tècnica</strong><small>React, Vite i Firebase</small></div>
              </li>
              <li>
                <span />
                <div><strong>Estructura editorial</strong><small>Pendent d’acordar</small></div>
              </li>
              <li>
                <span />
                <div><strong>Editor privat</strong><small>Següent fase</small></div>
              </li>
            </ol>

            <div className="contact-card" id="consultes">
              <span className="content-tag">Canal TICE</span>
              <h3>Tens un dubte o una necessitat?</h3>
              <p>
                Aquí hi haurà el canal privat de consultes del claustre. En definirem
                junts el funcionament abans d’activar-lo.
              </p>
              <span className="soon-label">Canal en preparació</span>
            </div>
          </aside>
        </section>
      </main>

      <footer>
        <div>
          <strong>Espai TICE · EASEO</strong>
          <span>Escola Andorrana de Segona Ensenyança d’Ordino</span>
        </div>
        <span>Primera base · curs 2026–2027</span>
      </footer>
    </div>
  );
}

export default App;

