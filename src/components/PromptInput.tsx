import { useState } from "react";
import { Sparkles } from "lucide-react";

interface PromptInputProps {
  onGenerate: (prompt: string) => void;
}

export const PromptInput = ({ onGenerate }: PromptInputProps) => {
  const [prompt, setPrompt] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onGenerate(prompt);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl">
      <div className="relative gradient-border rounded-xl glow-effect">
        <div className="flex items-center gap-3 bg-card rounded-xl p-2">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the website you want to build..."
            className="flex-1 bg-transparent px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none text-base"
          />
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
          >
            <Sparkles className="w-4 h-4" />
            Generate
          </button>
        </div>
      </div>
    </form>
  );
};
