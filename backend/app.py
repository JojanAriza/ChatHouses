from flask import Flask, request, jsonify, render_template_string
from flask_cors import CORS
import requests
import json
import subprocess
import sys
import os
import logging
from datetime import datetime
import pyproj

app = Flask(__name__)
CORS(app)  # Permitir CORS para todas las rutas

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def convert_coordinates(x, y, from_epsg=3857, to_epsg=4326):
    """
    Convierte coordenadas de un sistema de proyección a otro
    Por defecto convierte de Web Mercator (3857) a WGS84 (4326)
    """
    try:
        # Crear transformadores
        transformer = pyproj.Transformer.from_crs(f"EPSG:{from_epsg}", f"EPSG:{to_epsg}", always_xy=True)
        
        # Si las coordenadas están en el rango de lat/lon, no convertir
        if -180 <= x <= 180 and -90 <= y <= 90:
            return x, y
        
        # Convertir coordenadas
        lon, lat = transformer.transform(x, y)
        return lon, lat
    except Exception as e:
        logger.error(f"Error al convertir coordenadas: {e}")
        # Si falla la conversión, intentar detectar automáticamente
        return auto_detect_and_convert(x, y)

def auto_detect_and_convert(x, y):
    """
    Intenta detectar automáticamente el sistema de coordenadas y convertir
    """
    try:
        # Rangos típicos para diferentes sistemas de coordenadas
        if abs(x) > 1000000 or abs(y) > 1000000:
            # Probablemente Web Mercator (EPSG:3857)
            transformer = pyproj.Transformer.from_crs("EPSG:3857", "EPSG:4326", always_xy=True)
            lon, lat = transformer.transform(x, y)
            return lon, lat
        elif abs(x) > 10000 or abs(y) > 10000:
            # Podría ser UTM u otro sistema proyectado
            # Para Colombia, intentar con EPSG:3116 (MAGNA-SIRGAS / Colombia Bogota zone)
            transformer = pyproj.Transformer.from_crs("EPSG:3116", "EPSG:4326", always_xy=True)
            lon, lat = transformer.transform(x, y)
            if -90 <= lat <= 90 and -180 <= lon <= 180:
                return lon, lat
            
            # Si no funcionó, intentar con EPSG:21896 (Bogota 1975 / Colombia West zone)
            transformer = pyproj.Transformer.from_crs("EPSG:21896", "EPSG:4326", always_xy=True)
            lon, lat = transformer.transform(x, y)
            if -90 <= lat <= 90 and -180 <= lon <= 180:
                return lon, lat
        
        # Si nada funciona, devolver coordenadas originales
        return x, y
    except Exception as e:
        logger.error(f"Error en auto-detección de coordenadas: {e}")
        return x, y
ESRI_TOKEN = (
    "AAPTxy8BH1VEsoebNVZXo8HurJrfbEMKiRasj2RmnXYAwAvSG69qJuZyVjnrCjmMg"
    "U38ESyOYeK9AXY_BZoRq4LtixvakRUN3lXBgipKKCeD6dBMDaPIpz1jgO_hFfZJgaOkl"
    "dLjRHhvRfwHXmY2VZvK-0xaEcc9Jq3_zYVFsVEMIb-uK30VX54iTgjukAnCMvlEQN52"
    "ORIquErcAh-IhXIcyLTgmI-uYZXN8a8e_tbcc-0.AT1_cBfQTcac"
)

# Ruta al script de ArcPy (ajusta esta ruta según tu estructura)
ARCPY_SCRIPT_PATH = os.path.join(os.path.dirname(__file__), 'arcpy_script.py')

