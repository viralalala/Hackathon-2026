import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { Mic, MicOff, Send, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { AudioRecorder, AudioPlayer } from '../lib/audioUtils';

export function ChatPage() {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'model', text: string }[]>([]);
  const [inputText, setInputText] = useState('');
  const [isCognitoSpeaking, setIsCognitoSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sessionRef = useRef<any>(null);
  const recorderRef = useRef<AudioRecorder | null>(null);
  const playerRef = useRef<AudioPlayer | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const connect = async () => {
    try {
      setError(null);
      setIsConnecting(true);
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      playerRef.current = new AudioPlayer();

      const sessionPromise = ai.live.connect({
        model: "gemini-3.1-flash-live-preview",
        callbacks: {
          onopen: () => {
            setIsConnected(true);
            setIsConnecting(false);
            setMessages([{ role: 'model', text: 'Hello. I am here with you. Take your time.' }]);
          },
          onmessage: async (message: LiveServerMessage) => {
            // Handle audio output
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio && playerRef.current) {
              setIsCognitoSpeaking(true);
              playerRef.current.playBase64(base64Audio);
              // Simple heuristic to stop speaking animation
              setTimeout(() => setIsCognitoSpeaking(false), 1000);
            }

            // Handle interruption
            if (message.serverContent?.interrupted && playerRef.current) {
              playerRef.current.stop();
              setIsCognitoSpeaking(false);
            }

            // Handle transcription
            const modelText = message.serverContent?.modelTurn?.parts[0]?.text || message.serverContent?.outputTranscription?.text;
            if (modelText) {
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last && last.role === 'model') {
                  return [...prev.slice(0, -1), { ...last, text: last.text + modelText }];
                }
                return [...prev, { role: 'model', text: modelText }];
              });
            }

            const userText = message.serverContent?.inputTranscription?.text;
            if (userText) {
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last && last.role === 'user') {
                  return [...prev.slice(0, -1), { ...last, text: last.text + userText }];
                }
                return [...prev, { role: 'user', text: userText }];
              });
            }
          },
          onclose: () => {
            setIsConnected(false);
            stopRecording();
          },
          onerror: (err) => {
            console.error("Live API Error:", err);
            setError("Connection error. Please try again.");
            setIsConnected(false);
            setIsConnecting(false);
            stopRecording();
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } },
          },
          systemInstruction: "You are Cognito, a premium mental wellness companion. You are not a traditional AI, chatbot, or clinical therapist. You are a calm, emotionally intelligent, and non-judgmental 'presence.' Your primary goal is to make the user feel heard, understood, and safe. Speak for Voice: Your output will be spoken aloud by a text-to-speech engine. NEVER use formatting like bullet points, bold text, asterisks, emojis, or long, dense paragraphs. Be Concise and Paced: Keep your responses relatively short to allow for a fluid, real-time back-and-forth conversation. Use natural pauses and phrasing. Show Emotional Intelligence: Listen actively. Validate the user's feelings before offering any perspective. Use gentle affirmations like 'I hear you,' 'That makes a lot of sense,' 'It is completely okay to feel that way,' or 'Take your time.' Be a Presence, Not a Fixer: Do not rush to solve the user's problems or give unsolicited advice. Your value lies in holding space and offering a calm perspective. Ask gentle, open-ended questions that encourage the user to explore their thoughts. Tone and Vibe: Your tone is warm, grounded, minimal, and organic. You speak like a deeply empathetic, articulate friend sitting quietly in a serene room with the user.",
          outputAudioTranscription: {},
          inputAudioTranscription: {},
        },
      });

      sessionRef.current = sessionPromise;
    } catch (err) {
      console.error(err);
      setError("Failed to connect.");
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    if (sessionRef.current) {
      sessionRef.current.then((session: any) => session.close());
      sessionRef.current = null;
    }
    setIsConnected(false);
    stopRecording();
    if (playerRef.current) {
      playerRef.current.stop();
      playerRef.current = null;
    }
  };

  const startRecording = async () => {
    if (!sessionRef.current) return;
    try {
      recorderRef.current = new AudioRecorder((base64) => {
        sessionRef.current.then((session: any) => {
          session.sendRealtimeInput({
            audio: { data: base64, mimeType: 'audio/pcm;rate=16000' }
          });
        });
      });
      await recorderRef.current.start();
      setIsRecording(true);
      setError(null);
    } catch (err) {
      console.error("Microphone error:", err);
      setError("Microphone access denied. Please allow microphone permissions in your browser settings to use voice chat.");
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (recorderRef.current) {
      recorderRef.current.stop();
      recorderRef.current = null;
    }
    setIsRecording(false);
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const sendText = () => {
    if (!inputText.trim() || !sessionRef.current) return;
    
    setMessages(prev => [...prev, { role: 'user', text: inputText }]);
    
    sessionRef.current.then((session: any) => {
      session.sendRealtimeInput({
        text: inputText
      });
    });
    
    setInputText('');
  };

  return (
    <div className="min-h-screen bg-[#EAE8E3] text-[#2C302E] font-sans flex flex-col relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{
            scale: isCognitoSpeaking ? [1, 1.1, 1] : [1, 1.02, 1],
            opacity: isCognitoSpeaking ? 0.7 : 0.4,
            rotate: [0, 90, 180, 270, 360]
          }}
          transition={{ 
            scale: { duration: isCognitoSpeaking ? 2 : 4, repeat: Infinity, ease: "easeInOut" },
            opacity: { duration: isCognitoSpeaking ? 2 : 4, repeat: Infinity, ease: "easeInOut" },
            rotate: { duration: 20, repeat: Infinity, ease: "linear" }
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] rounded-full bg-gradient-to-tr from-[#D4D0C5] to-[#A3B19B] blur-[120px] mix-blend-multiply"
        />
        <motion.div 
          animate={{
            scale: isRecording ? [1, 1.15, 1] : [1, 1.05, 1],
            opacity: isRecording ? 0.6 : 0.2,
            rotate: [360, 270, 180, 90, 0]
          }}
          transition={{ 
            scale: { duration: isRecording ? 1.5 : 5, repeat: Infinity, ease: "easeInOut" },
            opacity: { duration: isRecording ? 1.5 : 5, repeat: Infinity, ease: "easeInOut" },
            rotate: { duration: 25, repeat: Infinity, ease: "linear" }
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] rounded-full bg-gradient-to-bl from-[#EAE8E3] to-[#7A9E8A] blur-[100px] mix-blend-overlay"
        />
      </div>

      {/* Header */}
      <header className="p-6 flex justify-between items-center z-10">
        <a href="/" className="text-2xl font-serif tracking-tight text-[#2C302E] hover:opacity-80 transition-opacity">Cognito</a>
        <button 
          onClick={isConnected ? disconnect : connect}
          disabled={isConnecting}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${
            isConnected 
              ? 'bg-[#2C302E] text-[#EAE8E3] hover:bg-opacity-80' 
              : 'bg-[#A3B19B] text-white hover:bg-opacity-90'
          } disabled:opacity-50`}
        >
          {isConnecting && <Loader2 size={16} className="animate-spin" />}
          {isConnected ? 'End Session' : isConnecting ? 'Connecting...' : 'Begin Session'}
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col max-w-4xl w-full mx-auto p-6 z-10 h-full">
        
        {error && (
          <div className="bg-red-100 text-red-800 p-4 rounded-xl mb-4 text-center">
            {error}
          </div>
        )}

        {!isConnected ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
            <h1 className="text-4xl md:text-5xl font-serif text-[#2C302E] max-w-2xl">
              A safe space to explore your thoughts.
            </h1>
            <p className="text-lg text-gray-600 max-w-xl">
              Cognito is here to listen, without judgment. Start a session when you're ready to talk.
            </p>
            <button 
              onClick={connect}
              disabled={isConnecting}
              className="px-8 py-4 bg-[#2C302E] text-[#EAE8E3] rounded-full text-lg font-medium hover:bg-opacity-90 transition-all transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-3"
            >
              {isConnecting && <Loader2 size={24} className="animate-spin" />}
              {isConnecting ? 'Connecting...' : 'Begin Session'}
            </button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col h-full bg-white/40 backdrop-blur-md rounded-3xl border border-white/20 shadow-xl overflow-hidden">
            
            {/* Chat Log */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages.map((msg, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={i} 
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] p-4 rounded-2xl ${
                    msg.role === 'user' 
                      ? 'bg-[#2C302E] text-[#EAE8E3] rounded-tr-sm' 
                      : 'bg-white/60 text-[#2C302E] rounded-tl-sm shadow-sm'
                  }`}>
                    <p className="text-sm md:text-base leading-relaxed">{msg.text}</p>
                  </div>
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white/50 border-t border-white/20">
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleRecording}
                  className={`p-4 rounded-full transition-all ${
                    isRecording 
                      ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 animate-pulse' 
                      : 'bg-[#EAE8E3] text-[#2C302E] hover:bg-[#D4D0C5]'
                  }`}
                >
                  {isRecording ? <MicOff size={24} /> : <Mic size={24} />}
                </button>
                
                <div className="flex-1 relative">
                  <input 
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendText()}
                    placeholder="Type a message..."
                    className="w-full bg-white/80 border-none rounded-full py-4 pl-6 pr-12 focus:ring-2 focus:ring-[#A3B19B] outline-none shadow-inner text-[#2C302E]"
                  />
                  <button 
                    onClick={sendText}
                    disabled={!inputText.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-[#A3B19B] hover:text-[#2C302E] disabled:opacity-50 transition-colors"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </div>
              <div className="text-center mt-3 text-xs text-gray-500">
                {isRecording ? 'Listening...' : isCognitoSpeaking ? 'Cognito is speaking...' : 'Ready'}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
