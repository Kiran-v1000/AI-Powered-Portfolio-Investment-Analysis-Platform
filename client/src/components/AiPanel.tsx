import { useRef, useState } from "react";
import type { ChatMsg } from "../types";

const SUGGESTIONS = [
  "Analyze my portfolio's overall health",
  "What are my biggest concentration risks?",
  "How should I think about rebalancing?",
  "Assess my income / dividend profile"
];

// Minimal markdown rendering (bold, headers, bullets) without a dependency.
function renderMarkdown(text: string) {
  const esc = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const html = esc
    .replace(/^### (.*)$/gm, "<h4>$1</h4>")
    .replace(/^## (.*)$/gm, "<h4>$1</h4>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/^- (.*)$/gm, "<li>$1</li>")
    .replace(/(<li>[\s\S]*?<\/li>)(?!\s*<li>)/g, "<ul>$1</ul>")
    .replace(/\n\n/g, "<br/>");
  return { __html: html };
}

export default function AiPanel({ api }: { api: string }) {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  async function send(question: string) {
    const q = question.trim();
    if (!q || streaming) return;
    const history: ChatMsg[] = [...messages, { role: "user", content: q }];
    setMessages([...history, { role: "assistant", content: "" }]);
    setInput("");
    setStreaming(true);

    try {
      const resp = await fetch(`${api}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history })
      });
      const reader = resp.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let answer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split("\n\n");
        buffer = events.pop() ?? "";
        for (const ev of events) {
          if (!ev.startsWith("data: ")) continue;
          const payload = JSON.parse(ev.slice(6));
          if (payload.text) {
            answer += payload.text;
            setMessages([...history, { role: "assistant", content: answer }]);
            scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
          }
          if (payload.error) {
            setMessages([...history, { role: "assistant", content: `⚠️ ${payload.error}` }]);
          }
        }
      }
    } catch {
      setMessages([...history, { role: "assistant", content: "⚠️ Could not reach the AI service." }]);
    } finally {
      setStreaming(false);
    }
  }

  return (
    <div className="panel ai-panel">
      <div className="ai-header">
        <h3>✦ AI Analyst</h3>
        <span className="ai-sub">Powered by Claude Fable 5</span>
      </div>

      <div className="chat-scroll" ref={scrollRef}>
        {messages.length === 0 && (
          <div className="suggestions">
            <p>Ask anything about this portfolio:</p>
            {SUGGESTIONS.map((s) => (
              <button key={s} className="suggestion" onClick={() => send(s)}>
                {s}
              </button>
            ))}
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`msg ${m.role}`}>
            {m.role === "assistant" ? (
              <div dangerouslySetInnerHTML={renderMarkdown(m.content || "…")} />
            ) : (
              m.content
            )}
          </div>
        ))}
      </div>

      <form
        className="chat-input"
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={streaming ? "Analyzing…" : "Ask about your portfolio…"}
          disabled={streaming}
        />
        <button type="submit" disabled={streaming || !input.trim()}>
          ➤
        </button>
      </form>
    </div>
  );
}