# HTML template para el mapa
MAP_TEMPLATE = '''
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>GPS en Tiempo Real con Esri REST</title>
  <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />
  <style>
    body { margin:0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    #panel {
      padding: 1em;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      display: flex;
      align-items: center;
      gap: 0.5em;
      flex-wrap: wrap;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    #panel input { 
      width: 120px; 
      padding: 0.4em; 
      border: none;
      border-radius: 6px;
      font-size: 0.9em;
    }
    #panel button { 
      padding: 0.5em 1em;
      background: rgba(255,255,255,0.2);
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
      transition: background 0.3s;
    }
    #panel button:hover {
      background: rgba(255,255,255,0.3);
    }
    #panel label {
      font-weight: 500;
      text-shadow: 0 1px 2px rgba(0,0,0,0.1);
    }
    #message {
      flex-basis: 100%;
      color: #ffeb3b;
      font-weight: bold;
      min-height: 1.2em;
      background: rgba(0,0,0,0.2);
      padding: 0.5em;
      border-radius: 4px;
      margin-top: 0.5em;
    }
    #map { 
      width: 100%; 
      height: calc(100vh - 90px);
      border-radius: 0 0 8px 8px;
    }
    .map-controls {
      position: absolute;
      top: 10px;
      right: 10px;
      z-index: 1000;
      display: flex;
      flex-direction: column;
      gap: 5px;
    }
    .map-control-btn {
      background: white;
      border: none;
      padding: 8px;
      border-radius: 4px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
      cursor: pointer;
      font-size: 12px;
      min-width: 80px;
    }
    .map-control-btn:hover {
      background: #f0f0f0;
    }
    .loading {
      display: none;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 2000;
      background: rgba(0,0,0,0.8);
      color: white;
      padding: 1em 2em;
      border-radius: 8px;
      font-weight: 500;
    }
  </style>
</head>
<body>
  <div id="panel">
    <button id="start">🚀 Iniciar GPS y Ruta</button>
    <label>📍 Destino:</label>
    <input id="destLat" placeholder="Latitud" value="{{ lat }}" />
    <input id="destLon" placeholder="Longitud" value="{{ lon }}" />
    <div id="message"></div>
  </div>

  <div style="position: relative;">
    <div id="map"></div>
    <div class="map-controls">
      <button class="map-control-btn" onclick="changeMapStyle('street')">🗺️ Calles</button>
      <button class="map-control-btn" onclick="changeMapStyle('satellite')">🛰️ Satélite</button>
      <button class="map-control-btn" onclick="changeMapStyle('terrain')">🏔️ Terreno</button>
      <button class="map-control-btn" onclick="centerOnRoute()">🎯 Centrar</button>
    </div>
    <div class="loading" id="loading">⏳ Calculando ruta...</div>
  </div>

  <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
  <script>
    // Inicialización del mapa con mejor vista inicial
    const map = L.map("map").setView([{{ lat }}, {{ lon }}], 12);
    
    // Capas de mapa disponibles
    const mapLayers = {
      street: L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
      }),
      satellite: L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
        maxZoom: 18,
        attribution: '© Esri, Maxar, GeoEye, Earthstar Geographics, CNES/Airbus DS, USDA, USGS, AeroGRID, IGN, and the GIS User Community'
      }),
      terrain: L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
        maxZoom: 17,
        attribution: '© OpenTopoMap (CC-BY-SA)'
      })
    };
    
    // Agregar capa inicial
    mapLayers.street.addTo(map);
    let currentLayer = 'street';

    let userMarker, destMarker, routeLine;

    // Función para cambiar estilo de mapa
    function changeMapStyle(style) {
      if (mapLayers[currentLayer]) {
        map.removeLayer(mapLayers[currentLayer]);
      }
      if (mapLayers[style]) {
        mapLayers[style].addTo(map);
        currentLayer = style;
      }
    }

    // Función para centrar en la ruta
    function centerOnRoute() {
      if (routeLine) {
        map.fitBounds(routeLine.getBounds(), { padding: [20, 20] });
      } else if (userMarker && destMarker) {
        const group = new L.featureGroup([userMarker, destMarker]);
        map.fitBounds(group.getBounds(), { padding: [50, 50] });
      }
    }

    // Helpers para mostrar/limpiar mensajes
    function showMessage(msg) {
      document.getElementById("message").innerText = msg;
      document.getElementById("message").style.display = "block";
    }
    function clearMessage() {
      document.getElementById("message").innerText = "";
      document.getElementById("message").style.display = "none";
    }

    function showLoading() {
      document.getElementById("loading").style.display = "block";
    }
    function hideLoading() {
      document.getElementById("loading").style.display = "none";
    }

    // Iconos personalizados
    const userIcon = L.divIcon({
      html: '<div style="background: #4CAF50; border: 3px solid white; border-radius: 50%; width: 20px; height: 20px; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>',
      iconSize: [20, 20],
      className: 'custom-marker'
    });

    const destIcon = L.divIcon({
      html: '<div style="background: #FF5722; border: 3px solid white; border-radius: 50%; width: 20px; height: 20px; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>',
      iconSize: [20, 20],
      className: 'custom-marker'
    });

    // Arranca la geolocalización continua
    document.getElementById("start").onclick = () => {
      if (!navigator.geolocation) {
        showMessage("❌ Geolocalización no soportada en este navegador");
        return;
      }
      clearMessage();
      showLoading();
      navigator.geolocation.watchPosition(onPos, onErr, {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 30000
      });
    };

    function onErr(err) {
      hideLoading();
      if (err.code === err.TIMEOUT) {
        console.warn("Timeout GPS, reintentando…");
        showMessage("⏱️ Reintentando obtener ubicación...");
        return;
      }
      showMessage("❌ Error al obtener posición: " + err.message);
      console.error(err);
    }

    async function onPos(pos) {
      try {
        hideLoading();
        clearMessage();
        const lat1 = pos.coords.latitude;
        const lon1 = pos.coords.longitude;

        // Dibuja o actualiza marcador de usuario
        if (!userMarker) {
          userMarker = L.marker([lat1, lon1], {icon: userIcon})
            .addTo(map)
            .bindPopup("📍 Tu ubicación actual");
        } else {
          userMarker.setLatLng([lat1, lon1]);
        }

        // Leer y validar destino
        const lat2Str = document.getElementById("destLat").value.trim();
        const lon2Str = document.getElementById("destLon").value.trim();
        if (!lat2Str || !lon2Str) {
          if (routeLine) {
            map.removeLayer(routeLine);
            routeLine = null;
          }
          return;
        }

        const lat2 = parseFloat(lat2Str);
        const lon2 = parseFloat(lon2Str);
        if (
          isNaN(lat2) || isNaN(lon2) ||
          lat2 < -90 || lat2 > 90 ||
          lon2 < -180 || lon2 > 180
        ) {
          showMessage("❌ Destino inválido. Lat ∈[-90,90], Lon ∈[-180,180]");
          return;
        }

        // Dibuja o actualiza marcador de destino
        if (!destMarker) {
          destMarker = L.marker([lat2, lon2], {icon: destIcon})
            .addTo(map)
            .bindPopup("🎯 Destino");
        } else {
          destMarker.setLatLng([lat2, lon2]);
        }

        // Ajustar vista para mostrar ambos puntos
        const group = new L.featureGroup([userMarker, destMarker]);
        map.fitBounds(group.getBounds(), { padding: [50, 50] });

        showLoading();
        showMessage("🔄 Calculando mejor ruta...");

        // Llama al backend para obtener la ruta
        const respRaw = await fetch("{{ backend_url }}/route", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lat1, lon1, lat2, lon2 })
        });

        hideLoading();

        if (!respRaw.ok) {
          throw new Error(`HTTP ${respRaw.status}`);
        }

        const data = await respRaw.json();

        if (data.error) {
          throw new Error(data.error.message || "Error desconocido");
        }

        const feats = data.routes?.features;
        if (!feats || !feats.length) {
          throw new Error("No se encontró ruta entre esos puntos");
        }

        // Extrae y transforma la geometría
        const path = feats[0].geometry.paths[0];
        const latlngs = path.map(p => [p[1], p[0]]);

        // Elimina ruta previa si existe
        if (routeLine) {
          map.removeLayer(routeLine);
        }

        // Dibuja nueva ruta con mejor estilo
        routeLine = L.polyline(latlngs, {
          color: "#2196F3",
          weight: 6,
          opacity: 0.8,
          smoothFactor: 1,
          className: 'route-line'
        }).addTo(map);

        // Ajustar vista a la ruta
        map.fitBounds(routeLine.getBounds(), { padding: [20, 20] });

        // Calcular distancia aproximada
        const distance = (routeLine.getBounds().getNorthEast().distanceTo(routeLine.getBounds().getSouthWest()) / 1000).toFixed(1);
        showMessage(`✅ Ruta calculada exitosamente! Distancia aproximada: ${distance} km`);

      } catch (e) {
        hideLoading();
        console.error(e);
        showMessage("❌ Ruta no disponible: " + e.message);
        if (routeLine) {
          map.removeLayer(routeLine);
          routeLine = null;
        }
      }
    }

    // Auto-iniciar si hay coordenadas
    if (document.getElementById("destLat").value && document.getElementById("destLon").value) {
      setTimeout(() => {
        document.getElementById("start").click();
      }, 1000);
    }

    // Agregar controles de zoom personalizados
    map.zoomControl.setPosition('bottomright');
  </script>
</body>
</html>
'''

