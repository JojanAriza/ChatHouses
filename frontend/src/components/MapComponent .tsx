import React from 'react';

interface MapComponentProps {
  latitude: number;
  longitude: number;
  backendUrl?: string;
}

const MapComponent: React.FC<MapComponentProps> = ({ 
  latitude, 
  longitude, 
  backendUrl = 'http://localhost:5000' 
}) => {
  // Las coordenadas pueden venir en diferentes sistemas de proyección
  // El backend se encargará de convertirlas automáticamente
  const mapUrl = `${backendUrl}/map?lat=${latitude}&lon=${longitude}&backend_url=${encodeURIComponent(backendUrl)}`;
  
  return (
    <div className="w-full h-full">
      <iframe
        src={mapUrl}
        className="w-full h-full border-0 rounded-lg"
        title="Mapa de Rutas GPS"
        allow="geolocation"
      />
    </div>
  );
};

export default MapComponent;