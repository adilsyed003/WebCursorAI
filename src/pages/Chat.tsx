import { useEffect, useState } from "react";
import { useLocation, Navigate } from "react-router-dom";
import { ChatPanel } from "@/components/ChatPanel";
import { FileExplorer } from "@/components/FileExplorer";
import { EditorPane } from "@/components/EditorPane";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import axios from "axios";
import { parseXml } from "@/parse";
import { Step } from "@/types";
interface FileNode {
  name: string;
  type: "file" | "folder";
  children?: FileNode[];
  content?: string;
}

const Chat = () => {
  const location = useLocation();
  const prompt = location.state?.prompt;
  const [steps, setSteps] = useState<Step[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  useEffect(() => {
    init();
  }, []);
  async function init() {
    const response = await axios.post(
      import.meta.env.VITE_BACKEND_URL + "template",
      {
        prompt: prompt,
      }
    );
    const { prompts, uiPrompts } = response.data;
    const parsed = parseXml(uiPrompts[0]);
    setSteps(parsed);
    // console.log(parsed);
  }

  if (!prompt) {
    return <Navigate to="/" replace />;
  }
  return (
    <div className="h-screen bg-background">
      <ResizablePanelGroup direction="horizontal" className="h-full">
        {/* Chat Panel */}
        <ResizablePanel defaultSize={25} minSize={15} maxSize={40}>
          <ChatPanel initialPrompt={prompt} steps={steps} />
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* File Explorer */}
        <ResizablePanel defaultSize={25} minSize={15} maxSize={40}>
          <FileExplorer
            onSelectFile={(file) => setSelectedFile(file)}
            selectedFile={selectedFile?.name || null}
          />
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Editor Pane */}
        <ResizablePanel defaultSize={50} minSize={20}>
          <EditorPane
            fileName={selectedFile?.name || null}
            content={selectedFile?.content || ""}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default Chat;