@app.route('/health', methods=['GET'])
def health_check():
    """Endpoint para verificar que el servidor está funcionando"""
    return jsonify({
        'status': 'ok',
        'message': 'Backend funcionando correctamente',
        'timestamp': datetime.now().isoformat()
    })

@app.route("/route", methods=["POST"])
def solve_route():
    """Endpoint para calcular rutas usando Esri"""
    try:
        data = request.json
        lat1, lon1 = data["lat1"], data["lon1"]
        lat2, lon2 = data["lat2"], data["lon2"]
        
        stops = {
            "features": [
                {"geometry": {"x": lon1, "y": lat1}},
                {"geometry": {"x": lon2, "y": lat2}}
            ]
        }
        
        params = {
            "f": "json",
            "stops": json.dumps(stops),
            "outSR": 4326,
            "token": ESRI_TOKEN
        }
        
        url = (
            "https://route.arcgis.com/arcgis/rest/services/"
            "World/Route/NAServer/Route_World/solve"
        )
        
        resp = requests.get(url, params=params, timeout=10).json()
        return jsonify(resp)
        
    except Exception as e:
        logger.error(f"Error al calcular ruta: {str(e)}")
        return jsonify({
            'error': {
                'message': f'Error al calcular ruta: {str(e)}'
            }
        }), 500

