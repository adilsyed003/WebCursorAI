import { useState } from "react";
import {
  ChevronRight,
  ChevronDown,
  FileCode,
  Folder,
  FolderOpen,
} from "lucide-react";

interface FileNode {
  name: string;
  type: "file" | "folder";
  children?: FileNode[];
  content?: string;
}

// const mockFiles: FileNode[] = [
//   {
//     name: "src",
//     type: "folder",
//     children: [
//       {
//         name: "components",
//         type: "folder",
//         children: [
//           { name: "Header.tsx", type: "file", content: `export const Header = () => {\n  return (\n    <header className="p-4 bg-slate-900">\n      <h1 className="text-xl font-bold">My App</h1>\n    </header>\n  );\n};` },
//           { name: "Hero.tsx", type: "file", content: `export const Hero = () => {\n  return (\n    <section className="py-20 text-center">\n      <h1 className="text-5xl font-bold">Welcome</h1>\n      <p className="mt-4 text-gray-400">Build something amazing</p>\n    </section>\n  );\n};` },
//         ],
//       },
//       {
//         name: "api",
//         type: "folder",
//         children: [
//           { name: "index.ts", type: "file", content: `export const fetchData = async () => {\n  const res = await fetch('/api/data');\n  return res.json();\n};` },
//         ],
//       },
//       { name: "App.tsx", type: "file", content: `import { Header } from './components/Header';\nimport { Hero } from './components/Hero';\n\nfunction App() {\n  return (\n    <div className="min-h-screen bg-black text-white">\n      <Header />\n      <Hero />\n    </div>\n  );\n}\n\nexport default App;` },
//       { name: "main.tsx", type: "file", content: `import React from 'react';\nimport ReactDOM from 'react-dom/client';\nimport App from './App';\nimport './index.css';\n\nReactDOM.createRoot(document.getElementById('root')!).render(\n  <React.StrictMode>\n    <App />\n  </React.StrictMode>\n);` },
//     ],
//   },
// ];

interface FileExplorerProps {
  onSelectFile: (file: FileNode) => void;
  selectedFile: string | null;
  files: FileNode[];
}

const FileItem = ({
  node,
  depth,
  onSelect,
  selectedFile,
}: {
  node: FileNode;
  depth: number;
  onSelect: (f: FileNode) => void;
  selectedFile: string | null;
}) => {
  const [isOpen, setIsOpen] = useState(depth < 2);

  if (node.type === "folder") {
    // Sort children: folders first (original order), then files (original order)
    const children = node.children || [];
    const folders = children.filter((c) => c.type === "folder");
    const files = children.filter((c) => c.type === "file");
    const orderedChildren = [...folders, ...files];
    return (
      <div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 w-full px-2 py-1 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded transition-colors"
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
        >
          {isOpen ? (
            <ChevronDown className="w-3.5 h-3.5" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5" />
          )}
          {isOpen ? (
            <FolderOpen className="w-4 h-4 text-primary" />
          ) : (
            <Folder className="w-4 h-4 text-primary" />
          )}
          <span>{node.name}</span>
        </button>
        {isOpen &&
          orderedChildren.map((child, i) => (
            <FileItem
              key={i}
              node={child}
              depth={depth + 1}
              onSelect={onSelect}
              selectedFile={selectedFile}
            />
          ))}
      </div>
    );
  }

  return (
    <button
      onClick={() => onSelect(node)}
      className={`flex items-center gap-1.5 w-full px-2 py-1 text-sm rounded transition-colors ${
        selectedFile === node.name
          ? "bg-secondary text-foreground"
          : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
      }`}
      style={{ paddingLeft: `${depth * 12 + 8}px` }}
    >
      <FileCode className="w-4 h-4 text-accent" />
      <span>{node.name}</span>
    </button>
  );
};

export const FileExplorer = ({
  onSelectFile,
  selectedFile,
  files,
}: FileExplorerProps) => {
  // Sort root: folders first (original order), then files (original order)
  const folders = files.filter((f) => f.type === "folder");
  const regFiles = files.filter((f) => f.type === "file");
  const orderedFiles = [...folders, ...regFiles];
  return (
    <div className="flex flex-col h-full bg-card border-r border-border">
      <div className="p-4 border-b border-border">
        <h2 className="text-sm font-medium text-foreground">Files</h2>
      </div>
      <div className="flex-1 overflow-y-auto py-2">
        {orderedFiles.map((node, i) => (
          <FileItem
            key={i}
            node={node}
            depth={0}
            onSelect={onSelectFile}
            selectedFile={selectedFile}
          />
        ))}
      </div>
    </div>
  );
};
