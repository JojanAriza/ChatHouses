import { getCasasConFiltros } from "../services/arcGisApi";

type CasaFeature = {
  attributes: {
    Piezas: number;
    Banos: number;
    Garage: string;
    Amoblada: string;
    Internet: string;
    Balcon: string;
    Hospital_Car: string;
    Hospital_foot: string;
    Escuelas_Car: string;
    Escuelas_foot: string;
  };
};

export async function getCasasMatch(filtros: Record<string, number>): Promise<string> {
  const casas = await getCasasConFiltros(filtros);

  if (!casas || casas.length === 0) {
    return "No encontré casas que cumplan exactamente con tus criterios. ¿Te gustaría ver opciones similares?";
  }

  return (casas as CasaFeature[]).map((casa: CasaFeature, index: number) => {
    const attrs = casa.attributes;
    return `${index + 1}. Casa:
  - Piezas: ${attrs.Piezas}
  - Baños: ${attrs.Banos}
  - Garage: ${attrs.Garage}
  - Amoblada: ${attrs.Amoblada}
  - Internet: ${attrs.Internet}
  - Balcón: ${attrs.Balcon}
  - Cercanía a hospitales (carro): ${attrs.Hospital_Car}
  - Cercanía a hospitales (a pie): ${attrs.Hospital_foot}
  - Cercanía a escuelas (carro): ${attrs.Escuelas_Car}
  - Cercanía a escuelas (a pie): ${attrs.Escuelas_foot}`;
  }).join("\n\n");
}

