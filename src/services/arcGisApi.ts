// src/services/arcgisService.ts
import axios from "axios";

const baseUrl = "https://services7.arcgis.com/BHeMmpbh6URXbisP/arcgis/rest/services/Casas_prueba_johan/FeatureServer/0/query";

export const getCasasConFiltros = async (filtros: Record<string, number>) => {
  const condiciones = Object.entries(filtros)
    .map(([campo, valor]) => `${campo}=${valor}`)
    .join(" AND ");

  const params = {
    where: condiciones || "1=1",
    outFields: "*",
    f: "json",
    returnGeometry: true
  };

  const { data } = await axios.get(baseUrl, { params });
  return data?.features?.slice(0, 10); // Máximo 10 resultados
};
