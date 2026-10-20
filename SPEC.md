# SPEC — Palabra

> Juego de adivinanza de palabras en español. Inspirado en Wordle, diseño propio.
> React + TypeScript + Vite. GitHub Pages. Sin backend.

---

## 1. Arquitectura

```
┌─────────────────────────────────────────────┐
│              GitHub Pages (estático)        │
│                                             │
│  ┌───────────┐  ┌──────────┐  ┌──────────┐ │
│  │ React SPA │──│ Corpus   │  │ CSS Vars │ │
│  │           │  │ JSON     │  │ Themes   │ │
│  └─────┬─────┘  └──────────┘  └──────────┘ │
│        │                                    │
│  ┌─────┴─────┐  ┌──────────┐               │
│  │ useGame   │──│ PRNG     │               │
│  │ hook      │  │ determin.│               │
│  └─────┬─────┘  └──────────┘               │
│        │                                    │
│  ┌─────┴─────┐  ┌──────────┐               │
│  │localStorage│  │ URL hash │               │
│  │ stats/prog│  │ share    │               │
│  └───────────┘  └──────────┘               │
└─────────────────────────────────────────────┘
```

**Decisiones clave:**

- Hash routing (`/#/ruta`). Sin react-router: switch manual sobre `location.hash`.
- Estado global con `useReducer` + Context. Sin Redux ni Zustand.
- CSS Modules o variables CSS. Sin Tailwind ni CSS-in-JS.
- Corpus importado estáticamente (`import corpus from './data/es5.json'`).
- PWA: solo `manifest.json` + icons. Sin Service Worker (complica más de lo que aporta para un juego estático).

---

## 2. Estructura de archivos

```
game-palabra/
├── .github/
│   └── workflows/
│       └── deploy.yml
├── public/
│   ├── manifest.json
│   └── icons/
│       ├── icon-192.png
│       └── icon-512.png
├── src/
│   ├── components/
│   │   ├── App.tsx
│   │   ├── Header.tsx
│   │   ├── Board.tsx
│   │   ├── Row.tsx
│   │   ├── Tile.tsx
│   │   ├── Keyboard.tsx
│   │   ├── Modal.tsx
│   │   ├── StatsView.tsx
│   │   ├── ShareCard.tsx
│   │   ├── CompareView.tsx
│   │   ├── ModeSelector.tsx
│   │   ├── CorpusSelector.tsx
│   │   └── HelpModal.tsx
│   ├── hooks/
│   │   ├── useGame.ts
│   │   ├── useStats.ts
│   │   └── useShare.ts
│   ├── lib/
│   │   ├── prng.ts
│   │   ├── seed.ts
│   │   ├── evaluator.ts
│   │   ├── normalize.ts
│   │   ├── share-codec.ts
│   │   ├── storage.ts
│   │   └── constants.ts
│   ├── data/
│   │   └── es5.json
│   ├── types/
│   │   └── index.ts
│   ├── styles/
│   │   ├── global.css
│   │   ├── theme.css
│   │   ├── board.css
│   │   └── keyboard.css
│   ├── main.tsx
│   └── vite-env.d.ts
├── tests/
│   ├── prng.test.ts
│   ├── evaluator.test.ts
│   ├── normalize.test.ts
│   ├── share-codec.test.ts
│   └── seed.test.ts
├── scripts/
│   └── validate-corpus.ts
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── SPEC.md
├── TASKS.md
├── AGENTS.md
└── README.md
```

---

## 3. Modelo de datos del corpus

### Archivo `es5.json`

```jsonc
{
  "id": "es5",
  "lang": "es",
  "wordLength": 5,
  "version": 1,          // Incrementar si cambia el array words (rompe seeds)
  "words": [              // Pool de soluciones. Curado. Orden fijo.
    "ÁRBOL",
    "PERRO",
    "MUNDO",
    "SALTO",
    "..."
  ],
  "valid": [              // Diccionario extendido para validar input.
    "ABAJO",              // Incluye words + más palabras aceptables.
    "ABEJA",
    "..."
  ]
}
```

**Reglas del corpus:**

