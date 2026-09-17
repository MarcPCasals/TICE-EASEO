import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Brain,
  ChartBar,
  CheckCircle,
  Copy,
  Devices,
  FileText,
  GoogleChromeLogo,
  MagnifyingGlass,
  MonitorPlay,
  SignOut,
  Sparkle,
  Wrench,
  X,
} from "@phosphor-icons/react";
import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db, googleProvider } from "./lib/firebase";

const ADMIN_EMAIL = "mperezc@educand.ad";
const previewUser = { displayName: "Marc Pérez", email: ADMIN_EMAIL, photoURL: "" };

const resources = [
  {
    id: "doble-autenticacio",
    type: "Videotutorial",
    category: "Google i Chrome",
    title: "Com activar l’autenticació de dos passos al compte Educand?",
    summary: "Augmenta la seguretat del teu compte en pocs minuts. Una guia clara, pas a pas, per activar la verificació en dos passos.",
    status: "Vídeo en preparació",
    image: "/two-step-verification.png",
    keywords: "google educand autenticació verificació dos passos seguretat compte vídeo tutorial",
  },
  {
    id: "prompt-rubriques",
    type: "Recurs destacat",
    category: "Biblioteca de prompts",
    title: "Prompt per fer les rúbriques d’avaluació",
    summary: "Un model de prompt per adaptar i generar rúbriques clares, coherents i alineades amb les competències.",
    status: "Prompt en preparació",
    date: "15 set. 2026",
    keywords: "prompt rúbriques avaluació competències chatgpt gemini claude",
  },
  {
    id: "comparativa-ia",
    type: "Article",
    category: "IA bàsica",
    title: "Gemini, ChatGPT o Claude: quina IA convé en cada situació?",
    summary: "Una comparativa clara i pràctica per triar l’eina adequada segons l’objectiu, el tipus de tasca i el context educatiu.",
    status: "Article en preparació",
    date: "12 set. 2026",
    keywords: "gemini chatgpt claude comparativa intel·ligència artificial eina quan",
  },
];

const topics = [
  { title: "Google i Chrome", subtitle: "Treballa millor", icon: GoogleChromeLogo, query: "Google" },
  { title: "IA bàsica", subtitle: "Comença des de zero", icon: Brain, query: "IA bàsica" },
  { title: "Eines d’IA", subtitle: "Recursos pràctics", icon: Wrench, query: "Eines IA" },
  { title: "Biblioteca de prompts", subtitle: "Idees llestes per usar", icon: FileText, query: "prompt" },
  { title: "IA avançada", subtitle: "Un pas més enllà", icon: ChartBar, query: "IA avançada" },
  { title: "Dispositius electrònics", subtitle: "Configuració i ús", icon: Devices, query: "dispositius" },
  { title: "Artefactes per assignatures", subtitle: "Idees per a l’aula", icon: BookOpen, query: "artefactes" },
];

function Brand() {
  return (
    <a className="brand" href="#inici" aria-label="Racó TIC-TAC, inici">
      <img src="/raco-tic-tac.svg" alt="Racó TIC-TAC. Pedagogia per al món digital" />
    </a>
  );
}

function AccessGate({ onSignIn, error, busy }) {
  return (
    <main className="access-gate">
      <div className="access-panel">
        <Brand />
        <span className="eyebrow">Servei TICE · EASEO</span>
        <h1>Pedagogia per al món digital.</h1>
        <p>Recursos, guies i acompanyament digital per a la comunitat Educand.</p>
        <button className="primary-button" type="button" onClick={onSignIn} disabled={busy}>
          {busy ? "Connectant…" : "Entrar amb el compte Educand"}
          <ArrowRight weight="bold" />
        </button>
        {error && <p className="form-error" role="alert">{error}</p>}
      </div>
    </main>
  );
}

function ResourceDialog({ resource, onClose }) {
  const [copied, setCopied] = useState(false);
  if (!resource) return null;

  const copyTitle = async () => {
    await navigator.clipboard?.writeText(resource.title);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="resource-dialog" role="dialog" aria-modal="true" aria-labelledby="resource-title" onMouseDown={(event) => event.stopPropagation()}>
        <button className="icon-button close-button" type="button" onClick={onClose} aria-label="Tancar"><X /></button>
        {resource.image && <img className="dialog-image" src={resource.image} alt="Telèfon amb la verificació en dos passos activada" />}
        <div className="dialog-copy">
          <span className="content-type">{resource.type}</span>
          <h2 id="resource-title">{resource.title}</h2>
          <p>{resource.summary}</p>
          <div className="preparation-note">
            <Sparkle weight="fill" />
            <div><strong>{resource.status}</strong><span>Aquesta és la fitxa inicial. El contingut complet s’hi afegirà des de l’editor.</span></div>
          </div>
          {resource.id === "prompt-rubriques" && (
            <button className="secondary-button" type="button" onClick={copyTitle}>
              {copied ? <CheckCircle weight="fill" /> : <Copy />}
              {copied ? "Copiat" : "Copiar el títol del prompt"}
            </button>
          )}
        </div>
      </section>
    </div>
  );
}

