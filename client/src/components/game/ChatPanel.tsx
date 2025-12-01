import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Send, MessageCircle } from 'lucide-react';

interface ChatMessage {
  id: string;
  playerId: string;
  playerName: string;
  message: string;
  emoji?: string;
  timestamp: number;
}

interface ChatPanelProps {
  playerId: string;
  playerName: string;
  messages: ChatMessage[];
  onSendMessage: (message: string, emoji?: string) => void;
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
  unreadCount?: number;
}

const EMOJIS = [
  { id: 'happy', emoji: '😊', label: 'Feliz' },
  { id: 'suspicious', emoji: '🤨', label: 'Desconfiado' },
  { id: 'shocked', emoji: '😱', label: 'Chocado' },
  { id: 'thinking', emoji: '🤔', label: 'Pensativo' },
  { id: 'angry', emoji: '😠', label: 'Bravo' },
  { id: 'cool', emoji: '😎', label: 'Confiante' },
];

export default function ChatPanel({
  playerId,
  playerName,
  messages,
  onSendMessage,
  isMinimized = false,
  onToggleMinimize,
  unreadCount = 0,
}: ChatPanelProps) {
  const [inputMessage, setInputMessage] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState<string | undefined>();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (inputMessage.trim() || selectedEmoji) {
      onSendMessage(inputMessage.trim(), selectedEmoji);
      setInputMessage('');
      setSelectedEmoji(undefined);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (isMinimized) {
    return (
      <Button
        variant="outline"
        className="fixed bottom-4 left-4 z-50 bg-background/80 backdrop-blur-sm rounded-full w-16 h-16 p-0 shadow-lg hover-elevate relative"
        onClick={onToggleMinimize}
      >
        <MessageCircle className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-4 left-4 z-50 w-80 h-96 bg-background/95 backdrop-blur-sm border-primary/30 flex flex-col shadow-2xl">
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-primary" />
          <span className="font-semibold text-sm">Chat</span>
        </div>
        {onToggleMinimize && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={onToggleMinimize}
          >
            ×
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2 ${msg.playerId === playerId ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-2 ${
                msg.playerId === playerId
                  ? 'bg-primary/20 text-primary-foreground'
                  : 'bg-muted'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold">{msg.playerName}</span>
                {msg.emoji && <span className="text-sm">{msg.emoji}</span>}
              </div>
              {msg.message && (
                <p className="text-sm break-words">{msg.message}</p>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 border-t border-border space-y-2">
        <div className="flex gap-1 justify-between">
          {EMOJIS.map((emoji) => (
            <Button
              key={emoji.id}
              variant={selectedEmoji === emoji.emoji ? 'default' : 'ghost'}
              size="sm"
              className="h-8 w-8 p-0 text-lg"
              onClick={() => setSelectedEmoji(emoji.emoji)}
              title={emoji.label}
            >
              {emoji.emoji}
            </Button>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Digite uma mensagem..."
            className="flex-1 text-sm"
            maxLength={200}
          />
          <Button
            size="sm"
            onClick={handleSend}
            disabled={!inputMessage.trim() && !selectedEmoji}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
