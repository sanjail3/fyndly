import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Heart, Star, Zap, Eye, Check, X, AlertCircle } from "lucide-react";
import { useConnectionsContext } from "@/components/ConnectionsProvider";

interface NotificationCardProps {
  notification: {
    id: string;
    type: 'like' | 'match' | 'super_like';
    user: {
      id: string;
      name: string;
      department: string;
      year: string;
      avatar: string;
      interests: string[];
      lookingFor: string[];
      bio: string;
      matchPercentage: number;
      location: string;
      projects: string[];
      isOnline: boolean;
      age?: number;
      funTags?: string[];
      skills?: {
        tech?: string[];
        personal?: string[];
      };
      socials?: {
        github?: string;
        linkedin?: string;
        twitter?: string;
        website?: string;
        email?: string;
      };
    };
    timestamp: string;
    isUnavailable?: boolean;
  };
  onViewProfile?: (userId: string) => void;
  isMatched?: boolean;
  connectionRequest?: {
    id: string;
    sender_id: string;
    receiver_id: string;
    status: string;
  };
}

const NotificationCard = ({ notification, onViewProfile, isMatched = false, connectionRequest }: NotificationCardProps) => {
  const { acceptConnectionRequest, declineConnectionRequest, loading, refreshData } = useConnectionsContext();

  const getNotificationIcon = () => {
    if (notification.isUnavailable) {
      return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
    switch (notification.type) {
      case 'super_like':
        return <Star className="h-4 w-4 text-yellow-400" />;
      case 'match':
        return <Zap className="h-4 w-4 text-[#CAFE33]" />;
      default:
        return <Heart className="h-4 w-4 text-red-400" />;
    }
  };

  const getNotificationText = () => {
    if (notification.isUnavailable) {
      return 'User no longer available';
    }
    if (connectionRequest) {
      return 'Wants to connect!';
    }
    switch (notification.type) {
      case 'super_like':
        return 'Super liked you!';
      case 'match':
        return 'It\'s a match!';
      default:
        return 'Liked your profile!';
    }
  };

  const handleAccept = async () => {
    if (connectionRequest && !notification.isUnavailable) {
      const success = await acceptConnectionRequest(connectionRequest.id);
      if (success) {
        await refreshData();
      }
    }
  };

  const handleDecline = async () => {
    if (connectionRequest) {
      const success = await declineConnectionRequest(connectionRequest.id);
      if (success) {
        await refreshData();
      }
    }
  };

  return (
    <Card className={`border-gray-600/50 hover:border-[#CAFE33]/50 transition-all duration-300 ${
      notification.isUnavailable ? 'bg-gray-900/50 opacity-75' : 'bg-gray-800/50'
    }`}>
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
          <div className="relative flex-shrink-0">
            <Avatar className={`h-10 w-10 sm:h-12 sm:w-12 border-2 ${
              notification.isUnavailable ? 'border-gray-600' : 'border-[#CAFE33]/40'
            }`}>
              <AvatarImage src={notification.user.avatar} />
              <AvatarFallback className={`font-bold text-sm ${
                notification.isUnavailable 
                  ? 'bg-gray-700 text-gray-400' 
                  : 'bg-gradient-to-br from-[#CAFE33] to-[#B8E62E] text-black'
              }`}>
                {notification.user.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            {notification.user.isOnline && !notification.isUnavailable && (
              <div className="absolute -bottom-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full border-2 border-gray-800"></div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              {getNotificationIcon()}
              <h3 className={`font-semibold text-sm sm:text-base truncate ${
                notification.isUnavailable ? 'text-gray-400' : 'text-white'
              }`}>
                {notification.user.name}
              </h3>
              {!notification.isUnavailable && (
                <Badge className="bg-[#CAFE33]/20 text-[#CAFE33] text-xs">
                  {notification.user.matchPercentage}%
                </Badge>
              )}
            </div>
            <p className={`text-xs sm:text-sm mb-1 ${
              notification.isUnavailable ? 'text-gray-500' : 'text-gray-400'
            }`}>
              {getNotificationText()}
            </p>
            <p className="text-xs text-gray-500">{notification.user.department} • {notification.timestamp}</p>
          </div>
          <div className="flex flex-col gap-2 flex-shrink-0 min-w-0 w-[80px]">
            {onViewProfile && !notification.isUnavailable && (
              <Button
                onClick={() => onViewProfile(notification.user.id)}
                variant="outline"
                size="sm"
                className="border-gray-600 text-gray-300 hover:border-[#CAFE33] hover:text-[#CAFE33] px-2 py-1 rounded-lg text-xs w-full sm:w-auto"
              >
                <Eye className="h-3 w-3 mr-1" />
                <span>View</span>
              </Button>
            )}
            {connectionRequest && connectionRequest.status === 'PENDING' && !notification.isUnavailable ? (
              <div className="flex gap-1">
                <Button
                  onClick={handleAccept}
                  disabled={loading}
                  className="bg-[#CAFE33] text-black hover:bg-[#B8E62E] font-semibold px-2 py-1 rounded-xl transition-all duration-300 hover:scale-105 text-xs flex-1"
                >
                  <Check className="h-3 w-3" />
                </Button>
                <Button
                  onClick={handleDecline}
                  disabled={loading}
                  variant="outline"
                  className="border-red-500 text-red-400 hover:bg-red-500/10 px-2 py-1 rounded-xl text-xs"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : connectionRequest && connectionRequest.status === 'PENDING' && notification.isUnavailable ? (
              <Button
                onClick={handleDecline}
                disabled={loading}
                variant="outline"
                className="border-gray-600 text-gray-500 hover:bg-gray-600/10 px-2 py-1 rounded-xl text-xs w-full"
              >
                <X className="h-3 w-3 mr-1" />
                <span>Remove</span>
              </Button>
            ) : isMatched ? (
              <Badge className="bg-gradient-to-r from-[#CAFE33] to-[#B8E62E] text-black font-bold text-xs px-3 py-1 rounded-xl">
                ✨ Matched
              </Badge>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationCard;
