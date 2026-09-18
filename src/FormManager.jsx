import { useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  CheckCircle,
  Copy,
  FloppyDisk,
  LinkSimple,
  ListChecks,
  PencilSimple,
  Plus,
  Trash,
  X,
} from "@phosphor-icons/react";
import { deleteDoc, doc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "./lib/firebase";

const questionTypes = [
  { id: "short_text", label: "Resposta curta" },
  { id: "long_text", label: "Resposta llarga" },
  { id: "single_choice", label: "Una opció" },
  { id: "multiple_choice", label: "Diverses opcions" },
];

function questionId() {
  return globalThis.crypto?.randomUUID?.() || `pregunta-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function suggestedQuestions() {
  return [
    { id: questionId(), type: "short_text", label: "Àmbit o departament", required: true, options: [] },
    { id: questionId(), type: "multiple_choice", label: "En quins àmbits t’agradaria rebre suport?", required: true, options: ["Google i Chrome", "Intel·ligència artificial", "Dispositius electrònics", "Eines per a l’aula", "Creació de materials digitals"] },
    { id: questionId(), type: "long_text", label: "Quina necessitat digital concreta tens ara mateix?", required: true, options: [] },
    { id: questionId(), type: "single_choice", label: "Quin format d’ajuda et seria més útil?", required: true, options: ["Guia breu", "Videotutorial", "Formació en grup", "Ajuda individual"] },
    { id: questionId(), type: "single_choice", label: "Amb quina prioritat necessites aquest suport?", required: true, options: ["A curt termini", "Durant aquest trimestre", "Més endavant"] },
    { id: questionId(), type: "long_text", label: "Altres interessos, idees o propostes", required: false, options: [] },
  ];
}

export function createStarterForm() {
  return {
    slug: "necessitats-inici-curs",
    title: "Necessitats i interessos digitals del professorat",
    description: "Explica’ns quins suports, recursos o formacions et serien més útils. Les respostes ajudaran a prioritzar les actuacions del servei TICE.",
    status: "draft",
    questions: suggestedQuestions(),
  };
}

function slugify(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 70);
}

function formStatus(status) {
  if (status === "open") return "Obert";
  if (status === "closed") return "Tancat";
  return "Esborrany";
}

export default function FormManager({ forms, user, onPreviewChange }) {
  const [form, setForm] = useState(createStarterForm);
  const [savedSlug, setSavedSlug] = useState(null);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const publicUrl = useMemo(() => `${window.location.origin}/formulari/${form.slug || "enllac"}`, [form.slug]);

  const change = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setFeedback("");
    setError("");
  };

  const newForm = () => {
    setForm(createStarterForm());
    setSavedSlug(null);
    setFeedback("");
    setError("");
    onPreviewChange?.(null);
  };

  const editForm = (entry) => {
    setForm({
      slug: entry.id,
      title: entry.title || "",
      description: entry.description || "",
      status: entry.status || "draft",
      questions: Array.isArray(entry.questions) ? entry.questions : [],
    });
    setSavedSlug(entry.id);
    setFeedback("");
    setError("");
    onPreviewChange?.(entry.id);
    window.requestAnimationFrame(() => document.querySelector(".form-builder")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const updateQuestion = (id, field, value) => {
    change("questions", form.questions.map((question) => question.id === id ? { ...question, [field]: value } : question));
  };

  const addQuestion = () => {
    change("questions", [...form.questions, { id: questionId(), type: "short_text", label: "", required: false, options: [] }]);
  };

  const moveQuestion = (index, offset) => {
    const target = index + offset;
    if (target < 0 || target >= form.questions.length) return;
    const questions = [...form.questions];
    [questions[index], questions[target]] = [questions[target], questions[index]];
    change("questions", questions);
  };

  const removeQuestion = (id) => {
    change("questions", form.questions.filter((question) => question.id !== id));
  };

  const saveForm = async (status) => {
    const slug = slugify(form.slug);
    const questions = form.questions.map((question) => ({
      id: question.id,
      type: question.type,
      label: question.label.trim(),
      required: Boolean(question.required),
      options: ["single_choice", "multiple_choice"].includes(question.type) ? question.options.map((option) => option.trim()).filter(Boolean) : [],
    }));
    if (!form.title.trim() || !slug) {
      setError("Escriu el títol i l’enllaç del formulari.");
      return;
    }
    if (!questions.length || questions.some((question) => !question.label)) {
      setError("Afegeix almenys una pregunta i comprova que totes tinguin un enunciat.");
      return;
    }
    if (questions.some((question) => ["single_choice", "multiple_choice"].includes(question.type) && question.options.length < 2)) {
      setError("Les preguntes d’opcions necessiten almenys dues respostes possibles.");
      return;
    }
    if (!savedSlug && forms.some((entry) => entry.id === slug)) {
      setError("Aquest enllaç ja està ocupat. Tria’n un altre.");
      return;
    }

    setSaving(true);
    setError("");
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      status,
      questions,
      authorName: user.displayName || "Marc Pérez",
      authorEmail: user.email,
      updatedAt: serverTimestamp(),
    };
    try {
      if (!import.meta.env.DEV) {
        await setDoc(doc(db, "forms", savedSlug || slug), savedSlug ? payload : { ...payload, createdAt: serverTimestamp() }, { merge: Boolean(savedSlug) });
      }
      setForm((current) => ({ ...current, slug, status, questions }));
      setSavedSlug(slug);
      setFeedback(status === "open" ? "Formulari obert i preparat per compartir." : status === "closed" ? "Formulari tancat. Les respostes anteriors es conserven." : "Esborrany desat.");
      onPreviewChange?.(slug);
    } catch {
      setError("No s’ha pogut desar el formulari. Comprova la connexió i torna-ho a provar.");
    } finally {
      setSaving(false);
    }
  };

  const removeForm = async (entry) => {
    if (!window.confirm(`Vols eliminar definitivament “${entry.title}”? Les respostes rebudes es conservaran.`)) return;
    try {
      if (!import.meta.env.DEV) await deleteDoc(doc(db, "forms", entry.id));
      if (savedSlug === entry.id) newForm();
    } catch {
      setError("No s’ha pogut eliminar el formulari.");
    }
  };

  const copyLink = async () => {
    await navigator.clipboard?.writeText(publicUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <section className="forms-admin">
      <div className="forms-library-heading">
        <div><span className="content-type">Recollida de necessitats</span><h1>Formularis</h1><p>Crea formularis reutilitzables i rep cada resposta directament a la safata TICE.</p></div>
        <button className="primary-button" type="button" onClick={newForm}><Plus weight="bold" /> Nou formulari</button>
      </div>

      <div className="forms-admin-list">
        {forms.length ? forms.map((entry) => (
          <article className="form-admin-row" key={entry.id}>
            <button type="button" className="form-admin-main" onClick={() => editForm(entry)}><span className={`form-state state-${entry.status}`}>{formStatus(entry.status)}</span><strong>{entry.title}</strong><small>/formulari/{entry.id} · {entry.questions?.length || 0} preguntes</small></button>
            <button type="button" onClick={() => editForm(entry)} aria-label={`Editar ${entry.title}`}><PencilSimple /></button>
            <button type="button" onClick={() => removeForm(entry)} aria-label={`Eliminar ${entry.title}`}><Trash /></button>
          </article>
        )) : <p className="publication-admin-empty">Encara no hi ha cap formulari desat.</p>}
      </div>

      <div className="form-builder">
        <div className="form-builder-heading"><div><span className="content-type">Editor</span><h2>{savedSlug ? "Edita el formulari" : "Prepara el primer formulari"}</h2></div>{savedSlug && <button className="secondary-button" type="button" onClick={newForm}><X /> Tancar l’edició</button>}</div>
        <div className="form-general-fields">
          <label><span>Títol <b>*</b></span><input value={form.title} maxLength="140" onChange={(event) => change("title", event.target.value)} /></label>
          <label><span>Text introductori</span><textarea rows="3" value={form.description} maxLength="600" onChange={(event) => change("description", event.target.value)} /></label>
          <label><span>Enllaç propi <b>*</b></span><div className="slug-field"><span>{window.location.origin}/formulari/</span><input value={form.slug} disabled={Boolean(savedSlug)} onChange={(event) => change("slug", slugify(event.target.value))} /></div><small>L’enllaç queda fix quan deses el formulari per primera vegada.</small></label>
        </div>

        <div className="question-editor-heading"><div><h3>Preguntes</h3><span>{form.questions.length} en total</span></div><button className="secondary-button" type="button" onClick={addQuestion}><Plus /> Afegir pregunta</button></div>
        <div className="question-editor-list">
          {form.questions.map((question, index) => (
            <article className="question-editor-card" key={question.id}>
              <span className="question-number">{index + 1}</span>
              <div className="question-editor-fields">
                <label><span>Enunciat</span><input value={question.label} maxLength="240" onChange={(event) => updateQuestion(question.id, "label", event.target.value)} placeholder="Escriu la pregunta" /></label>
                <label><span>Tipus de resposta</span><select value={question.type} onChange={(event) => updateQuestion(question.id, "type", event.target.value)}>{questionTypes.map((type) => <option value={type.id} key={type.id}>{type.label}</option>)}</select></label>
                {["single_choice", "multiple_choice"].includes(question.type) && <label className="question-options"><span>Opcions, una per línia</span><textarea rows="4" value={question.options.join("\n")} onChange={(event) => updateQuestion(question.id, "options", event.target.value.split("\n"))} /></label>}
                <label className="required-toggle"><input type="checkbox" checked={question.required} onChange={(event) => updateQuestion(question.id, "required", event.target.checked)} /><span>Resposta obligatòria</span></label>
              </div>
              <div className="question-editor-actions"><button type="button" disabled={index === 0} onClick={() => moveQuestion(index, -1)} aria-label="Pujar pregunta"><ArrowUp /></button><button type="button" disabled={index === form.questions.length - 1} onClick={() => moveQuestion(index, 1)} aria-label="Baixar pregunta"><ArrowDown /></button><button type="button" onClick={() => removeQuestion(question.id)} aria-label="Eliminar pregunta"><Trash /></button></div>
            </article>
          ))}
        </div>

        {savedSlug && <div className="share-form-link"><LinkSimple /><div><strong>Enllaç per compartir</strong><span>{publicUrl}</span></div><button type="button" onClick={copyLink}><Copy /> {copied ? "Copiat" : "Copiar"}</button></div>}
        {error && <p className="admin-error" role="alert">{error}</p>}
        {feedback && <p className="admin-feedback" role="status"><CheckCircle weight="fill" /> {feedback}</p>}
        <div className="form-builder-actions">
          <button className="primary-button" type="button" disabled={saving} onClick={() => saveForm("open")}><ListChecks /> {form.status === "open" ? "Actualitzar formulari obert" : "Desar i obrir"}</button>
          <button className="draft-button" type="button" disabled={saving} onClick={() => saveForm("draft")}><FloppyDisk /> Desar esborrany</button>
          {savedSlug && form.status !== "closed" && <button className="schedule-button" type="button" disabled={saving} onClick={() => saveForm("closed")}><X /> Tancar formulari</button>}
        </div>
      </div>
    </section>
  );
}
