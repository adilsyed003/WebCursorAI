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
import { Step, StepType } from "@/types";
import { useContainer } from "@/hooks/useContainer";
import { set } from "date-fns";
interface FileNode {
  name: string;
  type: "file" | "folder";
  children?: FileNode[];
  content?: string;
  path: string;
}

const Chat = () => {
  const location = useLocation();
  const prompt = location.state?.prompt;
  const [steps, setSteps] = useState<Step[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [files, setFiles] = useState<FileNode[]>([]);
  const [llmMessages, setLlmMessages] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([]);
  const webcontainer = useContainer();
  const [loading, setLoading] = useState(false);
  // Helper to build file tree from steps
  useEffect(() => {
    let originalFiles = [...files];
    let updateHappened = false;
    steps
      .filter(({ status }) => status === "pending")
      .map((step) => {
        updateHappened = true;
        if (step?.type === StepType.CreateFile) {
          let parsedPath = step.path?.split("/") ?? []; // ["src", "components", "App.tsx"]
          let currentFileStructure = [...originalFiles]; // {}
          const finalAnswerRef = currentFileStructure;

          let currentFolder = "";
          while (parsedPath.length) {
            currentFolder = `${currentFolder}/${parsedPath[0]}`;
            const currentFolderName = parsedPath[0];
            parsedPath = parsedPath.slice(1);

            if (!parsedPath.length) {
              // final file
              const file = currentFileStructure.find(
                (x) => x.path === currentFolder
              );
              if (!file) {
                currentFileStructure.push({
                  name: currentFolderName,
                  type: "file",
                  path: currentFolder,
                  content: step.code,
                });
              } else {
                file.content = step.code;
              }
            } else {
              /// in a folder
              const folder = currentFileStructure.find(
                (x) => x.path === currentFolder
              );
              if (!folder) {
                // create the folder
                currentFileStructure.push({
                  name: currentFolderName,
                  type: "folder",
                  path: currentFolder,
                  children: [],
                });
              }

              currentFileStructure = currentFileStructure.find(
                (x) => x.path === currentFolder
              )!.children!;
            }
          }
          originalFiles = finalAnswerRef;
        }
      });

    if (updateHappened) {
      setFiles(originalFiles);
      setSteps((steps) =>
        steps.map((s: Step) => {
          return {
            ...s,
            status: "completed",
          };
        })
      );
    }
    console.log(files);
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
    setLlmMessages(
      [...prompts, prompt].map((content) => ({
        role: "user",
        content,
      }))
    );

    setLlmMessages((x) => [
      ...x,
      { role: "assistant", content: stepsResponse.data.response },
    ]);
  }

  useEffect(() => {
    // Types for mount structure
    type MountFile = { file: { contents: string } };
    type MountDirectory = {
      directory: { [name: string]: MountFile | MountDirectory };
    };
    type MountNode = MountFile | MountDirectory;

    const createMountStructure = (
      files: FileNode[]
    ): { [name: string]: MountNode } => {
      const mountStructure: { [name: string]: MountNode } = {};

      const processFile = (file: FileNode, isRootFolder: boolean) => {
        if (file.type === "folder") {
          // For folders, create a directory entry
          mountStructure[file.name] = {
            directory: file.children
              ? Object.fromEntries(
                  file.children.map((child) => [
                    child.name,
                    processFile(child, false),
                  ])
                )
              : {},
          };
        } else if (file.type === "file") {
          if (isRootFolder) {
            mountStructure[file.name] = {
              file: {
                contents: file.content || "",
              },
            };
          } else {
            // For files, create a file entry with contents
            return {
              file: {
                contents: file.content || "",
              },
            };
          }
        }

        return mountStructure[file.name];
      };

      // Process each top-level file/folder
      files.forEach((file) => processFile(file, true));

      return mountStructure;
    };

    const mountStructure = createMountStructure(files);

    // Mount the structure if WebContainer is available
    console.log(mountStructure);
    webcontainer?.mount(mountStructure);
  }, [files, webcontainer]);

  if (!prompt) {
    return <Navigate to="/" replace />;
  }

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const handleSendMessages = async (userPrompt: string) => {
    const newMessage = {
      role: "user" as const,
      content: userPrompt,
    };
    setLoading(true);
    try {
      const stepsResponse = await axios.post(`${BACKEND_URL}chat`, {
        messages: [...llmMessages, newMessage],
      });
      setLlmMessages((x) => [...x, newMessage]);
      setLlmMessages((x) => [
        ...x,
        {
          role: "assistant" as const,
          content: stepsResponse.data.response,
        },
      ]);
      setSteps((s) => [
        ...s,
        ...parseXml(stepsResponse.data.response).map((x: Step) => ({
          ...x,
          status: "pending" as const,
        })),
      ]);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="h-screen bg-background">
      <ResizablePanelGroup direction="horizontal" className="h-full">
        {/* Chat Panel */}
        <ResizablePanel defaultSize={25} minSize={15} maxSize={40}>
          <ChatPanel
            initialPrompt={prompt}
            steps={steps}
            onSendMessage={handleSendMessages}
          />
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
            webContainer={webcontainer}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default Chat;
