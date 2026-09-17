import { useMemo, useState } from "react";
import { CalendarCheck, Check, ClockCountdown, Flag, Plus, SealCheck } from "@phosphor-icons/react";

function todayValue() {
  return new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

function readableDate(value) {
  if (!value) return "Sense data";
  return new Intl.DateTimeFormat("ca-AD", { weekday: "short", day: "numeric", month: "short" }).format(new Date(`${value}T12:00:00`));
}

function dateState(value) {
  if (!value) return { label: "Sense data", className: "" };
  const today = todayValue();
  if (value < today) return { label: "Vençut", className: "overdue" };
  if (value === today) return { label: "Avui", className: "today" };
  return { label: readableDate(value), className: "" };
}

const priorityOrder = { high: 0, medium: 1, low: 2 };
const priorityLabels = { high: "Alta", medium: "Mitjana", low: "Baixa" };

export default function ReminderBoard({ reminders, onCreate, onToggle }) {
  const [filter, setFilter] = useState("pending");
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [dueDate, setDueDate] = useState(todayValue());
  const [priority, setPriority] = useState("medium");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const visibleReminders = useMemo(() => reminders
    .filter((reminder) => filter === "all" || (filter === "done" ? reminder.completed : !reminder.completed))
    .sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      if ((a.dueDate || "9999") !== (b.dueDate || "9999")) return (a.dueDate || "9999").localeCompare(b.dueDate || "9999");
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }), [filter, reminders]);

  const addReminder = async (event) => {
    event.preventDefault();
    if (!title.trim()) {
      setError("Escriu què vols recordar.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await onCreate({ title: title.trim(), notes: notes.trim(), dueDate, priority });
      setTitle("");
      setNotes("");
      setPriority("medium");
    } catch {
      setError("No s’ha pogut desar el recordatori.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="reminder-workspace">
      <header className="reminder-title">
        <span className="content-type">Agenda privada</span>
        <h1>Recordatoris</h1>
        <p>Ordena les tasques del Racó i tingues clar què toca fer després.</p>
      </header>

      <div className="reminder-layout">
        <form className="reminder-form" onSubmit={addReminder}>
          <div className="reminder-form-heading"><CalendarCheck weight="duotone" /><div><strong>Nou recordatori</strong><span>Només és visible per a tu.</span></div></div>
          <label>Què has de fer? <span>*</span><input value={title} onChange={(event) => setTitle(event.target.value)} maxLength="140" placeholder="Per exemple: gravar el videotutorial…" /></label>
          <div className="reminder-form-row">
            <label>Data<input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} /></label>
            <label>Prioritat<select value={priority} onChange={(event) => setPriority(event.target.value)}><option value="high">Alta</option><option value="medium">Mitjana</option><option value="low">Baixa</option></select></label>
          </div>
          <label>Notes opcionals<textarea rows="4" value={notes} onChange={(event) => setNotes(event.target.value)} maxLength="500" placeholder="Detalls, enllaços o passos que no vols oblidar…" /></label>
          {error && <p className="admin-error" role="alert">{error}</p>}
          <button className="primary-button" type="submit" disabled={saving}><Plus weight="bold" />{saving ? "Desant…" : "Afegir recordatori"}</button>
        </form>

        <div className="reminder-list-panel">
          <div className="reminder-list-heading">
            <div><span className="content-type">La teva llista</span><h2>{filter === "done" ? "Fets" : filter === "all" ? "Tots" : "Per fer"}</h2></div>
            <div className="reminder-filters" aria-label="Filtres de recordatoris"><button className={filter === "pending" ? "selected" : ""} type="button" onClick={() => setFilter("pending")}>Pendents</button><button className={filter === "done" ? "selected" : ""} type="button" onClick={() => setFilter("done")}>Fets</button><button className={filter === "all" ? "selected" : ""} type="button" onClick={() => setFilter("all")}>Tots</button></div>
          </div>
          <div className="reminder-list">
            {visibleReminders.length ? visibleReminders.map((reminder) => {
              const due = dateState(reminder.dueDate);
              return (
                <article className={`reminder-item ${reminder.completed ? "completed" : ""}`} key={reminder.id}>
                  <button className="reminder-check" type="button" onClick={() => onToggle(reminder, !reminder.completed)} aria-label={reminder.completed ? "Tornar a marcar com a pendent" : "Marcar com a fet"}>{reminder.completed ? <Check weight="bold" /> : null}</button>
                  <div className="reminder-copy"><h3>{reminder.title}</h3>{reminder.notes && <p>{reminder.notes}</p>}<div className="reminder-meta"><span className={`reminder-date ${due.className}`}><ClockCountdown />{due.label}</span><span className={`priority priority-${reminder.priority}`}><Flag weight="fill" />Prioritat {priorityLabels[reminder.priority]}</span></div></div>
                </article>
              );
            }) : <div className="reminder-empty"><SealCheck weight="duotone" /><h3>{filter === "done" ? "Encara no n’has completat cap" : "Tot fet per ara"}</h3><p>Quan afegeixis un recordatori, apareixerà aquí.</p></div>}
          </div>
        </div>
      </div>
    </section>
  );
}
