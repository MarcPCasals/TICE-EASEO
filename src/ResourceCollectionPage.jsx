import { ArrowLeft, ArrowRight, BookOpen, FileText, ImagesSquare, Sparkle, Star, VideoCamera } from "@phosphor-icons/react";
import ResourceTags from "./ResourceTags";

const typeDetails = {
  video: { label: "Videotutorials", icon: VideoCamera },
  article: { label: "Articles", icon: BookOpen },
  prompt: { label: "Prompts", icon: Sparkle },
  template: { label: "Plantilles", icon: FileText },
  images: { label: "Galeries", icon: ImagesSquare },
};

function ResourceCard({ resource, onOpen }) {
  const details = typeDetails[resource.resourceType] || { label: resource.type || "Recurs", icon: BookOpen };
  const Icon = details.icon;
  return (
    <button className="library-card" type="button" onClick={() => onOpen(resource)}>
      <span className="library-card-icon"><Icon weight="duotone" /></span>
      <span className="library-card-copy">
        <small>{resource.type || details.label}</small>
        <strong>{resource.title}</strong>
        <ResourceTags tags={resource.tags} />
        <span>{resource.summary}</span>
        <em>{resource.category}</em>
      </span>
      {resource.featured && <span className="library-star" aria-label="Recurs destacat"><Star weight="fill" /></span>}
      <ArrowRight className="library-arrow" />
    </button>
  );
}

export default function ResourceCollectionPage({ title, eyebrow, intro, resources, groupByType, onBack, onOpen }) {
  const groups = groupByType
    ? Object.entries(typeDetails).map(([type, details]) => ({ type, ...details, resources: resources.filter((resource) => resource.resourceType === type) })).filter((group) => group.resources.length)
    : [{ type: "all", label: title, resources }];

  return (
    <main className="library-page">
      <button className="back-to-home" type="button" onClick={onBack}><ArrowLeft /> Tornar a l’inici</button>
      <header className="library-header">
        <span className="content-type">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{intro}</p>
      </header>
      {resources.length ? <div className="library-groups">
        {groups.map((group) => (
          <section className="library-group" key={group.type}>
            {groupByType && <div className="library-group-heading"><span>{group.label}</span><small>{group.resources.length} {group.resources.length === 1 ? "recurs" : "recursos"}</small></div>}
            <div className="library-grid">{group.resources.map((resource) => <ResourceCard key={resource.id} resource={resource} onOpen={onOpen} />)}</div>
          </section>
        ))}
      </div> : <div className="library-empty"><Star weight="duotone" /><h2>Encara no hi ha recursos aquí.</h2><p>Quan en publiquis o en destaquis algun, apareixerà automàticament en aquest espai.</p></div>}
    </main>
  );
}
