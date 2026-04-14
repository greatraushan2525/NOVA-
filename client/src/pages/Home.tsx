import { useEffect, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { ChatBox } from "@/components/ChatBox";
import { Loader2 } from "lucide-react";
import { getLoginUrl } from "@/const";

export default function Home() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);

  const createConversationMutation = trpc.chat.createConversation.useMutation();

  // Initialize conversation when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user && !conversationId) {
      setIsInitializing(true);
      createConversationMutation
        .mutateAsync()
        .then((result: any) => {
          // Extract the insertId from the result
          const newConvId = result.insertId || result[0]?.insertId;
          if (newConvId) {
            setConversationId(newConvId);
          }
        })
        .catch((error) => {
          console.error("Failed to create conversation:", error);
        })
        .finally(() => {
          setIsInitializing(false);
        });
    }
  }, [isAuthenticated, user, conversationId, createConversationMutation]);

  if (authLoading) {
    return (
      <div
        className="flex items-center justify-center h-screen relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, #FF00FF 0%, #1a0033 50%, #0d001a 100%)`,
        }}
      >
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#10a37f] mx-auto mb-4" />
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div
        className="flex items-center justify-center h-screen relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, #FF00FF 0%, #1a0033 50%, #0d001a 100%)`,
        }}
      >
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#10a37f] to-[#0d8f6e] flex items-center justify-center mx-auto mb-6">
            <span className="text-white font-bold text-3xl">AI</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Chat Assistant</h1>
          <p className="text-gray-300 mb-8 max-w-md">
            Experience intelligent conversations powered by advanced LLM technology
          </p>
          <a
            href={getLoginUrl()}
            className="inline-block px-8 py-3 bg-[#10a37f] hover:bg-[#0d8f6e] text-white font-semibold rounded-lg transition-all hover:shadow-lg hover:shadow-[#10a37f]/50"
          >
            Sign In to Chat
          </a>
        </div>
      </div>
    );
  }

  if (isInitializing || !conversationId) {
    return (
      <div
        className="flex items-center justify-center h-screen relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, #FF00FF 0%, #1a0033 50%, #0d001a 100%)`,
        }}
      >
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#10a37f] mx-auto mb-4" />
          <p className="text-white">Initializing chat...</p>
        </div>
      </div>
    );
  }

  return <ChatBox conversationId={conversationId} />;
}
