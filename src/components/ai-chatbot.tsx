import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Send, Bot, User, Heart, Loader2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: string;
}

export function AIChatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: 'Halo! Saya di sini untuk mendengarkan curhatan kamu. Ceritakan apa yang ada di pikiranmu hari ini. Ingat, ini adalah ruang yang aman untuk mengekspresikan perasaanmu.',
      timestamp: new Date().toISOString()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Load messages from localStorage
  useEffect(() => {
    const savedMessages = localStorage.getItem('aiChatMessages');
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages);
        if (parsed.length > 0) {
          setMessages(parsed);
        }
      } catch (error) {
        console.error('Error loading chat messages:', error);
      }
    }
  }, []);

  // Save messages to localStorage
  useEffect(() => {
    localStorage.setItem('aiChatMessages', JSON.stringify(messages));
  }, [messages]);

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-e0055e13/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({ 
          message: input.trim(),
          conversationHistory: messages.slice(-10) // Send last 10 messages for context
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('AI chat error response:', errorText);
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: data.response,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message to AI:', error);
      toast.error('Terjadi kesalahan saat mengirim pesan. Silakan coba lagi.');
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: 'Maaf, saya sedang mengalami kesulitan teknis. Silakan coba lagi dalam beberapa saat. Sementara itu, ingatlah bahwa perasaan yang kamu alami itu valid dan kamu tidak sendirian.',
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: '1',
        type: 'ai',
        content: 'Halo! Saya di sini untuk mendengarkan curhatan kamu. Ceritakan apa yang ada di pikiranmu hari ini. Ingat, ini adalah ruang yang aman untuk mengekspresikan perasaanmu.',
        timestamp: new Date().toISOString()
      }
    ]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">AI Companion</h2>
          <p className="text-white/70">Ruang aman untuk curhat dan berbagi perasaan</p>
        </div>
        <Button 
          variant="outline" 
          onClick={clearChat}
          className="bg-white/10 border-white/20 text-white hover:bg-white/20"
        >
          Mulai Chat Baru
        </Button>
      </div>

      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-white">
            <Bot className="h-5 w-5" />
            Percakapan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ScrollArea 
            ref={scrollAreaRef}
            className="h-[400px] w-full pr-4"
          >
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start gap-3 ${
                    message.type === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                    message.type === 'user' 
                      ? 'bg-blue-500' 
                      : 'bg-gradient-to-br from-purple-500 to-pink-500'
                  }`}>
                    {message.type === 'user' ? (
                      <User className="h-4 w-4 text-white" />
                    ) : (
                      <Heart className="h-4 w-4 text-white" />
                    )}
                  </div>
                  <div className={`flex-1 max-w-[80%] ${
                    message.type === 'user' ? 'text-right' : 'text-left'
                  }`}>
                    <div className={`inline-block p-3 rounded-lg ${
                      message.type === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-white/20 text-white border border-white/20'
                    }`}>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {message.content}
                      </p>
                      <p className="text-xs opacity-70 mt-1">
                        {new Date(message.timestamp).toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
                    <Heart className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="inline-block p-3 rounded-lg bg-white/20 border border-white/20">
                      <div className="flex items-center gap-2 text-white">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm">Sedang mengetik...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Tulis curhatanmu di sini..."
              disabled={isLoading}
              className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/40"
            />
            <Button 
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/5 backdrop-blur-sm border-white/10">
        <CardContent className="p-4">
          <div className="flex items-start gap-3 text-sm text-white/80">
            <Heart className="h-4 w-4 text-pink-300 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium mb-1">Catatan Penting:</p>
              <p className="leading-relaxed">
                AI Companion ini dirancang untuk memberikan dukungan emosional dan mendengarkan curhatanmu. 
                Namun, jika kamu mengalami krisis atau pikiran untuk menyakiti diri sendiri, 
                segera hubungi tenaga medis profesional atau hotline kesehatan mental.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}