| Regla | Detalle |
|-------|---------|
| Formato | Mayúsculas, con tildes y ñ |
| `words` | 500-2000 palabras comunes, sin groserías, sin arcaísmos |
| `valid` | 5000-10000 palabras válidas como intento |
| Orden | **NUNCA reordenar `words`** — rompe determinismo de seeds |
| Versión | Incrementar `version` al añadir/quitar de `words` |
| Añadir | Solo al final de `words`, nunca insertar en medio |
| `valid` ⊇ `words` | Toda solución es un intento válido |

### Validación de entrada

```ts
// Normalizar input → buscar en Set normalizado de valid
const validSet = new Set(corpus.valid.map(normalize));
const isValid = (guess: string) => validSet.has(normalize(guess));
```

---

## 4. Seed y PRNG

### Hash: FNV-1a 32-bit

Determinista, sin dependencias, buena distribución.

```ts
function fnv1a32(str: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0; // uint32
}
```

### PRNG: Mulberry32

Genera flotantes en [0, 1) de forma determinista.

```ts
function mulberry32(seed: number): () => number {
  let a = seed | 0;
  return () => {
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
```

### Construcción del seed string

| Modo | Formato | Ejemplo |
|------|---------|---------|
| Diario | `d:{corpusId}:{YYYY-MM-DD UTC}` | `d:es5:2026-10-20` |
| Código | `c:{corpusId}:{código normalizado}` | `c:es5:FIESTA-JUAN` |

**Normalización del código:** uppercase, trim, reemplazar espacios con `-`.

### Selección de palabra

```ts
const seedStr = buildSeedString(mode, corpusId, dateOrCode);
const numSeed = fnv1a32(seedStr);
const rng = mulberry32(numSeed);
const index = Math.floor(rng() * corpus.words.length);
const answer = corpus.words[index];
```

**Garantía:** mismo `seedStr` + mismo corpus `version` → mismo `index` → misma palabra. Siempre. En cualquier dispositivo.

---

## 5. Formato compacto del resultado compartido

### Share Token

```
v1-{corpusId}-{seed}-{attempts}{gridB64}
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `v1` | literal | Versión del formato |
| `corpusId` | string | ID del corpus (ej: `es5`) |
| `seed` | string | Seed original (fecha o código) |
| `attempts` | `1-6` o `X` | Intentos usados, `X` = derrota |
| `gridB64` | base64url | Grid codificado (sin padding `=`) |

### Codificación del grid

Cada tile tiene 3 estados:

| Valor | Estado | Emoji |
|-------|--------|-------|
| 0 | Ausente | ⬛ |
| 1 | Presente (mal posición) | 🟧 |
| 2 | Correcto | 🟩 |

Cada fila de 5 tiles → un byte:

```
rowByte = t[0]*81 + t[1]*27 + t[2]*9 + t[3]*3 + t[4]
// Rango: 0..242, cabe en 1 byte
```

Array de bytes (1 por fila jugada) → `base64url` sin padding.

### Decodificación

```ts
function decodeRow(byte: number): TileState[] {
  const states: TileState[] = [];
  let v = byte;
  for (let i = 4; i >= 0; i--) {
    states[i] = v % 3;
    v = Math.floor(v / 3);
  }
  return states;
}
```

### URL compartida

```
https://{host}/game-palabra/#/c/{shareToken}
```

Ejemplo:
```
https://user.github.io/game-palabra/#/c/v1-es5-2026-10-20-4ojbX
```

### Clipboard (para pegar en chat)

```
Palabra 🟩 4/6

⬛🟧⬛⬛⬛
⬛⬛🟩⬛🟧
🟩🟩🟩⬛🟩
🟩🟩🟩🟩🟩

🔗 https://.../#/c/v1-es5-2026-10-20-4ojbX
```

> Nota: usamos 🟧 (naranja) y 🟩 (verde) en vez de amarillo/verde para identidad propia.

---

## 6. Algoritmo de evaluación (letras repetidas)

### Dos pasadas obligatorias

```ts
type TileState = 'correct' | 'present' | 'absent';

