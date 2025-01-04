import React, { useState, useRef, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Bot, Send, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { useAIAgent } from '@/hooks/useAIAgent';
import { WalletState } from '@/types/wallet';
import { AIResponse } from '@/lib/ai/agent';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  status?: 'success' | 'warning' | 'error';
}

interface AIAssistantProps {
  walletState: WalletState;
  onTransactionAdvice?: (approved: boolean) => void;
}

export function AIAssistant({ walletState, onTransactionAdvice }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    isThinking,
    askAI,
    error
  } = useAIAgent(walletState);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'initial',
          type: 'assistant',
          content: `Hello! I'm your AI financial assistant. I can help you manage your wallet, evaluate transactions, and provide financial insights. Your current balance is ${walletState.balance} SOL. How can I assist you today?`,
          timestamp: new Date(),
        }
      ]);
    }
  }, []);

  const handleAIResponse = (response: AIResponse) => {
    if (response.actions?.primary) {
      onTransactionAdvice?.(response.actions.primary.action === 'proceed');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isThinking) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    try {
      const response = await askAI(inputValue);
      
      let status: Message['status'] = undefined;
      if (response.actions?.primary?.action === 'proceed') status = 'success';
      if (response.actions?.primary?.action === 'reject') status = 'error';
      if (response.type === 'warning') status = 'warning';

      const aiMessage: Message = {
        id: Date.now().toString(),
        type: 'assistant',
        content: response.message,
        timestamp: new Date(),
        status
      };

      setMessages(prev => [...prev, aiMessage]);

      if (response.actions?.primary && onTransactionAdvice) {
        onTransactionAdvice(response.actions.primary.action === 'proceed');
      }
    } catch (err) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        type: 'assistant',
        content: 'I apologize, but I encountered an error processing your request.',
        timestamp: new Date(),
        status: 'error'
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const renderMessage = (message: Message) => {
    const isAssistant = message.type === 'assistant';
    return (
      <div
        key={message.id}
        className={`flex ${isAssistant ? 'justify-start' : 'justify-end'} mb-4`}
      >
        <div
          className={`flex max-w-[80%] ${
            isAssistant ? 'bg-blue-50' : 'bg-gray-50'
          } rounded-lg p-4 ${message.status ? 'border' : ''} ${
            message.status === 'success' ? 'border-green-500' :
            message.status === 'warning' ? 'border-yellow-500' :
            message.status === 'error' ? 'border-red-500' : ''
          }`}
        >
          {isAssistant && (
            <Bot className="w-6 h-6 mr-2 flex-shrink-0 text-blue-600" />
          )}
          <div className="flex flex-col">
            <p className="text-sm">{message.content}</p>
            <span className="text-xs text-gray-500 mt-1">
              {message.timestamp.toLocaleTimeString()}
            </span>
            {message.status && (
              <div className="flex items-center mt-2">
                {message.status === 'success' && (
                  <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                )}
                {message.status === 'warning' && (
                  <AlertCircle className="w-4 h-4 text-yellow-500 mr-1" />
                )}
                {message.status === 'error' && (
                  <XCircle className="w-4 h-4 text-red-500 mr-1" />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="w-6 h-6" />
          AI Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="flex-1 overflow-y-auto mb-4">
          {messages.map(renderMessage)}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={isThinking ? "AI is thinking..." : "Ask me anything about your wallet..."}
            disabled={isThinking}
            className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={isThinking || !inputValue.trim()}
            className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </CardContent>
    </Card>
  );
}