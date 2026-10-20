# TASKS — Palabra

> Checklist de implementación. Marcar `[x]` al completar.
> Cada tarea es un commit atómico. No mezclar fases.

---

## Fase 1 — Cimientos

- [ ] Scaffold: `npm create vite@latest . -- --template react-ts`
- [ ] Limpiar boilerplate (App.css, logo, etc.)
- [ ] Configurar `vite.config.ts`: `base: '/game-palabra/'`
- [ ] Crear estructura de carpetas (`components/`, `hooks/`, `lib/`, `data/`, `types/`, `styles/`, `tests/`)
- [ ] `types/index.ts`: definir `TileState`, `GameState`, `GameMode`, `Corpus`, `ShareToken`, `Stats`
- [ ] `lib/prng.ts`: implementar `fnv1a32()` y `mulberry32()`
- [ ] `tests/prng.test.ts`: determinismo, distribución, seeds distintos
- [ ] `lib/normalize.ts`: implementar `normalize()`
- [ ] `tests/normalize.test.ts`: tildes, ñ, mayúsculas, edge cases
- [ ] `lib/seed.ts`: implementar `buildSeedString()` y `selectWord()`
- [ ] `tests/seed.test.ts`: estabilidad de selección, snapshot de índices
- [ ] `data/es5.json`: corpus inicial (~200 words, ~1000 valid)
- [ ] `scripts/validate-corpus.ts`: verificar estructura, duplicados, longitud, valid ⊇ words
- [ ] Instalar Vitest: `npm i -D vitest`
- [ ] `package.json` scripts: `test`, `test:watch`
- [ ] Verificar: `npm test` pasa, `npm run build` compila

## Fase 2 — Juego core

- [ ] `lib/evaluator.ts`: implementar `evaluate()`
- [ ] `tests/evaluator.test.ts`: todos los casos de SPEC §6
- [ ] `lib/constants.ts`: MAX_ATTEMPTS=6, WORD_LENGTH=5, emojis, colores
- [ ] `styles/theme.css`: variables CSS (colores, tamaños, breakpoints)
- [ ] `styles/global.css`: reset, body, fuentes
- [ ] `types/index.ts`: añadir `GameAction` para reducer
- [ ] `hooks/useGame.ts`: reducer con acciones ADD_LETTER, DELETE, SUBMIT, RESET
- [ ] `components/Tile.tsx`: render tile con estado, clase CSS dinámica
- [ ] `components/Row.tsx`: render fila de tiles
- [ ] `components/Board.tsx`: render 6 filas
- [ ] `styles/board.css`: grid layout, tamaños responsive, animación flip/shake/bounce
- [ ] `components/Keyboard.tsx`: teclado virtual QWERTY español (con Ñ)
- [ ] `styles/keyboard.css`: layout grid, colores por estado, responsive
- [ ] `components/Header.tsx`: título + botones (ayuda, stats)
- [ ] `components/App.tsx`: ensamblar Header + Board + Keyboard + estado global
- [ ] `src/main.tsx`: mount React
- [ ] Listener teclado físico en `useGame` o `App`
- [ ] Verificar: juego funcional modo diario, flip anima, shake en palabra inválida

## Fase 3 — Modos y persistencia

- [ ] `lib/storage.ts`: `saveGame()`, `loadGame()`, `saveStats()`, `loadStats()`, `clearGame()`
- [ ] `hooks/useStats.ts`: track partidas, victorias, racha, distribución por intentos
- [ ] `components/StatsView.tsx`: modal con stats + barra de distribución
- [ ] `components/ModeSelector.tsx`: UI para elegir diaria / código privado
- [ ] `components/CorpusSelector.tsx`: selector de corpus (solo es5 por ahora, extensible)
- [ ] Input de código privado con normalización
- [ ] Guardar partida en curso en localStorage (restaurar al recargar)
- [ ] Guardar stats por corpus
- [ ] Detectar si la partida diaria ya fue jugada hoy (UTC)
- [ ] Verificar: recargar página mantiene progreso, stats se acumulan

## Fase 4 — Compartir y comparar

- [ ] `lib/share-codec.ts`: `encodeShareToken()`, `decodeShareToken()`, `gridToEmoji()`
- [ ] `tests/share-codec.test.ts`: roundtrip, versión inválida, datos corruptos
- [ ] `hooks/useShare.ts`: parsear `location.hash` al montar, extraer token
- [ ] `components/ShareCard.tsx`: preview emoji + botón copiar clipboard + botón copiar URL
- [ ] `components/CompareView.tsx`: grids lado a lado, conteo de intentos, highlight ganador
- [ ] Routing hash: `''` → home/juego, `c/{token}` → modo comparación
- [ ] Al abrir link compartido: extraer seed, iniciar juego con ese seed
- [ ] Al terminar juego con rival: mostrar CompareView
- [ ] Feedback visual al copiar ("¡Copiado!")
- [ ] Verificar: copiar URL, abrir en incógnito, jugar, ver comparación correcta

## Fase 5 — Pulido

- [ ] Animación flip: CSS transform rotateX con delay secuencial
- [ ] Animación shake: CSS keyframes en fila
- [ ] Animación bounce: CSS keyframes en victoria
- [ ] Animación scale: feedback al presionar tecla
- [ ] Tema oscuro: `prefers-color-scheme: dark` + toggle manual
- [ ] Persistir preferencia de tema en localStorage
- [ ] `components/HelpModal.tsx`: instrucciones, significado de colores, ejemplos
- [ ] Accesibilidad: `aria-label` en cada tile ("Letra A, correcta"), `role="button"` en teclas
- [ ] Accesibilidad: focus visible, skip to content, anuncio de resultados
- [ ] `public/manifest.json`: nombre, iconos, theme_color, background_color
- [ ] Iconos 192x192 y 512x512
- [ ] `index.html`: meta tags (description, og:title, og:description, theme-color)
- [ ] Favicon
- [ ] Verificar: Lighthouse Accessibility ≥ 90, Performance ≥ 95

## Fase 6 — Deploy

- [ ] `.github/workflows/deploy.yml`: on push main → build → deploy pages
- [ ] Configurar repo: Settings → Pages → GitHub Actions
- [ ] `README.md`: descripción, cómo jugar, cómo desarrollar, cómo contribuir corpus
- [ ] Push a main, verificar deploy
- [ ] Smoke test en GH Pages: diaria, código, compartir, comparar
- [ ] Smoke test en móvil real (o DevTools responsive)
- [ ] Verificar: URL pública funciona, assets cargan, hash routing OK

---

## Reglas de trabajo

1. **Un commit por tarea.** Mensaje: `fase X: descripción corta`.
2. **Tests antes que UI.** Primero `lib/`, luego `components/`.
3. **Build debe pasar siempre.** No commitear código que rompa `npm run build`.
4. **No añadir dependencias** salvo Vitest (ya aprobado). Pedir autorización para cualquier otra.
5. **Mobile first.** CSS empieza en 320px, escala hacia arriba.
6. **0 any.** TypeScript strict. No `as any`, no `@ts-ignore`.