function ConsultationDialog({ user, context, onClose }) {
  const [topic, setTopic] = useState(context || "Consulta general");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    if (!message.trim()) return;
    setStatus("sending");
    setError("");
    try {
      if (!import.meta.env.DEV) {
        await addDoc(collection(db, "consultations"), {
          name: user.displayName || "Usuari Educand",
          email: user.email,
          topic,
          message: message.trim(),
          status: "new",
          createdAt: serverTimestamp(),
        });
      }
      setStatus("sent");
    } catch {
      setStatus("idle");
      setError("No s’ha pogut enviar la consulta. Torna-ho a provar d’aquí a un moment.");
    }
  };

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="consultation-dialog" role="dialog" aria-modal="true" aria-labelledby="consultation-title" onMouseDown={(event) => event.stopPropagation()}>
        <button className="icon-button close-button" type="button" onClick={onClose} aria-label="Tancar"><X /></button>
        {status === "sent" ? (
          <div className="success-message">
            <CheckCircle weight="fill" />
            <span className="eyebrow">Consulta enviada</span>
            <h2 id="consultation-title">Ja la tenim registrada.</h2>
            <p>La resposta arribarà al teu correu Educand: <strong>{user.email}</strong>.</p>
            <button className="primary-button" type="button" onClick={onClose}>D’acord</button>
          </div>
        ) : (
          <form onSubmit={submit}>
            <span className="eyebrow">Canal TICE</span>
            <h2 id="consultation-title">Fes una consulta</h2>
            <p>La consulta quedarà vinculada al teu compte Educand i la resposta t’arribarà per correu.</p>
            <label>Tema general<input value={topic} onChange={(event) => setTopic(event.target.value)} /></label>
            <label>Explica’ns el dubte<textarea rows="6" value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Què necessites resoldre?" required /></label>
            <div className="identity-row"><span>{user.displayName}</span><span>{user.email}</span></div>
            {error && <p className="form-error" role="alert">{error}</p>}
            <button className="primary-button" type="submit" disabled={status === "sending"}>
              {status === "sending" ? "Enviant…" : "Enviar la consulta"}<ArrowRight weight="bold" />
            </button>
          </form>
        )}
      </section>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(import.meta.env.DEV ? previewUser : null);
  const [authReady, setAuthReady] = useState(import.meta.env.DEV);
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState("");
  const [accountOpen, setAccountOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  const [consultationContext, setConsultationContext] = useState(null);
  const searchRef = useRef(null);

  useEffect(() => {
    if (import.meta.env.DEV) return undefined;
    return onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setAuthReady(true);
    });
  }, []);

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === "Escape") {
        setSelectedResource(null);
        setConsultationContext(null);
        setSearchOpen(false);
      }
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  const matches = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("ca");
    if (!needle) return resources;
    return resources.filter((resource) => `${resource.title} ${resource.summary} ${resource.category} ${resource.keywords}`.toLocaleLowerCase("ca").includes(needle));
  }, [query]);

  const handleSignIn = async () => {
    setAuthBusy(true);
    setAuthError("");
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const email = result.user.email?.toLowerCase() || "";
      if (!email.endsWith("@educand.ad")) {
        await signOut(auth);
        setAuthError("Cal entrar amb un compte @educand.ad.");
      }
    } catch (error) {
      if (error.code !== "auth/popup-closed-by-user") setAuthError("No s’ha pogut iniciar la sessió. Torna-ho a provar.");
    } finally {
      setAuthBusy(false);
    }
  };

  const runSearch = (event) => {
    event.preventDefault();
    setSearchOpen(true);
  };

  const chooseTopic = (topic) => {
    setQuery(topic.query);
    setSearchOpen(true);
    window.requestAnimationFrame(() => searchRef.current?.focus());
  };

  if (!authReady) return <div className="loading-screen">Preparant el Racó…</div>;
  if (!user) return <AccessGate onSignIn={handleSignIn} error={authError} busy={authBusy} />;

  const initials = (user.displayName || user.email || "ED").split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();

  return (
    <div className="site-shell" id="inici">
      <header className="site-header">
        <Brand />
        <nav aria-label="Navegació principal">
          <a className="active" href="#inici">Inici</a><a href="#guies">Guies</a><a href="#videotutorials">Videotutorials</a><a href="#recursos">Recursos</a><a href="#avui-al-raco">Novetats</a>
          <button type="button" onClick={() => setConsultationContext("Consulta general")}>Consulta</button>
        </nav>
        <div className="account-wrap">
          <button className="account-button" type="button" onClick={() => setAccountOpen((open) => !open)} aria-expanded={accountOpen}>
            <span className="avatar">{initials}</span><span><strong>{user.displayName?.split(" ")[0] || "Educand"}</strong><small>Compte Educand</small></span>
          </button>
          {accountOpen && (
            <div className="account-menu"><span>{user.email}</span>{user.email?.toLowerCase() === ADMIN_EMAIL && <strong>Administrador</strong>}{!import.meta.env.DEV && <button type="button" onClick={() => signOut(auth)}><SignOut /> Tancar sessió</button>}</div>
          )}
        </div>
      </header>

      <main>
        <section className="hero-section" aria-labelledby="hero-title">
          <span className="eyebrow">Tecnologia per a l’aprenentatge a l’EASEO</span>
          <h1 id="hero-title">Tens un dubte digital?<br />Aquí tens <em>la resposta.</em></h1>
          <p>Guies, recursos i acompanyament per integrar la tecnologia a la teva pràctica docent.</p>
          <form className="search-form" role="search" onSubmit={runSearch}>
            <MagnifyingGlass aria-hidden="true" />
            <input ref={searchRef} value={query} onChange={(event) => { setQuery(event.target.value); setSearchOpen(true); }} onFocus={() => setSearchOpen(true)} placeholder="Què necessites resoldre avui?" aria-label="Cercar recursos" />
            {query && <button className="clear-search" type="button" onClick={() => setQuery("")} aria-label="Netejar la cerca"><X /></button>}
            <button className="search-submit" type="submit">Cercar</button>
            {searchOpen && (
              <div className="search-results" role="region" aria-label="Resultats de cerca">
                <div className="results-heading"><strong>{query ? `Resultats per “${query}”` : "Recursos destacats"}</strong><button type="button" onClick={() => setSearchOpen(false)}><X /></button></div>
                {matches.length ? matches.map((resource) => (
                  <button type="button" className="search-result" key={resource.id} onClick={() => { setSelectedResource(resource); setSearchOpen(false); }}><span>{resource.type}</span><strong>{resource.title}</strong><ArrowRight /></button>
                )) : <p className="empty-results">Encara no hi ha cap recurs sobre aquest tema. Pots enviar-nos una consulta.</p>}
              </div>
            )}
          </form>
          <p className="search-note">Troba guies, exemples i solucions en segons.</p>
        </section>

        <section className="topics-strip" id="guies" aria-label="Temes principals">
          {topics.map(({ title, subtitle, icon: TopicIcon, query: topicQuery }) => (
            <button type="button" key={title} onClick={() => chooseTopic({ query: topicQuery })}><TopicIcon weight="regular" /><span><strong>{title}</strong><small>{subtitle}</small></span></button>
          ))}
        </section>

        <section className="editorial-grid" id="recursos">
          <article className="featured-resource" id="videotutorials">
            <div className="featured-copy">
              <span className="content-type">Últim recurs</span><h2>{resources[0].title}</h2><p>{resources[0].summary}</p>
              <button className="primary-button" type="button" onClick={() => setSelectedResource(resources[0])}>Veure la guia completa <ArrowRight weight="bold" /></button>
            </div>
            <button className="featured-image-button" type="button" onClick={() => setSelectedResource(resources[0])} aria-label={`Obrir: ${resources[0].title}`}>
              <img src={resources[0].image} alt="Telèfon amb la verificació en dos passos activada" /><span className="image-label"><MonitorPlay weight="fill" /> Videotutorial</span>
            </button>
          </article>

          <aside className="today-column" id="avui-al-raco">
            <div className="today-heading"><h2>Avui al Racó</h2><a href="#recursos">Veure totes les novetats <ArrowRight /></a></div>
            {resources.slice(1).map((resource) => (
              <button className="update-row" type="button" key={resource.id} onClick={() => setSelectedResource(resource)}>
                <span className="update-icon">{resource.id === "prompt-rubriques" ? <FileText /> : <BookOpen />}</span>
                <span className="update-copy"><small>{resource.type}</small><strong>{resource.title}</strong><span>{resource.summary}</span><time>{resource.date}</time></span>
              </button>
            ))}
          </aside>
        </section>
      </main>

      <footer><div><strong>Racó TIC-TAC · EASEO</strong><span>Escola Andorrana de Segona Ensenyança d’Ordino</span></div><div className="footer-links"><a href="#inici">Sobre el Racó</a><button type="button" onClick={() => setConsultationContext("Consulta general")}>Contacte</button><a href="#inici">Avís legal</a></div></footer>
      <ResourceDialog resource={selectedResource} onClose={() => setSelectedResource(null)} />
      {consultationContext && <ConsultationDialog user={user} context={consultationContext} onClose={() => setConsultationContext(null)} />}
    </div>
  );
}

export default App;
