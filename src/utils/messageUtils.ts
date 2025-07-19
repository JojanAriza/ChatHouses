import type { ChatMessage as AIChatMessage, Message } from "../types";

export const convertToMessages = (
  userMessage: string,
  messages: Message[]
): AIChatMessage[] => {
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

export const processAIStream = async (
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