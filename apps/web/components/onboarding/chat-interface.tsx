'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Send, Bot, User, Mic, MicOff } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createAgent } from '@/app/onboarding/actions'
import { useToast } from '@/hooks/use-toast'

type Message = {
  role: 'assistant' | 'user'
  content: string
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'assistant', 
      content: '¡Hola! Soy tu asistente de configuración inteligente. Vamos a crear tu primer Agente de Voz en menos de un minuto. Primero, ¿cómo te gustaría llamar a tu agente?' 
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const recognitionRef = useRef<any>(null)

  const router = useRouter()
  const { toast } = useToast()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Auto-focus input when messages change (user turn)
  useEffect(() => {
    scrollToBottom()
    if (!isLoading) {
      const timer = setTimeout(() => inputRef.current?.focus(), 100)
      return () => clearTimeout(timer)
    }
  }, [messages, isLoading])

  // Initialize Speech Recognition on Mount
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
          
          // Don't show toast for "no-speech" or "aborted" as it can be annoying
          if (event.error !== 'no-speech' && event.error !== 'aborted') {
            toast({
              variant: "destructive",
              title: "Error de micrófono",
              description: "No pudimos escucharte. Verifica los permisos.",
            })
          }
        }

        recognition.onend = () => {
          setIsListening(false)
        }

        recognitionRef.current = recognition
      }
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
    }
  }, [toast]) // Toast is stable enough, but ideally this runs once.

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast({
        variant: "destructive",
        title: "Navegador no soportado",
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
        // If it was already started, we might need to stop first
        recognitionRef.current.stop()
        setTimeout(() => {
           try { recognitionRef.current.start(); setIsListening(true); } catch(e) {}
        }, 100)
      }
    }
  }

  const handleFinish = async () => {
    try {
      // Use Server Action for reliable creation
      const agentName = messages[1]?.content || 'Mi Primer Agente'
      const result = await createAgent(agentName)

      if (result.success) {
        toast({
          title: "¡Agente Creado!",
          description: "Redirigiendo al dashboard...",
        })
        // Force hard navigation to ensure cache revalidation
        window.location.href = '/'
      } else {
        throw new Error(result.error)
      }
    } catch (error: any) {
      console.error('Error creating agent:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Hubo un problema al crear el agente.",
      })
    }
  }

  const sendMessage = async (overrideInput?: string) => {
    const textToSend = overrideInput || input
    if (!textToSend.trim() || isLoading) return

    const userMessage = { role: 'user' as const, content: textToSend }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      })

      const data = await response.json()
      
      setMessages(prev => [...prev, { role: 'assistant', content: data.content }])

      if (data.nextStep === 'finish') {
        setTimeout(() => handleFinish(), 1500)
      }

    } catch (error) {
      console.error('Failed to send message:', error)
      toast({
        variant: "destructive",
        title: "Error de conexión",
        description: "No pudimos conectar con la IA.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl h-[600px] flex flex-col shadow-xl">
      <CardHeader className="border-b bg-gray-50/50">
        <CardTitle className="flex items-center gap-2">
          <Bot className="w-6 h-6 text-primary" />
          <span>Configuración Asistida</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex items-start gap-3 ${
              msg.role === 'assistant' ? 'flex-row' : 'flex-row-reverse'
            }`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
              msg.role === 'assistant' ? 'bg-primary/10 text-primary' : 'bg-gray-200 text-gray-700'
            }`}>
              {msg.role === 'assistant' ? <Bot size={18} /> : <User size={18} />}
            </div>
            
            <div className={`rounded-lg p-3 max-w-[80%] ${
              msg.role === 'assistant' 
                ? 'bg-gray-100 text-gray-900' 
                : 'bg-primary text-primary-foreground'
            }`}>
              <p className="text-sm leading-relaxed">{msg.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
           <div className="flex items-start gap-3">
             <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
               <Bot size={18} />
             </div>
             <div className="bg-gray-100 rounded-lg p-3">
               <div className="flex space-x-2">
                 <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                 <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75" />
                 <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150" />
               </div>
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </CardContent>

      <CardFooter className="border-t p-4">
        <form 
          className="flex w-full gap-2"
          onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
        >
          <Input 
            ref={inputRef}
            value={input} 
            onChange={(e) => setInput(e.target.value)}
            placeholder={isListening ? "Escuchando..." : "Escribe tu respuesta..."}
            disabled={isLoading}
            className="flex-1"
          />
          <Button 
            type="button"
            variant="outline" 
            size="icon"
            onClick={toggleListening}
            className={isListening ? "text-red-500 border-red-500 animate-pulse" : ""}
            title="Usar micrófono"
          >
            {isListening ? <MicOff size={18} /> : <Mic size={18} />}
          </Button>
          <Button type="submit" disabled={isLoading || (!input.trim() && !isListening)}>
            <Send size={18} />
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}
