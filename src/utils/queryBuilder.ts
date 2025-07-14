
type CampoFiltro = 'Banos' | 'Piezas' | 'Garage' | 'Internet' | 'Amoblada' | 'Balcon';

export function extraerFiltros(texto: string): Record<string, number> {
  const filtros: Record<string, number> = {};

const patrones: Record<CampoFiltro, RegExp> = {
  Banos: /(\d+)\s*(?:baños|banos|baño|bano)/i,
  Piezas: /(\d+)\s*(?:habitaciones|cuartos|piezas)/i,
  Garage: /(\d+)\s*(?:garajes|garage)/i,
  Internet: /(?:internet|wifi)/i,
  Amoblada: /(?:amoblada|amoblado|muebles)/i,
  Balcon: /(?:balcón|balcon)/i
};


for (const campo in patrones) {
  const filtroCampo = campo as CampoFiltro; // 👈 obligamos a TypeScript a saber que es una clave válida
  const match = texto.match(patrones[filtroCampo]);
  if (match) {
    filtros[filtroCampo] = match[1] ? parseInt(match[1]) : 1;
  }
}

  return filtros;
}
