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

    let timeoutId: NodeJS.Timeout | undefined;

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
        
        // Dynamically calculate delay: base 800ms, faster if queue is building up
        const qSize = queueRef.current.length;
        const wordDelay = Math.max(350, 800 - (qSize * 100));
        await new Promise((resolve) => setTimeout(resolve, wordDelay));
      } else if (action.type === "fingerspell") {
        // Render each letter sequentially
        for (const letter of action.letters) {
          const letterGifUrl = require("../lib/signDictionary").aslAlphabet[letter];
          if (letterGifUrl) {
            setCurrentRender({ type: "letter", letterGifUrl, letter, word: action.word });
            
            // Fingerspelling cannot be too fast otherwise DOM can't paint and SVGs skip!
            // Min readable delay per letter is ~350ms minimum.
            const qSize = queueRef.current.length;
            const letterDelay = Math.max(350, 500 - (qSize * 25));
            await new Promise((resolve) => setTimeout(resolve, letterDelay));
          }
        }
      }

      // Small blank frame between words
      setCurrentRender({ type: "idle" });
      const qSize = queueRef.current.length;
      const blankDelay = Math.max(50, 150 - (qSize * 15));
      await new Promise((resolve) => setTimeout(resolve, blankDelay));

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
