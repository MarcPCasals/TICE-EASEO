import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowBendDownLeft,
  ArrowRight,
  BookOpen,
  Brain,
  BellRinging,
  ChartBar,
  CheckCircle,
  ChatCircleDots,
  Copy,
  Devices,
  FileText,
  GoogleChromeLogo,
  MagnifyingGlass,
  MonitorPlay,
  PaperPlaneTilt,
  SignOut,
  Sparkle,
  Star,
  ThumbsDown,
  ThumbsUp,
  Wrench,
  X,
} from "@phosphor-icons/react";
import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { addDoc, collection, deleteDoc, doc, onSnapshot, query as firestoreQuery, serverTimestamp, setDoc, updateDoc, where } from "firebase/firestore";
import { auth, db, googleProvider } from "./lib/firebase";
import AdminWorkspace from "./AdminWorkspace";
import PublicFormPage from "./PublicFormPage";
import ResourceCollectionPage from "./ResourceCollectionPage";
import FormattedContent from "./FormattedContent";
import ResourceTags from "./ResourceTags";
import { getPublicationTagLabels, normalizePublicationTags } from "./publicationTags";
import { aiPrivacyArticleContent } from "./content/aiPrivacyArticle";
import { reviewAiResponseArticleContent } from "./content/reviewAiResponseArticle";
import { promptRubriquesContent, promptRubriquesGuidance } from "./content/promptRubriques";
import {
  competencyTestGuidance,
  competencyTestPrompt,
  guidedPromptIntroduction,
  levelAdaptationGuidance,
  levelAdaptationPrompt,
  materialReviewGuidance,
  materialReviewPrompt,
} from "./content/guidedPrompts";

const ADMIN_EMAIL = "mperezc@educand.ad";
const previewUser = { uid: "preview-marc", displayName: "Marc Pérez", email: ADMIN_EMAIL, photoURL: "" };
const previewConsultations = [
  { id: "consulta-demo-1", name: "Laia M.", email: "laia.m@educand.ad", topic: "Autenticació de dos passos", kind: "question", message: "He activat la verificació de dos passos, però no sé com afegir el meu telèfon nou. Em podries indicar on es canvia?", status: "new", createdAt: new Date("2026-09-17T18:42:00+02:00") },
  { id: "consulta-demo-2", name: "Jordi P.", email: "jordi.p@educand.ad", topic: "Gemini o ChatGPT", kind: "publication_request", message: "Podries preparar una guia per comparar aquestes eines quan treballem amb documents del Drive?", status: "read", createdAt: new Date("2026-09-17T12:18:00+02:00") },
  { id: "consulta-demo-3", name: "Marta R.", email: "marta.r@educand.ad", topic: "Compartir una plantilla", kind: "suggestion", message: "Estaria bé afegir un exemple breu de com compartir la plantilla amb l’alumnat.", status: "resolved", createdAt: new Date("2026-09-16T16:05:00+02:00") },
];
const previewReminders = [
  { id: "recordatori-demo-1", title: "Gravar el videotutorial de l’autenticació de dos passos", notes: "Preparar primer un compte de prova i comprovar que no es mostri cap dada personal.", dueDate: "2026-09-18", priority: "high", completed: false, createdAt: new Date("2026-09-17T18:10:00+02:00") },
  { id: "recordatori-demo-2", title: "Revisar el prompt de rúbriques", notes: "Afegir un exemple breu per a cada nivell d’assoliment.", dueDate: "2026-09-17", priority: "medium", completed: false, createdAt: new Date("2026-09-17T11:30:00+02:00") },
  { id: "recordatori-demo-3", title: "Definir l’estructura de l’article comparatiu d’IA", notes: "Gemini, ChatGPT i Claude.", dueDate: "2026-09-16", priority: "low", completed: true, createdAt: new Date("2026-09-16T15:00:00+02:00") },
];

