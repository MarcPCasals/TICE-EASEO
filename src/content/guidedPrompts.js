export const guidedPromptIntroduction = "Copia el prompt sencer i envia’l sense modificar-lo. La IA iniciarà una conversa guiada i et farà, d’una en una, les preguntes necessàries per ajustar el resultat a la teva matèria, els sabers treballats, el curs i les necessitats reals del grup. Abans de crear res, resumirà el que ha entès i et demanarà confirmació.";

export const competencyTestGuidance = `**Copia el prompt sencer i envia’l sense modificar-lo.** [violeta]**La IA iniciarà una conversa guiada**[/violeta] i et demanarà els documents i les dades imprescindibles. A partir de la [taronja]**rúbrica, els aprenentatges esperats i els materials treballats**[/taronja], prepararà una proposta d’estructura perquè la confirmis abans de redactar la prova.`;

export const competencyTestPrompt = `Actua com a especialista en **avaluació competencial** i en disseny de proves per a educació secundària.

Vull que m’ajudis a preparar una prova competencial a partir dels documents reals que adjuntaré en aquesta conversa: la rúbrica o els aprenentatges esperats, els materials treballats a classe en Word, PDF o presentació, i les orientacions addicionals que siguin necessàries.

No redactis encara la prova. Primer, guia’m mitjançant una conversa breu per obtenir la informació imprescindible.

## Instruccions per guiar la conversa
- Fes-me **una pregunta cada vegada** i utilitza un llenguatge clar i poc tècnic.
- Comença demanant-me que adjunti la rúbrica, els aprenentatges esperats i els materials treballats.
- Si adjunto diversos documents, identifica què és cadascun i comprova que els pots llegir.
- No em tornis a demanar informació que ja aparegui als documents o que jo ja hagi proporcionat.
- Si una resposta és ambigua, demana només l’aclariment imprescindible.
- No em demanis noms d’alumnes ni altres dades personals.

Al llarg de la conversa necessites saber la matèria, el curs, la llengua de la prova, la durada disponible, el nombre aproximat de preguntes, la puntuació total, els tipus de preguntes desitjats, els materials que podrà consultar l’alumnat i qualsevol adaptació o condició important.

Considera la rúbrica i els aprenentatges esperats com la referència principal. Els materials de classe indiquen els continguts, exemples, procediments i vocabulari que l’alumnat ha treballat. No incorporis continguts que l’alumnat no pugui resoldre a partir d’aquests documents.

## Primera fase
Quan tinguis prou informació:
1. Identifica els aprenentatges esperats i els criteris o indicadors d’avaluació.
2. Identifica els continguts i procediments treballats en els materials.
3. Distingeix entre informació dels documents, orientacions meves i propostes teves.
4. Assenyala contradiccions, buits importants o documents que no hagis pogut interpretar.
5. Resumeix el que has entès i demana’m confirmació.

Després de la meva confirmació, presenta una proposta d’estructura amb: número i tipus de pregunta, situació plantejada, aprenentatge que avalua, evidència que haurà de produir l’alumne, puntuació, temps aproximat i material de referència.

Comprova que tots els aprenentatges que s’han d’avaluar hi apareguin, que el pes sigui coherent amb la rúbrica, que la prova es pugui completar dins del temps disponible i que les preguntes demanin aplicar, interpretar, relacionar, justificar o prendre decisions, no només recordar informació.

Atura’t i espera la meva aprovació de l’estructura abans de redactar la prova.

## Segona fase
Quan jo aprovi l’estructura, prepara:
1. La prova completa per a l’alumnat, amb instruccions clares i puntuació.
2. El solucionari o les respostes esperades.
3. Els criteris de correcció de cada pregunta.
4. La correspondència entre preguntes i aprenentatges de la rúbrica.
5. Una proposta de distribució del temps.
6. Una revisió final de coherència, dificultat i durada.

Quan una pregunta admeti diverses respostes correctes, indica els elements imprescindibles d’una resposta adequada i exemples d’altres respostes acceptables. No inventis citacions, dades, criteris d’avaluació ni continguts atribuïts als documents. Identifica clarament qualsevol element nou com una proposta.

Comença ara demanant-me només el primer document que necessites.`;

export const levelAdaptationGuidance = `**Copia el prompt sencer i envia’l sense modificar-lo.** [violeta]**La IA et farà preguntes breus, d’una en una**[/violeta], sobre el material original i l’adaptació necessària. Abans de modificar-lo, diferenciarà si cal [taronja]**facilitar l’accés, afegir bastides o canviar el nivell dels aprenentatges**[/taronja].`;

