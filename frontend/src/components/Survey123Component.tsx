import { BarChart3, Sparkles, ExternalLink, AlertCircle } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import type { Survey123ComponentProps, Survey123EventData } from "../types";

export const Survey123Component: React.FC<Survey123ComponentProps> = ({ 
  surveyId = "f43780edace6402db7c3ddedbfa52035",
  width = "100%",
  minHeight = 600,
  onFormLoaded,
  title = "Formulario Survey123",
  showHeader = true,
  className = ""
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [containerHeight, setContainerHeight] = useState<number>(minHeight);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const surveyUrl = `https://survey123.arcgis.com/share/${surveyId}`;

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== 'https://survey123.arcgis.com') return;

      try {
        const data: Survey123EventData = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        
        if (data.event === 'survey123:webform:formLoaded' || data.event === 'survey123:onFormLoaded') {
          setLoading(false);
          setError(null);
          
          if (data.contentHeight) {
            setContainerHeight(Math.max(data.contentHeight, minHeight));
          }
          
          if (onFormLoaded) {
            onFormLoaded(data);
          }
        }
      } catch (err) {
        console.error('Error procesando mensaje de Survey123:', err);
      }
    };

    window.addEventListener('message', handleMessage);

    const loadTimeout = setTimeout(() => {
      if (loading) {
        setLoading(false);
        setError('El formulario está tardando en cargar. Verifique su conexión.');
      }
    }, 15000);

    return () => {
      window.removeEventListener('message', handleMessage);
      clearTimeout(loadTimeout);
    };
  }, [loading, onFormLoaded, minHeight]);

  const handleIframeLoad = () => {
    setTimeout(() => {
      if (loading) {
        setLoading(false);
      }
    }, 3000);
  };

  const handleIframeError = () => {
    setLoading(false);
    setError('No se pudo cargar el formulario. Verifique la URL del survey.');
  };

  const retryLoad = () => {
    setLoading(true);
    setError(null);
    
    if (iframeRef.current) {
      const currentSrc = iframeRef.current.src;
      iframeRef.current.src = '';
      setTimeout(() => {
        if (iframeRef.current) {
          iframeRef.current.src = currentSrc;
        }
      }, 100);
    }
  };

  const openInNewTab = () => {
    window.open(surveyUrl, '_blank');
  };

  return (
    <div className={`survey123-container ${className}`} ref={containerRef}>
      {showHeader && (
        <div className="survey123-header relative overflow-hidden bg-gradient-to-r from-slate-50 via-blue-50 to-indigo-50 rounded-t-2xl border border-slate-200 border-b-0">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600"></div>
          
          <div className="p-6 relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-md">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    {title}
                    <Sparkles className="h-4 w-4 text-yellow-500" />
                  </h3>
                  <p className="text-sm text-gray-500">Completa la información requerida</p>
                </div>
              </div>
              
              <button
                onClick={openInNewTab}
                className="text-gray-400 hover:text-indigo-600 transition-colors duration-200 p-2 hover:bg-white rounded-lg"
                title="Abrir en nueva pestaña"
              >
                <ExternalLink className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      <div 
        className="survey123-iframe-container relative bg-white rounded-b-2xl overflow-hidden shadow-2xl border border-slate-200 border-t-0"
        style={{ height: containerHeight }}
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 z-10">
            <div className="text-center">
              <div className="relative mb-6">
                <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin border-t-blue-500 mx-auto"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-6 h-6 bg-blue-500 rounded-full animate-pulse"></div>
                </div>
              </div>
              <h4 className="text-lg font-semibold text-gray-700 mb-2">Cargando formulario...</h4>
              <p className="text-gray-500 text-sm">Esto puede tomar unos segundos</p>
              <div className="flex justify-center mt-4 space-x-1">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-75"></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-150"></div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 z-10">
            <div className="text-center p-8 max-w-md">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-400 to-orange-500 rounded-full mb-4 shadow-lg">
                <AlertCircle className="h-8 w-8 text-white" />
              </div>
              <h4 className="text-xl font-bold text-gray-800 mb-3">
                Oops! Algo salió mal
              </h4>
              <p className="text-gray-600 mb-6">{error}</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={retryLoad}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold"
                >
                  Reintentar
                </button>
                <button
                  onClick={openInNewTab}
                  className="bg-gradient-to-r from-gray-500 to-slate-600 hover:from-gray-600 hover:to-slate-700 text-white px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Nueva pestaña
                </button>
              </div>
            </div>
          </div>
        )}

        <iframe
          ref={iframeRef}
          name="survey123webform"
          src={surveyUrl}
          width={width}
          height="100%"
          frameBorder="0"
          marginHeight={0}
          marginWidth={0}
          title={title}
          onLoad={handleIframeLoad}
          onError={handleIframeError}
          allow="geolocation https://survey123.arcgis.com; camera https://survey123.arcgis.com; microphone https://survey123.arcgis.com"
          sandbox="allow-scripts allow-forms allow-same-origin allow-popups"
          loading="lazy"
          className={`w-full h-full transition-opacity duration-500 ${loading || error ? 'opacity-0' : 'opacity-100'}`}
        />
      </div>
    </div>
  );
};