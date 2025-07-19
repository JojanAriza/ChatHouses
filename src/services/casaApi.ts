import axios from "axios";
import type { Casa, ArcGISFeature } from "../types";

const BASE_URL = "https://services7.arcgis.com/BHeMmpbh6URXbisP/arcgis/rest/services/Casas_final/FeatureServer/0/query";

export const getCasas = async (): Promise<Casa[]> => {
  const params = {
    where: "1=1",
    outFields: "*",
    f: "json",
    returnGeometry: true
  };

  const response = await axios(BASE_URL, { params });
  return response.data.features.map((feature: ArcGISFeature) => ({
    ...feature.attributes,
    geometry: feature.geometry
  }));
};