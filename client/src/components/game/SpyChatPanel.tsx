import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Send, Eye, EyeOff } from 'lucide-react';

interface ChatMessage {
  id: string;
  playerId: string;
  playerName: string;
  message: string;
  emoji?: string;
  timestamp: number;
}

interface SpyChatPanelProps {
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

export default function SpyChatPanel({
  playerId,
  playerName,
  messages,
  onSendMessage,
  isMinimized = false,
  onToggleMinimize,
  unreadCount = 0,
}: SpyChatPanelProps) {
  const [inputMessage, setInputMessage] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState<string | undefined>();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (inputMessage.trim()) {
      onSendMessage(inputMessage.trim(), selectedEmoji);
      setInputMessage('');
      setSelectedEmoji(undefined);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  if (isMinimized) {
    return (
      <Button
        variant="outline"
        className="fixed bottom-24 right-4 z-50 bg-red-900/80 backdrop-blur-sm border-red-500/50 text-red-300 hover:bg-red-800/80 hover:text-red-200 shadow-lg shadow-red-500/20 rounded-full w-14 h-14 p-0 relative"
        onClick={onToggleMinimize}
      >
        <Eye className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1 animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-24 right-4 z-50 w-80 h-96 bg-red-950/95 backdrop-blur-sm border-red-500/50 flex flex-col shadow-lg shadow-red-500/20">
      <div className="flex items-center justify-between p-3 border-b border-red-500/30">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-red-400" />
          <span className="font-semibold text-sm text-red-300">Chat Secreto</span>
        </div>
        {onToggleMinimize && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-red-400 hover:text-red-300"
            onClick={onToggleMinimize}
          >
            <EyeOff className="w-4 h-4" />
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.length === 0 ? (
          <p className="text-center text-red-400/50 text-sm mt-8">
            Nenhuma mensagem secreta ainda...
          </p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`p-2 rounded ${
                msg.playerId === playerId
                  ? 'bg-red-800/50 ml-4'
                  : 'bg-red-900/50 mr-4'
              }`}
            >
              <div className="flex items-center gap-1 mb-1">
                {msg.emoji && <span className="text-sm">{msg.emoji}</span>}
                <span className="font-semibold text-xs text-red-300">
                  {msg.playerName}
                </span>
              </div>
              <p className="text-sm text-red-100">{msg.message}</p>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 border-t border-red-500/30 space-y-2">
        <div className="flex gap-1">
          {EMOJIS.map((emoji) => (
            <button
              key={emoji.id}
              onClick={() => setSelectedEmoji(selectedEmoji === emoji.emoji ? undefined : emoji.emoji)}
              className={`text-lg hover:scale-110 transition-transform ${
                selectedEmoji === emoji.emoji ? 'scale-125' : ''
              }`}
              title={emoji.label}
            >
              {emoji.emoji}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Mensagem secreta..."
            maxLength={200}
            className="bg-red-900/50 border-red-500/30 text-red-100 placeholder:text-red-400/50"
          />
          <Button
            onClick={handleSend}
            disabled={!inputMessage.trim()}
            size="icon"
            className="bg-red-700 hover:bg-red-600 text-white"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
