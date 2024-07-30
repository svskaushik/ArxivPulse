import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatWithPDFProps {
  paperId: string;
  pdfUrl: string;
}

const ChatWithPDF: React.FC<ChatWithPDFProps> = ({ paperId, pdfUrl }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat-with-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paperId, pdfUrl, message: input }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error('Failed to get response reader');

      let assistantMessage: Message = { role: 'assistant', content: '' };
      setMessages(prev => [...prev, assistantMessage]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(5));
              if (data.chunk) {
                assistantMessage.content += data.chunk;
                setMessages(prev => [...prev.slice(0, -1), { ...assistantMessage }]);
              }
            } catch (error) {
              console.error('Error parsing JSON:', error);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error in chat:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = useCallback((message: Message, index: number) => (
    <motion.div
      key={index}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`mb-2 ${message.role === 'user' ? 'text-right' : 'text-left'}`}
    >
      <span className={`inline-block p-2 rounded-lg ${message.role === 'user' ? 'bg-blue-600' : 'bg-gray-700'}`}>
        <ReactMarkdown
          rehypePlugins={[rehypeRaw]}
          components={{
            p: ({node, ...props}) => <p className="mb-2" {...props} />,
            h1: ({node, ...props}) => <h1 className="text-2xl font-bold mb-2" {...props} />,
            h2: ({node, ...props}) => <h2 className="text-xl font-bold mb-2" {...props} />,
            h3: ({node, ...props}) => <h3 className="text-lg font-bold mb-2" {...props} />,
            ul: ({node, ...props}) => <ul className="list-disc list-inside mb-2" {...props} />,
            ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-2" {...props} />,
            li: ({node, ...props}) => <li className="mb-1" {...props} />,
            strong: ({node, ...props}) => <strong className="font-bold" {...props} />,
            em: ({node, ...props}) => <em className="italic" {...props} />,
            code: ({node, inline, ...props}) => 
              inline ? <code className="bg-gray-700 rounded px-1" {...props} /> : <pre className="bg-gray-700 p-2 rounded mb-2 whitespace-pre-wrap break-words"><code className="break-words" {...props} /></pre>,
          }}
        >
          {message.content}
        </ReactMarkdown>
      </span>
    </motion.div>
  ), []);

  return (
    <div className="glass p-4 rounded-lg shadow-lg">
      <div ref={chatContainerRef} className="h-96 overflow-y-auto mb-4">
        {messages.map(renderMessage)}
        {isLoading && (
          <div className="text-center">
            <span className="inline-block animate-pulse">Thinking...</span>
          </div>
        )}
      </div>
      <form onSubmit={handleSubmit} className="flex">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about the paper..."
          className="flex-grow glass text-white p-2 rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="bg-blue-600 text-white px-4 py-2 rounded-r hover:bg-blue-700 transition-colors"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatWithPDF;
