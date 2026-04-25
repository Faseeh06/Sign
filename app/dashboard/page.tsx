"use client";

import { useState, useEffect, useRef } from "react";
import { useSpeech } from "../../hooks/useSpeech";
import { useSignQueue } from "../../hooks/useSignQueue";
import { Mic, MicOff, AlertCircle, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardPage() {
  const { addWord, currentRender, queueLength } = useSignQueue();
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  
  const { 
    isListening, 
    transcript, 
    error, 
    startListening, 
    stopListening 
  } = useSpeech({
    onWordRecognized: addWord
  });

  const [textInput, setTextInput] = useState("");

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (textInput.trim()) {
      const words = textInput.trim().split(/\s+/);
      words.forEach((word, index) => {
        addWord(word, index === 0);
      });
      setTextInput("");
    }
  };

  const [mounted, setMounted] = useState(false);
  const [nativeSupport, setNativeSupport] = useState(true);
  
  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
        setNativeSupport(false);
      }
    }
  }, []);

  // Auto-scroll transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript]);

  if (!mounted) return null;

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col items-center pt-24 px-4 pb-12 w-full max-w-5xl mx-auto space-y-8">
      
      {/* Header Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Real-Time Interpreter</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Speak into your microphone and see instant sign language translation.
        </p>
      </div>

      {!nativeSupport && (
        <div className="bg-destructive/10 text-destructive border border-destructive/20 p-4 rounded-xl flex items-start gap-3 w-full max-w-2xl">
          <AlertCircle className="w-6 h-6 shrink-0" />
          <p>
            Your browser does not support the Web Speech API. Please switch to Google Chrome or Microsoft Edge on a desktop to use this feature.
          </p>
        </div>
      )}

      {error && nativeSupport && (
        <div className="bg-destructive/10 text-destructive border border-destructive/20 p-4 rounded-xl flex items-start gap-3 w-full max-w-2xl">
          <AlertCircle className="w-6 h-6 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-6xl flex-grow">
        
        {/* Left Column: Video/Sign Render */}
        <div className="flex flex-col space-y-4 border border-border bg-card/50 backdrop-blur-sm p-6 rounded-3xl shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                {isListening && queueLength > 0 && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                )}
                <span className={`relative inline-flex rounded-full h-3 w-3 ${isListening ? 'bg-primary' : 'bg-muted'}`}></span>
              </span>
              Visual Translation
            </h2>
            {queueLength > 0 && (
               <span className="text-sm bg-muted px-2 py-1 rounded-md text-muted-foreground">
                 Queue: {queueLength}
               </span>
            )}
          </div>
          
          <div className="relative aspect-video bg-muted/30 rounded-2xl overflow-hidden flex items-center justify-center border border-border/50">
            <AnimatePresence mode="wait">
              {currentRender.type === "idle" && (
                <motion.div 
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center text-muted-foreground"
                >
                  <Info className="w-8 h-8 mb-2 opacity-50" />
                  <p>{isListening ? "Listening..." : "Ready to sign"}</p>
                </motion.div>
              )}

              {currentRender.type === "sign" && (
                <motion.div
                  key={`sign-${currentRender.word}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                  className="relative w-full h-full flex flex-col items-center justify-center p-4 bg-black/5"
                >
                  <img 
                    src={currentRender.gifUrl.includes('lifeprint.com') ? `/api/proxy?url=${encodeURIComponent(currentRender.gifUrl)}` : currentRender.gifUrl} 
                    alt={currentRender.word}
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    className="h-full object-contain drop-shadow-xl rounded-xl mix-blend-multiply dark:mix-blend-normal"
                  />
                  <div className="absolute bottom-4 left-0 right-0 text-center">
                    <span className="bg-background/80 backdrop-blur-md px-4 py-2 rounded-full font-bold text-lg border border-border shadow-sm">
                      {currentRender.word}
                    </span>
                  </div>
                </motion.div>
              )}

              {currentRender.type === "letter" && (
                <motion.div
                  key={`letter-${currentRender.letter}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="relative w-full h-full flex flex-col items-center justify-center bg-black/5"
                >
                  <img 
                    src={currentRender.letterGifUrl.includes('lifeprint.com') ? `/api/proxy?url=${encodeURIComponent(currentRender.letterGifUrl)}` : currentRender.letterGifUrl} 
                    alt={currentRender.letter}
                    className="max-h-[80%] object-contain drop-shadow-lg mix-blend-multiply dark:mix-blend-normal"
                  />
                  <div className="absolute bottom-4 left-0 right-0 text-center flex flex-col items-center">
                    <span className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-1">
                      Fingerspelling
                    </span>
                    <span className="bg-background/90 backdrop-blur-md px-5 py-2 rounded-full font-bold text-xl border border-border shadow-sm">
                      {currentRender.letter.toUpperCase()}
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Column: Transcript and Controls */}
        <div className="flex flex-col space-y-6">
          {/* Controls */}
          <div className="bg-card border border-border p-6 rounded-3xl shadow-sm flex flex-col items-center justify-center gap-4">
            <button
              onClick={isListening ? stopListening : startListening}
              disabled={!nativeSupport}
              className={`relative group overflow-hidden w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${isListening ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-[0_0_30px_rgba(239,68,68,0.4)]' : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_20px_rgba(0,0,0,0.1)]'}`}
            >
              {isListening && (
                <span className="absolute inset-0 rounded-full animate-ping border-2 border-current opacity-20"></span>
              )}
              {isListening ? (
                <MicOff className="w-10 h-10 transition-transform group-hover:scale-110" />
              ) : (
                <Mic className="w-10 h-10 transition-transform group-hover:scale-110" />
              )}
            </button>
            <div className="text-center">
              <h3 className="font-bold text-lg">{isListening ? "Listening actively" : "Microphone Off"}</h3>
              <p className="text-sm text-muted-foreground">
                {isListening ? "Click to stop interpretation" : "Click to begin translating speech"}
              </p>
            </div>
          </div>

          {/* Manual Input Box */}
          <div className="bg-card border border-border p-6 rounded-3xl shadow-sm flex flex-col gap-4">
            <h2 className="text-xl font-bold">Manual Text Input</h2>
            <form onSubmit={handleTextSubmit} className="flex gap-2 w-full">
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Type a word or sentence..."
                className="flex flex-1 h-12 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring bg-primary text-primary-foreground shadow hover:bg-primary/90 h-12 px-8"
              >
                Sign It
              </button>
            </form>
          </div>

          {/* Transcript Box */}
          <div className="flex-grow flex flex-col border border-border bg-card p-6 rounded-3xl shadow-sm min-h-[300px]">
            <h2 className="text-xl font-bold mb-4">Live Transcript</h2>
            <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar">
              {transcript ? (
                <p className="text-lg leading-relaxed">{transcript}</p>
              ) : (
                <p className="text-muted-foreground italic h-full flex items-center justify-center text-center opacity-50">
                  {isListening ? "Waiting for speech..." : "Transcript will appear here once you start speaking."}
                </p>
              )}
              <div ref={transcriptEndRef} />
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
