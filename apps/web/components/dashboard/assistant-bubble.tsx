'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Send, Bot, User, Mic, MicOff, X, Volume2, VolumeX } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { AnimatePresence, motion } from 'framer-motion'

// Custom Modern Robot Icon Component
function ModernRobotIcon({ className }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect x="4" y="8" width="16" height="10" rx="2" stroke="currentColor" strokeWidth="2"/>
      <path d="M6 13H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M16 13H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M9 4L10.5 8" stroke="currentColor" strokeWidth="2"/>
      <path d="M15 4L13.5 8" stroke="currentColor" strokeWidth="2"/>
      <circle cx="9" cy="4" r="1.5" fill="currentColor"/>
      <circle cx="15" cy="4" r="1.5" fill="currentColor"/>
      <path d="M9 16C9 16 10 17 12 17C14 17 15 16 15 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

type Message = {
  role: 'assistant' | 'user'
  content: string
}

export function AssistantBubble() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'assistant', 
      content: '¡Hola! Estoy aquí para ayudarte en cualquier momento. ¿Tienes alguna duda sobre la plataforma?' 
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isSoundEnabled, setIsSoundEnabled] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const recognitionRef = useRef<any>(null)

  const { toast } = useToast()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
      // Optional: focus input when opening
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [isOpen, messages, isLoading])

  // Speech Recognition Logic (Reused from ChatInterface)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition()
        recognition.continuous = false
        recognition.interimResults = false
        recognition.lang = 'es-ES'

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript
          setInput(transcript)
          setIsListening(false)
        }

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error', event.error)
          setIsListening(false)
          if (event.error !== 'no-speech' && event.error !== 'aborted') {
            toast({
              variant: "destructive",
              title: "Error de micrófono",
              description: "No pudimos escucharte. Verifica los permisos.",
            })
          }
        }

        recognition.onend = () => setIsListening(false)
        recognitionRef.current = recognition
      }
    }
    
    return () => {
      if (recognitionRef.current) recognitionRef.current.abort()
    }
  }, [toast])

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast({
        variant: "destructive",
        title: "No soportado",
        description: "Tu navegador no soporta reconocimiento de voz.",
      })
      return
    }

    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      try {
        recognitionRef.current.start()
        setIsListening(true)
      } catch (error) {
        console.error("Error starting speech recognition:", error)
        recognitionRef.current.stop()
        setTimeout(() => {
           try { recognitionRef.current.start(); setIsListening(true); } catch(e) {}
        }, 100)
      }
    }
  }

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage = { role: 'user' as const, content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      })

      const data = await response.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.content }])
      
      // Auto-play TTS if enabled
      if (isSoundEnabled && 'speechSynthesis' in window) {
         window.speechSynthesis.cancel()
         const utterance = new SpeechSynthesisUtterance(data.content)
         utterance.lang = 'es-ES'
         window.speechSynthesis.speak(utterance)
      }

    } catch (error) {
      console.error('Failed to send message:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "No pudimos conectar con el asistente.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="origin-bottom-right"
          >
            <Card className="w-[350px] sm:w-[400px] h-[500px] flex flex-col shadow-2xl border-primary/20">
              <CardHeader className="bg-primary/5 border-b p-4 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="flex items-center gap-2 text-base">
                  <ModernRobotIcon className="w-6 h-6 text-primary" />
                  <span>Asistente Virtual</span>
                </CardTitle>
                <div className="flex items-center gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8" 
                    onClick={() => setIsSoundEnabled(!isSoundEnabled)}
                    title={isSoundEnabled ? "Silenciar" : "Activar Voz"}
                  >
                    {isSoundEnabled ? <Volume2 size={18} className="text-primary" /> : <VolumeX size={18} className="text-muted-foreground" />}
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsOpen(false)}>
                    <X size={18} />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex items-start gap-2 ${
                      msg.role === 'assistant' ? 'flex-row' : 'flex-row-reverse'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      msg.role === 'assistant' ? 'bg-primary/10 text-primary' : 'bg-gray-200 text-gray-700'
                    }`}>
                      {msg.role === 'assistant' ? <ModernRobotIcon className="w-5 h-5" /> : <User size={14} />}
                    </div>
                    
                    <div className={`rounded-lg p-2.5 max-w-[85%] text-sm ${
                      msg.role === 'assistant' 
                        ? 'bg-gray-100 text-gray-900' 
                        : 'bg-primary text-primary-foreground'
                    }`}>
                      <p>{msg.content}</p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex items-center gap-2 text-muted-foreground text-xs ml-8">
                    <span className="animate-pulse">Escribiendo...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </CardContent>

              <CardFooter className="border-t p-3 bg-gray-50/50">
                <form 
                  className="flex w-full gap-2"
                  onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
                >
                  <Input 
                    ref={inputRef}
                    value={input} 
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Escribe tu duda..."
                    disabled={isLoading}
                    className="flex-1 h-9 text-sm"
                  />
                  <Button 
                    type="button"
                    variant="ghost" 
                    size="icon"
                    onClick={toggleListening}
                    className={`h-9 w-9 ${isListening ? "text-red-500 bg-red-50" : ""}`}
                  >
                    {isListening ? <MicOff size={16} /> : <Mic size={16} />}
                  </Button>
                  <Button type="submit" size="icon" disabled={isLoading} className="h-9 w-9">
                    <Send size={16} />
                  </Button>
                </form>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        size="icon"
        className={`h-16 w-16 rounded-full shadow-lg hover:scale-105 transition-transform duration-200 ${isOpen ? 'bg-red-500 hover:bg-red-600' : 'bg-primary hover:bg-primary/90'}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={28} /> : <ModernRobotIcon className="w-8 h-8 text-white" />}
      </Button>
    </div>
  )
}
