import { useEffect, useRef, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Streamdown } from "streamdown";
import { Button } from "@/components/ui/button";
import { Loader2, Send, Plus } from "lucide-react";

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
}

export function ChatBox({ conversationId }: { conversationId: number }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Fetch conversation history
  const { data: historyData } = trpc.chat.getHistory.useQuery({
    conversationId,
  });

  // Send message mutation
  const sendMessageMutation = trpc.chat.sendMessage.useMutation();
  const resetMutation = trpc.chat.resetConversation.useMutation();

  // Update messages when history is fetched
  useEffect(() => {
    if (historyData) {
      setMessages(
        historyData.map((msg) => ({
          ...msg,
          createdAt: new Date(msg.createdAt),
        }))
      );
    }
  }, [historyData]);

  // Auto-scroll to latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Auto-resize textarea
  const autoResize = (textarea: HTMLTextAreaElement) => {
    textarea.style.height = "auto";
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px";
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    autoResize(e.target);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    // Optimistically add user message
    const tempUserMessage: Message = {
      id: Date.now(),
      role: "user",
      content: userMessage,
      createdAt: new Date(),
    };
    setMessages((prev) => [...prev, tempUserMessage]);

    setIsLoading(true);

    try {
      const response = await sendMessageMutation.mutateAsync({
        conversationId,
        message: userMessage,
      });

      // Add assistant message
      const assistantMessage: Message = {
        id: Date.now() + 1,
        role: "assistant",
        content: response.reply,
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      // Remove the optimistic user message on error
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = async () => {
    if (confirm("Are you sure you want to clear the chat history?")) {
      try {
        await resetMutation.mutateAsync({ conversationId });
        setMessages([]);
      } catch (error) {
        console.error("Error resetting chat:", error);
      }
    }
  };

  return (
    <div
      className="flex flex-col h-screen relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, #FF00FF 0%, #1a0033 50%, #0d001a 100%)`,
      }}
    >
      {/* Geometric background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Grid texture overlay */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              linear-gradient(0deg, transparent 24%, rgba(16, 163, 127, 0.05) 25%, rgba(16, 163, 127, 0.05) 26%, transparent 27%, transparent 74%, rgba(16, 163, 127, 0.05) 75%, rgba(16, 163, 127, 0.05) 76%, transparent 77%, transparent),
              linear-gradient(90deg, transparent 24%, rgba(16, 163, 127, 0.05) 25%, rgba(16, 163, 127, 0.05) 26%, transparent 27%, transparent 74%, rgba(16, 163, 127, 0.05) 75%, rgba(16, 163, 127, 0.05) 76%, transparent 77%, transparent)
            `,
            backgroundSize: "50px 50px",
          }}
        />

        {/* Floating geometric planes - teal */}
        <div
          className="absolute w-96 h-96 rounded-3xl opacity-10 blur-3xl"
          style={{
            background: "linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%)",
            top: "-10%",
            right: "-5%",
            transform: "rotate(45deg)",
          }}
        />

        {/* Floating geometric planes - blue */}
        <div
          className="absolute w-80 h-80 rounded-3xl opacity-10 blur-3xl"
          style={{
            background: "linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)",
            bottom: "10%",
            left: "-8%",
            transform: "rotate(-30deg)",
          }}
        />

        {/* Floating geometric planes - coral */}
        <div
          className="absolute w-72 h-72 rounded-full opacity-10 blur-3xl"
          style={{
            background: "linear-gradient(135deg, #ff6b6b 0%, #ff8c42 100%)",
            top: "40%",
            left: "50%",
            transform: "translateX(-50%)",
          }}
        />
      </div>

      {/* Content layer */}
      <div className="relative z-10 flex flex-col h-screen">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#10a37f]/20 bg-black/30 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#10a37f] to-[#0d8f6e] flex items-center justify-center shadow-lg shadow-[#10a37f]/50">
              <span className="text-white font-bold text-sm">AI</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Chat Assistant</h1>
              <p className="text-xs text-[#10a37f]">Powered by Advanced LLM</p>
            </div>
          </div>
          <Button
            onClick={handleResetChat}
            variant="outline"
            size="sm"
            className="border-[#10a37f] text-[#10a37f] hover:bg-[#10a37f] hover:text-white transition-all"
          >
            <Plus className="w-4 h-4 mr-1" />
            New Chat
          </Button>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4" style={{backgroundColor: '#ffffff'}}>
          {messages.length === 0 && !isLoading && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#10a37f] to-[#0d8f6e] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#10a37f]/50">
                  <span className="text-white font-bold text-2xl">AI</span>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Welcome to Chat</h2>
                <p className="text-gray-400">
                  Start a conversation by typing a message below
                </p>
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {message.role === "assistant" && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#10a37f] to-[#0d8f6e] flex-shrink-0 flex items-center justify-center shadow-md shadow-[#10a37f]/30">
                  <span className="text-white font-bold text-xs">AI</span>
                </div>
              )}

              <div
                className={`max-w-md lg:max-w-lg px-4 py-3 rounded-lg backdrop-blur-sm ${
                  message.role === "user"
                    ? "bg-[#10a37f]/90 text-white rounded-br-none shadow-lg shadow-[#10a37f]/30"
                    : "bg-white/10 text-gray-100 rounded-bl-none border border-[#10a37f]/30 shadow-lg shadow-black/30"
                }`}
              >
                {message.role === "assistant" ? (
                  <Streamdown>{message.content}</Streamdown>
                ) : (
                  <p className="text-sm leading-relaxed">{message.content}</p>
                )}
              </div>

              {message.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex-shrink-0 flex items-center justify-center shadow-md shadow-purple-500/30">
                  <span className="text-white font-bold text-xs">You</span>
                </div>
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#10a37f] to-[#0d8f6e] flex-shrink-0 flex items-center justify-center shadow-md shadow-[#10a37f]/30">
                <span className="text-white font-bold text-xs">AI</span>
              </div>
              <div className="bg-white/10 text-gray-100 px-4 py-3 rounded-lg rounded-bl-none border border-[#10a37f]/30 flex gap-2 shadow-lg shadow-black/30">
                <div className="w-2 h-2 rounded-full bg-[#10a37f] animate-bounce" />
                <div
                  className="w-2 h-2 rounded-full bg-[#10a37f] animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                />
                <div
                  className="w-2 h-2 rounded-full bg-[#10a37f] animate-bounce"
                  style={{ animationDelay: "0.4s" }}
                />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-[#10a37f]/20 bg-black/30 backdrop-blur-sm px-6 py-4">
          <div className="flex gap-3 items-end bg-white/10 border border-[#10a37f]/30 rounded-lg p-3 focus-within:border-[#10a37f] transition-colors shadow-lg shadow-black/30">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Type your message... (Shift+Enter for new line)"
              className="flex-1 bg-transparent text-white placeholder-gray-500 outline-none resize-none max-h-32 text-sm leading-relaxed"
              rows={1}
              disabled={isLoading}
            />
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || !inputValue.trim()}
              className="bg-[#10a37f] hover:bg-[#0d8f6e] text-white flex-shrink-0 transition-all shadow-lg shadow-[#10a37f]/50"
              size="sm"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2 px-1">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}
