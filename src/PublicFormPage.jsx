import { useEffect, useState } from "react";
import { CheckCircle, PaperPlaneTilt, WarningCircle } from "@phosphor-icons/react";
import { addDoc, collection, doc, onSnapshot, serverTimestamp } from "firebase/firestore";
import { db } from "./lib/firebase";
import { createStarterForm } from "./FormManager";

function answerIsEmpty(value) {
  return Array.isArray(value) ? value.length === 0 : !String(value || "").trim();
}

export default function PublicFormPage({ slug, user }) {
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [answers, setAnswers] = useState({});
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (import.meta.env.DEV) {
      const preview = createStarterForm();
      setForm({ ...preview, id: slug, status: "open" });
      setLoading(false);
      return undefined;
    }
    return onSnapshot(doc(db, "forms", slug), (snapshot) => {
      setForm(snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null);
      setLoadError(snapshot.exists() ? "" : "No hem trobat aquest formulari.");
      setLoading(false);
    }, () => {
      setLoadError("No s’ha pogut carregar el formulari.");
      setLoading(false);
    });
  }, [slug]);

  const setAnswer = (questionId, value) => {
    setAnswers((current) => ({ ...current, [questionId]: value }));
    setError("");
  };

  const toggleOption = (questionId, option) => {
    const current = Array.isArray(answers[questionId]) ? answers[questionId] : [];
    setAnswer(questionId, current.includes(option) ? current.filter((value) => value !== option) : [...current, option]);
  };

  const submit = async (event) => {
    event.preventDefault();
    const missing = form.questions.find((question) => question.required && answerIsEmpty(answers[question.id]));
    if (missing) {
      setError(`Falta respondre: “${missing.label}”.`);
      document.getElementById(`question-${missing.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    const answerList = form.questions
      .map((question) => ({ questionId: question.id, question: question.label, value: answers[question.id] || (question.type === "multiple_choice" ? [] : "") }))
      .filter((answer) => !answerIsEmpty(answer.value));
    const message = answerList.map((answer) => `${answer.question}\n${Array.isArray(answer.value) ? answer.value.join(", ") : answer.value}`).join("\n\n");
    setSending(true);
    setError("");
    try {
      if (!import.meta.env.DEV) {
        await addDoc(collection(db, "consultations"), {
          name: user.displayName || "Usuari Educand",
          email: user.email,
          topic: form.title,
          kind: "form_response",
          message,
          formId: form.id,
          formTitle: form.title,
          answers: answerList,
          status: "new",
          createdAt: serverTimestamp(),
        });
      }
      setSent(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setError("No s’ha pogut enviar la resposta. Comprova la connexió i torna-ho a provar.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="public-form-shell">
      <header className="public-form-header"><a href="/" aria-label="Tornar al Racó TIC-TAC"><img src="/raco-tic-tac.svg" alt="Racó TIC-TAC" /></a><div><strong>{user.displayName || "Docent Educand"}</strong><span>{user.email}</span></div></header>
      <main className="public-form-main">
        {loading ? <div className="public-form-message"><span className="content-type">Formulari TICE</span><h1>Carregant…</h1></div> : loadError ? <div className="public-form-message"><WarningCircle /><h1>Formulari no disponible</h1><p>{loadError}</p><a className="primary-button" href="/">Tornar al Racó</a></div> : form.status !== "open" ? <div className="public-form-message"><WarningCircle /><span className="content-type">Formulari TICE</span><h1>{form.title}</h1><p>Aquest formulari està tancat i ja no admet respostes.</p><a className="primary-button" href="/">Tornar al Racó</a></div> : sent ? <div className="public-form-message success"><CheckCircle weight="fill" /><span className="content-type">Resposta enviada</span><h1>Gràcies per participar-hi.</h1><p>La teva resposta ha arribat correctament a la zona de peticions del servei TICE.</p><a className="primary-button" href="/">Tornar al Racó</a></div> : (
          <>
            <section className="public-form-intro"><span className="content-type">Formulari TICE · EASEO</span><h1>{form.title}</h1><p>{form.description}</p><div><strong>Respon com a {user.displayName || "docent Educand"}</strong><span>El teu nom i correu s’adjuntaran automàticament a la resposta.</span></div></section>
            <form className="public-form" onSubmit={submit}>
              {form.questions.map((question, index) => (
                <fieldset className="public-question" id={`question-${question.id}`} key={question.id}>
                  <legend><span>{index + 1}</span>{question.label}{question.required && <b>*</b>}</legend>
                  {question.type === "short_text" && <input value={answers[question.id] || ""} maxLength="300" onChange={(event) => setAnswer(question.id, event.target.value)} />}
                  {question.type === "long_text" && <textarea rows="5" value={answers[question.id] || ""} maxLength="3000" onChange={(event) => setAnswer(question.id, event.target.value)} />}
                  {question.type === "single_choice" && <div className="public-options">{question.options.map((option) => <label key={option}><input type="radio" name={question.id} checked={answers[question.id] === option} onChange={() => setAnswer(question.id, option)} /><span>{option}</span></label>)}</div>}
                  {question.type === "multiple_choice" && <div className="public-options">{question.options.map((option) => <label key={option}><input type="checkbox" checked={Array.isArray(answers[question.id]) && answers[question.id].includes(option)} onChange={() => toggleOption(question.id, option)} /><span>{option}</span></label>)}</div>}
                </fieldset>
              ))}
              {error && <p className="form-error public-form-error" role="alert">{error}</p>}
              <button className="primary-button public-form-submit" type="submit" disabled={sending}>{sending ? "Enviant…" : "Enviar la resposta"}<PaperPlaneTilt weight="bold" /></button>
              <p className="public-form-privacy">La resposta serà visible únicament per la persona responsable del servei TICE.</p>
            </form>
          </>
        )}
      </main>
    </div>
  );
}
