import { memo } from "react";
import ReactMarkdown from "react-markdown";
import { Prism } from "react-syntax-highlighter";

export const Markdown = memo(RenderMarkdown, (prevProps, nextProps) => {
  return prevProps.children === nextProps.children;
});

function RenderMarkdown({ children }: { children: string }) {
  return (
    <div className="prose">
      <ReactMarkdown
        components={{
          p({ children }) {
            return <p className="mb-2 last:mb-0">{children}</p>;
          },
          code({ node, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");

            return match ? (
              <Prism language={(match && match[1]) || ""} PreTag="div" showLineNumbers>
                {String(children).replace(/\n$/, "")}
              </Prism>
            ) : (
              <code {...props} className={className}>
                {children}
              </code>
            );
          },
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
