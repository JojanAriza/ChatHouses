import React, { useEffect, useRef, useState, useCallback } from 'react';
import { X, MapPin, Loader2 } from 'lucide-react';
import type { Casa } from '../services/arcGisApi';

// Definir tipos para ArcGIS API
interface ArcGISRequire {
  (dependencies: string[], callback: (...modules: unknown[]) => void, errback?: (error: Error) => void): void;
}

interface ArcGISMap {
  add: (layer: unknown) => void;
}

interface ArcGISView {
  container: HTMLDivElement;
  map: ArcGISMap;
  center: [number, number];
  zoom: number;
  constraints: {
    minZoom: number;
    maxZoom: number;
  };
  ui: {
    components: string[];
  };
  popup: {
    dockEnabled: boolean;
    dockOptions: {
      buttonEnabled: boolean;
      breakpoint: boolean;
      position: string;
    };
    defaultPopupTemplateEnabled: boolean;
    visibleElements: {
      featureNavigation: boolean;
      heading: boolean;
      closeButton: boolean;
    };
    open: (options: {
      features: unknown[];
      location: unknown;
      updateLocationEnabled: boolean;
    }) => void;
  };
  graphics: {
    add: (graphic: unknown) => void;
  };
  when: () => Promise<void>;
  resize: () => void;
  goTo: (target: { center: [number, number]; zoom: number }, options?: { duration: number }) => Promise<void>;
  destroy: () => void;
  destroyed: boolean;
}

interface ArcGISPoint {
  x: number;
  y: number;
  spatialReference: { wkid: number };
}

interface ArcGISGraphic {
  geometry: ArcGISPoint;
  symbol: unknown;
  popupTemplate: unknown;
}

interface ArcGISSymbol {
  color: [number, number, number, number];
  outline: { color: [number, number, number]; width: number };
  size: number;
}

interface ArcGISPopupTemplate {
  title: string;
  content: string;
}

interface ArcGISFeatureLayer {
  url: string;
  renderer: {
    type: string;
    symbol: {
      type: string;
      color: [number, number, number, number];
      outline: { color: [number, number, number]; width: number };
      size: number;
    };
  };
}

declare global {
  interface Window {
    require: ArcGISRequire;
  }
}

interface MapModalProps {
  casa: Casa;
  isOpen: boolean;
  onClose: () => void;
}

