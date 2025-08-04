import { useState } from 'react';
import axios from 'axios';
import { AlertCircle, MapPin, Users, BarChart3, Sparkles, Play, Loader2, CheckCircle2, Home, Database, Clock } from 'lucide-react';
import { useNavigate } from 'react-router';
import type { Survey123EventData, ProcessingResult } from '../types';
import { Survey123Component } from '../components/Survey123Component';


// Componente para mostrar el resultado del procesamiento
const ProcessingResult: React.FC<{ 
  result: ProcessingResult; 
  onClose: () => void; 
  onGoHome: () => void; 
  onNewRegistration: () => void; // Nueva prop para manejar nuevo registro
}> = ({ 
  result, 
  onClose, 
  onGoHome,
  onNewRegistration
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className={`p-8 ${result.success ? 'bg-gradient-to-br from-green-50 to-emerald-50' : 'bg-gradient-to-br from-red-50 to-orange-50'}`}>
          <div className="text-center">
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 shadow-xl ${
              result.success 
                ? 'bg-gradient-to-br from-green-400 to-emerald-500' 
                : 'bg-gradient-to-br from-red-400 to-orange-500'
            }`}>
              {result.success ? (
                <CheckCircle2 className="h-10 w-10 text-white" />
              ) : (
                <AlertCircle className="h-10 w-10 text-white" />
              )}
            </div>
            
            <h2 className={`text-3xl font-bold mb-4 ${
              result.success ? 'text-green-800' : 'text-red-800'
            }`}>
              {result.success ? '¡Procesamiento Completado!' : 'Error en el Procesamiento'}
            </h2>
            
            <p className={`text-lg mb-6 ${
              result.success ? 'text-green-700' : 'text-red-700'
            }`}>
              {result.message}
            </p>

            {/* Mostrar detalles del output si es exitoso */}
            {result.success && result.output && (
              <div className="bg-white rounded-lg p-6 mb-6 border border-green-200 text-left">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Database className="h-5 w-5 text-green-600" />
                  Detalles del Procesamiento:
                </h4>
                <pre className="text-sm text-gray-700 whitespace-pre-wrap overflow-x-auto bg-gray-50 p-3 rounded">
                  {result.output}
                </pre>
              </div>
            )}

            {/* Mostrar error si falla */}
            {!result.success && result.error && (
              <div className="bg-white rounded-lg p-6 mb-6 border border-red-200 text-left">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  Error Detallado:
                </h4>
                <pre className="text-sm text-red-700 whitespace-pre-wrap overflow-x-auto bg-red-50 p-3 rounded">
                  {result.error}
                </pre>
              </div>
            )}

            {/* Timestamp */}
            <div className="text-sm text-gray-500 mb-6 flex items-center justify-center gap-2">
              <Clock className="h-4 w-4" />
              Procesado el: {new Date(result.timestamp).toLocaleString()}
            </div>

            {/* Botones */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {result.success && (
                <button
                  onClick={onGoHome}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-8 py-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-xl font-bold text-lg flex items-center gap-3 justify-center"
                >
                  <Home className="h-6 w-6" />
                  Ir a Página Principal
                  <Sparkles className="h-5 w-5" />
                </button>
              )}
              
              <button
                onClick={result.success ? onNewRegistration : onClose}
                className="bg-gradient-to-r from-gray-500 to-slate-600 hover:from-gray-600 hover:to-slate-700 text-white px-8 py-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-xl font-bold text-lg"
              >
                {result.success ? 'Registrar Otra Casa' : 'Cerrar'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente para los botones de procesamiento en el panel derecho
const ActionPanel: React.FC = () => {
  const navigate = useNavigate();
  const [executingScript, setExecutingScript] = useState<boolean>(false);
  const [processingResult, setProcessingResult] = useState<ProcessingResult | null>(null);
  const [showResult, setShowResult] = useState<boolean>(false);

  const executeArcPyScript = async () => {
    setExecutingScript(true);
    setProcessingResult(null);

    try {
      const response = await axios.post('http://localhost:5000/execute-arcpy', {
        message: 'Ejecutando script desde Survey123',
        timestamp: new Date().toISOString()
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 480000 // Timeout de 8 minutos (480000 ms) - aumentado desde 2 minutos
      });

      setProcessingResult(response.data);
      setShowResult(true);

    } catch (error) {
      console.error('Error al conectar con el backend:', error);
      
      let errorMessage = 'Error desconocido';
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
          errorMessage = 'No se pudo conectar con el servidor. Asegúrate de que el backend esté ejecutándose en http://localhost:5000';
        } else if (error.code === 'ECONNABORTED') {
          errorMessage = 'La conexión se agotó. El procesamiento puede estar tardando más de lo esperado.';
        } else {
          errorMessage = error.message;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      setProcessingResult({
        success: false,
        message: 'Error en la comunicación con el servidor',
        error: errorMessage,
        timestamp: new Date().toISOString()
      });
      setShowResult(true);
    } finally {
      setExecutingScript(false);
    }
  };

  const handleCloseResult = () => {
    setShowResult(false);
    setProcessingResult(null);
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handleStayOnPage = () => {
    // Recargar la página actual
    window.location.reload();
  };

  return (
    <>
      <div className="space-y-6">
        {/* Card de instrucciones */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl mb-4 shadow-lg">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            
            <h3 className="text-xl font-bold text-gray-800 mb-3">
              Instrucciones
            </h3>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 text-left">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-700">
                  <p className="font-semibold mb-2">Pasos a seguir:</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Completa el formulario de la izquierda</li>
                    <li>Haz clic en "Terminar Registro"</li>
                    <li>Espera el procesamiento automático</li>
                  </ol>
                </div>
              </div>
            </div>

            <div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
              📍 Se calcularán automáticamente las distancias a hospitales, escuelas, parques y universidades
            </div>
          </div>
        </div>

        {/* Card del botón principal */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl mb-4 shadow-lg">
              <Play className="h-6 w-6 text-white" />
            </div>
            
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Finalizar Registro
            </h3>

            <button
              onClick={executeArcPyScript}
              disabled={executingScript}
              className={`
                w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 
                text-white px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 
                shadow-lg font-semibold text-sm flex items-center gap-2 justify-center
                ${executingScript ? 'opacity-75 cursor-not-allowed animate-pulse' : 'hover:shadow-xl'}
              `}
            >
              {executingScript ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Terminar Registro
                </>
              )}
            </button>
            
            <div className="mt-3 text-xs text-gray-500">
              ⏱️ Tiempo estimado: 30s - 5min
            </div>
          </div>
        </div>

        {/* Card de navegación */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl mb-4 shadow-lg">
              <Home className="h-6 w-6 text-white" />
            </div>
            
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Navegación
            </h3>

            <div className="space-y-3">
              <button
                onClick={handleGoHome}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold text-sm flex items-center gap-2 justify-center"
              >
                <Home className="h-4 w-4" />
                Ir a Inicio
              </button>
              
              <button
                onClick={handleStayOnPage}
                className="w-full bg-gradient-to-r from-gray-500 to-slate-600 hover:from-gray-600 hover:to-slate-700 text-white px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold text-sm flex items-center gap-2 justify-center"
              >
                <Sparkles className="h-4 w-4" />
                Nuevo Registro
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Modal de resultado */}
      {showResult && processingResult && (
        <ProcessingResult 
          result={processingResult}
          onClose={handleCloseResult}
          onGoHome={handleGoHome}
          onNewRegistration={handleStayOnPage}
        />
      )}
    </>
  );
};

// Componente principal
const App: React.FC = () => {
  const handleFormLoaded = (data: Survey123EventData) => {
    console.log('Formulario cargado:', data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
        
        <div className="relative max-w-7xl mx-auto px-6 py-12">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl mb-6 shadow-xl">
              <Users className="h-8 w-8 text-white" />
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
              Registra tu <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Casa</span>
            </h1>
            <p className="text-lg md:text-xl text-blue-100 mb-6 max-w-3xl mx-auto leading-relaxed">
              Completa el formulario y procesa automáticamente los datos con análisis de geolocalización
            </p>
            
            <div className="flex flex-wrap justify-center gap-6 text-sm text-blue-200">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>Geolocalización</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4" />
                <span>Procesamiento automático</span>
              </div>
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4" />
                <span>Análisis en tiempo real</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal con layout de dos columnas */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna izquierda - Formulario Survey123 (2/3 del ancho) */}
          <div className="lg:col-span-2">
            <Survey123Component
              surveyId="f43780edace6402db7c3ddedbfa52035"
              title="Registro de Casa"
              minHeight={700}
              onFormLoaded={handleFormLoaded}
              className="h-full"
            />
          </div>

          {/* Columna derecha - Panel de acciones (1/3 del ancho) */}
          <div className="lg:col-span-1">
            <ActionPanel />
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;