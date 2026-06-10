import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Send, Bot, User, Loader2, MessageSquare, Lightbulb } from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

type ResponseType = "stat" | "table" | "list" | "text" | "multi";

interface Stat { label: string; value: string | number; color?: string; }
interface ChatResponse {
  message: string;
  type: ResponseType;
  data?: Record<string, unknown>[];
  columns?: { key: string; label: string }[];
  stats?: Stat[];
  suggestions: string[];
}

interface Message {
  id: number;
  role: "user" | "bot";
  text?: string;
  response?: ChatResponse;
  loading?: boolean;
  error?: string;
}

const STAT_COLORS: Record<string, string> = {
  red: "bg-red-50 border-red-200 text-red-700 dark:bg-red-950/30 dark:border-red-800 dark:text-red-400",
  orange: "bg-orange-50 border-orange-200 text-orange-700 dark:bg-orange-950/30 dark:border-orange-800 dark:text-orange-400",
  yellow: "bg-yellow-50 border-yellow-200 text-yellow-700 dark:bg-yellow-950/30 dark:border-yellow-800 dark:text-yellow-400",
  green: "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-400",
  blue: "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950/30 dark:border-blue-800 dark:text-blue-400",
  indigo: "bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-950/30 dark:border-indigo-800 dark:text-indigo-400",
  purple: "bg-purple-50 border-purple-200 text-purple-700 dark:bg-purple-950/30 dark:border-purple-800 dark:text-purple-400",
  teal: "bg-teal-50 border-teal-200 text-teal-700 dark:bg-teal-950/30 dark:border-teal-800 dark:text-teal-400",
  cyan: "bg-cyan-50 border-cyan-200 text-cyan-700 dark:bg-cyan-950/30 dark:border-cyan-800 dark:text-cyan-400",
  violet: "bg-violet-50 border-violet-200 text-violet-700 dark:bg-violet-950/30 dark:border-violet-800 dark:text-violet-400",
  slate: "bg-slate-50 border-slate-200 text-slate-700 dark:bg-slate-950/30 dark:border-slate-800 dark:text-slate-400",
};

