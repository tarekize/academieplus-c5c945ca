import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}

export const ChatMessage = ({ role, content, isStreaming }: ChatMessageProps) => {
  const isUser = role === "user";

  return (
    <div className={cn(
      "flex gap-4 p-4 rounded-2xl transition-all duration-300",
      isUser ? "bg-primary/5 ml-auto max-w-[80%]" : "bg-card shadow-[var(--shadow-card)]"
    )}>
      <div className={cn(
        "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all",
        isUser 
          ? "bg-primary text-primary-foreground" 
          : "bg-gradient-to-br from-primary to-accent text-white shadow-[var(--shadow-glow)]"
      )}>
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>
      
      <div className="flex-1 space-y-2 pt-1">
        <p className="text-sm font-medium text-foreground/80">
          {isUser ? "Vous" : "Assistant Gemini"}
        </p>
        <div className="prose prose-sm max-w-none text-foreground">
          {isUser ? (
            <p className="whitespace-pre-wrap">{content}</p>
          ) : (
            <ReactMarkdown
              className="space-y-3"
              components={{
                h1: ({ children }) => (
                  <h1 className="text-2xl font-bold text-primary mb-3 mt-4 pb-2 border-b-2 border-primary/30">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-xl font-bold text-primary mb-2 mt-3">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-lg font-semibold text-secondary mb-2 mt-2">
                    {children}
                  </h3>
                ),
                strong: ({ children }) => (
                  <strong className="font-bold text-primary">{children}</strong>
                ),
                em: ({ children }) => (
                  <em className="italic text-accent">{children}</em>
                ),
                p: ({ children }) => (
                  <p className="leading-relaxed mb-2">{children}</p>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc list-inside space-y-1 ml-2 text-foreground">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-inside space-y-1 ml-2 text-foreground">
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li className="ml-4 marker:text-primary">{children}</li>
                ),
                code: ({ children, className }) => {
                  const isInline = !className;
                  return isInline ? (
                    <code className="bg-primary/10 text-primary px-1.5 py-0.5 rounded font-mono text-sm">
                      {children}
                    </code>
                  ) : (
                    <code className="block bg-muted p-3 rounded-lg overflow-x-auto font-mono text-sm">
                      {children}
                    </code>
                  );
                },
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground my-2">
                    {children}
                  </blockquote>
                ),
              }}
            >
              {content}
            </ReactMarkdown>
          )}
          {isStreaming && (
            <span className="inline-block w-2 h-4 ml-1 bg-primary animate-pulse" />
          )}
        </div>
      </div>
    </div>
  );
};