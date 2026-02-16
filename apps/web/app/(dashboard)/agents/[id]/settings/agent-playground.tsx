'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Mic, Send, Bot, User, Volume2, StopCircle, Wifi, WifiOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'

import { Phone, Square } from 'lucide-react'
import { Card } from '@/components/ui/card'

interface Message {
  role: 'user' | 'assistant'
  content: string
  isStreaming?: boolean
}

interface AgentPlaygroundProps {
  systemPrompt: string
  voiceId?: string
}

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error'

export function AgentPlayground({ systemPrompt, voiceId, agentId }: AgentPlaygroundProps & { agentId?: string }) {
  const { toast } = useToast()
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hola, soy tu agente de prueba. Configura mi prompt a la izquierda y pruébame aquí.' }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected')
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const [isWebCallActive, setIsWebCallActive] = useState(false)
  const [webSocket, setWebSocket] = useState<WebSocket | null>(null)
  const [transcript, setTranscript] = useState("")
  const recognitionRef = useRef<any>(null)
  const synthRef = useRef<any>(null)
  const [audioEnabled, setAudioEnabled] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Web Speech API for "Free" Testing
  useEffect(() => {
    if (typeof window !== 'undefined') {
       const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
       if (SpeechRecognition) {
         recognitionRef.current = new SpeechRecognition();
         recognitionRef.current.continuous = false;
         recognitionRef.current.lang = 'es-ES';
         recognitionRef.current.interimResults = false;
         
         recognitionRef.current.onresult = (event: any) => {
           const text = event.results[0][0].transcript;
           setTranscript(text);
           // Send to WebSocket
           if (webSocket && webSocket.readyState === WebSocket.OPEN) {
             webSocket.send(JSON.stringify({ type: 'conversation_input', text }));
           }
         };
         
         recognitionRef.current.onend = () => {
            // Restart if active? For now, manual turn taking or auto-restart
            if (isWebCallActive) {
                // recognitionRef.current.start(); 
            }
         };
       }
       
       synthRef.current = window.speechSynthesis;
    }
  }, [webSocket, isWebCallActive])

  const startWebCall = () => {
    // Check browser support
    if (!recognitionRef.current) {
        toast({
            title: "Navegador no soportado",
            description: "Tu navegador no soporta reconocimiento de voz. Usa Chrome o Edge.",
            variant: "destructive"
        })
        return;
    }

    setIsLoading(true);
    setConnectionStatus('connecting');

    try {
        console.log("Starting WebCall...");
        // Connect to local WebSocket - Use 127.0.0.1 to avoid IPv6 issues
        const ws = new WebSocket('ws://127.0.0.1:8080/connection');
        
        ws.onopen = () => {
          console.log('Connected to Voice Server');
          ws.send(JSON.stringify({ type: 'setup', agentId: agentId || 'test-agent' }));
          setIsWebCallActive(true);
          setIsLoading(false);
          setConnectionStatus('connected');
          
          // Start listening
          try {
              recognitionRef.current.start();
          } catch (e) {
              console.error("Error starting mic:", e);
              toast({ title: "Error Micrófono", description: "No se pudo iniciar el micrófono.", variant: "destructive" });
          }
          
          // Auto-enable audio for calls
          setAudioEnabled(true);
        };
        
        ws.onerror = (error) => {
            console.error("WebSocket Error:", error);
            setIsLoading(false);
            setConnectionStatus('error');
            toast({ 
                title: "Error de Conexión", 
                description: "No se pudo conectar al servidor de voz (ws://127.0.0.1:8080). Asegúrate de que el servidor esté corriendo.", 
                variant: "destructive" 
            });
        };

        ws.onmessage = (event) => {
          const data = JSON.parse(event.data);
          if (data.type === 'audio_delta') {
             // Accumulate response for display
             setMessages(prev => {
                 const last = prev[prev.length - 1];
                 if (last && last.role === 'assistant' && last.isStreaming) {
                     return [...prev.slice(0, -1), { ...last, content: last.content + data.text }];
                 } else {
                     return [...prev, { role: 'assistant', content: data.text, isStreaming: true }];
                 }
             });
          }
    
          if (data.type === 'end_of_turn') {
             // Speak the full last message
             setMessages(prev => {
                 const last = prev[prev.length - 1];
                 if (last && last.role === 'assistant') {
                     speakResponse(last.content); // Use existing TTS function
                     return [...prev.slice(0, -1), { ...last, isStreaming: false }];
                 }
                 return prev;
             });
             
             // Re-enable mic
             setTimeout(() => {
                 if (recognitionRef.current && isWebCallActive) {
                     try { recognitionRef.current.start(); } catch(e){}
                 }
             }, 1000);
          }
        };
        
        ws.onclose = (event) => {
            console.log("WebSocket Closed:", event.code, event.reason);
            if (isWebCallActive) {
                setIsWebCallActive(false);
                toast({ title: "Desconectado", description: "La conexión con el servidor se cerró." });
            }
        };
        
        setWebSocket(ws);
    } catch (error) {
        console.error("Setup Error:", error);
        setIsLoading(false);
        toast({ title: "Error Interno", description: "Falló la configuración de la llamada.", variant: "destructive" });
    }
  };

  const endWebCall = () => {
    if (webSocket) webSocket.close();
    if (recognitionRef.current) recognitionRef.current.stop();
    window.speechSynthesis.cancel();
    setIsWebCallActive(false);
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return

    const newMessages = [...messages, { role: 'user', content: text } as Message]
    setMessages(newMessages)
    setInput('')
    setIsLoading(true)

    // If WebCall is active, send to WebSocket
    if (isWebCallActive && webSocket && webSocket.readyState === WebSocket.OPEN) {
        try {
            webSocket.send(JSON.stringify({ type: 'conversation_input', text }));
            // Loading state will be handled by response stream or end_of_turn
            // But we can keep it true until first token? 
            // The current logic doesn't toggle isLoading on stream, so let's leave it?
            // Wait, ws.onmessage doesn't turn off isLoading. 
            // Actually startWebCall turns off isLoading on Connect.
            // So if we are here, isLoading is false.
            // We set it true above. We should probably set it false when we get response.
            // But we don't have a clear "response start" event in the current code other than audio_delta.
            // Let's just set it false immediately for now or rely on the stream.
            setIsLoading(false); 
        } catch (e) {
            console.error(e);
            setIsLoading(false);
        }
        return;
    }

    try {
      const response = await fetch('/api/agents/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          systemPrompt: systemPrompt,
          agentId: agentId
        })
      })

      if (!response.ok) throw new Error('Failed to fetch response')

      const data = await response.json()
      const assistantMessage = { role: 'assistant', content: data.content } as Message
      setMessages(prev => [...prev, assistantMessage])
      
      // Auto-play TTS if enabled
      if (audioEnabled) {
        speakResponse(data.content)
      }

    } catch (error) {
      console.error(error)
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error al conectar con el simulador.' }])
    } finally {
      setIsLoading(false)
    }
  }

  const speakResponse = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel() // Stop previous
      const utterance = new SpeechSynthesisUtterance(text)
      // Try to pick a voice roughly matching the ID or just default
      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
      window.speechSynthesis.speak(utterance)
    }
  }

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }

  const startRecording = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
      const recognition = new SpeechRecognition()
      recognition.lang = 'es-ES'
      recognition.interimResults = false
      recognition.maxAlternatives = 1

      recognition.onstart = () => setIsRecording(true)
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setInput(transcript)
        handleSendMessage(transcript) // Auto-send on voice end
      }

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error)
        setIsRecording(false)
      }

      recognition.onend = () => setIsRecording(false)

      recognition.start()
    } else {
      alert('Tu navegador no soporta reconocimiento de voz.')
    }
  }

  const stopRecording = () => {
    setIsRecording(false)
    // The recognition instance is not stored in ref here for simplicity, 
    // relying on auto-stop or "onend". For a robust implementation, use a ref.
  }

  const stopSpeaking = () => {
    if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
    }
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel()
    }
    setIsSpeaking(false)
  }

  return (
    <Card className="flex flex-col h-[600px] border-l-0 rounded-l-none shadow-none">
      <div className="p-3 border-b flex flex-col sm:flex-row justify-between items-center bg-gray-50/50 gap-2">
        <h3 className="font-semibold text-gray-700 flex items-center gap-2 text-sm">
          <Phone className="w-4 h-4" />
          Simulador
        </h3>
        <div className="flex gap-1 w-full sm:w-auto justify-end">
           <Button
             variant={audioEnabled ? "default" : "outline"}
             size="sm"
             onClick={() => setAudioEnabled(!audioEnabled)}
             className={cn("text-xs h-8 gap-2", audioEnabled ? "bg-blue-600 hover:bg-blue-700" : "text-gray-500")}
             title={audioEnabled ? "Audio Activado" : "Audio Desactivado (Solo Texto)"}
           >
             {audioEnabled ? <Volume2 className="w-3 h-3" /> : <Volume2 className="w-3 h-3 opacity-50" />}
             {audioEnabled ? "Voz" : "Silencio"}
           </Button>

           {!isWebCallActive ? (
             <Button 
               variant="default" 
               size="sm" 
               className="bg-green-600 hover:bg-green-700 text-white gap-2 text-xs h-8"
               onClick={startWebCall}
             >
               <Phone className="w-3 h-3" />
               Llamar
             </Button>
           ) : (
             <Button 
               variant="destructive" 
               size="sm" 
               className="gap-2 animate-pulse text-xs h-8"
               onClick={endWebCall}
             >
               <Square className="w-3 h-3" />
               Cortar
             </Button>
           )}
           <Button variant="ghost" size="sm" onClick={() => setMessages([])} className="text-xs h-8">
             Limpiar
           </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50" ref={scrollRef}>
        {messages.map((m, i) => (
          <div key={i} className={cn(
            "flex gap-3 max-w-[85%]",
            m.role === 'user' ? "ml-auto flex-row-reverse" : ""
          )}>
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
              m.role === 'user' ? "bg-primary text-primary-foreground" : "bg-muted border"
            )}>
              {m.role === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>
            <div className={cn(
              "p-3 rounded-2xl text-sm",
              m.role === 'user' 
                ? "bg-primary text-primary-foreground rounded-tr-none" 
                : "bg-white border shadow-sm rounded-tl-none"
            )}>
              {m.content}
            </div>
          </div>
        ))}
        {isLoading && (
           <div className="flex gap-3 max-w-[85%]">
             <div className="w-8 h-8 rounded-full bg-muted border flex items-center justify-center shrink-0">
               <Bot size={16} />
             </div>
             <div className="bg-white border shadow-sm rounded-2xl rounded-tl-none p-4 flex items-center gap-1">
               <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
               <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
               <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
             </div>
           </div>
        )}
      </div>

      <div className="p-4 border-t bg-background">
        <div className="flex gap-2">
          <Input 
            value={input} 
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(input)}
            placeholder="Escribe un mensaje..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button 
            size="icon" 
            variant={isRecording ? "destructive" : "outline"}
            onClick={toggleRecording}
            disabled={isLoading}
            title="Hablar"
          >
            <Mic size={18} className={isRecording ? "animate-pulse" : ""} />
          </Button>
          <Button 
            size="icon" 
            onClick={() => handleSendMessage(input)}
            disabled={!input.trim() || isLoading}
          >
            <Send size={18} />
          </Button>
        </div>
      </div>
    </Card>
  )
}
