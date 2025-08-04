import arcpy
import os
import sys
from datetime import datetime

# Agregar logging para debugging
import logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def main():
    try:
        logger.info("Iniciando script de ArcPy...")
        
        # ─── Parámetros de usuario ─────────────────────────────────────────────────────

        # Servicio REST de Casas
        houses_fc = r"https://services7.arcgis.com/BHeMmpbh6URXbisP/arcgis/rest/services/Casas_final/FeatureServer/0"
         
        # ─── Servicios REST de las demás capas ─────────────────────────────────────────

        hospitals_fc     = r"https://services7.arcgis.com/BHeMmpbh6URXbisP/arcgis/rest/services/Hospital_final/FeatureServer/0"

        parques_fc       = r"https://services7.arcgis.com/BHeMmpbh6URXbisP/arcgis/rest/services/Parques_Final/FeatureServer/0"

        escuelas_fc      = r"https://services7.arcgis.com/BHeMmpbh6URXbisP/arcgis/rest/services/Escuelas_Final/FeatureServer/0"

        universidades_fc = r"https://services7.arcgis.com/BHeMmpbh6URXbisP/arcgis/rest/services/Universidades_final/FeatureServer/0"
         
        # ─── Network Dataset local (para análisis de red) ───────────────────────────────

        gdb_path        = r"C:\Users\USER\Documents\ArcGIS\Packages\networkdata_edcefe\commondata\codigo_network.gdb"

        feature_dataset = "TransporteTerrestre1"

        network_dataset = os.path.join(gdb_path, feature_dataset, "Networkdata")
         
        # Campos de salida en el servicio de Casas

        fields_to_update = {

            hospitals_fc:     ("Hospital_Car",      "Hospital_foot"),

            escuelas_fc:      ("Escuelas_Car",      "Escuelas_foot"),

            parques_fc:       ("Parques_Car",       "Parques_foot"),

            universidades_fc: ("Universidades_Car", "Universidades_foot")

        }
         
        # Impedance attributes en tu ND

        impedances = ["CarCost", "FootCost"]

        # ────────────────────────────────────────────────────────────────────────────────
         
        logger.info("Verificando extensión Network Analyst...")
        # Preparar entorno
        if arcpy.CheckExtension("Network") == "Available":
            arcpy.CheckOutExtension("Network")
            logger.info("Extensión Network Analyst activada")
        else:
            raise RuntimeError("La extensión Network Analyst no está disponible")

        arcpy.env.overwriteOutput = True
         
        logger.info("Obteniendo información de la última casa...")
        # 1) Obtener OID y leer la última casa desde el servicio

        oid_field = arcpy.Describe(houses_fc).OIDFieldName

        all_fields = [oid_field] + [f for pair in fields_to_update.values() for f in pair]

        with arcpy.da.SearchCursor(

            houses_fc, all_fields,

            sql_clause=(None, f"ORDER BY {oid_field} DESC")

        ) as scur:

            rec = next(scur, None)

        if not rec:
            raise RuntimeError("No hay registros en el servicio de Casas")
         
        oid = rec[0]
        current_vals = dict(zip(all_fields[1:], rec[1:]))
        
        logger.info(f"Procesando casa con OID: {oid}")
         
        # 2) Crear capa puntual para la última casa

        last_house_lyr = "last_house"

        if arcpy.Exists(last_house_lyr):
            arcpy.management.Delete(last_house_lyr)

        arcpy.management.MakeFeatureLayer(
            houses_fc, last_house_lyr, f"{oid_field} = {oid}"
        )
        
        logger.info("Capa de la última casa creada")
         
        # Función para legacy ClosestFacility

        def solve_legacy_cf(imp_attr, facility_fc):
            logger.info(f"Calculando distancia con impedancia: {imp_attr}")
            
            layer_name = f"CF_{imp_attr}"

            if arcpy.Exists(layer_name):
                arcpy.management.Delete(layer_name)

            cf_result = arcpy.na.MakeClosestFacilityLayer(
                network_dataset, layer_name, imp_attr,
                "TRAVEL_TO", None, 1, imp_attr
            )

            analysis_layer = cf_result.getOutput(0)

            # Ver subcapas y usar los nombres correctos
            sublayers = arcpy.na.GetNAClassNames(analysis_layer)
            facilities_name = sublayers["Facilities"]
            incidents_name = sublayers["Incidents"]
            routes_name = next(name for key, name in sublayers.items() if "route" in key.lower())

            # Añadir Facilities desde el REST
            fac_maps = arcpy.na.NAClassFieldMappings(analysis_layer, facilities_name)

            arcpy.na.AddLocations(
                analysis_layer, facilities_name, facility_fc,
                field_mappings=fac_maps, search_tolerance="500 Meters",
                append="CLEAR", snap_to_position_along_network="SNAP"
            )

            # Añadir Incident
            inc_maps = arcpy.na.NAClassFieldMappings(analysis_layer, incidents_name)

            arcpy.na.AddLocations(
                analysis_layer, incidents_name, last_house_lyr,
                field_mappings=inc_maps, search_tolerance="500 Meters",
                append="CLEAR", snap_to_position_along_network="SNAP"
            )

            # Resolver
            arcpy.na.Solve(analysis_layer)

            # Leer tiempo acumulado
            time_field = f"Total_{imp_attr}"

            with arcpy.da.SearchCursor(f"{analysis_layer}\\{routes_name}", [time_field]) as rc:
                val = next(rc)[0]

            arcpy.management.Delete(analysis_layer)

            return val

        # 3) Calcular tiempos sólo si están vacíos
        logger.info("Calculando distancias para cada tipo de servicio...")

        results = {}

        for fc, (car_fld, foot_fld) in fields_to_update.items():
            
            service_name = fc.split('/')[-2].replace('_final', '').replace('_Final', '')
            logger.info(f"Procesando: {service_name}")

            if current_vals[car_fld] is None and current_vals[foot_fld] is None:

                results[car_fld]  = solve_legacy_cf("CarCost",  fc)

                results[foot_fld] = solve_legacy_cf("FootCost", fc)
                
                logger.info(f"{service_name} - Car: {results[car_fld]:.2f}, Foot: {results[foot_fld]:.2f}")

            else:

                results[car_fld]  = current_vals[car_fld]

                results[foot_fld] = current_vals[foot_fld]
                
                logger.info(f"{service_name} - Usando valores existentes")
         
        # 4) Eliminar capa puntual

        arcpy.management.Delete(last_house_lyr)
         
        logger.info("Actualizando servicio con los nuevos valores...")
        # 5) Actualizar directamente en el servicio con UpdateCursor

        update_fields = [oid_field] + [f for pair in fields_to_update.values() for f in pair]

        where = f"{oid_field} = {oid}"

        with arcpy.da.UpdateCursor(houses_fc, update_fields, where_clause=where) as ucur:

            for row in ucur:

                for i, (car_fld, foot_fld) in enumerate(fields_to_update.values(), start=1):

                    row[2*i-1] = results[car_fld]

                    row[2*i]   = results[foot_fld]

                ucur.updateRow(row)
         
        # 6) Reportar resultados
        logger.info("Script completado exitosamente!")
        print(f"Última casa (OID={oid}) actualizada en el servicio:")

        for car_fld, foot_fld in fields_to_update.values():
            print(f"  {car_fld}: {results[car_fld]:.2f} min, {foot_fld}: {results[foot_fld]:.2f} min")
            
        return True
        
    except Exception as e:
        logger.error(f"Error en el script: {str(e)}")
        print(f"ERROR: {str(e)}")
        return False
    
    finally:
        # Limpiar recursos
        try:
            if arcpy.CheckExtension("Network") == "CheckedOut":
                arcpy.CheckInExtension("Network")
                logger.info("Extensión Network Analyst liberada")
        except:
            pass

if __name__ == "__main__":
    success = main()
    if success:
        print("Script ejecutado exitosamente")
        sys.exit(0)
    else:
        print("Error en la ejecución del script")
        sys.exit(1)