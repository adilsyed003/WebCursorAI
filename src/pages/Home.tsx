import { useNavigate } from "react-router-dom";
import { PromptInput } from "@/components/PromptInput";
import { Sparkles } from "lucide-react";

const Home = () => {
  const navigate = useNavigate();

  const handleGenerate = (prompt: string) => {
    navigate("/chat", { state: { prompt } });
  };

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: "var(--gradient-bg)" }}
    >
      {/* Glow effect */}
      <div 
        className="fixed inset-0 pointer-events-none animate-pulse-glow"
        style={{ background: "var(--gradient-glow)" }}
      />

      <div className="relative z-10 flex flex-col items-center animate-fade-in">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "var(--gradient-primary)" }}>
            <Sparkles className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold gradient-text">BuildAI</h1>
        </div>

        {/* Heading */}
        <h2 className="text-4xl md:text-5xl font-bold text-foreground text-center mb-4">
          Build websites with AI
        </h2>
        <p className="text-lg text-muted-foreground text-center mb-12 max-w-md">
          Describe your idea and watch it come to life in seconds
        </p>

        {/* Input */}
        <PromptInput onGenerate={handleGenerate} />

        {/* Footer hint */}
        <p className="mt-8 text-xs text-muted-foreground">
          Press Enter or click Generate to start
        </p>
      </div>
    </div>
  );
};

export default Home;
