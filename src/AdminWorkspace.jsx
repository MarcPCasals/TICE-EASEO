import { useMemo, useRef, useState } from "react";
import {
  Article,
  ArrowLeft,
  ArrowRight,
  CalendarCheck,
  CheckCircle,
  ChatCircleDots,
  ClipboardText,
  ClockCountdown,
  Copy,
  FileText,
  FloppyDisk,
  Gauge,
  ImagesSquare,
  LinkSimple,
  ListBullets,
  ListNumbers,
  PencilSimple,
  Plus,
  Sparkle,
  Star,
  TextB,
  TextItalic,
  Trash,
  VideoCamera,
} from "@phosphor-icons/react";
import { addDoc, collection, deleteDoc, doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "./lib/firebase";
import ConsultationInbox from "./ConsultationInbox";
import ReminderBoard from "./ReminderBoard";
import AdminDashboard from "./AdminDashboard";
import FormManager from "./FormManager";
import FormattedContent from "./FormattedContent";

const publicationTypes = [
  { id: "video", label: "Vídeo", publicLabel: "Videotutorial", icon: VideoCamera },
  { id: "article", label: "Article", publicLabel: "Article", icon: Article },
  { id: "prompt", label: "Prompt", publicLabel: "Prompt", icon: Sparkle },
  { id: "template", label: "Plantilla", publicLabel: "Plantilla", icon: FileText },
  { id: "images", label: "Imatges", publicLabel: "Galeria d’imatges", icon: ImagesSquare },
];

const categories = [
  "Google i Chrome",
  "IA bàsica",
  "Eines d’IA",
  "Biblioteca de prompts",
  "IA avançada",
  "Dispositius electrònics",
  "Artefactes per assignatures",
];

const initialForm = {
  type: "video",
  title: "Com activar l’autenticació de dos passos al compte Educand?",
  summary: "Una guia clara, pas a pas, per activar la verificació en dos passos i protegir millor el compte Educand.",
  category: "Google i Chrome",
  keywords: "Google, Educand, autenticació, verificació, dos passos, seguretat",
  content: "En aquest videotutorial veuràs com activar l’autenticació de dos passos i revisar els mètodes de verificació del compte.",
  externalUrl: "https://drive.google.com/file/d/1FxOvd7OpkqWRVZx3w3SCpae2mqy6XH7L/view?usp=drive_link",
  featured: true,
  scheduledFor: "",
};

function splitKeywords(value) {
  return value.split(",").map((keyword) => keyword.trim()).filter(Boolean).slice(0, 12);
}

function currentEdition() {
  return new Intl.DateTimeFormat("ca-AD", { month: "long", year: "numeric" }).format(new Date());
}

function dateTimeInputValue(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function contentLabel(type) {
  if (type === "prompt") return "Text del prompt";
  if (type === "article") return "Text de l’article";
  if (type === "video") return "Guió o explicació del vídeo";
  if (type === "template") return "Instruccions de la plantilla";
  return "Descripció de les imatges";
}

function urlLabel(type) {
  if (type === "video") return "Enllaç del vídeo de Google Drive";
  if (type === "prompt") return "Document complementari (opcional)";
  if (type === "template") return "Enllaç de la plantilla";
  if (type === "images") return "Enllaç de la carpeta o presentació";
  return null;
}

function urlRequired(type) {
  return type === "video" || type === "template" || type === "images";
}

export default function AdminWorkspace({ user, onClose, onPublicationSaved, onPublicationDeleted, publications, forms, section, onSectionChange, consultations, onUpdateConsultation, onConvertConsultation, reminders, onSaveReminder, onToggleReminder, onDeleteReminder }) {
  const [form, setForm] = useState(initialForm);
  const [publicationId, setPublicationId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [error, setError] = useState("");
  const [currentStatus, setCurrentStatus] = useState(null);
  const contentEditorRef = useRef(null);

  const selectedType = useMemo(
    () => publicationTypes.find((type) => type.id === form.type) || publicationTypes[2],
    [form.type],
  );
  const PreviewIcon = selectedType.icon;
  const keywords = splitKeywords(form.keywords);
  const previewTitle = form.title.trim() || "Títol de la nova publicació";
  const previewSummary = form.summary.trim() || "La descripció breu apareixerà aquí i ajudarà a entendre ràpidament què aporta aquest recurs.";
  const previewContent = form.content.trim() || "Quan comencis a escriure el contingut, en veuràs aquí una previsualització abans de publicar-lo.";

  const changeField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setFeedback(null);
    setError("");
  };

  const formatSelection = (before, after, placeholder) => {
    const editor = contentEditorRef.current;
    if (!editor) return;
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const selected = form.content.slice(start, end) || placeholder;
    const nextContent = `${form.content.slice(0, start)}${before}${selected}${after}${form.content.slice(end)}`;
    changeField("content", nextContent);
    window.requestAnimationFrame(() => {
      editor.focus();
      editor.setSelectionRange(start + before.length, start + before.length + selected.length);
    });
  };

  const formatLines = (prefix) => {
    const editor = contentEditorRef.current;
    if (!editor) return;
    const start = form.content.lastIndexOf("\n", Math.max(0, editor.selectionStart - 1)) + 1;
    const nextBreak = form.content.indexOf("\n", editor.selectionEnd);
    const end = nextBreak === -1 ? form.content.length : nextBreak;
    const block = form.content.slice(start, end);
    const lines = block.split("\n").map((line, index) => `${prefix === "1. " ? `${index + 1}. ` : prefix}${line}`).join("\n");
    changeField("content", `${form.content.slice(0, start)}${lines}${form.content.slice(end)}`);
    window.requestAnimationFrame(() => {
      editor.focus();
      editor.setSelectionRange(start, start + lines.length);
    });
  };

  const newPublication = () => {
    setForm(initialForm);
    setPublicationId(null);
    setCurrentStatus(null);
    setFeedback(null);
    setError("");
  };

  const openNewPublication = () => {
    newPublication();
    onSectionChange("publications");
    window.requestAnimationFrame(() => document.querySelector(".publication-editor")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const editPublication = (publication) => {
    setForm({
      type: publication.resourceType || publication.type || "article",
      title: publication.title || "",
      summary: publication.summary || "",
      category: publication.category || categories[0],
      keywords: Array.isArray(publication.keywords) ? publication.keywords.join(", ") : publication.keywords || "",
      content: publication.content || "",
      externalUrl: publication.externalUrl || "",
      featured: Boolean(publication.featured),
      scheduledFor: dateTimeInputValue(publication.scheduledFor),
    });
    setPublicationId(publication.source === "firestore" ? publication.id : null);
    setCurrentStatus(publication.source === "firestore" ? publication.publicationStatus : null);
    setFeedback(publication.source === "seed" ? "Estàs editant una proposta inicial. En desar-la es convertirà en una publicació real." : null);
    setError("");
    window.requestAnimationFrame(() => document.querySelector(".publication-editor")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const duplicatePublication = (publication) => {
    setForm({
      type: publication.resourceType || publication.type || "article",
      title: `${publication.title || "Publicació"} — còpia`,
      summary: publication.summary || "",
      category: publication.category || categories[0],
      keywords: Array.isArray(publication.keywords) ? publication.keywords.join(", ") : publication.keywords || "",
      content: publication.content || "",
      externalUrl: publication.externalUrl || "",
      featured: false,
      scheduledFor: "",
    });
    setPublicationId(null);
    setCurrentStatus(null);
    setFeedback("Còpia preparada. Revisa-la i desa-la com una publicació nova.");
    setError("");
    window.requestAnimationFrame(() => document.querySelector(".publication-editor")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const removePublication = async (publication) => {
    if (publication.source !== "firestore" || !window.confirm(`Vols eliminar definitivament “${publication.title}”?`)) return;
    try {
      if (!import.meta.env.DEV) await deleteDoc(doc(db, "publications", publication.id));
      onPublicationDeleted?.(publication.id);
      if (publicationId === publication.id) newPublication();
    } catch {
      setError("No s’ha pogut eliminar la publicació.");
    }
  };

  const savePublication = async (status) => {
    if (!form.title.trim()) {
      setError("Escriu almenys el títol abans de desar.");
      return;
    }
    if (["published", "scheduled"].includes(status) && (!form.summary.trim() || !form.category || !form.content.trim())) {
      setError("Per publicar, completa el títol, la descripció, la temàtica i el contingut.");
      return;
    }
    if (["published", "scheduled"].includes(status) && urlRequired(form.type) && !form.externalUrl.trim()) {
      setError("Afegeix l’enllaç del recurs abans de publicar.");
      return;
    }
    if (status === "scheduled" && (!form.scheduledFor || new Date(form.scheduledFor).getTime() <= Date.now())) {
      setError("Tria una data i una hora futures per programar la publicació.");
      return;
    }

    setSaving(true);
    setError("");
    const publication = {
      type: form.type,
      typeLabel: selectedType.publicLabel,
      title: form.title.trim(),
      summary: form.summary.trim(),
      category: form.category,
      keywords,
      content: form.content.trim(),
      externalUrl: form.externalUrl.trim(),
      featured: Boolean(form.featured),
      scheduledFor: status === "scheduled" ? new Date(form.scheduledFor).toISOString() : "",
      status,
      authorName: user.displayName || "Marc Pérez",
      authorEmail: user.email,
      updatedAt: serverTimestamp(),
      publishedAt: status === "published" ? serverTimestamp() : null,
    };

    try {
      let savedId = publicationId;
      if (import.meta.env.DEV) {
        savedId ||= `preview-${Date.now()}`;
      } else if (publicationId) {
        await updateDoc(doc(db, "publications", publicationId), publication);
      } else {
        const created = await addDoc(collection(db, "publications"), {
          ...publication,
          createdAt: serverTimestamp(),
        });
        savedId = created.id;
      }
      setPublicationId(savedId);
      setCurrentStatus(status);
      setFeedback(status === "published" ? "Publicació visible al Racó." : status === "scheduled" ? "Publicació programada correctament." : "Esborrany desat correctament.");
      onPublicationSaved?.({ id: savedId, ...publication, updatedAt: new Date(), publishedAt: status === "published" ? new Date() : null });
    } catch {
      setError("No s’ha pogut desar. Comprova la connexió i torna-ho a provar.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="admin-workspace">
      <div className="admin-breadcrumbs"><button type="button" onClick={onClose}>Espai de gestió</button><span>›</span><strong>{section === "dashboard" ? "Tauler" : section === "consultations" ? "Peticions" : section === "reminders" ? "Recordatoris" : section === "forms" ? "Formularis" : "Publicacions"}</strong></div>
      <button className="back-to-site" type="button" onClick={onClose}><ArrowLeft /> Tornar al web</button>

      <div className="admin-section-tabs" role="tablist" aria-label="Apartats de gestió">
        <button className={section === "dashboard" ? "selected" : ""} type="button" role="tab" aria-selected={section === "dashboard"} onClick={() => onSectionChange("dashboard")}><Gauge /> Tauler</button>
        <button className={section === "publications" ? "selected" : ""} type="button" role="tab" aria-selected={section === "publications"} onClick={() => onSectionChange("publications")}><FileText /> Publicacions</button>
        <button className={section === "forms" ? "selected" : ""} type="button" role="tab" aria-selected={section === "forms"} onClick={() => onSectionChange("forms")}><ClipboardText /> Formularis</button>
        <button className={section === "consultations" ? "selected" : ""} type="button" role="tab" aria-selected={section === "consultations"} onClick={() => onSectionChange("consultations")}><ChatCircleDots /> Peticions {consultations.some((item) => item.status === "new") && <span>{consultations.filter((item) => item.status === "new").length}</span>}</button>
        <button className={section === "reminders" ? "selected" : ""} type="button" role="tab" aria-selected={section === "reminders"} onClick={() => onSectionChange("reminders")}><CalendarCheck /> Recordatoris {reminders.some((item) => !item.completed) && <span>{reminders.filter((item) => !item.completed).length}</span>}</button>
      </div>

      {section === "dashboard" ? <AdminDashboard publications={publications} consultations={consultations} reminders={reminders} onNavigate={onSectionChange} onNewPublication={openNewPublication} /> : section === "forms" ? <FormManager forms={forms} user={user} /> : section === "consultations" ? <ConsultationInbox consultations={consultations} reminders={reminders} onUpdateStatus={onUpdateConsultation} onConvertToReminder={onConvertConsultation} /> : section === "reminders" ? <ReminderBoard reminders={reminders} onSave={onSaveReminder} onToggle={onToggleReminder} onDelete={onDeleteReminder} /> : <>
      <section className="publication-library-admin">
        <div className="publication-library-heading"><div><span className="content-type">Biblioteca privada</span><h1>Publicacions</h1><p>Recupera, duplica, programa, destaca o retira qualsevol recurs.</p></div><button className="primary-button" type="button" onClick={newPublication}><Plus weight="bold" /> Nova publicació</button></div>
        <div className="publication-admin-list">
          {publications.length ? publications.map((publication) => <article className="publication-admin-row" key={`${publication.source}-${publication.id}`}>
            <button className="publication-admin-main" type="button" onClick={() => editPublication(publication)}>
              <span className={`publication-state state-${publication.publicationStatus || "published"}`}>{publication.source === "seed" ? "Proposta inicial" : publication.publicationStatus === "draft" ? "Esborrany" : publication.publicationStatus === "scheduled" ? new Date(publication.scheduledFor).getTime() <= Date.now() ? "Publicada automàticament" : "Programada" : "Publicada"}</span>
              <strong>{publication.title}</strong><small>{publication.category} · {publication.type}</small>
            </button>
            {publication.featured && <span className="publication-featured" title="Destacada"><Star weight="fill" /></span>}
            <button className="publication-admin-duplicate" type="button" onClick={() => duplicatePublication(publication)} aria-label={`Duplicar ${publication.title}`}><Copy /></button>
            <button className="publication-admin-edit" type="button" onClick={() => editPublication(publication)} aria-label={`Editar ${publication.title}`}><PencilSimple /></button>
            {publication.source === "firestore" && <button className="publication-admin-delete" type="button" onClick={() => removePublication(publication)} aria-label={`Eliminar ${publication.title}`}><Trash /></button>}
          </article>) : <p className="publication-admin-empty">Encara no hi ha cap publicació desada.</p>}
        </div>
      </section>
      <section className="publication-studio">
        <div className="publication-editor">
          <span className="content-type">Espai de gestió</span>
          <h1>Contingut</h1>
          <p className="admin-intro">Crea el recurs, revisa com quedarà i publica’l sense haver d’entrar al codi.</p>

          <fieldset className="format-picker">
            <legend>Format de publicació</legend>
            <div>
              {publicationTypes.map(({ id, label, icon: TypeIcon }) => (
                <button className={form.type === id ? "selected" : ""} type="button" key={id} onClick={() => changeField("type", id)} aria-pressed={form.type === id}>
                  <TypeIcon weight={form.type === id ? "duotone" : "regular"} /><span>{label}</span>
                </button>
              ))}
            </div>
          </fieldset>

          <div className="publication-fields">
            <label className="field-wide"><span className="field-label">Títol <b>*</b></span><input value={form.title} maxLength="120" onChange={(event) => changeField("title", event.target.value)} placeholder="Escriu un títol clar i directe" /></label>
            <label className="field-wide"><span className="field-label">Descripció breu <b>*</b></span><textarea rows="3" value={form.summary} maxLength="300" onChange={(event) => changeField("summary", event.target.value)} placeholder="Explica en poques paraules què hi trobaran" /><small>{form.summary.length}/300</small></label>
            <label><span className="field-label">Temàtica <b>*</b></span><select value={form.category} onChange={(event) => changeField("category", event.target.value)}>{categories.map((category) => <option key={category}>{category}</option>)}</select></label>
            <label><span className="field-label">Paraules clau</span><input value={form.keywords} onChange={(event) => changeField("keywords", event.target.value)} placeholder="IA, avaluació, rúbriques…" /><small>Separa-les amb comes.</small></label>
            <label className="field-wide featured-toggle"><input type="checkbox" checked={Boolean(form.featured)} onChange={(event) => changeField("featured", event.target.checked)} /><span><Star weight={form.featured ? "fill" : "regular"} /><b>Destacar aquesta publicació</b><small>Apareixerà a la pàgina de Destacats, ordenada pel seu tipus.</small></span></label>
            <div className="field-wide content-editor-label"><label className="field-label" htmlFor="publication-content">{contentLabel(form.type)} <b>*</b></label>
              <div className="editor-toolbar" role="toolbar" aria-label="Format del contingut">
                <button type="button" onClick={() => formatSelection("**", "**", "text en negreta")} title="Negreta" aria-label="Posar en negreta"><TextB /></button>
                <button type="button" onClick={() => formatSelection("*", "*", "text en cursiva")} title="Cursiva" aria-label="Posar en cursiva"><TextItalic /></button>
                <button type="button" onClick={() => formatLines("- ")} title="Llista amb pics" aria-label="Crear una llista amb pics"><ListBullets /></button>
                <button type="button" onClick={() => formatLines("1. ")} title="Llista numerada" aria-label="Crear una llista numerada"><ListNumbers /></button>
                <button type="button" onClick={() => formatSelection("[", "](https://)", "text de l’enllaç")} title="Enllaç" aria-label="Afegir un enllaç"><LinkSimple /></button>
                <span className="editor-toolbar-divider" aria-hidden="true" />
                <button className="format-color format-violet" type="button" onClick={() => formatSelection("[violeta]**", "**[/violeta]", "concepte digital")} title="Violeta per a conceptes digitals" aria-label="Aplicar l’èmfasi digital violeta"><span aria-hidden="true">A</span><small>Digital</small></button>
                <button className="format-color format-orange" type="button" onClick={() => formatSelection("[taronja]**", "**[/taronja]", "concepte pedagògic")} title="Taronja per a conceptes pedagògics" aria-label="Aplicar l’èmfasi pedagògic taronja"><span aria-hidden="true">A</span><small>Pedagògic</small></button>
              </div>
              <textarea id="publication-content" ref={contentEditorRef} rows="8" value={form.content} maxLength="30000" onChange={(event) => changeField("content", event.target.value)} placeholder={`Comença a escriure el ${selectedType.label.toLocaleLowerCase("ca")} aquí…`} />
              <small>{form.content.length}/30000</small>
            </div>
            {urlLabel(form.type) && <label className="field-wide"><span className="field-label">{urlLabel(form.type)} {urlRequired(form.type) && <b>*</b>}</span><input type="url" value={form.externalUrl} onChange={(event) => changeField("externalUrl", event.target.value)} placeholder="https://drive.google.com/…" /></label>}
            <label className="field-wide schedule-field"><span className="field-label">Data i hora de publicació programada</span><input type="datetime-local" value={form.scheduledFor} onChange={(event) => changeField("scheduledFor", event.target.value)} /><small>Només s’utilitzarà si prems «Programar».</small></label>
          </div>

          {error && <p className="admin-error" role="alert">{error}</p>}
          {feedback && <p className="admin-feedback" role="status"><CheckCircle weight="fill" /> {feedback}</p>}
          <div className="editor-actions">
            <button className="primary-button" type="button" onClick={() => savePublication("published")} disabled={saving}>{saving ? "Desant…" : currentStatus === "published" ? "Actualitzar publicació" : "Publicar"}<ArrowRight weight="bold" /></button>
            <button className="schedule-button" type="button" onClick={() => savePublication("scheduled")} disabled={saving}><ClockCountdown /> {currentStatus === "scheduled" ? "Actualitzar programació" : "Programar"}</button>
            <button className="draft-button" type="button" onClick={() => savePublication("draft")} disabled={saving}><FloppyDisk /> {currentStatus === "published" ? "Despublicar" : "Desar esborrany"}</button>
          </div>
        </div>

        <aside className="publication-preview" aria-live="polite">
          <div className="preview-label"><span>Previsualització</span><small>Així es veurà al web</small></div>
          <div className="preview-paper">
            <div className="preview-edition"><span>Edició digital · {currentEdition()}</span><small>Racó TIC-TAC</small></div>
            <h2>Avui al Racó</h2>
            <article className="preview-resource">
              <span className="preview-resource-icon"><PreviewIcon /></span>
              <div><small>{selectedType.publicLabel}</small><h3>{previewTitle}</h3><p>{previewSummary}</p></div>
            </article>
            <FormattedContent content={previewContent} className="preview-content" />
            <div className="preview-meta"><span>{form.category || "Temàtica"}</span><span>{keywords.length ? keywords.join(" · ") : "Paraules clau"}</span></div>
          </div>
        </aside>
      </section></>}
    </main>
  );
}
