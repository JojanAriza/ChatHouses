import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, Search } from "lucide-react";
import aiService from "../services/aiService";
import { searchCasas, extractCriteriaFromText } from "../services/arcGisApi";
import MapModal from "../components/Map";
import HouseResultsContainer from "../components/HouseResults";
import type { Casa, ChatMessage as AIChatMessage, Message, } from "../types";
import HouseDetailsModal from "../components/HouseDetailsModal";
import Header from "../components/Header";
import ErrorMessage from "../components/ErrorMessage";
import Loading from "../components/Loading";
import QuickSearch from "../components/QuickSearch";

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
      "casa",
      "casas",
      "vivienda",
      "hogar",
      "apartamento",
      "propiedad",
      "piezas",
      "pieza",
      "cuarto",
      "cuartos",
      "habitación",
      "habitaciones",
      "baño",
      "baños",
      "garage",
      "balcón",
      "amoblada",
      "amueblada",
      "busco",
      "necesito",
      "quiero",
      "me interesa",
      "mostrar",
      "encontrar",
    ];

    return houseKeywords.some((keyword) => lowerText.includes(keyword));
  };

  // Función para convertir el mensaje a formato ChatMessage
  const convertToMessages = (userMessage: string): AIChatMessage[] => {
    const conversationHistory: AIChatMessage[] = messages.map((msg) => ({
      id: msg.id,
      text: msg.text,
      sender: msg.sender,
      timestamp: msg.timestamp,
    }));

    // Agregar el mensaje actual del usuario
    conversationHistory.push({
      id: Date.now(),
      text: userMessage,
      sender: "user",
      timestamp: new Date(),
    });

    return conversationHistory;
  };

  // Función para procesar el stream de respuesta de IA
  const processAIStream = async (
    aiResponseStream:
      | AsyncGenerator<string, void, unknown>
      | AsyncIterable<string>
  ): Promise<string> => {
    let fullResponse = "";

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
          const responseText =
            matches.length > 0
              ? `Encontré ${matches.length} casa${
                  matches.length > 1 ? "s" : ""
                } que coinciden con tus criterios. Aquí están los resultados ordenados por relevancia:`
              : "No encontré casas que coincidan exactamente con tus criterios. Te sugiero que pruebes con criterios más amplios.";

          const aiMessageId = Date.now() + Math.random();
          const aiMessage: Message = {
            id: aiMessageId,
            text: responseText,
            sender: "ai",
            timestamp: new Date(),
            houseResults: matches,
          };

          setMessages((prev) => [...prev, aiMessage]);
        } else {
          // No se pudieron extraer criterios, usar IA normal
          const chatMessages = convertToMessages(userMessage);
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
        const chatMessages = convertToMessages(userMessage);
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
    setInputMessage("");
    setError(null);

    await generateAIResponse(inputMessage);
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

      <Header/>

      {/* Quick Search Buttons */}
      <QuickSearch handleQuickSearch = {handleQuickSearch}/>

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
        {isLoading && <Loading />}

        {/* Error message */}
        {error && <ErrorMessage error={error}/>}

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