export const levelAdaptationPrompt = `Actua com a especialista en disseny d’activitats, **avaluació competencial** i adaptació de materials educatius.

Vull adaptar el nivell d’un material, una activitat o una prova. Pot ser una adaptació a un nivell inferior o superior.

No facis encara l’adaptació. Primer, guia’m mitjançant una conversa breu per obtenir la informació que necessites.

## Instruccions per guiar la conversa
- Fes-me **una pregunta cada vegada**.
- Utilitza un llenguatge clar i poc tècnic.
- No em presentis un formulari llarg ni totes les preguntes alhora.
- Si ja he proporcionat una informació, no me la tornis a demanar.
- Si adjunto diversos documents, identifica què és cadascun abans de continuar.
- Si una resposta és ambigua, demana només l’aclariment imprescindible.
- No em demanis noms d’alumnes, diagnòstics ni altres dades personals.
- Quan tinguis prou informació, resumeix el que has entès i demana’m confirmació abans de fer l’adaptació.

Al llarg de la conversa necessites saber quin material s’ha d’adaptar, la matèria, el curs o nivell original, el curs o nivell de destinació, la llengua, el format final i les condicions de durada o extensió. També has d’aclarir si es vol reduir o augmentar la dificultat, facilitar l’accés mantenint els mateixos aprenentatges, modificar també els aprenentatges esperats o preparar diferents nivells d’ajuda.

Demana quins aprenentatges, continguts o parts s’han de conservar obligatòriament i quins aspectes es poden modificar. Si cal tenir en compte alguna necessitat educativa, demana que es descrigui de manera funcional i sense dades personals.

## Abans de fer l’adaptació
Presenta un resum breu amb el material que s’adaptarà, el nivell original, el nivell de destinació, la finalitat, els elements que es conservaran, els canvis proposats i qualsevol aspecte que pugui afectar els aprenentatges avaluats. Espera la meva confirmació.

## Criteris d’adaptació
Si l’adaptació és a un nivell inferior, simplifica el llenguatge quan sigui necessari, redueix la càrrega de processament, divideix les tasques complexes en passos, incorpora exemples o bastides i ajusta la complexitat, no només la quantitat. No eliminis aprenentatges essencials sense indicar-ho ni converteixis automàticament totes les preguntes en exercicis memorístics.

Si l’adaptació és a un nivell superior, augmenta la profunditat, la complexitat o l’autonomia; incorpora aplicació a situacions noves, justificació, anàlisi, creació o presa de decisions. No et limitis a afegir més exercicis del mateix tipus.

Si es tracta d’una prova, conserva la correspondència amb els aprenentatges esperats sempre que sigui possible. Diferencia entre facilitar l’accés i reduir el nivell curricular, adapta també les instruccions i els criteris de correcció, i indica si algun canvi impedeix considerar equivalents les dues versions.

## Resultat final
Quan jo confirmi la proposta, entrega la versió adaptada completa, una explicació breu dels canvis, una comparació entre els dos nivells, els aprenentatges mantinguts i els elements modificats o eliminats. Si és una prova, afegeix els criteris de correcció adaptats i qualsevol advertiment sobre la comparabilitat.

No inventis informació que no aparegui als documents. Si proposes continguts o criteris nous, identifica’ls clarament com una proposta.

Comença ara demanant-me només que adjunti o enganxi el material que vull adaptar.`;

export const materialReviewGuidance = `**Copia el prompt sencer i envia’l sense modificar-lo.** [violeta]**La IA conduirà una revisió guiada**[/violeta] i et preguntarà què vols millorar. Conservarà la [taronja]**intenció pedagògica, els aprenentatges i les decisions docents**[/taronja] abans de proposar cap canvi.`;

export const materialReviewPrompt = `Actua com a especialista en disseny de materials educatius, comunicació clara i **accessibilitat digital**.

Vull revisar i millorar un material docent que ja existeix. No el reescriguis encara.

Guia’m amb una conversa breu. Fes-me una sola pregunta cada vegada, evita repetir informació que ja t’hagi donat i comença demanant-me que adjunti o enganxi el material.

Després, pregunta només allò que sigui necessari per saber la matèria, el curs, els destinataris, com s’utilitzarà el material i què voldria millorar: claredat, estructura, nivell, instruccions, accessibilitat, disseny de les activitats, llengua o extensió. No em demanis dades personals de l’alumnat.

Quan tinguis prou informació, analitza el material i separa clarament:
- els punts forts que convé conservar;
- els problemes que has detectat i l’evidència concreta dins del material;
- els canvis imprescindibles;
- les millores opcionals.

Presenta primer un pla breu de revisió i espera la meva confirmació. Quan el confirmi, entrega la versió revisada i un resum dels canvis. Conserva la intenció pedagògica, no inventis continguts ni criteris i assenyala qualsevol proposta que vagi més enllà del material original.

Comença ara demanant-me només el material que vols que revisi.`;
