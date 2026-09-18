import { useMemo, useState } from "react";
import { ArrowSquareOut, CalendarPlus, CheckCircle, ChatCircleDots, Copy, EnvelopeSimple, SealCheck } from "@phosphor-icons/react";

function consultationDate(value) {
  const date = value instanceof Date ? value : value?.toDate?.();
  if (!date) return "Ara";
  return new Intl.DateTimeFormat("ca-AD", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(date);
}

function statusLabel(status) {
  if (status === "resolved") return "Resolta";
  if (status === "read") return "Llegida";
  return "Pendent";
}

function kindLabel(kind) {
  if (kind === "form_response") return "Resposta a formulari";
  if (kind === "suggestion") return "Suggeriment";
  if (kind === "publication_request") return "Petició de publicació";
  return "Dubte";
}

export default function ConsultationInbox({ consultations, onUpdateStatus, onConvertToReminder, reminders }) {
  const [filter, setFilter] = useState("open");
  const [selectedId, setSelectedId] = useState(consultations.find((item) => item.status !== "resolved")?.id || consultations[0]?.id || null);
  const [copied, setCopied] = useState(false);

  const visibleConsultations = useMemo(() => {
    if (filter === "new") return consultations.filter((item) => item.status === "new");
    if (filter === "resolved") return consultations.filter((item) => item.status === "resolved");
    return consultations.filter((item) => item.status !== "resolved");
  }, [consultations, filter]);

  const selected = consultations.find((item) => item.id === selectedId) || visibleConsultations[0] || null;
  const convertedToReminder = selected ? reminders.some((reminder) => reminder.sourceConsultationId === selected.id) : false;

  const openConsultation = (consultation) => {
    setSelectedId(consultation.id);
    setCopied(false);
    if (consultation.status === "new") onUpdateStatus(consultation.id, "read");
  };

  const copyEmail = async () => {
    if (!selected?.email) return;
    await navigator.clipboard?.writeText(selected.email);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <section className="consultation-workspace">
      <header className="consultation-title">
        <span className="content-type">Safata TICE</span>
        <h1>Peticions i respostes</h1>
        <p>Centralitza dubtes, suggeriments, peticions i respostes als formularis TICE.</p>
      </header>

      <div className="consultation-inbox">
        <aside className="consultation-list-panel">
          <div className="consultation-filters" aria-label="Filtres de consultes">
            <button className={filter === "open" ? "selected" : ""} type="button" onClick={() => setFilter("open")}>Obertes</button>
            <button className={filter === "new" ? "selected" : ""} type="button" onClick={() => setFilter("new")}>Pendents</button>
            <button className={filter === "resolved" ? "selected" : ""} type="button" onClick={() => setFilter("resolved")}>Resoltes</button>
          </div>
          <div className="consultation-list">
            {visibleConsultations.length ? visibleConsultations.map((consultation) => (
              <button className={`consultation-row ${consultation.id === selected?.id ? "selected" : ""} ${consultation.status === "new" ? "unread" : ""}`} type="button" key={consultation.id} onClick={() => openConsultation(consultation)}>
                <span className="consultation-avatar">{(consultation.name || "D").split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase()}</span>
                <span className="consultation-row-copy"><strong>{consultation.name || "Docent Educand"}</strong><em className={`consultation-kind kind-${consultation.kind || "question"}`}>{kindLabel(consultation.kind)}</em><small>{consultation.topic}</small><span>{consultation.message}</span></span>
                <span className={`consultation-status status-${consultation.status}`}>{statusLabel(consultation.status)}</span>
                <time>{consultationDate(consultation.createdAt)}</time>
              </button>
            )) : <div className="consultation-empty"><SealCheck /><strong>Tot al dia</strong><span>No hi ha consultes en aquest apartat.</span></div>}
          </div>
        </aside>

        <article className="consultation-detail">
          {selected ? (
            <>
              <div className="consultation-detail-heading">
                <div><span>{kindLabel(selected.kind)} · {statusLabel(selected.status)}</span><h2>{selected.topic}</h2></div>
                <time>{consultationDate(selected.createdAt)}</time>
              </div>
              <div className="consultation-sender">
                <span className="consultation-avatar large">{(selected.name || "D").split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase()}</span>
                <div><strong>{selected.name || "Docent Educand"}</strong><a href={`mailto:${selected.email}`}>{selected.email}</a></div>
                <button type="button" onClick={copyEmail} aria-label="Copiar el correu"><Copy /> {copied ? "Copiat" : "Copiar"}</button>
              </div>
              {selected.kind === "form_response" && Array.isArray(selected.answers) ? <div className="form-response-detail">{selected.answers.map((answer, index) => <div key={answer.questionId || index}><span>{answer.question}</span><p>{Array.isArray(answer.value) ? answer.value.join(" · ") : answer.value}</p></div>)}</div> : <div className="consultation-message"><ChatCircleDots weight="duotone" /><p>{selected.message}</p></div>}
              <div className="consultation-actions">
                <a className="primary-button" href={`mailto:${selected.email}?subject=${encodeURIComponent(`Re: ${selected.topic}`)}`}><EnvelopeSimple /> Respondre per correu <ArrowSquareOut /></a>
                <button className="secondary-button" type="button" disabled={convertedToReminder} onClick={() => onConvertToReminder(selected)}><CalendarPlus />{convertedToReminder ? "Afegida als recordatoris" : "Convertir en recordatori"}</button>
                <button className="secondary-button" type="button" onClick={() => onUpdateStatus(selected.id, selected.status === "resolved" ? "read" : "resolved")}>
                  <CheckCircle weight={selected.status === "resolved" ? "regular" : "fill"} />{selected.status === "resolved" ? "Reobrir la consulta" : "Marcar com a resolta"}
                </button>
              </div>
              <p className="consultation-note">La resposta s’enviarà des del teu correu habitual; aquí en gestiones el tipus, l’estat i, si cal, la conversió en recordatori.</p>
            </>
          ) : <div className="consultation-detail-empty"><ChatCircleDots /><h2>Selecciona una consulta</h2><p>El missatge complet apareixerà aquí.</p></div>}
        </article>
      </div>
    </section>
  );
}