function evaluate(guess: string, answer: string): TileState[] {
  const g = normalize(guess).split('');
  const a = normalize(answer).split('');
  const len = g.length;
  const result: TileState[] = new Array(len).fill('absent');

  // Contar ocurrencias de cada letra en la respuesta
  const counts: Record<string, number> = {};
  for (const ch of a) counts[ch] = (counts[ch] || 0) + 1;

  // Pasada 1: verdes (posición correcta)
  for (let i = 0; i < len; i++) {
    if (g[i] === a[i]) {
      result[i] = 'correct';
      counts[g[i]]--;
    }
  }

  // Pasada 2: naranjas (letra existe, posición incorrecta)
  for (let i = 0; i < len; i++) {
    if (result[i] === 'absent' && counts[g[i]] > 0) {
      result[i] = 'present';
      counts[g[i]]--;
    }
  }

  return result;
}
```

### Casos de prueba obligatorios

| Guess | Answer | Resultado | Razón |
|-------|--------|-----------|-------|
| PERRO | CARRO | ⬛⬛🟩🟩🟩 | P,E ausentes; R,R,O correctos |
| LETAL | TALAR | 🟧⬛🟧🟧🟩 | L presente (1), T presente, A presente, L correcta |
| ARANA | DRAMA | ⬛🟩🟩⬛🟩 | 1ª A: no queda (ya consumida por pos 4). R,A correctos. N ausente. Última A correcta |
| MAMMA | AMIGA | 🟧⬛🟧⬛🟩 | 1ª M: presente. 2ª A→ausente (una A ya consumida). 2ª M: presente? No, solo hay 1 M. A final correcta |
| SISAS | SALSA | 🟧⬛⬛⬛🟩 | S(0):presente, I:ausente, S(2):ausente(S consumidas), A(3):ausente, S(4):... wait |

> Los tests unitarios deben cubrir todos estos casos. Son el contrato del evaluador.

### Normalización para comparación

```ts
function normalize(str: string): string {
  return str
    .toUpperCase()
    .replace(/[ÁÀÂÄ]/g, 'A')
    .replace(/[ÉÈÊË]/g, 'E')
    .replace(/[ÍÌÎÏ]/g, 'I')
    .replace(/[ÓÒÔÖ]/g, 'O')
    .replace(/[ÚÙÛÜ]/g, 'U');
  // Ñ se preserva — es letra propia en español
}
```

**Flujo:**
- Corpus almacena `ÁRBOL` (con tilde).
- Jugador escribe `ARBOL` (sin tilde, el teclado virtual no tiene tildes).
- `normalize("ÁRBOL") === normalize("ARBOL") === "ARBOL"`.
- Comparación OK. Evaluador funciona.
- Al revelar respuesta: mostrar forma original con tilde.

---

## 7. Estados y pantallas UX

### Pantallas

```
┌─────────┐    ┌──────────┐    ┌──────────┐
│  HOME   │───▶│  JUEGO   │───▶│ RESULTADO│
│         │    │          │    │          │
│ • Diaria│    │ Board    │    │ Stats    │
│ • Código│    │ Keyboard │    │ Share    │
│ • Corpus│    │ Header   │    │ Comparar │
└─────────┘    └──────────┘    └──────────┘
                    │
               ┌────┴────┐
               │ MODALES  │
               │ • Ayuda  │
               │ • Stats  │
               │ • Config │
               └──────────┘
```

### Estados del juego

```
idle ──▶ playing ──▶ won
                 ──▶ lost
```

| Estado | Descripción | Transición |
|--------|-------------|------------|
| `idle` | Tablero vacío, esperando primer intento | → `playing` al escribir |
| `playing` | Intentos en progreso | → `won` si acertó, → `lost` si 6 intentos |
| `won` | Acertó. Mostrar animación + modal resultado | Terminal |
| `lost` | 6 intentos. Revelar palabra + modal resultado | Terminal |

### Flujo de compartir con comparación

```
A termina juego
  → genera shareToken
  → copia URL al clipboard

