<!-- Auto-generated guidance for AI coding agents working on HolaWeb -->
# Repo snapshot

This is a small, static front-end repository (no build system). It contains plain HTML, CSS and JavaScript files served directly from the repository root. The project is published via GitHub Pages at URLs like `https://<Usuario>.github.io/HolaWeb/examen.html` and the default branch is `main` (owner: `DonAxis`).

**Key files / folders**
- `index.html` — landing page, links to exercises and includes `TrabajoConsola.js` and `arreglos.js`.
- `examen.html` — exam page. Includes a large `catalogo` array embedded in the file (do not change the array contents unless asked).
- `alumnos.js` — example of rendering a data array to a table and small business logic (flags entries with `IA` in `califica`).
- `imagenes/` — static image assets referenced by many pages.

**Big picture & architecture**
- Single-page/static site: no bundler, no server-side code. Files are directly loaded via `<script>` and `<link>` tags in HTML.
- Data often comes from local JS files or inline arrays (e.g., `catalogo` inside `examen.html`, `Califica` in `alumnos.js`). Many pages expect these arrays to exist in the global scope.
- UI patterns: DOM is manipulated directly with `document.getElementById(...).innerHTML` or similar; agents should follow the project's imperative DOM approach rather than introducing frameworks.

**Project-specific patterns and gotchas**
- Variable keys are not always consistent: some objects use `categoria`, others have a misspelling `categora`. When writing code that reads category fields, handle both keys defensively.
- Data is sometimes embedded in HTML (`<pre><code>const catalogo = [...]</code></pre>`). The exam instructions explicitly state "copy only, do not modify" — do not change the embedded `catalogo` unless requested.
- Filenames and identifiers are mostly Spanish (e.g., `alumnos`, `examen`, `TrabajoConsola.js`) — prefer Spanish examples/strings when adding files or messages to remain consistent.
- CSS files are per-page (e.g., `examen.css`, `cuadro.css`); avoid merging styles unless asked.

**How to run & debug locally**
- There's no build step. To preview pages open the HTML file in a browser or run a simple static server from the repo root.

PowerShell example (works if Python is installed):
```
cd path\to\HolaWeb
python -m http.server 8000
# then open http://localhost:8000/index.html
```

If Node.js is available you can use `http-server`:
```
npm install -g http-server
http-server -p 8000
```

Debugging tips
- Use the browser DevTools console and Elements inspector. Most logic is bound to DOM ids: search for `document.getElementById("alumnos")`, `#preguntas`, or script includes at the bottom of HTML.
- Example: `alumnos.js` sets `document.getElementById("alumnos").innerHTML = tabla` — look for `id="alumnos"` in HTML when modifying rendering.
- Example: `alumnos.js` highlights entries with `IA` using `if (p.califica.includes("IA")) { color = 'red' }` — copy this pattern for small conditional UI flags.

**Safety and data handling**
- Avoid modifying the large `catalogo` array unless the change is explicitly requested; many exam tasks expect the original dataset.
- When adding code that parses external URLs (like entries in `alumnos.js`), treat values as untrusted strings — but remember this is a static demo site intended for classroom use.

**Commits / PRs**
- Keep changes small and focused: modify only the pages/files required for the task. Don't refactor global DOM patterns across the whole repo in the same PR.
- Use filenames in Spanish where relevant to stay consistent with the rest of the repo.

**Examples to reference in edits**
- Render table from array: see `alumnos.js` (creates an HTML table and injects it into `#alumnos`).
- Defensive category reading: search the repo for `categoria` and `categora` to handle inconsistent keys.
- Exam UI expectations: see `examen.html` instructions (responsiveness, click-to-alert product details) — if implementing exam features, follow the specified behavior in that file.

If anything here is unclear or you'd like more detail (for example, a recommended small refactor, test harness, or local dev script), tell me which area to expand and I'll update this file. 
