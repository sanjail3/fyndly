import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Heart, Star, Zap, CheckCheck, Eye, Check, X, Trash2 } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { useConnectionsContext } from "@/components/ConnectionsProvider";
import { useState } from "react";

interface NotificationsListProps {
  onViewProfile?: (userId: string) => void;
}

const NotificationsList = ({ onViewProfile }: NotificationsListProps) => {
  const { notifications, loading, markAsRead, markAllAsRead, refetch } = useNotifications();
  const { acceptConnectionRequest, declineConnectionRequest, loading: connectionLoading } = useConnectionsContext();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'connection_accepted':
        return <Heart className="h-4 w-4 text-green-400" />;
      case 'match_created':
        return <Zap className="h-4 w-4 text-[#CAFE33]" />;
      case 'connection_request':
        return <Heart className="h-4 w-4 text-[#CAFE33]" />;
      default:
        return <Heart className="h-4 w-4 text-red-400" />;
    }
  };

  const handleNotificationClick = (notification: any) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
    if (notification.related_user_id && onViewProfile && notification.type !== 'connection_request') {
      onViewProfile(notification.related_user_id);
    }
  };

  const handleAcceptRequest = async (notificationId: string, connectionRequestId: string) => {
    const success = await acceptConnectionRequest(connectionRequestId);
    if (success) {
      // Try to mark as read and delete, but ignore if already deleted
      try {
        await markAsRead(notificationId);
        await deleteNotification(notificationId);
      } catch (err) {
        // Ignore not found errors
      }
      refetch();
    }
  };

  const handleDeclineRequest = async (notificationId: string, connectionRequestId: string) => {
    const success = await declineConnectionRequest(connectionRequestId);
    if (success) {
      try {
        await markAsRead(notificationId);
        await deleteNotification(notificationId);
      } catch (err) {
        // Ignore not found errors
      }
      refetch();
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      setDeletingId(notificationId);
      const response = await fetch(`/api/notifications?notificationId=${notificationId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete notification');
      }

      // Refresh notifications after deletion
      refetch();
    } catch (error) {
      console.error('Error deleting notification:', error);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[200px] flex flex-col items-center justify-center">
        <div className="w-16 h-16 bg-gradient-to-r from-[#CAFE33] to-[#B8E62E] rounded-2xl flex items-center justify-center animate-pulse shadow-xl mb-2">
          <span className="text-2xl font-bold text-black">🔔</span>
        </div>
        <p className="text-gray-400">Loading notifications...</p>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">🔔</div>
        <h2 className="text-xl font-semibold text-gray-400 mb-2">No notifications yet</h2>
        <p className="text-gray-500">You'll see notifications here when people interact with you!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {notifications.filter(n => !n.is_read).length > 0 && (
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-400">
            {notifications.filter(n => !n.is_read).length} unread notifications
          </p>
          <Button
            onClick={markAllAsRead}
            variant="ghost"
            size="sm"
            className="text-[#CAFE33] hover:bg-[#CAFE33]/10"
          >
            <CheckCheck className="h-4 w-4 mr-1" />
            Mark all read
          </Button>
        </div>
      )}

      {notifications.map((notification) => (
        <Card 
          key={notification.id} 
          className={`border-gray-600/50 hover:border-[#CAFE33]/50 transition-all duration-300 ${
            notification.type !== 'connection_request' ? 'cursor-pointer' : ''
          } ${
            !notification.is_read ? 'bg-[#CAFE33]/5 border-[#CAFE33]/30' : 'bg-gray-800/50'
          }`}
          onClick={notification.type !== 'connection_request' ? () => handleNotificationClick(notification) : undefined}
        >
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
              <div className="relative flex-shrink-0">
                <Avatar className="h-10 w-10 sm:h-12 sm:w-12 border-2 border-[#CAFE33]/40">
                  <AvatarImage src={notification.related_user?.avatar_url || "/placeholder.svg"} />
                  <AvatarFallback className="bg-gradient-to-br from-[#CAFE33] to-[#B8E62E] text-black font-bold text-sm">
                    {notification.related_user?.full_name?.split(' ').map(n => n[0]).join('') || '?'}
                  </AvatarFallback>
                </Avatar>
                {!notification.is_read && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#CAFE33] rounded-full"></div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  {getNotificationIcon(notification.type)}
                  <h3 className="font-semibold text-white text-sm sm:text-base truncate">
                    {notification.title}
                  </h3>
                  {notification.type === 'match_created' && (
                    <Badge className="bg-gradient-to-r from-[#CAFE33] to-[#B8E62E] text-black font-bold text-xs">
                      ✨ Match
                    </Badge>
                  )}
                  {notification.type === 'connection_request' && (
                    <Badge className="bg-blue-500/20 text-blue-400 font-bold text-xs">
                      🤝 Request
                    </Badge>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-gray-400 mb-1">
                  {notification.message}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(notification.created_at).toLocaleDateString()} • {new Date(notification.created_at).toLocaleTimeString()}
                </p>
              </div>
              
              <div className="flex gap-2 flex-shrink-0">
                {notification.type === 'connection_request' && notification.connection_request_id ? (
                  <>
                    <Button
                      onClick={() => handleAcceptRequest(notification.id, notification.connection_request_id!)}
                      disabled={connectionLoading || deletingId === notification.id}
                      className="bg-gradient-to-r from-[#CAFE33] to-[#B8E62E] text-black hover:from-[#B8E62E] hover:to-[#CAFE33] font-semibold px-3 py-1 rounded-xl transition-all duration-300 hover:scale-105 text-xs"
                    >
                      <Check className="h-3 w-3 mr-1" />
                      Accept
                    </Button>
                    <Button
                      onClick={() => handleDeclineRequest(notification.id, notification.connection_request_id!)}
                      disabled={connectionLoading || deletingId === notification.id}
                      variant="outline"
                      className="border-red-500 text-red-400 hover:bg-red-500/10 px-3 py-1 rounded-xl text-xs"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Decline
                    </Button>
                  </>
                ) : null}
                
                {notification.related_user_id && onViewProfile && (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewProfile(notification.related_user_id!);
                      if (!notification.is_read) {
                        markAsRead(notification.id);
                      }
                    }}
                    variant="outline"
                    size="sm"
                    className="border-gray-600 text-gray-300 hover:border-[#CAFE33] hover:text-[#CAFE33] px-2 py-1 rounded-lg text-xs"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    <span>View</span>
                  </Button>
                )}

                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(notification.id);
                  }}
                  variant="ghost"
                  size="sm"
                  disabled={deletingId === notification.id}
                  className="text-gray-400 hover:text-red-400 hover:bg-red-400/10 px-2 py-1 rounded-lg text-xs"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default NotificationsList;
