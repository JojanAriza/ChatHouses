import type { SearchCriteria } from "../types";

export const generateRefinementText = (
  previousCriteria: SearchCriteria,
  newCriteria: SearchCriteria
): string => {
  const changes: string[] = [];

  // Comparar y encontrar los cambios REALES
  (Object.keys(newCriteria) as (keyof SearchCriteria)[]).forEach((key) => {
    const oldValue = previousCriteria[key];
    const newValue = newCriteria[key];

    // Solo agregar como cambio si realmente cambió el valor o es nuevo
    if (newValue !== undefined && newValue !== null) {
      // Si no existía antes o cambió
      if (oldValue === undefined || oldValue !== newValue) {

        switch (key) {
          case "internet":
            changes.push(newValue ? "con internet" : "sin internet");
            break;
          case "garage":
            changes.push(newValue ? "con garage" : "sin garage");
            break;
          case "amoblada":
            changes.push(newValue ? "amoblada" : "sin amoblar");
            break;
          case "balcon":
            changes.push(newValue ? "con balcón" : "sin balcón");
            break;
          case "asensor":
            changes.push(newValue ? "con ascensor" : "sin ascensor");
            break;
          case "television":
            changes.push(newValue ? "con televisión" : "sin televisión");
            break;
          case "nearHospital":
            if (newValue) changes.push("cerca de hospital");
            break;
          case "nearSchool":
            if (newValue) changes.push("cerca de escuela");
            break;
          case "nearPark":
            if (newValue) changes.push("cerca de parque");
            break;
          case "nearUniversity":
            if (newValue) changes.push("cerca de universidad");
            break;
          case "piezas":
            if (oldValue && oldValue !== newValue) {
              changes.push(
                `${newValue} habitaciones (cambio desde ${oldValue})`
              );
            } else {
              changes.push(`${newValue} habitaciones`);
            }
            break;
          case "banos":
            if (oldValue && oldValue !== newValue) {
              changes.push(`${newValue} baños (cambio desde ${oldValue})`);
            } else {
              changes.push(`${newValue} baños`);
            }
            break;
          case "precioMin":
            changes.push(`precio mínimo: $${newValue.toLocaleString()}`);
            break;
          case "precioMax":
            changes.push(`precio máximo: $${newValue.toLocaleString()}`);
            break;
        }
      }
    }
  });

  if (changes.length > 0) {
    return `¡Perfecto! He refinado tu búsqueda agregando: ${changes.join(
      ", "
    )}.`;
  }

  return "He refinado tu búsqueda con los nuevos criterios especificados.";
};