B abre URL con shareToken
  → App parsea token, extrae: corpus, seed, resultado de A
  → B juega la misma palabra (mismo seed)
  → B termina
  → Muestra CompareView:
    ┌──────────────────────────────┐
    │    TÚ: 3/6    │   RIVAL: 4/6 │
    │  🟩🟩🟩🟩🟩  │  ⬛🟧⬛⬛⬛  │
    │               │  ⬛⬛🟩⬛🟧  │
    │               │  🟩🟩🟩⬛🟩  │
    │               │  🟩🟩🟩🟩🟩  │
    └──────────────────────────────┘
```

### Componentes UX clave

| Componente | Responsabilidad |
|------------|-----------------|
| `Header` | Logo, botones ayuda/stats/config |
| `Board` | Grid 6×5, tiles con estados y animaciones |
| `Tile` | Una celda. Estados: empty, filled, correct, present, absent |
| `Keyboard` | Teclado virtual. Letras coloreadas según estado conocido |
| `Modal` | Contenedor genérico para modales |
| `StatsView` | Partidas jugadas, % victoria, racha, distribución |
| `ShareCard` | Botón compartir + preview emoji grid |
| `CompareView` | Lado a lado tu resultado vs rival |
| `ModeSelector` | Elegir diaria / código |
| `CorpusSelector` | Elegir corpus (extensible a futuro) |
| `HelpModal` | Cómo jugar, significado de colores |

### Animaciones

| Evento | Animación |
|--------|-----------|
| Escribir letra | Scale bounce en tile |
| Enviar intento | Flip secuencial (tile por tile, 300ms delay) |
| Intento inválido | Shake horizontal en fila |
| Victoria | Bounce secuencial en fila ganadora |
| Tecla presionada | Scale feedback en tecla virtual |

### Responsive

| Breakpoint | Layout |
|------------|--------|
| < 480px | Board y teclado ocupan 100% ancho, tiles ~58px |
| 480-768px | Board centrado max-width 350px |
| > 768px | Board centrado max-width 350px, más padding |

---

## 8. Riesgos y límites (sin backend)

| Riesgo | Impacto | Mitigación |
|--------|---------|------------|
| **Corpus visible en JS** | Jugador puede ver todas las palabras | Aceptable para juego casual. No hay premios. |
| **Trampas triviales** | Inspeccionar state en DevTools | Aceptable. No es competitivo. |
| **Cambio de corpus rompe seeds** | Palabras diarias cambian para fechas pasadas | Versionar corpus. Documentar que v1 es inmutable. |
| **localStorage borrado** | Pierde stats y progreso | Aceptable. Sin backend no hay alternativa. |
| **Stats no sincronizan entre dispositivos** | Cada dispositivo tiene sus stats | Aceptable. Feature explícitamente fuera de scope. |
| **Zona horaria para diaria** | Jugadores ven fecha distinta | Usar UTC siempre. Mostrar "Palabra del día (UTC)". |
| **URL muy larga** | Problemas en algunos clientes de chat | Share token ~40 chars. URL total ~80 chars. OK. |
| **Corpus pequeño** | Se agotan palabras diarias | 500 palabras = 1.4 años. Ampliar corpus sin romper orden. |
| **Sin validación server-side de intentos** | Jugador puede inventar palabras no válidas | Corpus `valid` incluye diccionario extendido local. |
| **Navegadores antiguos** | `Math.imul` no soportado en IE11 | Target: navegadores modernos. IE no soportado. |

---

## 9. Plan de implementación por fases

### Fase 1 — Cimientos (1 día)

- [ ] `npm create vite@latest` con React + TypeScript
- [ ] Estructura de carpetas
- [ ] `tsconfig.json`, `vite.config.ts` (base path para GH Pages)
- [ ] Types: `TileState`, `GameState`, `Corpus`, `ShareToken`
- [ ] `lib/prng.ts` — FNV-1a + Mulberry32
- [ ] `lib/normalize.ts`
- [ ] `lib/seed.ts` — construcción de seed string
- [ ] Tests: PRNG determinismo, normalize
- [ ] Corpus `es5.json` inicial (~100 words, ~500 valid)
- [ ] Script `validate-corpus.ts`

### Fase 2 — Juego core (2 días)

- [ ] `lib/evaluator.ts` + tests exhaustivos
- [ ] `hooks/useGame.ts` — reducer con estados idle/playing/won/lost
- [ ] `Board`, `Row`, `Tile` — render del tablero
- [ ] `Keyboard` — teclado virtual con feedback de colores
- [ ] Teclado físico — listener de keydown
- [ ] CSS global + theme variables
- [ ] Layout mobile-first
- [ ] Modo diario funcional (hard-coded corpus)

### Fase 3 — Modos y persistencia (1 día)

- [ ] `lib/storage.ts` — localStorage wrapper
- [ ] `hooks/useStats.ts` — estadísticas
- [ ] Modo código privado
- [ ] Corpus selector (preparado para múltiples corpus)
- [ ] `ModeSelector` UI
- [ ] `StatsView` con distribución
- [ ] Guardar/restaurar partida en curso

### Fase 4 — Compartir y comparar (1 día)

- [ ] `lib/share-codec.ts` — encode/decode share token + tests
- [ ] `hooks/useShare.ts` — parsear hash al montar
- [ ] `ShareCard` — botón copiar + preview emoji
- [ ] `CompareView` — lado a lado
- [ ] Routing por hash: `/`, `/c/{token}`
- [ ] Guardar resultado rival en state, mostrar tras jugar

### Fase 5 — Pulido (1 día)

- [ ] Animaciones CSS: flip, shake, bounce
- [ ] Tema oscuro/claro (toggle + `prefers-color-scheme`)
- [ ] `HelpModal`
- [ ] Accesibilidad: `aria-label` en tiles, `role` en teclado, focus management
- [ ] `manifest.json` + iconos
- [ ] Meta tags OG para preview en redes
- [ ] Favicon

### Fase 6 — Deploy (0.5 días)

- [ ] `.github/workflows/deploy.yml`
- [ ] `README.md`
- [ ] Probar deploy en GH Pages
- [ ] Verificar base path, rutas, assets
- [ ] Smoke test en móvil real

---

## 10. Criterios de aceptación y pruebas

### Tests unitarios (Vitest)

| Test | Qué verifica |
|------|-------------|
| `prng.test.ts` | Mulberry32 genera misma secuencia para mismo seed. 10 llamadas, snapshot de valores. |
| `prng.test.ts` | Seeds distintos → secuencias distintas. |
| `seed.test.ts` | Mismo modo+corpus+fecha → mismo seed string. |
| `seed.test.ts` | Seed string → word index es estable (snapshot). |
| `evaluator.test.ts` | Casos tabla sección 6 (todos). |
| `evaluator.test.ts` | Palabra sin letras repetidas. |
| `evaluator.test.ts` | Palabra con 3+ letras iguales. |
| `normalize.test.ts` | Tildes removidas, Ñ preservada. |
| `normalize.test.ts` | Minúsculas → mayúsculas. |
| `share-codec.test.ts` | encode → decode roundtrip. |
| `share-codec.test.ts` | Token inválido → error graceful. |
| `share-codec.test.ts` | Versión no soportada → error graceful. |

### Tests de integración (manual o Playwright futuro)

| Criterio | Cómo verificar |
|----------|---------------|
| Mismo seed = misma palabra | Abrir en 2 navegadores con mismo código. Misma palabra. |
| Mobile responsive | Chrome DevTools, 320px ancho mínimo. |
| Teclado físico funciona | Escribir con teclado en desktop. |
| Compartir funciona | Copiar URL, abrir en incógnito. Jugar. Ver comparación. |
| Stats persisten | Jugar, recargar, stats siguen ahí. |
| Tema oscuro/claro | Toggle funciona. Respeta preferencia OS. |
| Accesibilidad | Lighthouse accessibility ≥ 90. |
| Build sin errores | `npm run build` éxito, 0 warnings TS. |
| Deploy funcional | URL de GH Pages carga y funciona. |

### Criterios de rendimiento

| Métrica | Objetivo |
|---------|----------|
| Lighthouse Performance | ≥ 95 |
| Lighthouse Accessibility | ≥ 90 |
| Bundle size (gzip) | < 100KB (sin corpus) |
| Corpus load | < 50ms |
| First paint | < 1s en 4G |
