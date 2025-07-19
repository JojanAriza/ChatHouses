import { useState, useEffect, useCallback } from 'react';
import type { SpeechRecognitionErrorEvent, SpeechRecognitionEvent, SpeechRecognitionInstance } from "../types";

interface VoiceRecognitionConfig {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  maxAlternatives?: number;
  autoSubmitDelay?: number;
}

interface VoiceRecognitionReturn {
  isListening: boolean;
  speechSupported: boolean;
  error: string | null;
  transcript: string;
  toggleListening: () => void;
  resetError: () => void;
  resetTranscript: () => void;
}

const defaultConfig: VoiceRecognitionConfig = {
  language: 'es-ES',
  continuous: false,
  interimResults: true,
  maxAlternatives: 1,
  autoSubmitDelay: 300,
};

export const useVoiceRecognition = (
  onFinalTranscript?: (transcript: string) => void,
  config: VoiceRecognitionConfig = {}
): VoiceRecognitionReturn => {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [speechSupported, setSpeechSupported] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<string>('');
  const [recognition, setRecognition] = useState<SpeechRecognitionInstance | null>(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const finalConfig = { ...defaultConfig, ...config };

  // Función para obtener mensaje de error amigable
  const getErrorMessage = (errorCode: string): string => {
    const errorMessages: Record<string, string> = {
      'network': 'Error de conexión. Verifica tu internet.',
      'not-allowed': 'Permiso de micrófono denegado. Habilítalo en la configuración.',
      'no-speech': 'No se detectó voz. Intenta de nuevo.',
      'audio-capture': 'No se pudo acceder al micrófono.',
      'service-not-allowed': 'Servicio de reconocimiento no permitido.',
      'bad-grammar': 'Error en el reconocimiento de gramática.',
      'language-not-supported': 'Idioma no soportado.',
    };

    return errorMessages[errorCode] || 'Error en el reconocimiento de voz.';
  };

  // Inicializar reconocimiento de voz
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        setSpeechSupported(true);
        const recognitionInstance = new SpeechRecognition();
        
        // Configuración del reconocimiento de voz
        recognitionInstance.lang = finalConfig.language!;
        recognitionInstance.continuous = finalConfig.continuous!;
        recognitionInstance.interimResults = finalConfig.interimResults!;
        recognitionInstance.maxAlternatives = finalConfig.maxAlternatives!;

        // Evento cuando se recibe resultado
        recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
          const current = event.resultIndex;
          const transcriptResult = event.results[current][0].transcript;
          
          // Actualizar transcript con el texto transcrito
          setTranscript(transcriptResult.trim());
          
          // Si es resultado final y hay callback, ejecutarlo después del delay
          if (event.results[current].isFinal && transcriptResult.trim() && onFinalTranscript) {
            setTimeout(() => {
              onFinalTranscript(transcriptResult.trim());
              setTranscript(''); // Limpiar transcript después de usar
            }, finalConfig.autoSubmitDelay);
          }
        };

        // Evento cuando termina el reconocimiento
        recognitionInstance.onend = () => {
          setIsListening(false);
        };

        // Evento de error
        recognitionInstance.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error('Error de reconocimiento de voz:', event.error);
          setIsListening(false);
          setError(getErrorMessage(event.error));
        };

        // Cuando inicia el reconocimiento
        recognitionInstance.onstart = () => {
          setIsListening(true);
          setError(null);
        };

        setRecognition(recognitionInstance);
      } else {
        setSpeechSupported(false);
        console.warn('Reconocimiento de voz no soportado en este navegador');
      }
    }
  }, [finalConfig, onFinalTranscript]);

  // Función para iniciar/detener reconocimiento de voz
  const toggleListening = useCallback(() => {
    if (!recognition) return;

    if (isListening) {
      recognition.stop();
    } else {
      // Limpiar transcript anterior y empezar a escuchar
      setTranscript('');
      setError(null);
      recognition.start();
    }
  }, [recognition, isListening]);

  // Función para resetear errores
  const resetError = useCallback(() => {
    setError(null);
  }, []);

  // Función para resetear transcript
  const resetTranscript = useCallback(() => {
    setTranscript('');
  }, []);

  return {
    isListening,
    speechSupported,
    error,
    transcript,
    toggleListening,
    resetError,
    resetTranscript,
  };
};