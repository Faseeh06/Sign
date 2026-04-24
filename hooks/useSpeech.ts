import { useState, useEffect, useRef, useCallback } from "react";

// Add global interfaces for SpeechRecognition to avoid TypeScript errors
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface UseSpeechProps {
  onWordRecognized: (word: string, isFirstWord: boolean) => void;
}

export function useSpeech({ onWordRecognized }: UseSpeechProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const processedWordsRef = useRef<Set<string>>(new Set());
  const transcriptLengthRef = useRef<number>(0);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError("Web Speech API is not supported in this browser. Please use Google Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    // recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let currentTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        currentTranscript += event.results[i][0].transcript;
      }

      setTranscript(currentTranscript);

      // Simple diffing to find new words
      const words = currentTranscript.trim().split(/\s+/);
      const isFirstWordOfSentence = event.results[event.resultIndex].isFinal && words.length === 1;

      // When interim results are updated, we only want to fire onWordRecognized for newly typed words.
      // A robust way mapping interim speech to stream is tricky, but we can just track words by length index.
      if (words.length > transcriptLengthRef.current) {
        for (let i = transcriptLengthRef.current; i < words.length; i++) {
          const word = words[i];
          if (word) {
             onWordRecognized(word, i === 0 || isFirstWordOfSentence);
          }
        }
        transcriptLengthRef.current = words.length;
      }

      // Reset when final
      if (event.results[event.resultIndex].isFinal) {
        transcriptLengthRef.current = 0;
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setError(`Error: ${event.error}`);
      setIsListening(false);
    };

    recognition.onend = () => {
      // Auto-restart if we were intended to be listening (helps continuous capture)
      if (isListening) {
        recognition.start();
      } else {
        setIsListening(false);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isListening, onWordRecognized]);

  const startListening = useCallback(() => {
    setError(null);
    setTranscript("");
    transcriptLengthRef.current = 0;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e: any) {
        setError(`Failed to start: ${e.message}`);
      }
    }
  }, []);

  const stopListening = useCallback(() => {
    setIsListening(false);
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  return {
    isListening,
    transcript,
    error,
    startListening,
    stopListening,
  };
}
