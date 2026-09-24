export const PUBLICATION_TAGS = [
  { id: "general-interest", label: "Interès general" },
  { id: "start-of-year", label: "Inici de curs" },
  { id: "teacher-organization", label: "Organització docent" },
  { id: "communication-teams", label: "Comunicació i equips" },
  { id: "classroom-preparation", label: "Preparació d’aula" },
  { id: "assessment", label: "Avaluació" },
  { id: "security-privacy", label: "Seguretat i privacitat" },
  { id: "troubleshooting", label: "Resolució de problemes" },
];

const publicationTagIds = new Set(PUBLICATION_TAGS.map((tag) => tag.id));

export function normalizePublicationTags(tags) {
  if (!Array.isArray(tags)) return [];
  return [...new Set(tags.filter((tag) => publicationTagIds.has(tag)))].slice(0, 2);
}

export function getPublicationTagLabels(tags) {
  const normalizedTags = normalizePublicationTags(tags);
  return PUBLICATION_TAGS.filter((tag) => normalizedTags.includes(tag.id)).map((tag) => tag.label);
}
