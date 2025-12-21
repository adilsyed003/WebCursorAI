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
import { set } from "date-fns";
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
  const [files, setFiles] = useState<FileNode[]>([]);

  useEffect(() => {
    steps.forEach((step) => {
      if (step.type === 0 && step.path && step.code) {
        const pathParts = step.path.split("/");
        let currentLevel = files;
        for (let i = 0; i < pathParts.length; i++) {
          const part = pathParts[i];
          let existingNode = currentLevel.find((f) => f.name === part);
          if (!existingNode) {
            if (i === pathParts.length - 1) {
              // file
              existingNode = { name: part, type: "file", content: step.code };
            } else {
              // folder
              existingNode = { name: part, type: "folder", children: [] };
            }
            currentLevel.push(existingNode);
          }
          if (existingNode.type === "folder") {
            if (!existingNode.children) {
              existingNode.children = [];
            }
            currentLevel = existingNode.children;
          }
        }
      }
    });
    setFiles(files);
  }, [steps, files]);

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
    console.log(parsed[0]);
    const stepsResponse = await axios.post(
      import.meta.env.VITE_BACKEND_URL + "chat",
      {
        messages: [...prompts, prompt].map((p: string) => ({
          role: "user",
          content: p,
        })),
      }
    );
    console.log("Chat Response:", stepsResponse.data);
    console.log("Steps after chat response:", steps);
    setSteps((prev) => [...prev, ...parseXml(stepsResponse.data.response)]);
    console.log("Chat Response Steps:", parseXml(stepsResponse.data.response));
    console.log("Steps after chat response:", steps);
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
            files={files}
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
