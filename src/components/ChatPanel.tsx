import { useState, useEffect } from "react";
import { Send } from "lucide-react";
import { Step } from "@/types";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatPanelProps {
  initialPrompt: string;
  steps: Step[];
  onSendMessage?: (message: string) => void;
}

export const ChatPanel = ({
  initialPrompt,
  steps,
  onSendMessage,
}: ChatPanelProps) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: "user", content: initialPrompt },
  ]);
  const [input, setInput] = useState("");

  // Add assistant responses from steps
  useEffect(() => {
    if (steps && steps.length > 0) {
      setMessages((prev) => {
        // Only add step titles that are not already present
        const assistantTitles = steps.map((s) => s.title);
        const alreadyAdded = prev.filter(
          (msg) =>
            msg.role === "assistant" && assistantTitles.includes(msg.content)
        );
        if (alreadyAdded.length === assistantTitles.length) return prev;
        // Add each step.title as assistant message if not already present
        const newMsgs = steps
          .map((s) => s.title)
          .filter(
            (title) =>
              !prev.some(
                (msg) => msg.role === "assistant" && msg.content === title
              )
          )
          .map((title) => ({ role: "assistant" as const, content: title }));
        return [...prev, ...newMsgs];
      });
    }
  }, [steps]);
  const handleSend = () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { role: "user", content: input }]);
    if (onSendMessage) onSendMessage(input);
    setInput("");
  };

  return (
    <div className="flex flex-col h-full bg-card border-r border-border">
      <div className="p-4 border-b border-border">
        <h2 className="text-sm font-medium text-foreground">Chat</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 ">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={
              msg.role === "user" ? "flex justify-end" : "flex justify-start"
            }
          >
            <div
              className={
                msg.role === "user"
                  ? "bg-gray-200 text-muted-foreground rounded-lg px-3 py-2 max-w-xs text-right"
                  : "bg-card text-foreground rounded-lg px-3 py-2 max-w-xs"
              }
            >
              <span
                className={`text-xs font-medium block ${
                  msg.role === "user" ? "text-primary" : "text-accent"
                }`}
              ></span>
              <p>{msg.content}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 border-t border-border">
        <div className="flex items-center gap-2 bg-secondary rounded-lg p-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask for changes..."
            className="flex-1 bg-transparent px-2 py-1 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <button
            onClick={handleSend}
            className="p-1.5 text-primary hover:opacity-80"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
