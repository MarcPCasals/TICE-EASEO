import { useMemo, useState } from "react";
import {
  Article,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  FileText,
  FloppyDisk,
  ImagesSquare,
  LinkSimple,
  ListBullets,
  ListNumbers,
  Sparkle,
  TextB,
  TextItalic,
  VideoCamera,
} from "@phosphor-icons/react";
import { addDoc, collection, doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "./lib/firebase";

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
  type: "prompt",
  title: "Prompt per fer les rúbriques d’avaluació",
  summary: "Un model de prompt per adaptar i generar rúbriques clares, coherents i alineades amb les competències.",
  category: "Biblioteca de prompts",
  keywords: "rúbriques, avaluació, competències, criteris, IA",
  content: "",
  externalUrl: "",
};

function splitKeywords(value) {
  return value.split(",").map((keyword) => keyword.trim()).filter(Boolean).slice(0, 12);
}

function currentEdition() {
  return new Intl.DateTimeFormat("ca-AD", { month: "long", year: "numeric" }).format(new Date());
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
  if (type === "template") return "Enllaç de la plantilla";
  if (type === "images") return "Enllaç de la carpeta o presentació";
  return null;
}

export default function AdminWorkspace({ user, onClose, onPublicationSaved }) {
  const [form, setForm] = useState(initialForm);
  const [publicationId, setPublicationId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [error, setError] = useState("");

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

  const savePublication = async (status) => {
    if (!form.title.trim()) {
      setError("Escriu almenys el títol abans de desar.");
      return;
    }
    if (status === "published" && (!form.summary.trim() || !form.category || !form.content.trim())) {
      setError("Per publicar, completa el títol, la descripció, la temàtica i el contingut.");
      return;
    }
    if (status === "published" && urlLabel(form.type) && !form.externalUrl.trim()) {
      setError("Afegeix l’enllaç del recurs abans de publicar.");
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
      setFeedback(status === "published" ? "Publicació visible al Racó." : "Esborrany desat correctament.");
      onPublicationSaved?.({ id: savedId, ...publication, updatedAt: new Date(), publishedAt: status === "published" ? new Date() : null });
    } catch {
      setError("No s’ha pogut desar. Comprova la connexió i torna-ho a provar.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="admin-workspace">
      <div className="admin-breadcrumbs"><button type="button" onClick={onClose}>Espai de gestió</button><span>›</span><strong>Nova publicació</strong></div>
      <button className="back-to-site" type="button" onClick={onClose}><ArrowLeft /> Tornar al web</button>

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
            <label className="field-wide content-editor-label"><span className="field-label">{contentLabel(form.type)} <b>*</b></span>
              <div className="editor-toolbar" aria-hidden="true"><TextB /><TextItalic /><ListBullets /><ListNumbers /><LinkSimple /></div>
              <textarea rows="8" value={form.content} maxLength="4000" onChange={(event) => changeField("content", event.target.value)} placeholder={`Comença a escriure el ${selectedType.label.toLocaleLowerCase("ca")} aquí…`} />
              <small>{form.content.length}/4000</small>
            </label>
            {urlLabel(form.type) && <label className="field-wide"><span className="field-label">{urlLabel(form.type)} <b>*</b></span><input type="url" value={form.externalUrl} onChange={(event) => changeField("externalUrl", event.target.value)} placeholder="https://drive.google.com/…" /></label>}
          </div>

          {error && <p className="admin-error" role="alert">{error}</p>}
          {feedback && <p className="admin-feedback" role="status"><CheckCircle weight="fill" /> {feedback}</p>}
          <div className="editor-actions">
            <button className="primary-button" type="button" onClick={() => savePublication("published")} disabled={saving}>{saving ? "Desant…" : "Publicar"}<ArrowRight weight="bold" /></button>
            <button className="draft-button" type="button" onClick={() => savePublication("draft")} disabled={saving}><FloppyDisk /> Desar esborrany</button>
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
            <div className="preview-content">{previewContent}</div>
            <div className="preview-meta"><span>{form.category || "Temàtica"}</span><span>{keywords.length ? keywords.join(" · ") : "Paraules clau"}</span></div>
          </div>
        </aside>
      </section>
    </main>
  );
}
