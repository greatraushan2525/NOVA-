import { useState } from "react";
import { Download, Share2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface ExportShareProps {
  conversationId: number;
  conversationTitle: string;
}

export function ExportShare({ conversationId, conversationTitle }: ExportShareProps) {
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  const exportMutation = trpc.chat.exportConversation.useQuery(
    { conversationId, format: "markdown" },
    { enabled: false }
  );

  const generateShareLinkMutation = trpc.chat.generateShareLink.useMutation();

  const handleExportMarkdown = async () => {
    try {
      const result = await exportMutation.refetch();
      if (result.data) {
        const element = document.createElement("a");
        const file = new Blob([result.data.content], { type: "text/markdown" });
        element.href = URL.createObjectURL(file);
        element.download = result.data.filename;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        toast.success("Conversation exported as Markdown");
      }
    } catch (error) {
      toast.error("Failed to export conversation");
    }
  };

  const handleExportJSON = async () => {
    try {
      const result = await trpc.chat.exportConversation.useQuery(
        { conversationId, format: "json" },
        { enabled: false }
      ).refetch();
      if (result.data) {
        const element = document.createElement("a");
        const file = new Blob([result.data.content], { type: "application/json" });
        element.href = URL.createObjectURL(file);
        element.download = result.data.filename;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        toast.success("Conversation exported as JSON");
      }
    } catch (error) {
      toast.error("Failed to export conversation");
    }
  };

  const handleGenerateShareLink = async () => {
    try {
      const result = await generateShareLinkMutation.mutateAsync({ conversationId });
      const fullUrl = `${window.location.origin}${result.shareUrl}`;
      setShareUrl(fullUrl);
      toast.success("Share link generated");
    } catch (error) {
      toast.error("Failed to generate share link");
    }
  };

  const handleCopyShareLink = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Share link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <h3 className="font-semibold text-sm text-gray-800">Export & Share</h3>

      <div className="space-y-2">
        <Button
          onClick={handleExportMarkdown}
          className="w-full bg-green-600 hover:bg-green-700 text-white text-sm h-9 flex items-center justify-center gap-2"
          size="sm"
        >
          <Download className="w-4 h-4" />
          Export as Markdown
        </Button>

        <Button
          onClick={handleExportJSON}
          className="w-full bg-green-600 hover:bg-green-700 text-white text-sm h-9 flex items-center justify-center gap-2"
          size="sm"
        >
          <Download className="w-4 h-4" />
          Export as JSON
        </Button>

        <Button
          onClick={handleGenerateShareLink}
          disabled={generateShareLinkMutation.isPending}
          className="w-full bg-green-600 hover:bg-green-700 text-white text-sm h-9 flex items-center justify-center gap-2"
          size="sm"
        >
          <Share2 className="w-4 h-4" />
          {generateShareLinkMutation.isPending ? "Generating..." : "Generate Share Link"}
        </Button>
      </div>

      {shareUrl && (
        <div className="bg-white p-3 rounded border border-gray-200">
          <p className="text-xs text-gray-600 mb-2">Share this link:</p>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="flex-1 text-xs px-2 py-1 bg-gray-100 rounded border border-gray-300"
            />
            <Button
              onClick={handleCopyShareLink}
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white h-8 w-8 p-0"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
