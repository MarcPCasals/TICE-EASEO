# Espai TICE · EASEO

Primera base tècnica del futur portal TICE de l'Escola Andorrana de Segona Ensenyança d'Ordino.

## Estat actual

- Aplicació creada amb React i Vite.
- Projecte Firebase `tice-easeo` inicialitzat al client.
- Firebase Hosting preparat per publicar la carpeta `dist`.
- Primera portada provisional i adaptable a ordinador, iPad i mòbil.
- Encara no hi ha autenticació, base de dades, editor ni formulari de consultes.

La portada actual serveix per validar el to visual i comprovar el desplegament. No fixa l'arquitectura editorial definitiva.

## Desenvolupament local

```bash
npm install
npm run dev
```

## Verificació i publicació

```bash
npm run build
npx firebase-tools deploy --only hosting
```

## Decisions pendents

Abans de construir el gestor de continguts cal acordar:

1. Estructura de pàgines, pestanyes i subpàgines.
2. Tipus de contingut: novetat, article, videotutorial, recurs i avís.
3. Funcionament i privacitat del canal de consultes.
4. Rols d'edició i accés del claustre.
5. Ús de Google Drive, Firebase Storage i notificacions.
6. Historial de versions, arxiu i còpies de seguretat.

## Privacitat

Firebase Analytics queda desactivat en aquesta primera versió. Abans d'activar mètriques o formularis, cal definir quines dades són realment necessàries i com s'informarà les persones usuàries.
