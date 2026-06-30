import { Badge } from "@/components/ui/badge";
import { Video, MessageSquare, User } from "lucide-react";

export function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase();

  let style: React.CSSProperties = { background: 'hsl(150 20% 93%)', color: 'hsl(152 10% 42%)', border: '1px solid hsl(150 20% 84%)' };

  if (s === "scheduled")   style = { background: 'hsl(214 80% 94%)',  color: 'hsl(214 80% 35%)',  border: '1px solid hsl(214 60% 80%)' };
  if (s === "completed")   style = { background: 'hsl(152 60% 91%)',  color: 'hsl(152 72% 28%)',  border: '1px solid hsl(152 50% 75%)' };
  if (s === "cancelled")   style = { background: 'hsl(4 80% 94%)',    color: 'hsl(4 72% 40%)',    border: '1px solid hsl(4 60% 78%)' };
  if (s === "rescheduled") style = { background: 'hsl(25 90% 93%)',   color: 'hsl(25 80% 40%)',   border: '1px solid hsl(25 70% 76%)' };

  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize"
      style={style}
    >
      {status}
    </span>
  );
}

export function TypeIcon({ type }: { type?: string | null }) {
  if (type === "video") return <Video className="h-4 w-4" />;
  if (type === "chat")  return <MessageSquare className="h-4 w-4" />;
  return <User className="h-4 w-4" />;
}

export function RiskBadge({ level }: { level?: string | null }) {
  if (!level) return null;
  const l = level.toLowerCase();

  let style: React.CSSProperties = { background: 'hsl(150 20% 93%)', color: 'hsl(152 10% 42%)', border: '1px solid hsl(150 20% 84%)' };
  if (l === "healthy")  style = { background: 'hsl(152 60% 91%)',  color: 'hsl(152 72% 28%)',  border: '1px solid hsl(152 50% 72%)' };
  if (l === "moderate") style = { background: 'hsl(48 90% 92%)',   color: 'hsl(38 85% 30%)',   border: '1px solid hsl(48 75% 70%)' };
  if (l === "high")     style = { background: 'hsl(25 90% 93%)',   color: 'hsl(25 80% 35%)',   border: '1px solid hsl(25 70% 72%)' };
  if (l === "critical") style = { background: 'hsl(4 80% 93%)',    color: 'hsl(4 72% 38%)',    border: '1px solid hsl(4 60% 72%)' };

  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold capitalize"
      style={style}
    >
      {level}
    </span>
  );
}
