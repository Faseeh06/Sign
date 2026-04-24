import { useState, useEffect, useRef, useCallback } from "react";
import { SignAction } from "../lib/signDictionary";
import { getSignStrategy } from "../lib/signLogic";

type RenderState =
  | { type: "idle" }
  | { type: "sign"; gifUrl: string; word: string }
  | { type: "letter"; letterGifUrl: string; letter: string; word: string };

export function useSignQueue() {
  const [queue, setQueue] = useState<SignAction[]>([]);
  const [currentRender, setCurrentRender] = useState<RenderState>({ type: "idle" });
  const [isProcessing, setIsProcessing] = useState(false);
  const queueRef = useRef(queue);

  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);

  const addWord = useCallback((word: string, isFirstWord: boolean) => {
    const strategy = getSignStrategy(word, isFirstWord);
    if (strategy.type !== "none") {
      setQueue((prev) => [...prev, strategy]);
    }
  }, []);

  // Process the queue
  useEffect(() => {
    if (isProcessing || queue.length === 0) return;

    let timeoutId: NodeJS.Timeout;

    const processNext = async () => {
      setIsProcessing(true);
      const action = queueRef.current[0];

      if (!action) {
        setCurrentRender({ type: "idle" });
        setIsProcessing(false);
        return;
      }

      if (action.type === "sign") {
        setCurrentRender({ type: "sign", gifUrl: action.gif, word: action.word });
        
        // Wait 900ms for a full sign word
        await new Promise((resolve) => setTimeout(resolve, 900));
      } else if (action.type === "fingerspell") {
        // Render each letter sequentially
        for (const letter of action.letters) {
          const letterGifUrl = require("../lib/signDictionary").aslAlphabet[letter];
          if (letterGifUrl) {
            setCurrentRender({ type: "letter", letterGifUrl, letter, word: action.word });
            // Wait 400ms per letter spelling
            await new Promise((resolve) => setTimeout(resolve, 400));
          }
        }
      }

      // Small blank frame between words
      setCurrentRender({ type: "idle" });
      await new Promise((resolve) => setTimeout(resolve, 150));

      // Pop the action
      setQueue((prev) => prev.slice(1));
      setIsProcessing(false);
    };

    processNext();

    return () => {
      clearTimeout(timeoutId);
    };
  }, [queue, isProcessing]);

  return {
    addWord,
    currentRender,
    queueLength: queue.length
  };
}
