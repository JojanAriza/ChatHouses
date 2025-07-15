import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, AlertCircle, Home, Search, X, MapPin, Bed, Bath, Car, Square } from 'lucide-react';
import aiService, { type ChatMessage as AIChatMessage } from '../services/aiService';
import { searchCasas, extractCriteriaFromText, type CasaMatch, type Casa } from '../services/arcGisApi';
import MapModal from '../components/Map';
import HouseResultsContainer from '../components/HouseResults';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  houseResults?: CasaMatch[];
}


// Modal Component para detalles de la casa
interface HouseDetailsModalProps {
  casa: Casa;
  isOpen: boolean;
  onClose: () => void;
  onOpenMap: (casa: Casa) => void;
}

const HouseDetailsModal: React.FC<HouseDetailsModalProps> = ({ casa, isOpen, onClose, onOpenMap }) => {
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
              onClick={() => onOpenMap(casa)}
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
  const [isMapModalOpen, setIsMapModalOpen] = useState<boolean>(false);
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

  // Función para convertir el mensaje a formato ChatMessage
  const convertToMessages = (userMessage: string): AIChatMessage[] => {
    const conversationHistory: AIChatMessage[] = messages.map(msg => ({
      id: msg.id,
      text: msg.text,
      sender: msg.sender,
      timestamp: msg.timestamp
    }));
    
    // Agregar el mensaje actual del usuario
    conversationHistory.push({
      id: Date.now(),
      text: userMessage,
      sender: 'user',
      timestamp: new Date()
    });
    
    return conversationHistory;
  };

  // Función para procesar el stream de respuesta de IA
  const processAIStream = async (aiResponseStream: AsyncGenerator<string, void, unknown> | AsyncIterable<string>): Promise<string> => {
    let fullResponse = '';
    
    // Verificar si es un AsyncGenerator o AsyncIterable
    if (Symbol.asyncIterator in aiResponseStream) {
      for await (const chunk of aiResponseStream) {
        fullResponse += chunk;
      }
    } else {
      // Si no es un AsyncGenerator, intentar convertirlo a string
      fullResponse = String(aiResponseStream);
    }
    
    return fullResponse;
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
            sender: 'ai',
            timestamp: new Date(),
            houseResults: matches
          };
          
          setMessages(prev => [...prev, aiMessage]);
        } else {
          // No se pudieron extraer criterios, usar IA normal
          const chatMessages = convertToMessages(userMessage);
          const aiResponseStream = await aiService.generateResponse(chatMessages);
          const text = await processAIStream(aiResponseStream);
          
          const aiMessageId = Date.now() + Math.random();
          const aiMessage: Message = {
            id: aiMessageId,
            text,
            sender: 'ai',
            timestamp: new Date()
          };
          
          setMessages(prev => [...prev, aiMessage]);
        }
      } else {
        // Consulta general, usar IA normal
        const chatMessages = convertToMessages(userMessage);
        const aiResponseStream = await aiService.generateResponse(chatMessages);
        const text = await processAIStream(aiResponseStream);
        
        const aiMessageId = Date.now() + Math.random();
        const aiMessage: Message = {
          id: aiMessageId,
          text,
          sender: 'ai',
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, aiMessage]);
      }
    } catch (error) {
      console.error('Error al generar respuesta:', error);
      setError('Error al generar respuesta. Intenta de nuevo.');
      
      const errorMessage: Message = {
        id: Date.now() + Math.random(),
        text: 'Lo siento, hubo un error al procesar tu consulta. Por favor intenta de nuevo.',
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
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

  const handleSendMessage = async (): Promise<void> => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setError(null);

    await generateAIResponse(inputMessage);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleHouseClick = (casa: Casa): void => {
    setSelectedCasa(casa);
    setIsModalOpen(true);
  };

  const handleOpenMap = (casa: Casa): void => {
    setSelectedCasa(casa);
    setIsModalOpen(false);
    setIsMapModalOpen(true);
  };

  const handleCloseModal = (): void => {
    setIsModalOpen(false);
    setSelectedCasa(null);
  };

  const handleCloseMapModal = (): void => {
    setIsMapModalOpen(false);
    setSelectedCasa(null);
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-md border-b border-blue-500/20 px-6 py-4 flex items-center space-x-3">
        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
          <Bot className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Asistente de Casas IA</h1>
          <p className="text-blue-300 text-sm">Encuentra tu hogar ideal con ayuda de IA</p>
        </div>
      </div>

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

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                message.sender === 'user'
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                  : 'bg-white/10 backdrop-blur-md text-white border border-blue-500/20'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                  {message.sender === 'user' ? (
                    <User className="w-5 h-5" />
                  ) : (
                    <Bot className="w-5 h-5" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {message.text}
                  </div>
                  {message.houseResults && message.houseResults.length > 0 && (
                    <div className="mt-4">
<HouseResultsContainer
  matches={message.houseResults}
  onHouseClick={handleHouseClick}
/>
                    </div>
                  )}
                  <div className="text-xs opacity-50 mt-2">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white/10 backdrop-blur-md text-white border border-blue-500/20 rounded-2xl px-4 py-3 max-w-[80%]">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Procesando...</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="flex justify-start">
            <div className="bg-red-500/20 backdrop-blur-md text-red-200 border border-red-500/20 rounded-2xl px-4 py-3 max-w-[80%]">
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm">{error}</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-black/20 backdrop-blur-md border-t border-blue-500/20 px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Pregunta sobre casas o describe lo que buscas..."
              className="w-full bg-white/10 backdrop-blur-md text-white placeholder-gray-300 rounded-xl px-4 py-3 pr-12 border border-blue-500/20 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
              disabled={isLoading}
            />
            <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:from-gray-500 disabled:to-gray-600 text-white rounded-xl px-6 py-3 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Modals */}
      {selectedCasa && (
        <HouseDetailsModal
          casa={selectedCasa}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onOpenMap={handleOpenMap}
        />
      )}

      {selectedCasa && (
        <MapModal
          casa={selectedCasa}
          isOpen={isMapModalOpen}
          onClose={handleCloseMapModal}
        />
      )}
    </div>
  );
}