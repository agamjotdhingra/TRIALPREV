import { Badge } from "@/components/ui/badge";
import { Video, MessageSquare, User, AlertTriangle } from "lucide-react";

export function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase();
  let colorClass = "bg-muted text-muted-foreground";

  if (s === "scheduled") colorClass = "bg-blue-900/30 text-blue-400 border border-blue-500/20";
  if (s === "completed") colorClass = "bg-emerald-900/30 text-emerald-400 border border-emerald-500/20";
  if (s === "cancelled") colorClass = "bg-red-900/30 text-red-400 border border-red-500/20";
  if (s === "rescheduled") colorClass = "bg-orange-900/30 text-orange-400 border border-orange-500/20";

  return <Badge className={`${colorClass} hover:${colorClass} capitalize px-2 py-0.5 rounded-full font-medium text-xs`}>{status}</Badge>;
}

export function TypeIcon({ type }: { type?: string | null }) {
  if (type === "video") return <Video className="h-4 w-4" />;
  if (type === "chat") return <MessageSquare className="h-4 w-4" />;
  return <User className="h-4 w-4" />;
}

export function RiskBadge({ level }: { level?: string | null }) {
  if (!level) return null;
  const l = level.toLowerCase();

  let colorClass = "bg-slate-800 text-slate-400";
  if (l === "healthy") colorClass = "bg-emerald-950/40 text-emerald-400 border border-emerald-500/20";
  if (l === "moderate") colorClass = "bg-yellow-950/40 text-yellow-400 border border-yellow-500/20";
  if (l === "high") colorClass = "bg-orange-950/40 text-orange-400 border border-orange-500/20";
  if (l === "critical") colorClass = "bg-red-950/40 text-red-400 border border-red-500/20";

  return <Badge className={`${colorClass} hover:${colorClass} capitalize px-2.5 py-0.5 rounded-full font-semibold text-xs`}>{level}</Badge>;
}
