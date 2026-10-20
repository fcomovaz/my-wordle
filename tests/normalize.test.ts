import { describe, it, expect } from 'vitest';
import { normalize } from '../src/lib/normalize';

describe('normalize', () => {
  it('convierte minúsculas a mayúsculas', () => {
    expect(normalize('perro')).toBe('PERRO');
  });

  it('remueve tildes y diéresis de vocales', () => {
    expect(normalize('árbol')).toBe('ARBOL');
    expect(normalize('PINGÜINO')).toBe('PINGUINO');
    expect(normalize('café')).toBe('CAFE');
    expect(normalize('líder')).toBe('LIDER');
    expect(normalize('camión')).toBe('CAMION');
  });

  it('preserva la letra Ñ y ñ', () => {
    expect(normalize('niño')).toBe('NIÑO');
    expect(normalize('ÑANDÚ')).toBe('ÑANDU');
  });

  it('maneja strings vacíos y caracteres ya normalizados', () => {
    expect(normalize('')).toBe('');
    expect(normalize('SALTO')).toBe('SALTO');
  });
});
