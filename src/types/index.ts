export interface HouseCardProps {
  match: CasaMatch;
  onHouseClick: (casa: Casa) => void;
}

export interface HouseResultsContainerProps {
  matches: CasaMatch[];
  onHouseClick: (casa: Casa) => void;
}

export interface ArcGISRequire {
  (dependencies: string[], callback: (...modules: unknown[]) => void, errback?: (error: Error) => void): void;
}

export interface ArcGISMap {
  add: (layer: unknown) => void;
}

export interface ArcGISView {
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

export interface ArcGISPoint {
  x: number;
  y: number;
  spatialReference: { wkid: number };
}

export interface ArcGISGraphic {
  geometry: ArcGISPoint;
  symbol: unknown;
  popupTemplate: unknown;
}

export interface ArcGISSymbol {
  color: [number, number, number, number];
  outline: { color: [number, number, number]; width: number };
  size: number;
}

export interface ArcGISPopupTemplate {
  title: string;
  content: string;
}

export interface ArcGISFeatureLayer {
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

export interface MapModalProps {
  casa: Casa;
  isOpen: boolean;
  onClose: () => void;
}

export interface ChatMessage {
  id: number;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export interface AIServiceConfig {
  model?: string;
  temperature?: number;
  systemPrompt?: string;
}

export interface Casa {
  OBJECTID: number;
  Name: string;
  Banos: number;
  Piezas: number;
  Garage: number;
  Internet: number;
  Amoblada: number;
  Balcon: number;
  Hospital_Car: number;
  Hospital_foot: number;
  Escuelas_Car: number;
  Escuelas_foot: number;
  Area_m2: number;
  Pisos: number;
  Asensor: number;
  Television: number;
  Parques_Car: number;
  Parques_foot: number;
  Universidades_Car: number;
  Universidades_foot: number;
  GlobalID: string;
  Precio: number;
  Telefono: number;
  CreationDate: string;
  Creator: string;
  EditDate: string;
  Editor: string;
  geometry?: {
    x: number;
    y: number;
  };
}

export interface SearchCriteria {
  banos?: number;
  piezas?: number;
  garage?: boolean;
  internet?: boolean;
  amoblada?: boolean;
  balcon?: boolean;
  asensor?: boolean;
  television?: boolean;
  hospitalCar?: number;
  hospitalFoot?: number;
  escuelasCar?: number;
  escuelasFoot?: number;
  parquesCar?: number;
  parquesFoot?: number;
  universidadesCar?: number;
  universidadesFoot?: number;
  nearHospital?: boolean;
  nearSchool?: boolean;
  nearPark?: boolean;
  nearUniversity?: boolean;
  area?: number;
  pisos?: number;
  precioMin?: number;
  precioMax?: number;
}

export interface CasaMatch {
  casa: Casa;
  score: number;
  matches: string[];
  partialMatches: string[];
}

export interface ArcGISFeature {
  attributes: Casa;
  geometry: {
    x: number;
    y: number;
  };
}

export interface Message {
  id: number;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
  houseResults?: CasaMatch[];
}

// Modal Component para detalles de la casa
export interface HouseDetailsModalProps {
  casa: Casa;
  isOpen: boolean;
  onClose: () => void;
  onOpenMap: (casa: Casa) => void;
}