import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowBendDownLeft,
  ArrowRight,
  BookOpen,
  Brain,
  BellRinging,
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
import { addDoc, collection, doc, onSnapshot, query as firestoreQuery, serverTimestamp, updateDoc, where } from "firebase/firestore";
import { auth, db, googleProvider } from "./lib/firebase";
import AdminWorkspace from "./AdminWorkspace";

const ADMIN_EMAIL = "mperezc@educand.ad";
const previewUser = { displayName: "Marc Pérez", email: ADMIN_EMAIL, photoURL: "" };
const previewConsultations = [
  { id: "consulta-demo-1", name: "Laia M.", email: "laia.m@educand.ad", topic: "Autenticació de dos passos", message: "He activat la verificació de dos passos, però no sé com afegir el meu telèfon nou. Em podries indicar on es canvia?", status: "new", createdAt: new Date("2026-09-17T18:42:00+02:00") },
  { id: "consulta-demo-2", name: "Jordi P.", email: "jordi.p@educand.ad", topic: "Gemini o ChatGPT", message: "Per preparar activitats amb documents del Drive, quina eina em recomanes fer servir i per què?", status: "read", createdAt: new Date("2026-09-17T12:18:00+02:00") },
  { id: "consulta-demo-3", name: "Marta R.", email: "marta.r@educand.ad", topic: "Compartir una plantilla", message: "Ja he pogut duplicar la plantilla i adaptar-la al meu grup. Moltes gràcies!", status: "resolved", createdAt: new Date("2026-09-16T16:05:00+02:00") },
];
const previewReminders = [
  { id: "recordatori-demo-1", title: "Gravar el videotutorial de l’autenticació de dos passos", notes: "Preparar primer un compte de prova i comprovar que no es mostri cap dada personal.", dueDate: "2026-09-18", priority: "high", completed: false, createdAt: new Date("2026-09-17T18:10:00+02:00") },
  { id: "recordatori-demo-2", title: "Revisar el prompt de rúbriques", notes: "Afegir un exemple breu per a cada nivell d’assoliment.", dueDate: "2026-09-17", priority: "medium", completed: false, createdAt: new Date("2026-09-17T11:30:00+02:00") },
  { id: "recordatori-demo-3", title: "Definir l’estructura de l’article comparatiu d’IA", notes: "Gemini, ChatGPT i Claude.", dueDate: "2026-09-16", priority: "low", completed: true, createdAt: new Date("2026-09-16T15:00:00+02:00") },
];

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
        {resource.image && <img className="dialog-image" src={resource.image} alt="Imatge del recurs" />}
        <div className="dialog-copy">
          <span className="content-type">{resource.type}</span>
          <h2 id="resource-title">{resource.title}</h2>
          <p>{resource.summary}</p>
          {resource.content ? <div className="resource-content">{resource.content}</div> : <div className="preparation-note"><Sparkle weight="fill" /><div><strong>{resource.status}</strong><span>Aquesta és la fitxa inicial. El contingut complet s’hi afegirà des de l’editor.</span></div></div>}
          {resource.externalUrl && <a className="primary-button resource-link" href={resource.externalUrl} target="_blank" rel="noreferrer">Obrir el recurs <ArrowRight weight="bold" /></a>}
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

