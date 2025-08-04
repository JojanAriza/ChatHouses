import { formatCasasResults } from "./arcGisApi";
import { searchCasas } from "./casaSearch";
import { SearchCriteriaManager } from "./SearchCriteriaManager";

export class HouseSearchService {
  private criteriaManager: SearchCriteriaManager;

  constructor() {
    this.criteriaManager = new SearchCriteriaManager();
  }

  async handleHouseSearch(text: string): Promise<string | null> {
    try {
      // PRIMERO: Verificar si el usuario quiere limpiar criterios anteriores
      if (this.criteriaManager.shouldClearPreviousCriteria(text)) {
        this.criteriaManager.clearSearchHistory();
      }

      // SEGUNDO: Extraer criterios de búsqueda (ahora ya limpio si era necesario)
      const criteria = this.criteriaManager.extractCriteriaFromFollowUp(text);

      // TERCERO: Guardar los criterios actuales para próximas consultas
      this.criteriaManager.updateLastCriteria(criteria);

      // Solo buscar si hay al menos un criterio
      if (Object.keys(criteria).length > 0) {
        const matches = await searchCasas(criteria);
        let responseText = "";

        // Agregar información sobre qué criterios se están usando
        const currentCriteria = this.criteriaManager.formatCurrentCriteria(criteria);
        if (currentCriteria) {
          responseText = `🔍 **Búsqueda actual:**\n${currentCriteria}\n\n`;
        }

        responseText += formatCasasResults(matches);

        // Si no hay resultados, hacer una búsqueda más amplia
        if (matches.length === 0) {
          // Aquí podrías implementar lógica para búsqueda más flexible
          // Por ejemplo, relajar algunos criterios y buscar de nuevo
          responseText += "\n\n💡 *Tip: Si no encuentras resultados, puedes probar con criterios más amplios o decir 'nueva búsqueda' para empezar desde cero.*";
        }

        return responseText;
      }

      return null;
    } catch (error) {
      console.error("Error al buscar casas:", error);
      return "Hubo un problema al buscar casas en la base de datos. ¿Podrías intentar reformular tu consulta con más detalles específicos?";
    }
  }

  async shouldSearchCasas(text: string): Promise<boolean> {
    return await this.criteriaManager.shouldSearchCasas(text);
  }

  clearSearchHistory() {
    this.criteriaManager.clearSearchHistory();
  }
}