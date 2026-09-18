function questionId() {
  return globalThis.crypto?.randomUUID?.() || `pregunta-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function createStarterForm() {
  return {
    slug: "necessitats-inici-curs",
    title: "Necessitats i interessos digitals del professorat",
    description: "Explica’ns quins suports, recursos o formacions et serien més útils. Les respostes ajudaran a prioritzar les actuacions del servei TICE.",
    status: "draft",
    questions: [
      { id: questionId(), type: "short_text", label: "Àmbit o departament", required: true, options: [] },
      { id: questionId(), type: "multiple_choice", label: "En quins àmbits t’agradaria rebre suport?", required: true, options: ["Google i Chrome", "Intel·ligència artificial", "Dispositius electrònics", "Eines per a l’aula", "Creació de materials digitals"] },
      { id: questionId(), type: "long_text", label: "Quina necessitat digital concreta tens ara mateix?", required: true, options: [] },
      { id: questionId(), type: "single_choice", label: "Quin format d’ajuda et seria més útil?", required: true, options: ["Guia breu", "Videotutorial", "Formació en grup", "Ajuda individual"] },
      { id: questionId(), type: "single_choice", label: "Amb quina prioritat necessites aquest suport?", required: true, options: ["A curt termini", "Durant aquest trimestre", "Més endavant"] },
      { id: questionId(), type: "long_text", label: "Altres interessos, idees o propostes", required: false, options: [] },
    ],
  };
}