const MapModal: React.FC<MapModalProps> = ({ casa, isOpen, onClose }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [arcgisLoaded, setArcgisLoaded] = useState(false);
  const mapInstance = useRef<ArcGISMap | null>(null);
  const viewInstance = useRef<ArcGISView | null>(null);

  const cleanupMap = useCallback(() => {
    if (viewInstance.current) {
      try {
        viewInstance.current.destroy();
      } catch (error) {
        console.warn('Error al destruir la vista:', error);
      }
      viewInstance.current = null;
    }
    if (mapInstance.current) {
      mapInstance.current = null;
    }
    setMapLoaded(false);
  }, []);

  const loadArcGIS = useCallback(() => {
    if (arcgisLoaded) return Promise.resolve();

    return new Promise<void>((resolve, reject) => {
      if (document.querySelector('link[href*="arcgis.com"]')) {
        setArcgisLoaded(true);
        resolve();
        return;
      }

      const cssLink = document.createElement('link');
      cssLink.rel = 'stylesheet';
      cssLink.href = 'https://js.arcgis.com/4.28/esri/themes/light/main.css';
      document.head.appendChild(cssLink);

      if (document.querySelector('script[src*="js.arcgis.com"]')) {
        setArcgisLoaded(true);
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://js.arcgis.com/4.28/';
      script.onload = () => {
        setArcgisLoaded(true);
        resolve();
      };
      script.onerror = () => reject(new Error('Error loading ArcGIS API'));
      document.head.appendChild(script);
    });
  }, [arcgisLoaded]);

  const initializeMap = useCallback(async () => {
    if (!mapRef.current || !casa.geometry) return;

    try {
      setMapError(null);
      setMapLoaded(false);
      cleanupMap();
      await loadArcGIS();
      
      // ✅ Esperar a que el modal se renderice completamente
      await new Promise((r) => setTimeout(r, 500));

      const loadModules = () => {
        return new Promise<[
          new (config: { basemap: string }) => ArcGISMap,
          new (config: {
            container: HTMLDivElement;
            map: ArcGISMap;
            center: [number, number];
            zoom: number;
            constraints: { minZoom: number; maxZoom: number };
            ui: { components: string[] };
          }) => ArcGISView,
          new (config: ArcGISFeatureLayer) => unknown,
          new (config: { geometry: ArcGISPoint; symbol: ArcGISSymbol; popupTemplate: ArcGISPopupTemplate }) => ArcGISGraphic,
          new (config: { x: number; y: number; spatialReference: { wkid: number } }) => ArcGISPoint,
          new (config: ArcGISSymbol) => ArcGISSymbol,
          new (config: ArcGISPopupTemplate) => ArcGISPopupTemplate,
        ]>((resolve, reject) => {
          if (!window.require) {
            reject(new Error('ArcGIS require not available'));
            return;
          }

          window.require(
            [
              'esri/Map',
              'esri/views/MapView',
              'esri/layers/FeatureLayer',
              'esri/Graphic',
              'esri/geometry/Point',
              'esri/symbols/SimpleMarkerSymbol',
              'esri/PopupTemplate',
            ],
            (...modules: unknown[]) => resolve(modules as [
              new (config: { basemap: string }) => ArcGISMap,
              new (config: {
                container: HTMLDivElement;
                map: ArcGISMap;
                center: [number, number];
                zoom: number;
                constraints: { minZoom: number; maxZoom: number };
                ui: { components: string[] };
              }) => ArcGISView,
              new (config: ArcGISFeatureLayer) => unknown,
              new (config: { geometry: ArcGISPoint; symbol: ArcGISSymbol; popupTemplate: ArcGISPopupTemplate }) => ArcGISGraphic,
              new (config: { x: number; y: number; spatialReference: { wkid: number } }) => ArcGISPoint,
              new (config: ArcGISSymbol) => ArcGISSymbol,
              new (config: ArcGISPopupTemplate) => ArcGISPopupTemplate,
            ]),
            (error: Error) => reject(error)
          );
        });
      };

      const [
        Map,
        MapView,
        FeatureLayer,
        Graphic,
        Point,
        SimpleMarkerSymbol,
        PopupTemplate,
      ] = await loadModules();

      const map = new Map({ basemap: 'streets-navigation-vector' });

      const view = new MapView({
        container: mapRef.current,
        map: map,
        center: [casa.geometry.x, casa.geometry.y],
        zoom: 15,
        constraints: {
          minZoom: 8,
          maxZoom: 22,
        },
        ui: {
          components: ['zoom', 'compass', 'attribution'],
        },
      });

      // ✅ Configurar popup para que no cubra todo el mapa
      view.popup = {
        dockEnabled: true,
        dockOptions: {
          buttonEnabled: true,
          breakpoint: false,
          position: 'top-right' // Posicionar el popup en la esquina superior derecha
        },
        // ✅ Configurar el popup para que sea más pequeño
        defaultPopupTemplateEnabled: false,
        visibleElements: {
          featureNavigation: false,
          heading: true,
          closeButton: true
        },
        open: () => {} // Placeholder
      };

      const markerSymbol = new SimpleMarkerSymbol({
        color: [255, 69, 0, 0.9] as [number, number, number, number],
        outline: { color: [255, 255, 255], width: 3 },
        size: 16,
      });

      const point = new Point({
        x: casa.geometry.x,
        y: casa.geometry.y,
        spatialReference: { wkid: 3857 },
      });

      const popupTemplate = new PopupTemplate({
        title: casa.Name || `Casa ${casa.OBJECTID}`,
        content: `
          <div style="max-width: 300px;">
            <div><strong>Habitaciones:</strong> ${casa.Piezas}</div>
            <div><strong>Baños:</strong> ${casa.Banos}</div>
            <div><strong>Garage:</strong> ${casa.Garage ? 'Sí' : 'No'}</div>
            <div><strong>Internet:</strong> ${casa.Internet ? 'Sí' : 'No'}</div>
            <div><strong>Amoblada:</strong> ${casa.Amoblada ? 'Sí' : 'No'}</div>
            <div><strong>Balcón:</strong> ${casa.Balcon ? 'Sí' : 'No'}</div>
          </div>
        `,
      });

      const pointGraphic = new Graphic({
        geometry: point,
        symbol: markerSymbol,
        popupTemplate,
      });

      const featureLayer = new FeatureLayer({
        url: 'https://services7.arcgis.com/BHeMmpbh6URXbisP/arcgis/rest/services/Casas_prueba_johan/FeatureServer/0',
        renderer: {
          type: 'simple',
          symbol: {
            type: 'simple-marker',
            color: [70, 130, 180, 0.7] as [number, number, number, number],
            outline: { color: [255, 255, 255], width: 2 },
            size: 10,
          },
        },
      });

      map.add(featureLayer);

      // ✅ Esperar a que la vista esté completamente cargada
      await view.when();
      
      // ✅ Múltiples intentos de resize para asegurar renderizado correcto
      const forceResize = () => {
        if (viewInstance.current && !viewInstance.current.destroyed) {
          viewInstance.current.resize();
        }
      };

      // Resize inmediato y programado
      forceResize();
      setTimeout(forceResize, 100);
      setTimeout(forceResize, 300);
      setTimeout(forceResize, 500);
      setTimeout(forceResize, 1000);

      view.graphics.add(pointGraphic);

      // ✅ Usar goTo primero para posicionar el mapa
      await view.goTo(
        { 
          center: [casa.geometry.x, casa.geometry.y], 
          zoom: 15 
        },
        { 
          duration: 1000
        }
      );

      // ✅ Marcar el mapa como cargado ANTES de abrir el popup
      mapInstance.current = map;
      viewInstance.current = view;
      setMapLoaded(true);

      // ✅ Esperar un poco más y luego abrir el popup
      setTimeout(() => {
        if (viewInstance.current && !viewInstance.current.destroyed) {
          viewInstance.current.popup.open({
            features: [pointGraphic],
            location: point,
            // ✅ Configurar la posición del popup para que no cubra todo el mapa
            updateLocationEnabled: true
          });
        }
      }, 1500); // Esperar más tiempo para asegurar que el mapa esté completamente renderizado

      // ✅ Listener para redimensionar cuando cambie el tamaño del contenedor
      const resizeObserver = new ResizeObserver(() => {
        if (viewInstance.current && !viewInstance.current.destroyed) {
          setTimeout(() => {
            viewInstance.current!.resize();
            // ✅ FIXED: Pasar el objeto correcto a goTo
            viewInstance.current!.goTo(
              { 
                center: viewInstance.current!.center, 
                zoom: viewInstance.current!.zoom 
              }, 
              { duration: 0 }
            );
          }, 100);
        }
      });

      if (mapRef.current) {
        resizeObserver.observe(mapRef.current);
      }

      // Limpiar observer cuando se destruya el componente
      const cleanup = () => {
        resizeObserver.disconnect();
      };

      // Guardar función de cleanup para uso posterior
      (view as ArcGISView & { _customCleanup?: () => void })._customCleanup = cleanup;

    } catch (error) {
      console.error('Error al inicializar el mapa:', error);
      setMapError(
        `Error al cargar el mapa: ${
          error instanceof Error ? error.message : 'Error desconocido'
        }`
      );
    }
  }, [casa, loadArcGIS, cleanupMap]);

  // ✅ Cleanup mejorado
  const enhancedCleanup = useCallback(() => {
    if (viewInstance.current) {
      try {
        // Ejecutar cleanup personalizado si existe
        const viewWithCleanup = viewInstance.current as ArcGISView & { _customCleanup?: () => void };
        if (viewWithCleanup._customCleanup) {
          viewWithCleanup._customCleanup();
        }
        viewInstance.current.destroy();
      } catch (error) {
        console.warn('Error al destruir la vista:', error);
      }
      viewInstance.current = null;
    }
    if (mapInstance.current) {
      mapInstance.current = null;
    }
    setMapLoaded(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // ✅ Esperar más tiempo para la inicialización
      setTimeout(() => initializeMap(), 600);
    } else {
      document.body.style.overflow = 'unset';
      enhancedCleanup();
    }

    return () => {
      document.body.style.overflow = 'unset';
      enhancedCleanup();
    };
  }, [isOpen, initializeMap, enhancedCleanup]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-blue-500/20">
        <div className="bg-blue-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">
                {casa.Name || `Casa ${casa.OBJECTID}`}
              </h2>
              <p className="text-blue-200 text-sm">Ubicación en el mapa</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-blue-200 hover:text-white p-2 rounded-full hover:bg-blue-700 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* ✅ Contenedor del mapa con dimensiones fijas y mejoradas */}
        <div className="relative" style={{ height: '70vh', minHeight: '500px' }}>
          {!casa.geometry ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-600">
              <MapPin className="w-16 h-16 mb-4 text-blue-300" />
              <h3 className="text-lg font-semibold">Ubicación no disponible</h3>
              <p className="text-sm">Esta propiedad no tiene coordenadas</p>
            </div>
          ) : (
            <>
              {!mapLoaded && !mapError && (
                <div className="absolute inset-0 bg-white/90 flex items-center justify-center z-10">
                  <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
                    <p className="text-gray-600">Cargando mapa...</p>
                  </div>
                </div>
              )}

              {mapError && (
                <div className="absolute inset-0 bg-white/90 flex items-center justify-center z-10">
                  <div className="text-center max-w-md">
                    <MapPin className="w-16 h-16 mx-auto mb-4 text-red-400" />
                    <h3 className="text-lg font-semibold text-gray-800">Error al cargar el mapa</h3>
                    <p className="text-red-600 text-sm mb-4">{mapError}</p>
                    <button
                      onClick={() => {
                        setMapError(null);
                        initializeMap();
                      }}
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition"
                    >
                      Intentar de nuevo
                    </button>
                  </div>
                </div>
              )}

              {/* ✅ Contenedor del mapa con estilos mejorados */}
              <div
                ref={mapRef}
                className="w-full h-full"
                style={{
                  opacity: mapLoaded ? 1 : 0,
                  transition: 'opacity 0.5s ease-in-out',
                  minHeight: '500px',
                  // ✅ Asegurar que el contenedor tenga el tamaño correcto
                  position: 'relative',
                  zIndex: 1
                }}
              />
            </>
          )}
        </div>

        <div className="bg-blue-900 text-white px-6 py-4 text-sm">
          <p>
            <strong>{casa.Piezas}</strong> habitaciones •{' '}
            <strong>{casa.Banos}</strong> baños •{' '}
            {casa.Garage ? 'Con garage' : 'Sin garage'}
          </p>
          <p className="text-blue-300 text-xs">
            Hospital: {casa.Hospital_Car} min • Escuela: {casa.Escuelas_Car} min
          </p>
        </div>
      </div>
    </div>
  );
};

export default MapModal;