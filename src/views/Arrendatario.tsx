import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, Search } from "lucide-react";
import aiService from "../services/aiService";
import MapModal from "../components/Map";
import HouseResultsContainer from "../components/HouseResults";
import type { Casa, Message, SearchCriteria } from "../types";
import HouseDetailsModal from "../components/HouseDetailsModal";
import Header from "../components/Header";
import ErrorMessage from "../components/ErrorMessage";
import Loading from "../components/Loading";
import QuickSearch from "../components/QuickSearch";
import { searchCasas } from "../services/casaSearch";
import { isHouseQuery, isFollowUpQuery, extractCriteriaFromFollowUp, formatCriteriaText } from "../utils/criteriaExtractor";
import { generateRefinementText } from "../utils/responseGenerator";
import { convertToMessages, processAIStream } from "../utils/messageUtils";

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "¡Hola! Soy tu asistente de IA especializado en búsqueda de casas. Puedo ayudarte a encontrar la casa perfecta según tus necesidades.\n\n¿Qué estás buscando? Por ejemplo:\n• 'Busco una casa con 3 piezas y 2 baños'\n• 'Quiero una casa amoblada con garage'\n• 'Necesito una casa cerca del hospital'",
      sender: "ai" as const,
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCasa, setSelectedCasa] = useState<Casa | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState<boolean>(false);
  const [lastSearchCriteria, setLastSearchCriteria] =
    useState<SearchCriteria | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateAIResponse = async (userMessage: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      // Verificar si es una consulta sobre casas
      if (isHouseQuery(userMessage)) {

        // Determinar si es una consulta de seguimiento o una nueva búsqueda
        const isFollowUp = isFollowUpQuery(userMessage, lastSearchCriteria !== null);

        // Guardar referencia a criterios previos ANTES de actualizar
        const previousCriteria = lastSearchCriteria;

        // Usar función híbrida que combina extracción local + API
        const criteria = extractCriteriaFromFollowUp(
          userMessage,
          lastSearchCriteria
        );

        // CRUCIAL: Asegurar que siempre haya al menos un criterio para búsquedas de casas
        const hasAnyCriteria = Object.keys(criteria).length > 0;

        if (hasAnyCriteria || isHouseQuery(userMessage)) {
          // Actualizar los criterios de la última búsqueda
          setLastSearchCriteria(criteria);

          const matches = await searchCasas(criteria);

          // Crear mensaje con resultados
          let responseText = "";

          if (isFollowUp && previousCriteria) {
            // Es un refinamiento de búsqueda - usar criterios anteriores vs nuevos
            responseText = generateRefinementText(previousCriteria, criteria);
          } else {
            // Es una búsqueda nueva
            responseText =
              "Perfecto! Voy a buscar casas que coincidan con tus criterios.";
          }

          // Agregar información sobre los criterios y resultados
          const criteriaText = formatCriteriaText(criteria);

          if (matches.length > 0) {
            responseText += `\n\nEncontré ${matches.length} casa${
              matches.length > 1 ? "s" : ""
            } que coinciden con tus criterios${isFollowUp ? " refinados" : ""}${
              criteriaText ? ":\n\n" + criteriaText : ""
            }\n\nAquí están los resultados ordenados por relevancia:`;
          } else {
            responseText += `\n\nNo encontré casas que coincidan exactamente con estos criterios${
              isFollowUp ? " refinados" : ""
            }${
              criteriaText ? ":\n\n" + criteriaText : ""
            }\n\nTe sugiero ajustar algunos filtros para ampliar la búsqueda.`;
          }

          // Crear el mensaje AI con los resultados SIEMPRE que haya casas
          const aiMessageId = Date.now() + Math.random();
          
          const aiMessage: Message = {
            id: aiMessageId,
            text: responseText,
            sender: "ai",
            timestamp: new Date(),
            // CRUCIAL: Forzar que houseResults siempre esté presente si hay resultados
            houseResults: matches.length > 0 ? [...matches] : undefined,
          };

          // Usar callback para asegurar que el estado se actualiza correctamente
          setMessages((prevMessages) => {
            const newMessages = [...prevMessages, aiMessage];
            return newMessages;
          });

        } else {
          // No se pudieron extraer criterios, usar IA normal
          const chatMessages = convertToMessages(userMessage, messages);
          const aiResponseStream = await aiService.generateResponse(
            chatMessages
          );
          const text = await processAIStream(aiResponseStream);

          const aiMessageId = Date.now() + Math.random();
          const aiMessage: Message = {
            id: aiMessageId,
            text,
            sender: "ai",
            timestamp: new Date(),
          };

          setMessages((prev) => [...prev, aiMessage]);
        }
      } else {
        // Consulta general, usar IA normal
        const chatMessages = convertToMessages(userMessage, messages);
        const aiResponseStream = await aiService.generateResponse(chatMessages);
        const text = await processAIStream(aiResponseStream);

        const aiMessageId = Date.now() + Math.random();
        const aiMessage: Message = {
          id: aiMessageId,
          text,
          sender: "ai",
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, aiMessage]);
      }
    } catch (error) {
      console.error("Error al generar respuesta:", error);
      setError("Error al generar respuesta. Intenta de nuevo.");

      const errorMessage: Message = {
        id: Date.now() + Math.random(),
        text: "Lo siento, hubo un error al procesar tu consulta. Por favor intenta de nuevo.",
        sender: "ai",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickSearch = (searchText: string) => {
    setInputMessage(searchText);
  };

  const handleSendMessage = async (): Promise<void> => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now(),
      text: inputMessage,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = inputMessage; // Capturar antes de limpiar
    setInputMessage("");
    setError(null);

    await generateAIResponse(currentInput);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter" && !e.shiftKey) {
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
      <Header />

      {/* Quick Search Buttons */}
      <QuickSearch handleQuickSearch={handleQuickSearch} />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                message.sender === "user"
                  ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                  : "bg-white/10 backdrop-blur-md text-white border border-blue-500/20"
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                  {message.sender === "user" ? (
                    <User className="w-5 h-5" />
                  ) : (
                    <Bot className="w-5 h-5" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {message.text}
                  </div>
                  {/* Renderizado de resultados de casas */}
                  {message.houseResults && message.houseResults.length > 0 && (
                    <div className="mt-4">
                      <div className="text-xs opacity-75 mb-2">
                        🏠 Mostrando {message.houseResults.length} resultados
                      </div>
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
        {isLoading && <Loading />}

        {/* Error message */}
        {error && <ErrorMessage error={error} />}

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