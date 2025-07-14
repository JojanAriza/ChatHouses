import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, AlertCircle, Home, Search, X, MapPin, Bed, Bath, Car, Square } from 'lucide-react';
import aiService from '../services/aiService';
import { searchCasas, extractCriteriaFromText, type CasaMatch } from '../services/arcGisApi';
import HouseResults from '../components/HouseResults';
import type { Casa } from '../services/arcGisApi';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  houseResults?: CasaMatch[];
}

// Modal Component
interface HouseDetailsModalProps {
  casa: Casa;
  isOpen: boolean;
  onClose: () => void;
}

const HouseDetailsModal: React.FC<HouseDetailsModalProps> = ({ casa, isOpen, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-blue-900 via-indigo-900 to-blue-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-blue-500/20">
        {/* Header */}
        <div className="sticky top-0 bg-black/20 backdrop-blur-md border-b border-blue-500/20 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
              <Home className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Detalles de la Propiedad</h2>
              <p className="text-blue-300 text-sm">Información completa</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-blue-300 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Main Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-blue-500/20">
                <h3 className="text-lg font-semibold text-white mb-3">Información General</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Home className="w-4 h-4 text-blue-400" />
                    <span className="text-gray-300 text-sm">
                      {casa.Name || 'Nombre no especificado'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-blue-400" />
                    <span className="text-gray-300 text-sm">
                      Campo: {casa.Field || 'No especificado'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Square className="w-4 h-4 text-blue-400" />
                    <span className="text-gray-300 text-sm">
                      ID: {casa.OBJECTID}
                    </span>
                  </div>
                </div>
              </div>

              {/* Characteristics */}
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-blue-500/20">
                <h3 className="text-lg font-semibold text-white mb-3">Características</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center space-x-2">
                    <Bed className="w-4 h-4 text-blue-400" />
                    <span className="text-gray-300 text-sm">
                      {casa.Piezas || 0} piezas
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Bath className="w-4 h-4 text-blue-400" />
                    <span className="text-gray-300 text-sm">
                      {casa.Banos || 0} baños
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Car className="w-4 h-4 text-blue-400" />
                    <span className="text-gray-300 text-sm">
                      {casa.Garage ? 'Con garage' : 'Sin garage'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Home className="w-4 h-4 text-blue-400" />
                    <span className="text-gray-300 text-sm">
                      {casa.Amoblada ? 'Amoblada' : 'Sin amoblar'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {/* Additional Features */}
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-blue-500/20">
                <h3 className="text-lg font-semibold text-white mb-3">Características Adicionales</h3>
                <div className="space-y-2">
                  {casa.Balcon ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-gray-300 text-sm">Balcón</span>
                    </div>
                  ) : null}
                  {casa.Internet ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-gray-300 text-sm">Internet</span>
                    </div>
                  ) : null}
                  {!casa.Balcon && !casa.Internet && (
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      <span className="text-gray-400 text-sm">Sin características adicionales</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Proximity to Services */}
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-blue-500/20">
                <h3 className="text-lg font-semibold text-white mb-3">Proximidad a Servicios</h3>
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-medium text-white mb-1">Hospital</h4>
                    <div className="text-xs text-gray-300">
                      <div>En auto: {casa.Hospital_Car || 'No especificado'}</div>
                      <div>A pie: {casa.Hospital_foot || 'No especificado'}</div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-white mb-1">Escuelas</h4>
                    <div className="text-xs text-gray-300">
                      <div>En auto: {casa.Escuelas_Car || 'No especificado'}</div>
                      <div>A pie: {casa.Escuelas_foot || 'No especificado'}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Coordinates */}
              {casa.geometry && (
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-blue-500/20">
                  <h3 className="text-lg font-semibold text-white mb-3">Ubicación</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-blue-400" />
                      <span className="text-gray-300 text-sm">
                        Coordenadas: {casa.geometry.x.toFixed(6)}, {casa.geometry.y.toFixed(6)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-500/20 hover:bg-gray-500/30 text-gray-300 rounded-lg transition-colors cursor-pointer"
            >
              Cerrar
            </button>
            <button
              onClick={() => {
                // Aquí puedes agregar lógica para mostrar en el mapa si tienes coordinates
                if (casa.geometry) {
                  console.log('Mostrar en mapa:', casa.geometry);
                }
              }}
              disabled={!casa.geometry}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:from-gray-500 disabled:to-gray-600 text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <MapPin className="w-4 h-4 inline mr-2" />
              Ver en Mapa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "¡Hola! Soy tu asistente de IA especializado en búsqueda de casas. Puedo ayudarte a encontrar la casa perfecta según tus necesidades.\n\n¿Qué estás buscando? Por ejemplo:\n• 'Busco una casa con 3 piezas y 2 baños'\n• 'Quiero una casa amoblada con garage'\n• 'Necesito una casa cerca del hospital'",
      sender: 'ai' as const,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCasa, setSelectedCasa] = useState<Casa | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const isHouseQuery = (text: string): boolean => {
    const lowerText = text.toLowerCase();
    const houseKeywords = [
      'casa', 'casas', 'vivienda', 'hogar', 'apartamento', 'propiedad',
      'piezas', 'pieza', 'cuarto', 'cuartos', 'habitación', 'habitaciones',
      'baño', 'baños', 'garage', 'balcón', 'amoblada', 'amueblada',
      'busco', 'necesito', 'quiero', 'me interesa', 'mostrar', 'encontrar'
    ];
    
    return houseKeywords.some(keyword => lowerText.includes(keyword));
  };

  const generateAIResponse = async (userMessage: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      // Verificar si es una consulta sobre casas
      if (isHouseQuery(userMessage)) {
        const criteria = extractCriteriaFromText(userMessage);
        
        if (Object.keys(criteria).length > 0) {
          // Buscar casas que coincidan
          const matches = await searchCasas(criteria);
          
          // Crear mensaje con resultados
          const responseText = matches.length > 0 
            ? `Encontré ${matches.length} casa${matches.length > 1 ? 's' : ''} que coinciden con tus criterios. Aquí están los resultados ordenados por relevancia:`
            : 'No encontré casas que coincidan exactamente con tus criterios. Te sugiero que pruebes con criterios más amplios.';
          
          const aiMessageId = Date.now() + Math.random();
          const aiMessage: Message = {
            id: aiMessageId,
            text: responseText,
            sender: 'ai' as const,
            timestamp: new Date(),
            houseResults: matches
          };
          
          setMessages(prev => [...prev, aiMessage]);
          setIsLoading(false);
          return;
        }
      }

      // Obtener todas las conversaciones para el contexto
      const conversationHistory = messages.concat({
        id: Date.now() + Math.random(),
        text: userMessage,
        sender: 'user' as const,
        timestamp: new Date()
      });

      // Obtener el stream de la respuesta
      const stream = await aiService.generateResponse(conversationHistory);
      
      let fullResponse = '';
      let aiMessageId: number | null = null;
      
      // Procesar el stream
      for await (const chunk of stream) {
        fullResponse += chunk;
        
        // Crear el mensaje de IA solo en el primer chunk
        if (aiMessageId === null) {
          aiMessageId = Date.now() + Math.random();
          const aiMessage: Message = {
            id: aiMessageId,
            text: fullResponse,
            sender: 'ai' as const,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, aiMessage]);
        } else {
          // Actualizar el mensaje existente
          setMessages(prev => 
            prev.map(msg => 
              msg.id === aiMessageId 
                ? { ...msg, text: fullResponse }
                : msg
            )
          );
        }
      }

    } catch (err: unknown) {
      console.error('Error al generar respuesta:', err);
      
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      
      if (errorMessage.includes('429')) {
        setError('Demasiadas peticiones. Por favor, espera un momento antes de intentar de nuevo.');
      } else if (errorMessage.includes('500')) {
        setError('Error del servidor. Por favor, intenta de nuevo en unos minutos.');
      } else {
        setError('No se pudo generar una respuesta. Por favor, intenta de nuevo.');
      }
      
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLInputElement>): Promise<void> => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessageId = Date.now() + Math.random();
    const userMessage: Message = {
      id: userMessageId,
      text: inputMessage,
      sender: 'user' as const,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const messageText = inputMessage;
    setInputMessage('');

    await new Promise(resolve => setTimeout(resolve, 100));
    await generateAIResponse(messageText);
  };

  const handleHouseSelect = (casa: Casa) => {
    setSelectedCasa(casa);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCasa(null);
  };

  const formatTime = (timestamp: Date): string => {
    return timestamp.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const clearError = () => {
    setError(null);
  };

  const quickSearchButtons = [
    { text: "Casas con 2 piezas", icon: <Home className="w-4 h-4" /> },
    { text: "Casas con garage", icon: <Search className="w-4 h-4" /> },
    { text: "Casas amobladas", icon: <Home className="w-4 h-4" /> },
    { text: "Casas cerca del hospital", icon: <Search className="w-4 h-4" /> }
  ];

  const handleQuickSearch = (searchText: string) => {
    setInputMessage(searchText);
  };

  return (
    <>
      <div className="flex flex-col h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-blue-800">
        {/* Header */}
        <div className="bg-black/20 backdrop-blur-md border-b border-blue-500/20 px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Asistente de Búsqueda de Casas</h1>
              <p className="text-blue-300 text-sm">
                {isLoading ? 'Buscando...' : 'En línea • Listo para ayudar'}
              </p>
            </div>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="bg-red-500/20 border-l-4 border-red-500 p-4 mx-6 mt-4 rounded-r-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <p className="text-red-300 text-sm">{error}</p>
              </div>
              <button
                onClick={clearError}
                className="text-red-400 hover:text-red-300 transition-colors"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Quick Search Buttons */}
        <div className="px-6 py-4 bg-black/10 backdrop-blur-sm border-b border-blue-500/10">
          <p className="text-blue-300 text-sm mb-2">Búsquedas rápidas:</p>
          <div className="flex flex-wrap gap-2">
            {quickSearchButtons.map((button, index) => (
              <button
                key={index}
                onClick={() => handleQuickSearch(button.text)}
                className="flex items-center space-x-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 px-3 py-1 rounded-full text-sm transition-colors"
              >
                {button.icon}
                <span>{button.text}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div key={message.id}>
              <div className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex items-start space-x-3 max-w-xs lg:max-w-md xl:max-w-lg ${
                  message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}>
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.sender === 'user' 
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500' 
                      : 'bg-gradient-to-r from-green-500 to-blue-500'
                  }`}>
                    {message.sender === 'user' ? (
                      <User className="w-5 h-5 text-white" />
                    ) : (
                      <Bot className="w-5 h-5 text-white" />
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div className={`relative px-4 py-3 rounded-2xl ${
                    message.sender === 'user'
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                      : 'bg-white/10 backdrop-blur-md text-gray-100 border border-blue-500/20'
                  }`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {message.text}
                    </p>
                    <p className={`text-xs mt-1 ${
                      message.sender === 'user' ? 'text-blue-100' : 'text-blue-300'
                    }`}>
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* House Results */}
              {message.houseResults && message.houseResults.length > 0 && (
                <div className="mt-4 ml-11">
                  <HouseResults 
                    matches={message.houseResults} 
                    onHouseSelect={handleHouseSelect}
                  />
                </div>
              )}
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-3 max-w-xs lg:max-w-md xl:max-w-lg">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-blue-500/20">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 text-blue-300 animate-spin" />
                    <span className="text-sm text-blue-300">Buscando...</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-black/20 backdrop-blur-md border-t border-blue-500/20 px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ejemplo: 'Busco una casa con 3 piezas y 2 baños'"
                disabled={isLoading}
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === 'Enter') {
                    handleSubmit(e);
                  }
                }}
                className="w-full bg-white/10 backdrop-blur-md text-white placeholder-gray-400 px-4 py-3 rounded-2xl border border-blue-500/20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:opacity-50"
              />
            </div>
            <button
              onClick={handleSubmit}
              disabled={!inputMessage.trim() || isLoading}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:from-gray-500 disabled:to-gray-600 text-white p-3 rounded-2xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 disabled:hover:scale-100"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <p className="text-blue-300 text-xs mt-2 text-center">
            Describe la casa que buscas o presiona Enter para enviar
          </p>
        </div>
      </div>

      {/* Modal */}
      {selectedCasa && (
        <HouseDetailsModal
          casa={selectedCasa}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
}