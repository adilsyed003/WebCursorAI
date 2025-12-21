import { useState } from "react";
import { Code, Eye } from "lucide-react";

interface EditorPaneProps {
  fileName: string | null;
  content: string;
}

export const EditorPane = ({ fileName, content }: EditorPaneProps) => {
  const [activeTab, setActiveTab] = useState<"code" | "preview">("code");

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex items-center border-b border-border">
        <button
          onClick={() => setActiveTab("code")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === "code" ? "text-foreground border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Code className="w-4 h-4" />
          Code
        </button>
        <button
          onClick={() => setActiveTab("preview")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === "preview" ? "text-foreground border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Eye className="w-4 h-4" />
          Preview
        </button>
        {fileName && (
          <span className="ml-auto mr-4 text-xs text-muted-foreground">{fileName}</span>
        )}
      </div>

      <div className="flex-1 overflow-auto">
        {activeTab === "code" ? (
          <div className="p-4">
            {content ? (
              <pre className="font-mono text-sm text-foreground leading-relaxed">
                <code>{content}</code>
              </pre>
            ) : (
              <p className="text-muted-foreground text-sm">Select a file to view its content</p>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full bg-secondary/30">
            <div className="text-center p-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Eye className="w-8 h-8 text-primary" />
              </div>
              <p className="text-muted-foreground">Preview will appear here</p>
              <p className="text-xs text-muted-foreground mt-1">Connect to a backend to enable live preview</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
