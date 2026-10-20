import fs from 'node:fs';
import path from 'node:path';

function normalize(str: string): string {
  return str
    .toUpperCase()
    .replace(/[ÁÀÂÄ]/g, 'A')
    .replace(/[ÉÈÊË]/g, 'E')
    .replace(/[ÍÌÎÏ]/g, 'I')
    .replace(/[ÓÒÔÖ]/g, 'O')
    .replace(/[ÚÙÛÜ]/g, 'U');
}

const corpusPath = path.resolve(process.cwd(), 'src/data/es5.json');
const raw = fs.readFileSync(corpusPath, 'utf-8');
const data = JSON.parse(raw);

const errors: string[] = [];

if (!data.id || typeof data.id !== 'string') {
  errors.push('Falta id válido');
}
if (data.wordLength !== 5) {
  errors.push(`wordLength debe ser 5, recibido: ${data.wordLength}`);
}
if (!Array.isArray(data.words) || data.words.length === 0) {
  errors.push('Array words debe ser no vacío');
}
if (!Array.isArray(data.valid) || data.valid.length === 0) {
  errors.push('Array valid debe ser no vacío');
}

const wordSet = new Set<string>();
for (let i = 0; i < data.words.length; i++) {
  const w = data.words[i];
  const n = normalize(w);
  if (n.length !== data.wordLength) {
    errors.push(`Palabra words[${i}] "${w}" no tiene ${data.wordLength} letras`);
  }
  if (wordSet.has(w)) {
    errors.push(`Palabra duplicada en words: "${w}"`);
  }
  wordSet.add(w);
}

const validSet = new Set<string>();
for (let i = 0; i < data.valid.length; i++) {
  const v = data.valid[i];
  const n = normalize(v);
  if (n.length !== data.wordLength) {
    errors.push(`Palabra valid[${i}] "${v}" no tiene ${data.wordLength} letras`);
  }
  validSet.add(normalize(v));
}

for (const w of data.words) {
  if (!validSet.has(normalize(w))) {
    errors.push(`Palabra de words "${w}" no existe en valid`);
  }
}

if (errors.length > 0) {
  console.error('Error validando corpus:');
  for (const err of errors) console.error(`- ${err}`);
  process.exit(1);
}

console.log(`Corpus ${data.id} (v${data.version}) válido: ${data.words.length} palabras objetivo, ${data.valid.length} válidas.`);
