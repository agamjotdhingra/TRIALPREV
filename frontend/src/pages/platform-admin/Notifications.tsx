import { useListNotifications, useMarkNotificationRead } from "@/api/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, CheckCircle2, AlertCircle, Info, Calendar } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export default function AdminNotifications() {
  const { data: notifications, isLoading, refetch } = useListNotifications({});
  const markRead = useMarkNotificationRead();

  const handleMarkRead = async (id: number) => {
    try {
      await markRead.mutateAsync(id);
      refetch();
    } catch { /* noop */ }
  };

  const getIcon = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('alert') || t.includes('critical')) return <AlertCircle className="h-5 w-5 text-red-400" />;
    if (t.includes('appointment')) return <Calendar className="h-5 w-5 text-blue-400" />;
    if (t.includes('success')) return <CheckCircle2 className="h-5 w-5 text-emerald-400" />;
    return <Info className="h-5 w-5 text-indigo-400" />;
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Platform Notifications</h1>
          <p className="text-slate-400 mt-2">Alerts, updates, and system messages.</p>
        </div>
      </div>

      <Card className="bg-slate-900 border-slate-800 text-white overflow-hidden">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="text-center py-12 text-slate-400">Loading notifications...</div>
          ) : (
            <div className="divide-y divide-slate-800">
              {notifications?.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex gap-4 p-4 transition-colors hover:bg-slate-800/40 ${!(notification.is_read || notification.isRead) ? 'bg-blue-500/5' : ''}`}
                >
                  <div className="shrink-0 mt-1">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-start">
                      <p className={`text-sm font-semibold ${!(notification.is_read || notification.isRead) ? 'text-white' : 'text-slate-400'}`}>
                        {notification.title}
                      </p>
                      <span className="text-xs text-slate-500 whitespace-nowrap ml-4">
                        {new Date(notification.created_at || notification.createdAt).toLocaleDateString()} {new Date(notification.created_at || notification.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400">
                      {notification.message}
                    </p>
                  </div>
                  {!(notification.is_read || notification.isRead) && (
                    <div className="shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleMarkRead(notification.id)}
                        disabled={markRead.isPending}
                        title="Mark as read"
                        className="text-slate-400 hover:text-white hover:bg-slate-800"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
              {(!notifications || notifications.length === 0) && (
                <div className="py-12 flex flex-col items-center justify-center text-slate-400">
                  <Bell className="h-12 w-12 text-slate-600 mb-4" />
                  <p>You're all caught up!</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
