# Palabra 🟩

Juego de adivinanza de palabras en español de 5 letras, inspirado en Wordle con diseño propio, estética sobria y ejecución determinista client-side sin backend ni dependencias innecesarias.

## Características

- **Sin backend ni secretos**: Todo se computa en el cliente de manera segura y reproducible.
- **PRNG determinista**: Algoritmo FNV-1a de 32 bits + Mulberry32. Todos los jugadores ven la misma palabra en el mismo día o con el mismo código.
- **Normalización inteligente**: Soporte de tildes (Á, É, Í, Ó, Ú, Ü), mayúsculas/minúsculas y preservación estricta de la letra **Ñ**.
- **Evaluación precisa**: Manejo de letras repetidas en dos pasadas (verdes primero, luego naranjas según frecuencias restantes).
- **Modos de juego**:
  - **Diaria (UTC)**: Una palabra nueva cada día calculada a las 00:00 UTC.
  - **Código privado**: Crea partidas personalizadas con cualquier código (ej. `FIESTA-JUAN`, `RETOS`).
  - **Desafío vs. Rival**: Juega a través de URLs compartidas y compara tus intentos y cuadrícula lado a lado con tu rival sin spoilers de la solución.
- **Tema claro / oscuro**: Adaptación automática al sistema (`prefers-color-scheme`) y botón de conmutación manual persistido.
- **Accesibilidad**: Etiquetas `aria-label` descriptivas en cada ficha y botón, soporte de navegación con teclado y modo `prefers-reduced-motion`.
- **Almacenamiento versionado**: `localStorage` resiliente ante datos corruptos o versiones incompatibles.

## Ejecución local

1. Instalar dependencias:
```bash
npm install
```

2. Iniciar servidor de desarrollo:
```bash
npm run dev
```

3. Ejecutar pruebas unitarias:
```bash
npm test
```

4. Validar integridad del corpus:
```bash
npm run validate:corpus
```

5. Compilar para producción:
```bash
npm run build
```

## Reglas del Corpus

El corpus de palabras se ubica en `src/data/es5.json`:
- **`words`**: Lista ordenada de soluciones. **NUNCA reordenar ni insertar en medio** para no alterar la asignación de semillas en fechas pasadas. Solo agregar al final e incrementar `version`.
- **`valid`**: Diccionario extendido de intentos admisibles (`valid ⊇ words`).

## Formato del Share Token

Los resultados se compactan en una cadena en base64url sin exponer la palabra secreta:
```
v1-{corpusId}-{seed}-{intentos}{gridB64}
```
Ejemplo: `v1-es5-2026-10-20-4...`

## Despliegue en GitHub Pages

El proyecto incluye un flujo automatizado de CI/CD en `.github/workflows/deploy.yml`. Al pushear a `main`, se ejecutan las validaciones, pruebas y la compilación, publicando los archivos estáticos en GitHub Pages bajo `/game-palabra/`.