function StatGrid({ stats }: { stats: Stat[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3">
      {stats.map((s, i) => (
        <div key={i} className={`rounded-lg border px-3 py-2.5 ${STAT_COLORS[s.color ?? "blue"] ?? STAT_COLORS.blue}`}>
          <div className="text-xs font-medium opacity-70 mb-0.5">{s.label}</div>
          <div className="text-xl font-bold">{s.value}</div>
        </div>
      ))}
    </div>
  );
}

function DataTable({ data, columns }: { data: Record<string, unknown>[]; columns: { key: string; label: string }[] }) {
  if (!data || data.length === 0) return <p className="text-sm text-muted-foreground mt-2 italic">No records found.</p>;
  return (
    <div className="mt-3 overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-muted/60 border-b border-border">
            {columns.map((c) => (
              <th key={c.key} className="px-3 py-2 text-left font-semibold text-muted-foreground whitespace-nowrap">{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
              {columns.map((c) => (
                <td key={c.key} className="px-3 py-2 whitespace-nowrap">
                  {(() => {
                    const val = String(row[c.key] ?? "—");
                    if (val === "critical" || val === "⚠️ Yes") return <Badge className="bg-red-100 text-red-800 hover:bg-red-100 text-xs">{val}</Badge>;
                    if (val === "high") return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100 text-xs">{val}</Badge>;
                    if (val === "moderate") return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 text-xs">{val}</Badge>;
                    if (val === "healthy") return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 text-xs">{val}</Badge>;
                    if (val === "approved") return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 text-xs">{val}</Badge>;
                    if (val === "pending") return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 text-xs">{val}</Badge>;
                    if (val === "scheduled") return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 text-xs">{val}</Badge>;
                    if (val === "cancelled") return <Badge className="bg-red-100 text-red-800 hover:bg-red-100 text-xs">{val}</Badge>;
                    if (val === "completed") return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 text-xs">{val}</Badge>;
                    return <span className="text-foreground">{val}</span>;
                  })()}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="px-3 py-1.5 bg-muted/30 text-xs text-muted-foreground border-t border-border">
        {data.length} record{data.length !== 1 ? "s" : ""}
      </div>
    </div>
  );
}

function QuestionList({ data, columns }: { data: Record<string, unknown>[]; columns?: { key: string; label: string }[] }) {
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {data.map((row, i) => (
        <div key={i} className="flex items-center gap-1.5 text-sm bg-muted/50 rounded-md px-3 py-1.5 border border-border">
          <Lightbulb className="h-3 w-3 text-yellow-500 flex-shrink-0" />
          <span>{String(row[columns?.[0]?.key ?? "question"] ?? "")}</span>
        </div>
      ))}
    </div>
  );
}

function BotMessage({ msg, onSuggestion }: { msg: Message; onSuggestion: (s: string) => void }) {
  if (msg.loading) {
    return (
      <div className="flex gap-3 items-start">
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
          <Bot className="h-4 w-4 text-primary-foreground" />
        </div>
        <div className="bg-card border border-border rounded-xl rounded-tl-none px-4 py-3 flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Querying database…
        </div>
      </div>
    );
  }

  if (msg.error) {
    return (
      <div className="flex gap-3 items-start">
        <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Bot className="h-4 w-4 text-white" />
        </div>
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl rounded-tl-none px-4 py-3 text-sm dark:bg-red-950/20 dark:border-red-800 dark:text-red-400">
          {msg.error}
        </div>
      </div>
    );
  }

  const r = msg.response!;
  return (
    <div className="flex gap-3 items-start max-w-full">
      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
        <Bot className="h-4 w-4 text-primary-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="bg-card border border-border rounded-xl rounded-tl-none px-4 py-3">
          <p className="text-sm font-medium">{r.message}</p>

          {(r.type === "multi" || r.type === "stat") && r.stats && (
            <StatGrid stats={r.stats} />
          )}

          {(r.type === "multi" || r.type === "table") && r.data && r.columns && r.data.length > 0 && (
            <DataTable data={r.data} columns={r.columns} />
          )}

          {r.type === "list" && r.data && r.columns && (
            <QuestionList data={r.data} columns={r.columns} />
          )}

          {r.type === "text" && (
            <p className="text-sm text-muted-foreground mt-2">{r.message}</p>
          )}
        </div>

        {r.suggestions && r.suggestions.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2 ml-1">
            {r.suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => onSuggestion(s)}
                className="text-xs bg-muted hover:bg-muted/80 border border-border rounded-full px-2.5 py-1 text-muted-foreground hover:text-foreground transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const STARTER_SUGGESTIONS = [
  "Platform overview",
  "Show critical patients",
  "Available beds",
  "Today's appointments",
  "ICU patients",
  "Critical lab reports",
  "Risk distribution",
  "Help",
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      role: "bot",
      response: {
        message: "Hello! I'm the HealthOS Data Assistant. Ask me anything about your patients, beds, doctors, appointments, or hospital operations — I'll query the live database and give you the answer.",
        type: "list",
        data: STARTER_SUGGESTIONS.map((q) => ({ question: q })),
        columns: [{ key: "question", label: "Try asking" }],
        suggestions: [],
      },
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(text: string) {
    const question = text.trim();
    if (!question || loading) return;

    const userMsg: Message = { id: Date.now(), role: "user", text: question };
    const loadingMsg: Message = { id: Date.now() + 1, role: "bot", loading: true };
    setMessages((prev) => [...prev, userMsg, loadingMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${BASE}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: question }),
      });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data: ChatResponse = await res.json();
      setMessages((prev) => prev.map((m) =>
        m.id === loadingMsg.id ? { ...m, loading: false, response: data } : m
      ));
    } catch (err) {
      setMessages((prev) => prev.map((m) =>
        m.id === loadingMsg.id ? { ...m, loading: false, error: "Failed to reach the server. Please try again." } : m
      ));
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }

  function handleSuggestion(s: string) {
    if (!loading) send(s);
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-56px)]">
      {/* Header */}
      <div className="border-b border-border px-6 py-3 flex items-center gap-3 bg-card flex-shrink-0">
        <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
          <MessageSquare className="h-4 w-4 text-primary-foreground" />
        </div>
        <div>
          <h2 className="font-semibold text-sm leading-tight">HealthOS Data Assistant</h2>
          <p className="text-xs text-muted-foreground">Query live hospital data in plain English — no AI, real database answers</p>
        </div>
        <div className="ml-auto">
          <Badge variant="outline" className="text-xs gap-1 text-emerald-600 border-emerald-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
            Live DB
          </Badge>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
        {messages.map((msg) =>
          msg.role === "user" ? (
            <div key={msg.id} className="flex gap-3 items-start justify-end">
              <div className="bg-primary text-primary-foreground rounded-xl rounded-tr-none px-4 py-3 text-sm max-w-md">
                {msg.text}
              </div>
              <div className="w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center flex-shrink-0 mt-0.5">
                <User className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          ) : (
            <BotMessage key={msg.id} msg={msg} onSuggestion={handleSuggestion} />
          )
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border px-6 py-4 bg-card flex-shrink-0">
        <div className="flex gap-3 max-w-4xl mx-auto">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask about patients, beds, appointments, doctors, labs… (press Enter)"
            disabled={loading}
            className="flex-1"
            autoFocus
          />
          <Button onClick={() => send(input)} disabled={loading || !input.trim()} className="gap-2 px-5">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Send
          </Button>
        </div>
        <p className="text-xs text-muted-foreground text-center mt-2">
          All answers are fetched directly from the live HealthOS database — no AI or hallucination.
        </p>
      </div>
    </div>
  );
}