function ConsultationToast({ consultation, onAccept, onOpen }) {
  if (!consultation) return null;
  return (
    <aside className="consultation-toast" role="status" aria-live="polite">
      <span className="toast-icon"><BellRinging weight="fill" /></span>
      <div className="toast-copy"><small>Nova consulta</small><strong>{consultation.name}</strong><span>{consultation.topic}</span></div>
      <div className="toast-actions"><button type="button" onClick={onAccept}>D’acord</button><button type="button" onClick={onOpen}>Llegir-la sencera <ArrowRight /></button></div>
    </aside>
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
  const [adminOpen, setAdminOpen] = useState(false);
  const [adminSection, setAdminSection] = useState("publications");
  const [publishedResources, setPublishedResources] = useState([]);
  const [consultations, setConsultations] = useState(import.meta.env.DEV ? previewConsultations : []);
  const [reminders, setReminders] = useState(import.meta.env.DEV ? previewReminders : []);
  const [toastConsultationId, setToastConsultationId] = useState(null);
  const searchRef = useRef(null);
  const isAdmin = user?.email?.toLowerCase() === ADMIN_EMAIL;
  const unreadConsultations = consultations.filter((consultation) => consultation.status === "new");
  const toastConsultation = consultations.find((consultation) => consultation.id === toastConsultationId) || null;

  useEffect(() => {
    if (import.meta.env.DEV) return undefined;
    return onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setAuthReady(true);
    });
  }, []);

  useEffect(() => {
    if (!user || import.meta.env.DEV) return undefined;
    const isAdmin = user.email?.toLowerCase() === ADMIN_EMAIL;
    const source = isAdmin ? collection(db, "publications") : firestoreQuery(collection(db, "publications"), where("status", "==", "published"));
    return onSnapshot(source, (snapshot) => {
      const entries = snapshot.docs
        .map((entry) => {
          const data = entry.data();
          const dateValue = data.publishedAt?.toDate?.() || data.updatedAt?.toDate?.();
          return {
            id: entry.id,
            type: data.typeLabel || "Recurs",
            resourceType: data.type,
            category: data.category || "Recursos",
            title: data.title,
            summary: data.summary,
            content: data.content,
            externalUrl: data.externalUrl,
            status: data.status === "published" ? "Publicat" : "Esborrany",
            date: dateValue ? new Intl.DateTimeFormat("ca-AD", { day: "numeric", month: "short", year: "numeric" }).format(dateValue) : "Ara",
            keywords: Array.isArray(data.keywords) ? data.keywords.join(" ") : data.keywords || "",
            sortDate: dateValue?.getTime?.() || 0,
            publicationStatus: data.status,
          };
        })
        .filter((entry) => isAdmin ? entry.publicationStatus === "published" : true)
        .sort((a, b) => b.sortDate - a.sortDate);
      setPublishedResources(entries);
    });
  }, [user]);

  useEffect(() => {
    if (!isAdmin || import.meta.env.DEV) return undefined;
    return onSnapshot(collection(db, "consultations"), (snapshot) => {
      const entries = snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() })).sort((a, b) => {
        const aDate = a.createdAt?.toDate?.()?.getTime?.() || 0;
        const bDate = b.createdAt?.toDate?.()?.getTime?.() || 0;
        return bDate - aDate;
      });
      setConsultations(entries);
    });
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin || import.meta.env.DEV) return undefined;
    return onSnapshot(collection(db, "reminders"), (snapshot) => {
      const entries = snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() }));
      setReminders(entries);
    });
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin || adminOpen) {
      setToastConsultationId(null);
      return;
    }
    setToastConsultationId(unreadConsultations[0]?.id || null);
  }, [adminOpen, isAdmin, unreadConsultations.length]);

  useEffect(() => {
    const count = isAdmin ? unreadConsultations.length : 0;
    if ("setAppBadge" in navigator && count) navigator.setAppBadge(count).catch(() => {});
    if ("clearAppBadge" in navigator && !count) navigator.clearAppBadge().catch(() => {});

    const favicon = document.querySelector('link[rel="icon"]');
    if (!favicon) return;
    if (!count) {
      favicon.href = "/tice-mark.svg";
      return;
    }
    const canvas = document.createElement("canvas");
    canvas.width = 192;
    canvas.height = 192;
    const context = canvas.getContext("2d");
    const image = new Image();
    image.onload = () => {
      context.drawImage(image, 0, 0, 192, 192);
      context.fillStyle = "#c894d5";
      context.beginPath();
      context.arc(151, 42, 35, 0, Math.PI * 2);
      context.fill();
      context.fillStyle = "#173a5e";
      context.font = "bold 39px DM Sans, sans-serif";
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText(String(Math.min(count, 9)), 151, 44);
      favicon.href = canvas.toDataURL("image/png");
    };
    image.src = "/icon-192.png";
  }, [isAdmin, unreadConsultations.length]);

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

  const displayResources = useMemo(() => {
    const publishedTitles = new Set(publishedResources.map((resource) => resource.title.trim().toLocaleLowerCase("ca")));
    const pendingSeeds = resources.slice(1).filter((resource) => !publishedTitles.has(resource.title.trim().toLocaleLowerCase("ca")));
    return [resources[0], ...publishedResources, ...pendingSeeds];
  }, [publishedResources]);

  const matches = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("ca");
    if (!needle) return displayResources;
    return displayResources.filter((resource) => `${resource.title} ${resource.summary} ${resource.category} ${resource.keywords}`.toLocaleLowerCase("ca").includes(needle));
  }, [displayResources, query]);

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

  const updateConsultationStatus = async (consultationId, status) => {
    if (import.meta.env.DEV) {
      setConsultations((current) => current.map((consultation) => consultation.id === consultationId ? { ...consultation, status } : consultation));
      return;
    }
    const timestamps = status === "resolved" ? { resolvedAt: serverTimestamp() } : { readAt: serverTimestamp() };
    await updateDoc(doc(db, "consultations", consultationId), { status, ...timestamps });
  };

  const openConsultationInbox = () => {
    setAdminSection("consultations");
    setAdminOpen(true);
    setAccountOpen(false);
    setToastConsultationId(null);
  };

  const createReminder = async (reminder) => {
    if (import.meta.env.DEV) {
      setReminders((current) => [{ id: `recordatori-${Date.now()}`, ...reminder, completed: false, createdAt: new Date() }, ...current]);
      return;
    }
    await addDoc(collection(db, "reminders"), {
      ...reminder,
      completed: false,
      ownerEmail: user.email,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  };

  const toggleReminder = async (reminder, completed) => {
    if (import.meta.env.DEV) {
      setReminders((current) => current.map((item) => item.id === reminder.id ? { ...item, completed } : item));
      return;
    }
    await updateDoc(doc(db, "reminders", reminder.id), {
      completed,
      completedAt: completed ? serverTimestamp() : null,
      updatedAt: serverTimestamp(),
    });
  };

  if (!authReady) return <div className="loading-screen">Preparant el Racó…</div>;
  if (!user) return <AccessGate onSignIn={handleSignIn} error={authError} busy={authBusy} />;

  const initials = (user.displayName || user.email || "ED").split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();

  return (
    <div className="site-shell" id="inici">
      <header className="site-header">
        <Brand />
        <nav aria-label="Navegació principal">
          <a className="active" href="#inici" onClick={() => setAdminOpen(false)}>Inici</a><a href="#guies" onClick={() => setAdminOpen(false)}>Guies</a><a href="#videotutorials" onClick={() => setAdminOpen(false)}>Videotutorials</a><a href="#recursos" onClick={() => setAdminOpen(false)}>Recursos</a><a href="#avui-al-raco" onClick={() => setAdminOpen(false)}>Novetats</a>
          <button className="consultation-nav-button" type="button" onClick={() => isAdmin ? openConsultationInbox() : setConsultationContext("Consulta general")}>Consulta{isAdmin && unreadConsultations.length > 0 && <span className="notification-badge">{unreadConsultations.length}</span>}</button>
        </nav>
        <div className="account-wrap">
          <button className="account-button" type="button" onClick={() => setAccountOpen((open) => !open)} aria-expanded={accountOpen}>
            <span className="avatar">{initials}</span><span><strong>{user.displayName?.split(" ")[0] || "Educand"}</strong><small>Compte Educand</small></span>
          </button>
          {accountOpen && (
            <div className="account-menu"><span>{user.email}</span>{isAdmin && <><strong>Administrador</strong><button type="button" onClick={() => { setAdminSection("publications"); setAdminOpen(true); setAccountOpen(false); }}>Espai de gestió {unreadConsultations.length > 0 && <span className="menu-count">{unreadConsultations.length}</span>}<ArrowRight /></button></>}{!import.meta.env.DEV && <button type="button" onClick={() => signOut(auth)}><SignOut /> Tancar sessió</button>}</div>
          )}
        </div>
      </header>

      {adminOpen ? <AdminWorkspace user={user} section={adminSection} onSectionChange={setAdminSection} consultations={consultations} onUpdateConsultation={updateConsultationStatus} reminders={reminders} onCreateReminder={createReminder} onToggleReminder={toggleReminder} onClose={() => setAdminOpen(false)} onPublicationSaved={(publication) => {
        if (import.meta.env.DEV && publication.status === "published") {
          setPublishedResources((current) => [{ ...publication, type: publication.typeLabel, date: "Ara", keywords: publication.keywords.join(" "), sortDate: Date.now() }, ...current.filter((entry) => entry.id !== publication.id)]);
        }
      }} /> : <main>
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
          <p className="search-note"><span>Troba guies, exemples i solucions en segons.</span><ArrowBendDownLeft weight="bold" aria-hidden="true" /></p>
        </section>

        <section className="topics-strip" id="guies" aria-label="Temes principals">
          {topics.map(({ title, subtitle, icon: TopicIcon, query: topicQuery }) => (
            <button type="button" key={title} onClick={() => chooseTopic({ query: topicQuery })}><TopicIcon weight="regular" /><span><strong>{title}</strong><small>{subtitle}</small></span></button>
          ))}
        </section>

        <section className="editorial-grid" id="recursos">
          <article className="featured-resource" id="videotutorials">
            <div className="featured-copy">
              <span className="content-type">Últim recurs</span><h2>{displayResources[0].title}</h2><p>{displayResources[0].summary}</p>
              <button className="primary-button" type="button" onClick={() => setSelectedResource(displayResources[0])}>Veure la guia completa <ArrowRight weight="bold" /></button>
            </div>
            <button className="featured-image-button" type="button" onClick={() => setSelectedResource(displayResources[0])} aria-label={`Obrir: ${displayResources[0].title}`}>
              <img src={displayResources[0].image} alt="Telèfon amb la verificació en dos passos activada" /><span className="image-label"><MonitorPlay weight="fill" /> Videotutorial</span>
            </button>
          </article>

          <aside className="today-column" id="avui-al-raco">
            <div className="today-heading">
              <div className="today-title-block"><span>Edició digital · setembre 2026</span><h2>Avui al Racó</h2></div>
              <a href="#recursos">Veure totes les novetats <ArrowRight /></a>
            </div>
            {displayResources.slice(1).map((resource) => (
              <button className="update-row" type="button" key={resource.id} onClick={() => setSelectedResource(resource)}>
                <span className="update-icon">{resource.id === "prompt-rubriques" ? <FileText /> : <BookOpen />}</span>
                <span className="update-copy"><small>{resource.type}</small><strong>{resource.title}</strong><span>{resource.summary}</span><time>{resource.date}</time></span>
              </button>
            ))}
          </aside>
        </section>
      </main>}

      <footer><div><strong>Racó TIC-TAC · EASEO</strong><span>Escola Andorrana de Segona Ensenyança d’Ordino</span></div><div className="footer-links"><a href="#inici">Sobre el Racó</a><button type="button" onClick={() => setConsultationContext("Consulta general")}>Contacte</button><a href="#inici">Avís legal</a></div></footer>
      <ResourceDialog resource={selectedResource} onClose={() => setSelectedResource(null)} />
      {consultationContext && <ConsultationDialog user={user} context={consultationContext} onClose={() => setConsultationContext(null)} />}
      <ConsultationToast consultation={toastConsultation} onAccept={() => updateConsultationStatus(toastConsultation.id, "read")} onOpen={() => { updateConsultationStatus(toastConsultation.id, "read"); openConsultationInbox(); }} />
    </div>
  );
}

export default App;
