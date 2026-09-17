import { ArrowRight, CalendarCheck, ChatCircleDots, ClockCountdown, FileText, Plus, Star } from "@phosphor-icons/react";

function todayValue() {
  return new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

function publicationTime(publication) {
  if (publication.publicationStatus === "scheduled" && publication.scheduledFor) return new Date(publication.scheduledFor).getTime();
  const value = publication.publishedAt?.toDate?.() || publication.publishedAt || publication.updatedAt?.toDate?.() || publication.updatedAt;
  return value ? new Date(value).getTime() : publication.sortDate || 0;
}

function scheduledTime(publication) {
  return publication.scheduledFor ? new Date(publication.scheduledFor).getTime() : Number.POSITIVE_INFINITY;
}

function shortDate(value) {
  if (!value) return "Sense data";
  return new Intl.DateTimeFormat("ca-AD", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

export default function AdminDashboard({ publications, consultations, reminders, onNavigate, onNewPublication }) {
  const today = todayValue();
  const unread = consultations.filter((item) => item.status === "new");
  const urgentReminders = reminders.filter((item) => !item.completed && item.dueDate && item.dueDate <= today);
  const drafts = publications.filter((item) => item.source === "firestore" && item.publicationStatus === "draft");
  const nextScheduled = publications.filter((item) => item.publicationStatus === "scheduled" && scheduledTime(item) > Date.now()).sort((a, b) => scheduledTime(a) - scheduledTime(b))[0];
  const lastPublished = publications.filter((item) => (item.publicationStatus || "published") === "published" || (item.publicationStatus === "scheduled" && scheduledTime(item) <= Date.now())).sort((a, b) => publicationTime(b) - publicationTime(a))[0];

  return (
    <section className="admin-dashboard">
      <header className="dashboard-heading">
        <div><span className="content-type">Centre de comandament</span><h1>Avui al Racó</h1><p>Tot allò que requereix la teva atenció, reunit en una sola mirada.</p></div>
        <button className="primary-button" type="button" onClick={onNewPublication}><Plus weight="bold" /> Nova publicació</button>
      </header>

      <div className="dashboard-metrics">
        <button type="button" onClick={() => onNavigate("consultations")}><ChatCircleDots /><span><strong>{unread.length}</strong><small>consultes noves</small></span><ArrowRight /></button>
        <button type="button" onClick={() => onNavigate("reminders")}><CalendarCheck /><span><strong>{urgentReminders.length}</strong><small>recordatoris per avui</small></span><ArrowRight /></button>
        <button type="button" onClick={() => onNavigate("publications")}><FileText /><span><strong>{drafts.length}</strong><small>esborranys pendents</small></span><ArrowRight /></button>
      </div>

      <div className="dashboard-columns">
        <article className="dashboard-focus">
          <span className="dashboard-icon"><ClockCountdown weight="duotone" /></span>
          <small>Pròxima publicació</small>
          {nextScheduled ? <><h2>{nextScheduled.title}</h2><p>{shortDate(nextScheduled.scheduledFor)} · {nextScheduled.category}</p><button type="button" onClick={() => onNavigate("publications")}>Revisar la programació <ArrowRight /></button></> : <><h2>Encara no n’hi ha cap de programada.</h2><p>Pots preparar el pròxim recurs i decidir exactament quan es farà visible.</p><button type="button" onClick={onNewPublication}>Preparar una publicació <ArrowRight /></button></>}
        </article>

        <article className="dashboard-latest">
          <span className="dashboard-icon"><Star weight="duotone" /></span>
          <small>Darrera publicació</small>
          {lastPublished ? <><h2>{lastPublished.title}</h2><p>{lastPublished.category} · {lastPublished.type}</p></> : <><h2>El Racó espera el primer recurs.</h2><p>Quan publiquis, el podràs recuperar des d’aquí.</p></>}
        </article>
      </div>

      <div className="dashboard-agenda">
        <div><span className="content-type">Agenda immediata</span><h2>Què necessita resposta?</h2></div>
        <div className="dashboard-agenda-list">
          {unread.slice(0, 2).map((item) => <button type="button" key={item.id} onClick={() => onNavigate("consultations")}><ChatCircleDots /><span><strong>{item.name}</strong><small>{item.topic}</small></span><ArrowRight /></button>)}
          {urgentReminders.slice(0, 3).map((item) => <button type="button" key={item.id} onClick={() => onNavigate("reminders")}><CalendarCheck /><span><strong>{item.title}</strong><small>{item.dueDate < today ? "Recordatori vençut" : "Per avui"}</small></span><ArrowRight /></button>)}
          {!unread.length && !urgentReminders.length && <p className="dashboard-clear">Tot al dia. No tens consultes noves ni recordatoris urgents.</p>}
        </div>
      </div>
    </section>
  );
}
