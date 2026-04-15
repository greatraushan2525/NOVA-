import { useState } from "react";
import { FileText, Folder, Search, Code, Plus, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Tool {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  color: string;
}

const AVAILABLE_TOOLS: Tool[] = [
  {
    id: "projects",
    name: "Projects",
    icon: <Folder className="w-5 h-5" />,
    description: "Organize chats by project",
    color: "bg-blue-100 text-blue-700",
  },
  {
    id: "documents",
    name: "Documents",
    icon: <FileText className="w-5 h-5" />,
    description: "Upload and analyze files",
    color: "bg-purple-100 text-purple-700",
  },
  {
    id: "search",
    name: "Web Search",
    icon: <Search className="w-5 h-5" />,
    description: "Search the internet",
    color: "bg-green-100 text-green-700",
  },
  {
    id: "code",
    name: "Code Interpreter",
    icon: <Code className="w-5 h-5" />,
    description: "Execute and debug code",
    color: "bg-orange-100 text-orange-700",
  },
];

export function ToolsPanel() {
  const [expandedTools, setExpandedTools] = useState<Set<string>>(new Set());

  const toggleTool = (toolId: string) => {
    const newExpanded = new Set(expandedTools);
    if (newExpanded.has(toolId)) {
      newExpanded.delete(toolId);
    } else {
      newExpanded.add(toolId);
    }
    setExpandedTools(newExpanded);
  };

  return (
    <div className="w-full bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
          <span>Tools & Features</span>
          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
            {AVAILABLE_TOOLS.length}
          </span>
        </h3>
      </div>

      {/* Tools List */}
      <div className="divide-y divide-gray-200">
        {AVAILABLE_TOOLS.map((tool) => (
          <div key={tool.id} className="p-3 hover:bg-gray-50 transition-colors">
            <button
              onClick={() => toggleTool(tool.id)}
              className="w-full flex items-start justify-between gap-3 text-left"
            >
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className={`p-2 rounded-lg flex-shrink-0 ${tool.color}`}>
                  {tool.icon}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800">{tool.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{tool.description}</p>
                </div>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${
                  expandedTools.has(tool.id) ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Expanded Content */}
            {expandedTools.has(tool.id) && (
              <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                {tool.id === "projects" && (
                  <>
                    <p className="text-xs text-gray-600 mb-2">
                      Create projects to organize your conversations by topic or team.
                    </p>
                    <Button
                      className="w-full bg-green-600 hover:bg-green-700 text-white text-xs h-8"
                      size="sm"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      New Project
                    </Button>
                  </>
                )}

                {tool.id === "documents" && (
                  <>
                    <p className="text-xs text-gray-600 mb-2">
                      Upload PDFs, images, or text files to analyze with AI.
                    </p>
                    <Button
                      className="w-full bg-green-600 hover:bg-green-700 text-white text-xs h-8"
                      size="sm"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Upload File
                    </Button>
                  </>
                )}

                {tool.id === "search" && (
                  <>
                    <p className="text-xs text-gray-600 mb-2">
                      Search the web and get real-time information in your conversations.
                    </p>
                    <Button
                      className="w-full bg-green-600 hover:bg-green-700 text-white text-xs h-8"
                      size="sm"
                    >
                      Enable Web Search
                    </Button>
                  </>
                )}

                {tool.id === "code" && (
                  <>
                    <p className="text-xs text-gray-600 mb-2">
                      Run Python code, debug, and visualize results directly in chat.
                    </p>
                    <Button
                      className="w-full bg-green-600 hover:bg-green-700 text-white text-xs h-8"
                      size="sm"
                    >
                      Enable Code Execution
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          More tools coming soon
        </p>
      </div>
    </div>
  );
}