const resources = [
  {
    id: "afegir-contactes-etiquetes",
    source: "seed",
    type: "Videotutorial",
    resourceType: "video",
    category: "Google i Chrome",
    title: "Com afegir contactes a una etiqueta de Google Contactes?",
    summary: "Incorpora a una etiqueta un contacte que ja tenies o crea’n un de nou quan no constava a la importació inicial del curs.",
    status: "Disponible",
    date: "24 set. 2026",
    sortDate: new Date("2026-09-24T11:30:00+02:00").getTime(),
    tags: ["teacher-organization", "communication-teams"],
    keywords: "google contactes etiquetes afegir contacte existent nou docent incorporació correu educand",
    content: "Les etiquetes de Google Contactes permeten tenir agrupades les persones a qui envies correus habitualment. Però durant el curs pot incorporar-se un docent nou o pot ser que algun contacte no aparegués al document importat a l’inici.\n\nEn aquest tutorial veuràs com:\n- afegir a una etiqueta un contacte que ja tens desat;\n- crear un contacte nou quan encara no existeix;\n- assignar-lo a l’etiqueta adequada perquè quedi inclòs en els futurs enviaments.\n\nEt servirà per mantenir les llistes de contactes actualitzades sense haver de tornar a fer tota la importació.",
    externalUrl: "https://drive.google.com/file/d/1uwlZxdXGy3m0nFySNYLJLLRPk4pq8AuO/view?usp=drive_link",
    featured: true,
    publicationStatus: "published",
  },
  {
    id: "importar-contactes-inici-curs",
    source: "seed",
    type: "Videotutorial",
    resourceType: "video",
    category: "Google i Chrome",
    title: "Com importar i organitzar els contactes a l’inici de curs?",
    summary: "Carrega d’una vegada els contactes del curs amb les etiquetes corresponents i gestiona els possibles duplicats abans d’enviar correus.",
    status: "Disponible",
    date: "24 set. 2026",
    sortDate: new Date("2026-09-24T11:00:00+02:00").getTime(),
    tags: ["start-of-year", "teacher-organization"],
    keywords: "google contactes importar inici curs etiquetes duplicats correu document csv educand",
    content: "A l’inici de curs pots importar en un sol procés el document amb els contactes i les etiquetes que se t’ha facilitat. Així tindràs preparats els grups de destinataris i no hauràs d’afegir cada persona manualment.\n\nEn aquest tutorial veuràs com:\n- importar correctament el document de contactes;\n- comprovar que els contactes han quedat associats a les etiquetes previstes;\n- detectar i gestionar contactes duplicats perquè una mateixa persona no rebi el correu més d’una vegada.\n\nEt servirà per començar el curs amb una agenda ordenada i amb les llistes de correu a punt per utilitzar.",
    externalUrl: "https://drive.google.com/file/d/1J9wb34VX01q0iHHtgcGu4MQarvVV82ZU/view?usp=drive_link",
    featured: true,
    publicationStatus: "published",
  },
  {
    id: "google-groups-crear-gestionar-grup",
    source: "seed",
    type: "Videotutorial",
    resourceType: "video",
    category: "Google i Chrome",
    title: "Google Groups: què és i com crear un grup?",
    summary: "Crea una adreça compartida per comunicar-te amb tot un equip o col·lectiu i aprèn a gestionar-ne els membres i les preferències.",
    status: "Disponible",
    date: "24 set. 2026",
    sortDate: new Date("2026-09-24T10:30:00+02:00").getTime(),
    tags: ["communication-teams", "teacher-organization"],
    keywords: "google groups grups correu equip membres preferències permisos comunicació educand",
    content: "Google Groups és una eina que permet reunir diverses persones dins d’un mateix grup i comunicar-t’hi mitjançant una única adreça de correu. En l’àmbit educatiu pot ser útil per escriure a un equip docent, una comissió o un altre col·lectiu estable sense haver de seleccionar tots els destinataris cada vegada.\n\nEn aquest tutorial veuràs com:\n- crear un grup i definir-ne la informació bàsica;\n- afegir-hi i gestionar-ne els membres;\n- configurar les preferències i el funcionament del grup;\n- aprofitar els avantatges d’una adreça única per simplificar la comunicació.\n\nEt servirà per centralitzar els enviaments, mantenir actualitzats els destinataris i gestionar de manera més pràctica la comunicació d’un equip.",
    externalUrl: "https://drive.google.com/file/d/1BR-7rGRKpQ1zGuoii_OpBOvEdYFnpwjv/view?usp=drive_link",
    featured: true,
    publicationStatus: "published",
  },
  {
    id: "cinc-revisions-resposta-ia",
    source: "seed",
    type: "Article",
    resourceType: "article",
    category: "IA bàsica",
    title: "Cinc coses que sempre hem de revisar abans d’utilitzar una resposta d’IA",
    summary: "Una rutina docent per comprovar la fiabilitat, les fonts, l’objectiu pedagògic, l’adequació al grup i les decisions que no podem delegar.",
    status: "Disponible",
    date: "24 set. 2026",
    sortDate: new Date("2026-09-24T12:00:00+02:00").getTime(),
    image: "/revisar-resposta-ia-capcalera.jpg",
    imageAlt: "Una docent contrasta un material generat amb IA amb altres fonts abans d’utilitzar-lo a classe.",
    imageCaption: "Una resposta d’IA només es converteix en material d’aula després d’una revisió docent.",
    tags: ["general-interest", "classroom-preparation"],
    keywords: "intel·ligència artificial revisar resposta fonts verificació biaixos objectiu pedagògic alumnat aula criteri docent",
    content: reviewAiResponseArticleContent,
    featured: true,
    publicationStatus: "published",
  },
  {
    id: "dades-alumnat-ia",
    source: "seed",
    type: "Article",
    resourceType: "article",
    category: "IA bàsica",
    title: "Abans d’escriure el prompt, esborra l’alumne",
    summary: "Quines dades no hem d’introduir en una eina d’intel·ligència artificial i com podem ensenyar l’alumnat a protegir la seva privacitat.",
    status: "Disponible",
    date: "18 set. 2026",
    sortDate: new Date("2026-09-18T12:00:00+02:00").getTime(),
    image: "/dades-ia-capcalera.jpg",
    imageAlt: "Una docent elimina dades identificatives d’un document abans de consultar una eina d’intel·ligència artificial.",
    imageCaption: "Abans de consultar una IA, cal retirar qualsevol dada que pugui identificar un alumne.",
    tags: ["security-privacy", "classroom-preparation"],
    keywords: "intel·ligència artificial dades alumnat privacitat anonimització protecció pedagogia aula",
    content: aiPrivacyArticleContent,
    featured: true,
    publicationStatus: "published",
  },
  {
    id: "doble-autenticacio",
    source: "seed",
    type: "Videotutorial",
    resourceType: "video",
    category: "Google i Chrome",
    title: "Com activar l’autenticació de dos passos al compte Educand?",
    summary: "Augmenta la seguretat del teu compte en pocs minuts. Una guia clara, pas a pas, per activar la verificació en dos passos.",
    status: "Vídeo en preparació",
    image: "/two-step-verification.png",
    tags: ["general-interest", "security-privacy"],
    keywords: "google educand autenticació verificació dos passos seguretat compte vídeo tutorial",
    content: "En aquest videotutorial veuràs com activar l’autenticació de dos passos i revisar els mètodes de verificació del compte.",
    externalUrl: "https://drive.google.com/file/d/1FxOvd7OpkqWRVZx3w3SCpae2mqy6XH7L/view?usp=drive_link",
    featured: true,
    publicationStatus: "published",
  },
  {
    id: "prompt-rubriques",
    source: "seed",
    type: "Prompt guiat",
    resourceType: "prompt",
    category: "Biblioteca de prompts",
    title: "Crear una rúbrica d’avaluació per a qualsevol matèria",
    summary: "Una versió ampliada del model del centre que et pregunta la matèria, el curs, els aprenentatges, la tasca i l’escala abans de crear la rúbrica.",
    status: "Disponible",
    date: "15 set. 2026",
    tags: ["assessment", "classroom-preparation"],
    keywords: "prompt guiat rúbriques avaluació competències matèria assignatura curs aprenentatges criteris escala chatgpt gemini claude",
    guidance: promptRubriquesGuidance,
    content: promptRubriquesContent,
    externalUrl: "/prompt-rubriques-ae.docx",
    featured: true,
    publicationStatus: "published",
  },
  {
    id: "prompt-prova-competencial-guiada",
    source: "seed",
    type: "Prompt guiat",
    resourceType: "prompt",
    category: "Biblioteca de prompts",
    title: "Crear una prova competencial amb els teus documents",
    summary: "Adjunta la rúbrica i els materials de classe: la IA et farà les preguntes imprescindibles i prepararà una prova alineada amb els aprenentatges esperats.",
    status: "Disponible",
    date: "18 set. 2026",
    tags: ["assessment", "classroom-preparation"],
    keywords: "prompt guiat prova competencial rúbrica aprenentatges esperats materials preguntes avaluació",
    guidance: competencyTestGuidance,
    content: competencyTestPrompt,
    featured: true,
    publicationStatus: "published",
  },
  {
    id: "prompt-adaptar-nivell-guiat",
    source: "seed",
    type: "Prompt guiat",
    resourceType: "prompt",
    category: "Biblioteca de prompts",
    title: "Adaptar el nivell d’un material o d’una prova",
    summary: "Converteix un material a un nivell inferior o superior mitjançant una conversa que diferencia l’accés, les bastides i els aprenentatges avaluats.",
    status: "Disponible",
    date: "18 set. 2026",
    tags: ["classroom-preparation"],
    keywords: "prompt guiat adaptació nivell curs prova material bastides accessibilitat diversitat",
    guidance: levelAdaptationGuidance,
    content: levelAdaptationPrompt,
    featured: true,
    publicationStatus: "published",
  },
  {
    id: "prompt-revisar-material-guiat",
    source: "seed",
    type: "Prompt guiat",
    resourceType: "prompt",
    category: "Biblioteca de prompts",
    title: "Revisar i millorar un material docent",
    summary: "Una revisió guiada per millorar la claredat, l’estructura, el nivell o l’accessibilitat d’un material sense perdre’n la intenció pedagògica.",
    status: "Disponible",
    date: "18 set. 2026",
    tags: ["classroom-preparation"],
    keywords: "prompt guiat revisar millorar material docent claredat estructura accessibilitat",
    guidance: materialReviewGuidance,
    content: materialReviewPrompt,
    featured: false,
    publicationStatus: "published",
  },
  {
    id: "comparativa-ia",
    source: "seed",
    type: "Article",
    resourceType: "article",
    category: "IA bàsica",
    title: "Gemini, ChatGPT o Claude: quina IA convé en cada situació?",
    summary: "Una comparativa clara i pràctica per triar l’eina adequada segons l’objectiu, el tipus de tasca i el context educatiu.",
    status: "Article en preparació",
    date: "12 set. 2026",
    tags: ["general-interest", "classroom-preparation"],
    keywords: "gemini chatgpt claude comparativa intel·ligència artificial eina quan",
    featured: false,
    publicationStatus: "published",
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

const consultationKinds = [
  { id: "question", label: "Dubte" },
  { id: "suggestion", label: "Suggeriment" },
  { id: "publication_request", label: "Petició de publicació" },
];

function consultationKindLabel(kind) {
  return consultationKinds.find((item) => item.id === kind)?.label || "Dubte";
}

function Brand() {
  return (
    <a className="brand" href="#inici" aria-label="Racó TIC-TAC, inici">
      <img src="/raco-tic-tac.svg" alt="Racó TIC-TAC. Pedagogia per al món digital" />
    </a>
  );
}

function drivePreviewUrl(url) {
  const fileId = url?.match(/drive[.]google[.]com\/file\/d\/([^/]+)/)?.[1];
  return fileId ? `https://drive.google.com/file/d/${fileId}/preview` : null;
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

function ResourceDialog({ resource, resources: allResources, user, onRate, onAskQuestion, onOpenResource, onClose }) {
  const [copied, setCopied] = useState(false);
  const [rating, setRating] = useState(null);
  const [question, setQuestion] = useState("");
  const [questionKind, setQuestionKind] = useState("question");
  const [questionStatus, setQuestionStatus] = useState("idle");
  useEffect(() => {
    setCopied(false);
    setRating(null);
    setQuestion("");
    setQuestionKind("question");
    setQuestionStatus("idle");
  }, [resource?.id]);
  if (!resource) return null;

  const copyContent = async () => {
    const text = resource.content || resource.title;
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      const fallback = document.createElement("textarea");
      fallback.value = text;
      fallback.setAttribute("readonly", "");
      fallback.style.position = "fixed";
      fallback.style.opacity = "0";
      document.body.appendChild(fallback);
      fallback.select();
      document.execCommand("copy");
      fallback.remove();
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };
  const videoUrl = resource.resourceType === "video" ? drivePreviewUrl(resource.externalUrl) : null;
  const resourceKeywords = new Set(String(resource.keywords || "").toLocaleLowerCase("ca").split(/[ ,]+/).filter((word) => word.length > 3));
  const relatedResources = allResources
    .filter((candidate) => candidate.id !== resource.id)
    .map((candidate) => ({
      ...candidate,
      relationScore: (candidate.category === resource.category ? 4 : 0) + String(candidate.keywords || "").toLocaleLowerCase("ca").split(/[ ,]+/).filter((word) => resourceKeywords.has(word)).length,
    }))
    .filter((candidate) => candidate.relationScore > 0)
    .sort((a, b) => b.relationScore - a.relationScore)
    .slice(0, 3);

  const rateResource = async (helpful) => {
    await onRate(resource, helpful);
    setRating(helpful);
  };

  const submitQuestion = async (event) => {
    event.preventDefault();
    if (!question.trim()) return;
    setQuestionStatus("sending");
    try {
      await onAskQuestion(resource, question.trim(), questionKind);
      setQuestion("");
      setQuestionStatus("sent");
    } catch {
      setQuestionStatus("error");
    }
  };

  const introduction = <>
    <span className="content-type">{resource.type}</span>
    <h2 id="resource-title">{resource.title}</h2>
    <ResourceTags tags={resource.tags} className="resource-dialog-tags" />
    <p>{resource.summary}</p>
    {resource.guidance && <FormattedContent content={resource.guidance} className="resource-guidance" />}
    {resource.content ? resource.resourceType === "prompt" ? (
      <div className="prompt-content-frame">
        <div className="prompt-copy-sticky">
          <button className="prompt-copy-button" type="button" onClick={copyContent}>
            {copied ? <CheckCircle weight="fill" /> : <Copy />}
            {copied ? "Prompt copiat" : "Copiar el prompt"}
          </button>
        </div>
        <FormattedContent content={resource.content} />
      </div>
    ) : <FormattedContent content={resource.content} className={resource.resourceType === "article" ? "resource-content article-content" : "resource-content"} /> : <div className="preparation-note"><Sparkle weight="fill" /><div><strong>{resource.status}</strong><span>Aquesta és la fitxa inicial. El contingut complet s’hi afegirà des de l’editor.</span></div></div>}
  </>;

  const resourceActions = <>
    {resource.externalUrl && !videoUrl && <a className="primary-button resource-link" href={resource.externalUrl} target="_blank" rel="noreferrer">{resource.externalUrl.endsWith(".docx") ? "Descarregar el document" : "Obrir el recurs"} <ArrowRight weight="bold" /></a>}
    <form className="resource-question-box" onSubmit={submitQuestion}>
      <div className="resource-question-heading"><ChatCircleDots weight="duotone" /><div><strong>Pregunta o proposa</strong><span>Envia una necessitat directament des d’aquí i la resposta t’arribarà al correu Educand.</span></div></div>
      {questionStatus === "sent" ? <p className="resource-question-success"><CheckCircle weight="fill" /> Missatge enviat com a «{consultationKindLabel(questionKind)}» i vinculat a «{resource.title}».</p> : <>
        <div className="consultation-kind-picker" role="group" aria-label="Tipus de missatge">{consultationKinds.map((kind) => <button className={questionKind === kind.id ? "selected" : ""} type="button" key={kind.id} aria-pressed={questionKind === kind.id} onClick={() => setQuestionKind(kind.id)}>{kind.label}</button>)}</div>
        <textarea rows="3" value={question} onChange={(event) => { setQuestion(event.target.value); setQuestionStatus("idle"); }} maxLength="1200" placeholder={questionKind === "question" ? "Escriu aquí el teu dubte…" : questionKind === "suggestion" ? "Què milloraries o afegiries?" : "Quina publicació o recurs necessites?"} aria-label={`${consultationKindLabel(questionKind)} sobre ${resource.title}`} required />
        <div className="resource-question-footer"><span>{user.email}</span><button type="submit" disabled={questionStatus === "sending"}><PaperPlaneTilt weight="bold" /> {questionStatus === "sending" ? "Enviant…" : questionKind === "question" ? "Enviar el dubte" : questionKind === "suggestion" ? "Enviar el suggeriment" : "Enviar la petició"}</button></div>
        {questionStatus === "error" && <p className="form-error" role="alert">No s’ha pogut enviar. Torna-ho a provar d’aquí a un moment.</p>}
      </>}
    </form>
    <div className="resource-feedback">
      {rating === null ? <><span>T’ha estat útil?</span><button type="button" onClick={() => rateResource(true)}><ThumbsUp /> Sí</button><button type="button" onClick={() => rateResource(false)}><ThumbsDown /> Encara no</button></> : <p><CheckCircle weight="fill" /> Gràcies! La teva resposta ens ajuda a millorar el Racó.</p>}
    </div>
    {relatedResources.length > 0 && <div className="related-resources"><span className="content-type">També et pot interessar</span>{relatedResources.map((related) => <button type="button" key={related.id} onClick={() => onOpenResource(related)}><small>{related.type}</small><strong>{related.title}</strong><ArrowRight /></button>)}</div>}
  </>;

  return (
    <div className={`modal-backdrop ${resource.resourceType === "article" ? "article-page-backdrop" : ""}`} role="presentation" onMouseDown={onClose}>
      <section className={`resource-dialog ${videoUrl ? "video-resource-dialog" : resource.resourceType === "article" ? "article-resource-dialog" : resource.image ? "image-resource-dialog" : "text-resource-dialog"}`} role="dialog" aria-modal="true" aria-labelledby="resource-title" onMouseDown={(event) => event.stopPropagation()}>
        <button className="icon-button close-button" type="button" onClick={onClose} aria-label="Tancar"><X /></button>
        {videoUrl ? <>
          <div className="dialog-copy video-introduction">{introduction}</div>
          <div className="dialog-video"><iframe src={videoUrl} title={resource.title} allow="autoplay; fullscreen" allowFullScreen /></div>
          <div className="dialog-copy video-actions">{resourceActions}</div>
        </> : resource.resourceType === "article" ? <>
          {resource.image && <figure className="article-hero"><img className="dialog-image" src={resource.image} alt={resource.imageAlt || "Imatge de capçalera de l’article"} />{resource.imageCaption && <figcaption>{resource.imageCaption}</figcaption>}</figure>}
          <div className="dialog-copy article-copy">{introduction}{resourceActions}</div>
        </> : <>
          {resource.image && <img className="dialog-image" src={resource.image} alt={resource.imageAlt || "Imatge del recurs"} />}
          <div className="dialog-copy">{introduction}{resourceActions}</div>
        </>}
      </section>
    </div>
  );
}

function ConsultationDialog({ user, context, onClose }) {
  const [topic, setTopic] = useState(context || "Consulta general");
  const [kind, setKind] = useState("question");
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
          kind,
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
            <span className="eyebrow">Missatge enviat · {consultationKindLabel(kind)}</span>
            <h2 id="consultation-title">Ja la tenim registrada.</h2>
            <p>La resposta arribarà al teu correu Educand: <strong>{user.email}</strong>.</p>
            <button className="primary-button" type="button" onClick={onClose}>D’acord</button>
          </div>
        ) : (
          <form onSubmit={submit}>
            <span className="eyebrow">Canal TICE</span>
            <h2 id="consultation-title">Escriu-nos</h2>
            <p>Pots enviar un dubte, fer un suggeriment o demanar una nova publicació. El missatge quedarà vinculat al teu compte Educand.</p>
            <div className="consultation-kind-picker dialog-kind-picker" role="group" aria-label="Tipus de missatge">{consultationKinds.map((item) => <button className={kind === item.id ? "selected" : ""} type="button" key={item.id} aria-pressed={kind === item.id} onClick={() => setKind(item.id)}>{item.label}</button>)}</div>
            <label>Tema general<input value={topic} onChange={(event) => setTopic(event.target.value)} /></label>
            <label>{kind === "question" ? "Explica’ns el dubte" : kind === "suggestion" ? "Explica’ns el suggeriment" : "Quina publicació necessites?"}<textarea rows="6" value={message} onChange={(event) => setMessage(event.target.value)} placeholder={kind === "question" ? "Què necessites resoldre?" : kind === "suggestion" ? "Què podríem millorar o afegir?" : "Descriu el tema o recurs que t’ajudaria."} required /></label>
            <div className="identity-row"><span>{user.displayName}</span><span>{user.email}</span></div>
            {error && <p className="form-error" role="alert">{error}</p>}
            <button className="primary-button" type="submit" disabled={status === "sending"}>
              {status === "sending" ? "Enviant…" : "Enviar el missatge"}<ArrowRight weight="bold" />
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
      <div className="toast-copy"><small>Nou: {consultationKindLabel(consultation.kind)}</small><strong>{consultation.name}</strong><span>{consultation.topic}</span></div>
      <div className="toast-actions"><button type="button" onClick={onAccept}>D’acord</button><button type="button" onClick={onOpen}>Llegir-la sencera <ArrowRight /></button></div>
    </aside>
  );
}

function App() {
  const formRoute = window.location.pathname.match(/^\/formulari\/([^/]+)\/?$/);
  const formSlug = formRoute ? decodeURIComponent(formRoute[1]) : null;
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
  const [adminSection, setAdminSection] = useState("dashboard");
  const [publicView, setPublicView] = useState("home");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [publishedResources, setPublishedResources] = useState([]);
  const [forms, setForms] = useState([]);
  const [consultations, setConsultations] = useState(import.meta.env.DEV ? previewConsultations : []);
  const [reminders, setReminders] = useState(import.meta.env.DEV ? previewReminders : []);
  const [toastConsultationId, setToastConsultationId] = useState(null);
  const [currentTime, setCurrentTime] = useState(Date.now());
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
    const source = isAdmin ? collection(db, "publications") : firestoreQuery(collection(db, "publications"), where("status", "in", ["published", "scheduled"]));
    return onSnapshot(source, (snapshot) => {
      const entries = snapshot.docs
        .map((entry) => {
          const data = entry.data();
          const dateValue = data.status === "scheduled" && data.scheduledFor ? new Date(data.scheduledFor) : data.publishedAt?.toDate?.() || data.updatedAt?.toDate?.();
          return {
            id: entry.id,
            source: "firestore",
            type: data.typeLabel || "Recurs",
            resourceType: data.type,
            category: data.category || "Recursos",
            title: data.title,
            summary: data.summary,
            guidance: resources.find((seedResource) => seedResource.title === data.title)?.guidance || "",
            content: data.content,
            externalUrl: data.externalUrl,
            tags: normalizePublicationTags(data.tags),
            featured: Boolean(data.featured),
            scheduledFor: data.scheduledFor || "",
            status: data.status === "published" ? "Publicat" : data.status === "scheduled" ? "Programat" : "Esborrany",
            date: dateValue ? new Intl.DateTimeFormat("ca-AD", { day: "numeric", month: "short", year: "numeric" }).format(dateValue) : "Ara",
            keywords: Array.isArray(data.keywords) ? data.keywords.join(" ") : data.keywords || "",
            sortDate: dateValue?.getTime?.() || 0,
            publicationStatus: data.status,
          };
        })
        .sort((a, b) => b.sortDate - a.sortDate);
      setPublishedResources(entries);
    });
  }, [user]);

  useEffect(() => {
    const timer = window.setInterval(() => setCurrentTime(Date.now()), 30000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!isAdmin || import.meta.env.DEV) return undefined;
    return onSnapshot(collection(db, "forms"), (snapshot) => {
      const entries = snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() })).sort((a, b) => {
        const aDate = a.updatedAt?.toDate?.()?.getTime?.() || 0;
        const bDate = b.updatedAt?.toDate?.()?.getTime?.() || 0;
        return bDate - aDate;
      });
      setForms(entries);
    });
  }, [isAdmin]);

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
      favicon.href = "/tice-mark-v3.svg";
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
      context.arc(159, 34, 29, 0, Math.PI * 2);
      context.fill();
      context.fillStyle = "#173a5e";
      context.font = "bold 34px DM Sans, sans-serif";
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText(String(Math.min(count, 9)), 159, 36);
      favicon.href = canvas.toDataURL("image/png");
    };
    image.src = "/icon-192-v3.png";
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
    const visibleFirestore = publishedResources.filter((resource) => resource.publicationStatus === "published" || (resource.publicationStatus === "scheduled" && resource.scheduledFor && new Date(resource.scheduledFor).getTime() <= currentTime));
    const publishedTitles = new Set(visibleFirestore.map((resource) => resource.title.trim().toLocaleLowerCase("ca")));
    const pendingSeeds = resources.filter((resource) => !publishedTitles.has(resource.title.trim().toLocaleLowerCase("ca")));
    return [...visibleFirestore, ...pendingSeeds].sort((a, b) => (b.sortDate || 0) - (a.sortDate || 0));
  }, [currentTime, publishedResources]);

  const publicationLibrary = useMemo(() => {
    const savedTitles = new Set(publishedResources.map((resource) => resource.title.trim().toLocaleLowerCase("ca")));
    return [...publishedResources, ...resources.filter((resource) => !savedTitles.has(resource.title.trim().toLocaleLowerCase("ca")))];
  }, [publishedResources]);

  const featuredResources = useMemo(() => displayResources.filter((resource) => resource.featured), [displayResources]);

  const matches = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("ca");
    if (!needle) return displayResources;
    return displayResources.filter((resource) => `${resource.title} ${resource.summary} ${resource.category} ${resource.keywords} ${getPublicationTagLabels(resource.tags).join(" ")}`.toLocaleLowerCase("ca").includes(needle));
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

  const openCategory = (category) => {
    setSelectedCategory(category);
    setPublicView("category");
    setAdminOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
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

  const convertConsultationToReminder = async (consultation) => {
    if (reminders.some((reminder) => reminder.sourceConsultationId === consultation.id)) return;
    await saveReminder({
      title: `Respondre: ${consultation.topic}`,
      notes: `${consultation.name} · ${consultation.email}\n${consultation.message}`,
      dueDate: new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date()),
      priority: "medium",
      sourceConsultationId: consultation.id,
    });
  };

  const saveReminder = async (reminder) => {
    const { id, ...values } = reminder;
    if (import.meta.env.DEV) {
      setReminders((current) => id
        ? current.map((item) => item.id === id ? { ...item, ...values } : item)
        : [{ id: `recordatori-${Date.now()}`, ...values, completed: false, createdAt: new Date() }, ...current]);
      return;
    }
    if (id) {
      await updateDoc(doc(db, "reminders", id), { ...values, updatedAt: serverTimestamp() });
      return;
    }
    await addDoc(collection(db, "reminders"), {
      ...values,
      sourceConsultationId: values.sourceConsultationId || "",
      completed: false,
      ownerEmail: user.email,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  };

  const rateResource = async (resource, helpful) => {
    if (import.meta.env.DEV) return;
    const feedbackId = `${resource.id}_${user.uid}`.replace(/[^a-zA-Z0-9_-]/g, "_");
    await setDoc(doc(db, "resourceFeedback", feedbackId), {
      resourceId: resource.id,
      resourceTitle: resource.title,
      helpful,
      userEmail: user.email,
      updatedAt: serverTimestamp(),
    });
  };

  const submitResourceQuestion = async (resource, message, kind) => {
    const consultation = {
      name: user.displayName || "Usuari Educand",
      email: user.email,
      topic: resource.title,
      kind,
      message,
      resourceId: resource.id,
      resourceType: resource.resourceType,
      status: "new",
      createdAt: serverTimestamp(),
    };
    if (import.meta.env.DEV) {
      setConsultations((current) => [{ ...consultation, id: `consulta-${Date.now()}`, createdAt: new Date() }, ...current]);
      return;
    }
    await addDoc(collection(db, "consultations"), consultation);
  };

  const deleteReminder = async (reminderId) => {
    if (import.meta.env.DEV) {
      setReminders((current) => current.filter((item) => item.id !== reminderId));
      return;
    }
    await deleteDoc(doc(db, "reminders", reminderId));
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

  if (formSlug) return <PublicFormPage slug={formSlug} user={user} />;

  return (
    <div className="site-shell" id="inici">
      <header className="site-header">
        <Brand />
        <nav aria-label="Navegació principal">
          <a className={!adminOpen && publicView === "home" ? "active" : ""} href="#inici" onClick={() => { setAdminOpen(false); setPublicView("home"); }}>Inici</a><a href="#guies" onClick={() => { setAdminOpen(false); setPublicView("home"); }}>Guies</a><a href="#videotutorials" onClick={() => { setAdminOpen(false); setPublicView("home"); }}>Videotutorials</a><a href="#recursos" onClick={() => { setAdminOpen(false); setPublicView("home"); }}>Recursos</a><button className={!adminOpen && publicView === "featured" ? "active" : ""} type="button" onClick={() => { setAdminOpen(false); setPublicView("featured"); window.scrollTo({ top: 0, behavior: "smooth" }); }}><Star weight="fill" /> Destacats</button><a href="#avui-al-raco" onClick={() => { setAdminOpen(false); setPublicView("home"); }}>Novetats</a>
          <button className="consultation-nav-button" type="button" onClick={() => isAdmin ? openConsultationInbox() : setConsultationContext("Consulta general")}>Consulta{isAdmin && unreadConsultations.length > 0 && <span className="notification-badge">{unreadConsultations.length}</span>}</button>
        </nav>
        <div className="account-wrap">
          <button className="account-button" type="button" onClick={() => setAccountOpen((open) => !open)} aria-expanded={accountOpen}>
            <span className="avatar">{initials}</span><span><strong>{user.displayName?.split(" ")[0] || "Educand"}</strong><small>Compte Educand</small></span>
          </button>
          {accountOpen && (
            <div className="account-menu"><span>{user.email}</span>{isAdmin && <><strong>Administrador</strong><button type="button" onClick={() => { setAdminSection("dashboard"); setAdminOpen(true); setAccountOpen(false); }}>Espai de gestió {unreadConsultations.length > 0 && <span className="menu-count">{unreadConsultations.length}</span>}<ArrowRight /></button></>}{!import.meta.env.DEV && <button type="button" onClick={() => signOut(auth)}><SignOut /> Tancar sessió</button>}</div>
          )}
        </div>
      </header>

      {adminOpen ? <AdminWorkspace user={user} section={adminSection} onSectionChange={setAdminSection} publications={publicationLibrary} forms={forms} consultations={consultations} onUpdateConsultation={updateConsultationStatus} onConvertConsultation={convertConsultationToReminder} reminders={reminders} onSaveReminder={saveReminder} onToggleReminder={toggleReminder} onDeleteReminder={deleteReminder} onClose={() => setAdminOpen(false)} onPublicationDeleted={(publicationId) => {
        if (import.meta.env.DEV) setPublishedResources((current) => current.filter((entry) => entry.id !== publicationId));
      }} onPublicationSaved={(publication) => {
        if (import.meta.env.DEV) {
          setPublishedResources((current) => [{ ...publication, guidance: resources.find((seedResource) => seedResource.title === publication.title)?.guidance || "", source: "firestore", type: publication.typeLabel, resourceType: publication.type, date: "Ara", keywords: publication.keywords.join(" "), sortDate: Date.now(), publicationStatus: publication.status }, ...current.filter((entry) => entry.id !== publication.id)]);
        }
      }} /> : publicView === "featured" ? <ResourceCollectionPage title="Destacats" eyebrow="Selecció del Racó" intro="Els recursos més útils per començar, ordenats per format perquè trobis ràpidament allò que necessites." resources={featuredResources} groupByType onBack={() => setPublicView("home")} onOpen={setSelectedResource} /> : publicView === "category" ? <ResourceCollectionPage title={selectedCategory} eyebrow="Biblioteca per temàtiques" intro={selectedCategory === "Biblioteca de prompts" ? guidedPromptIntroduction : `Guies, vídeos i recursos de ${selectedCategory} reunits en un mateix lloc.`} resources={displayResources.filter((resource) => resource.category === selectedCategory)} onBack={() => setPublicView("home")} onOpen={setSelectedResource} /> : <main>
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
            <button type="button" key={title} onClick={() => openCategory(title)}><TopicIcon weight="regular" /><span><strong>{title}</strong><small>{subtitle}</small></span></button>
          ))}
        </section>

        <section className="editorial-grid" id="recursos">
          <article className="featured-resource" id="videotutorials">
            <div className="featured-copy">
              <span className="content-type">Últim recurs</span><h2>{displayResources[0].title}</h2><ResourceTags tags={displayResources[0].tags} /><p>{displayResources[0].summary}</p>
              <button className="primary-button" type="button" onClick={() => setSelectedResource(displayResources[0])}>Veure la guia completa <ArrowRight weight="bold" /></button>
            </div>
            <button className="featured-image-button" type="button" onClick={() => setSelectedResource(displayResources[0])} aria-label={`Obrir: ${displayResources[0].title}`}>
              <img src={displayResources[0].image} alt={displayResources[0].imageAlt || `Imatge de ${displayResources[0].title}`} /><span className="image-label">{displayResources[0].resourceType === "video" ? <MonitorPlay weight="fill" /> : <BookOpen weight="fill" />} {displayResources[0].type}</span>
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
                <div className="update-copy"><small>{resource.type}</small><strong>{resource.title}</strong><ResourceTags tags={resource.tags} className="update-tags" /><span>{resource.summary}</span><time>{resource.date}</time></div>
              </button>
            ))}
          </aside>
        </section>
      </main>}

      <footer><div><strong>Racó TIC-TAC · EASEO</strong><span>Escola Andorrana de Segona Ensenyança d’Ordino</span></div><div className="footer-links"><a href="#inici">Sobre el Racó</a><button type="button" onClick={() => setConsultationContext("Consulta general")}>Contacte</button><a href="#inici">Avís legal</a></div></footer>
      <ResourceDialog resource={selectedResource} resources={displayResources} user={user} onRate={rateResource} onAskQuestion={submitResourceQuestion} onOpenResource={setSelectedResource} onClose={() => setSelectedResource(null)} />
      {consultationContext && <ConsultationDialog user={user} context={consultationContext} onClose={() => setConsultationContext(null)} />}
      <ConsultationToast consultation={toastConsultation} onAccept={() => updateConsultationStatus(toastConsultation.id, "read")} onOpen={() => { updateConsultationStatus(toastConsultation.id, "read"); setSelectedResource(null); setConsultationContext(null); openConsultationInbox(); }} />
    </div>
  );
}

export default App;
