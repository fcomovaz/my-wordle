# AGENTS — Instrucciones para agentes

> Lee esto antes de tocar una línea de código.

---

## Estilo de comunicación

- **Caveman.** Frases cortas. Cero relleno. Ahorra tokens.
- No expliques lo que vas a hacer. Hazlo.
- No repitas el prompt del usuario.
- Si algo falla, di qué falló y qué hiciste. Nada más.

## Principios de código

1. **Cambios pequeños.** Un archivo, una responsabilidad, un commit.
2. **Ejecuta tests y build después de cada cambio.** `npm test` y `npm run build`. Si falla, arregla antes de seguir.
3. **No añadas dependencias sin necesidad.** React, Vitest y nada más. Si crees que necesitas algo, justifica en una línea. Espera aprobación.
4. **TypeScript strict.** Cero `any`. Cero `@ts-ignore`. Cero `as unknown as X`.
5. **No overengineering.** Si dudas entre simple y sofisticado, elige simple.
6. **Mobile first.** CSS empieza en el viewport más pequeño.
7. **Preserva comentarios existentes.** No borres documentación que no sea tuya.
8. **Corpus es sagrado.** Nunca reordenes `words[]`. Solo añade al final. Incrementa `version` si tocas `words`.

## Flujo de trabajo

```
1. Lee SPEC.md para entender el diseño.
2. Lee TASKS.md para saber qué sigue.
3. Implementa UNA tarea.
4. Corre npm test && npm run build.
5. Si pasa: marca [x] en TASKS.md, commitea.
6. Si falla: arregla. No avances.
7. Repite.
```

## Convenciones

| Aspecto | Convención |
|---------|------------|
| Nombres de archivo | kebab-case (`share-codec.ts`) |
| Nombres de componente | PascalCase (`ShareCard.tsx`) |
| Nombres de hook | camelCase con `use` (`useGame.ts`) |
| Exports | Named exports. No default exports. |
| Tests | Mismo nombre + `.test.ts` en `tests/` |
| CSS | Un archivo por componente o por dominio. Variables en `theme.css`. |
| Commits | `fase N: descripción corta en español` |

## Qué NO hacer

- No instalar Tailwind, styled-components, Zustand, Redux, react-router, ni ningún framework CSS.
- No crear API endpoints, serverless functions, ni bases de datos.
- No usar `Math.random()` para nada relacionado con el juego. Solo `mulberry32`.
- No cambiar el orden del array `words` en el corpus.
- No escribir respuestas largas. Caveman.
- No preguntar al usuario salvo bloqueo real (ambigüedad técnica que impide avanzar).

## Arquitectura rápida

```
src/lib/     → Lógica pura. Sin React. Sin DOM. Testeable.
src/hooks/   → Hooks React. Conectan lib con componentes.
src/components/ → UI. Solo render y eventos.
src/data/    → Corpus JSON. Inmutable en orden.
src/types/   → Tipos compartidos.
src/styles/  → CSS puro. Variables. Mobile-first.
tests/       → Tests unitarios con Vitest.
```

## Referencias

- [SPEC.md](./SPEC.md) — Arquitectura, algoritmos, formatos.
- [TASKS.md](./TASKS.md) — Checklist por fases.
