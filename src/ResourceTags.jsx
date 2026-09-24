import { getPublicationTagLabels } from "./publicationTags";

export default function ResourceTags({ tags, className = "" }) {
  const labels = getPublicationTagLabels(tags);
  if (!labels.length) return null;

  return (
    <div className={`resource-tags${className ? ` ${className}` : ""}`} aria-label="Etiquetes de la publicació">
      {labels.map((label) => <span className="resource-tag" key={label}>{label}</span>)}
    </div>
  );
}
