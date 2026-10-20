# TASKS — Palabra

> Checklist de implementación. Marcar `[x]` al completar.
> Cada tarea es un commit atómico. No mezclar fases.

---

## Fase 1 — Cimientos

- [x] Scaffold: `npm create vite@latest . -- --template react-ts`
- [x] Limpiar boilerplate (App.css, logo, etc.)
- [x] Configurar `vite.config.ts`: `base: '/game-palabra/'`
- [x] Crear estructura de carpetas (`components/`, `hooks/`, `lib/`, `data/`, `types/`, `styles/`, `tests/`)
- [x] `types/index.ts`: definir `TileState`, `GameState`, `GameMode`, `Corpus`, `ShareToken`, `Stats`
- [x] `lib/prng.ts`: implementar `fnv1a32()` y `mulberry32()`
- [x] `tests/prng.test.ts`: determinismo, distribución, seeds distintos
- [x] `lib/normalize.ts`: implementar `normalize()`
- [x] `tests/normalize.test.ts`: tildes, ñ, mayúsculas, edge cases
- [x] `lib/seed.ts`: implementar `buildSeedString()` y `selectWord()`
- [x] `tests/seed.test.ts`: estabilidad de selección, snapshot de índices
- [x] `data/es5.json`: corpus inicial (~200 words, ~1000 valid)
- [x] `scripts/validate-corpus.ts`: verificar estructura, duplicados, longitud, valid ⊇ words
- [x] Instalar Vitest: `npm i -D vitest`
- [x] `package.json` scripts: `test`, `test:watch`
- [x] Verificar: `npm test` pasa, `npm run build` compila

## Fase 2 — Juego core

- [x] `lib/evaluator.ts`: implementar `evaluate()`
- [x] `tests/evaluator.test.ts`: todos los casos de SPEC §6
- [x] `lib/constants.ts`: MAX_ATTEMPTS=6, WORD_LENGTH=5, emojis, colores
- [x] `styles/theme.css`: variables CSS (colores, tamaños, breakpoints)
- [x] `styles/global.css`: reset, body, fuentes
- [x] `types/index.ts`: añadir `GameAction` para reducer
- [x] `hooks/useGame.ts`: reducer con acciones ADD_LETTER, DELETE, SUBMIT, RESET
- [x] `components/Tile.tsx`: render tile con estado, clase CSS dinámica
- [x] `components/Row.tsx`: render fila de tiles
- [x] `components/Board.tsx`: render 6 filas
- [x] `styles/board.css`: grid layout, tamaños responsive, animación flip/shake/bounce
- [x] `components/Keyboard.tsx`: teclado virtual QWERTY español (con Ñ)
- [x] `styles/keyboard.css`: layout grid, colores por estado, responsive
- [x] `components/Header.tsx`: título + botones (ayuda, stats)
- [x] `components/App.tsx`: ensamblar Header + Board + Keyboard + estado global
- [x] `src/main.tsx`: mount React
- [x] Listener teclado físico en `useGame` o `App`
- [x] Verificar: juego funcional modo diario, flip anima, shake en palabra inválida

## Fase 3 — Modos y persistencia

- [x] `lib/storage.ts`: `saveGame()`, `loadGame()`, `saveStats()`, `loadStats()`, `clearGame()`
- [x] `hooks/useStats.ts`: track partidas, victorias, racha, distribución por intentos
- [x] `components/StatsView.tsx`: modal con stats + barra de distribución
- [x] `components/ModeSelector.tsx`: UI para elegir diaria / código privado
- [x] `components/CorpusSelector.tsx`: selector de corpus (solo es5 por ahora, extensible)
- [x] Input de código privado con normalización
- [x] Guardar partida en curso en localStorage (restaurar al recargar)
- [x] Guardar stats por corpus
- [x] Detectar si la partida diaria ya fue jugada hoy (UTC)
- [x] Verificar: recargar página mantiene progreso, stats se acumulan

## Fase 4 — Compartir y comparar

- [x] `lib/share-codec.ts`: `encodeShareToken()`, `decodeShareToken()`, `gridToEmoji()`
- [x] `tests/share-codec.test.ts`: roundtrip, versión inválida, datos corruptos
- [x] `hooks/useShare.ts`: parsear `location.hash` al montar, extraer token
- [x] `components/ShareCard.tsx`: preview emoji + botón copiar clipboard + botón copiar URL
- [x] `components/CompareView.tsx`: grids lado a lado, conteo de intentos, highlight ganador
- [x] Routing hash: `''` → home/juego, `c/{token}` → modo comparación
- [x] Al abrir link compartido: extraer seed, iniciar juego con ese seed
- [x] Al terminar juego con rival: mostrar CompareView
- [x] Feedback visual al copiar ("¡Copiado!")
- [x] Verificar: copiar URL, abrir en incógnito, jugar, ver comparación correcta

## Fase 5 — Pulido

- [x] Animación flip: CSS transform rotateX con delay secuencial
- [x] Animación shake: CSS keyframes en fila
- [x] Animación bounce: CSS keyframes en victoria
- [x] Animación scale: feedback al presionar tecla
- [x] Tema oscuro: `prefers-color-scheme: dark` + toggle manual
- [x] Persistir preferencia de tema en localStorage
- [x] `components/HelpModal.tsx`: instrucciones, significado de colores, ejemplos
- [x] Accesibilidad: `aria-label` en cada tile ("Letra A, correcta"), `role="button"` en teclas
- [x] Accesibilidad: focus visible, skip to content, anuncio de resultados
- [x] `public/manifest.json`: nombre, iconos, theme_color, background_color
- [x] Iconos 192x192 y 512x512
- [x] `index.html`: meta tags (description, og:title, og:description, theme-color)
- [x] Favicon
- [x] Verificar: Lighthouse Accessibility ≥ 90, Performance ≥ 95

## Fase 6 — Deploy

- [x] `.github/workflows/deploy.yml`: on push main → build → deploy pages
- [x] Configurar repo: Settings → Pages → GitHub Actions
- [x] `README.md`: descripción, cómo jugar, cómo desarrollar, cómo contribuir corpus
- [x] Push a main, verificar deploy
- [x] Smoke test en GH Pages: diaria, código, compartir, comparar
- [x] Smoke test en móvil real (o DevTools responsive)
- [x] Verificar: URL pública funciona, assets cargan, hash routing OK

---

## Reglas de trabajo

1. **Un commit por tarea.** Mensaje: `fase X: descripción corta`.
2. **Tests antes que UI.** Primero `lib/`, luego `components/`.
3. **Build debe pasar siempre.** No commitear código que rompa `npm run build`.
4. **No añadir dependencias** salvo Vitest (ya aprobado). Pedir autorización para cualquier otra.
5. **Mobile first.** CSS empieza en 320px, escala hacia arriba.
6. **0 any.** TypeScript strict. No `as any`, no `@ts-ignore`.