@app.route("/map", methods=["GET"])
def show_map():
    """Endpoint para mostrar el mapa con coordenadas específicas"""
    try:
        lat_param = request.args.get('lat', '4.6097')  # Default Bogotá
        lon_param = request.args.get('lon', '-74.0817')
        backend_url = request.args.get('backend_url', 'http://localhost:5000')
        
        # Convertir a float
        x = float(lon_param)
        y = float(lat_param)
        
        # Convertir coordenadas si es necesario
        lon, lat = convert_coordinates(x, y)
        
        # Validar que las coordenadas convertidas estén en rango válido
        if not (-90 <= lat <= 90 and -180 <= lon <= 180):
            logger.warning(f"Coordenadas fuera de rango después de conversión: lat={lat}, lon={lon}")
            # Usar coordenadas por defecto de Bogotá
            lat, lon = 4.6097, -74.0817
        
        logger.info(f"Mostrando mapa con coordenadas: lat={lat}, lon={lon}")
        
        return render_template_string(
            MAP_TEMPLATE, 
            lat=lat, 
            lon=lon, 
            backend_url=backend_url
        )
        
    except Exception as e:
        logger.error(f"Error al mostrar mapa: {str(e)}")
        return f"Error al cargar el mapa: {str(e)}", 500

@app.route('/execute-arcpy', methods=['POST'])
def execute_arcpy_script():
    """Ejecuta el script de ArcPy cuando se completa el formulario"""
    try:
        logger.info("Recibida solicitud para ejecutar script de ArcPy")
        
        # Verificar que el archivo del script existe
        if not os.path.exists(ARCPY_SCRIPT_PATH):
            logger.error(f"Script no encontrado en: {ARCPY_SCRIPT_PATH}")
            return jsonify({
                'success': False,
                'message': f'Script no encontrado en: {ARCPY_SCRIPT_PATH}'
            }), 500
        
        # Obtener datos del formulario si se necesitan (opcional)
        form_data = request.json if request.is_json else {}
        logger.info(f"Datos del formulario recibidos: {form_data}")
        
        # Ejecutar el script de ArcPy
        logger.info("Iniciando ejecución del script de ArcPy...")
        
        # Usar el intérprete de Python que tiene ArcGIS instalado
        python_arcgis_path = r"C:\Program Files\ArcGIS\Pro\bin\Python\envs\arcgispro-py3\python.exe"
        
        # Ejecutar el script
        result = subprocess.run(
            [python_arcgis_path, ARCPY_SCRIPT_PATH],
            capture_output=True,
            text=True,
            timeout=300  # Timeout de 5 minutos
        )
        
        if result.returncode == 0:
            logger.info("Script ejecutado exitosamente")
            return jsonify({
                'success': True,
                'message': 'Script de ArcPy ejecutado exitosamente',
                'output': result.stdout,
                'timestamp': datetime.now().isoformat()
            })
        else:
            logger.error(f"Error en la ejecución del script: {result.stderr}")
            return jsonify({
                'success': False,
                'message': 'Error al ejecutar el script de ArcPy',
                'error': result.stderr,
                'timestamp': datetime.now().isoformat()
            }), 500
            
    except subprocess.TimeoutExpired:
        logger.error("Timeout al ejecutar el script")
        return jsonify({
            'success': False,
            'message': 'El script tardó demasiado en ejecutarse (timeout)',
            'timestamp': datetime.now().isoformat()
        }), 408
        
    except Exception as e:
        logger.error(f"Error inesperado: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'Error inesperado: {str(e)}',
            'timestamp': datetime.now().isoformat()
        }), 500

if __name__ == '__main__':
    # Verificar que el script de ArcPy existe
    if not os.path.exists(ARCPY_SCRIPT_PATH):
        print(f"ADVERTENCIA: Script de ArcPy no encontrado en: {ARCPY_SCRIPT_PATH}")
        print("Por favor, copia tu script de ArcPy como 'arcpy_script.py' en el mismo directorio que este archivo")
    
    print("Iniciando servidor Flask...")
    print(f"Script de ArcPy configurado en: {ARCPY_SCRIPT_PATH}")
    
    # Ejecutar en modo desarrollo
    app.run(debug=True, host='0.0.0.0', port=5000)