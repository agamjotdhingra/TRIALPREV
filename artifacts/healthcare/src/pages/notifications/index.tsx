import { useListNotifications, useMarkNotificationRead, getListNotificationsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, CheckCircle2, AlertCircle, Info, Calendar } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export default function Notifications() {
  const { data: notifications, isLoading } = useListNotifications({});
  const markRead = useMarkNotificationRead();
  const queryClient = useQueryClient();

  const handleMarkRead = (id: number) => {
    markRead.mutate({ id }, {
      onSuccess: () => {
        // Optimistic UI update could go here or simple invalidation
        queryClient.invalidateQueries({ queryKey: getListNotificationsQueryKey({}) });
      }
    });
  };

  const getIcon = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('alert') || t.includes('critical')) return <AlertCircle className="h-5 w-5 text-red-500" />;
    if (t.includes('appointment')) return <Calendar className="h-5 w-5 text-blue-500" />;
    if (t.includes('success')) return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
    return <Info className="h-5 w-5 text-indigo-500" />;
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground mt-2">Alerts, updates, and system messages.</p>
        </div>
        <Button variant="outline" className="gap-2">
          <CheckCircle2 className="h-4 w-4" />
          Mark All as Read
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">Loading notifications...</div>
          ) : (
            <div className="divide-y divide-border">
              {notifications?.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`flex gap-4 p-4 transition-colors hover:bg-muted/50 ${!notification.isRead ? 'bg-primary/5 dark:bg-primary/10' : ''}`}
                >
                  <div className="shrink-0 mt-1">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-start">
                      <p className={`text-sm font-medium ${!notification.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {notification.title}
                      </p>
                      <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                        {new Date(notification.createdAt).toLocaleDateString()} {new Date(notification.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {notification.message}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <div className="shrink-0">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleMarkRead(notification.id)}
                        disabled={markRead.isPending}
                        title="Mark as read"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
              {(!notifications || notifications.length === 0) && (
                <div className="py-12 flex flex-col items-center justify-center text-muted-foreground">
                  <Bell className="h-12 w-12 text-muted mb-4" />
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