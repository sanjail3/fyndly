
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Heart, Star, Zap, Eye, Check, X } from "lucide-react";

interface NotificationCardProps {
  notification: {
    id: number;
    type: 'like' | 'match' | 'super_like';
    user: {
      id: number;
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
  };
  onViewProfile?: (userId: number) => void;
}

const NotificationCard = ({ notification, onViewProfile }: NotificationCardProps) => {
  const getNotificationIcon = () => {
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
    switch (notification.type) {
      case 'super_like':
        return 'Super liked you!';
      case 'match':
        return 'It\'s a match!';
      default:
        return 'Liked your profile!';
    }
  };

  return (
    <Card className="bg-gray-800/50 border-gray-600/50 hover:border-[#CAFE33]/50 transition-all duration-300">
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
          <div className="relative flex-shrink-0">
            <Avatar className="h-10 w-10 sm:h-12 sm:w-12 border-2 border-[#CAFE33]/40">
              <AvatarImage src={notification.user.avatar} />
              <AvatarFallback className="bg-gradient-to-br from-[#CAFE33] to-[#B8E62E] text-black font-bold text-sm">
                {notification.user.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            {notification.user.isOnline && (
              <div className="absolute -bottom-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full border-2 border-gray-800"></div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              {getNotificationIcon()}
              <h3 className="font-semibold text-white text-sm sm:text-base truncate">{notification.user.name}</h3>
              <Badge className="bg-[#CAFE33]/20 text-[#CAFE33] text-xs">
                {notification.user.matchPercentage}%
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-gray-400 mb-1">{getNotificationText()}</p>
            <p className="text-xs text-gray-500">{notification.user.department} • {notification.timestamp}</p>
          </div>
          <div className="flex flex-col gap-2 flex-shrink-0 min-w-0 w-[80px]">
            {onViewProfile && (
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
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface NotificationsSectionProps {
  onViewProfile: (userId: number) => void;
}

const NotificationsSection = ({ onViewProfile }: NotificationsSectionProps) => {
  const mockNotifications = [
    {
      id: 1,
      type: 'like' as const,
      user: {
        id: 101,
        name: 'Alice Johnson',
        department: 'Computer Science',
        year: '4th Year',
        avatar: 'https://i.pravatar.cc/150?img=1',
        interests: ['AI', 'Machine Learning', 'Data Science'],
        lookingFor: ['Project Collaboration', 'Networking'],
        bio: 'Passionate about AI and its applications in healthcare.',
        matchPercentage: 85,
        location: 'Stanford University',
        projects: ['AI Diagnosis Tool', 'Sentiment Analysis App'],
        isOnline: true,
        age: 22,
        funTags: ['Tech Enthusiast', 'Coffee Lover'],
        skills: {
          tech: ['Python', 'TensorFlow', 'SQL'],
          personal: ['Teamwork', 'Problem-solving']
        },
        socials: {
          github: 'https://github.com/alicejohnson',
          linkedin: 'https://linkedin.com/in/alicejohnson',
          twitter: 'https://twitter.com/alicejohnson',
          website: 'https://alicejohnson.com',
          email: 'alice.johnson@example.com'
        }
      },
      timestamp: '2 hours ago'
    },
    {
      id: 2,
      type: 'match' as const,
      user: {
        id: 102,
        name: 'Bob Williams',
        department: 'Electrical Engineering',
        year: '3rd Year',
        avatar: 'https://i.pravatar.cc/150?img=2',
        interests: ['Robotics', 'Embedded Systems', 'IoT'],
        lookingFor: ['Internship', 'Mentorship'],
        bio: 'Interested in building the next generation of smart devices.',
        matchPercentage: 92,
        location: 'MIT',
        projects: ['Smart Home Automation System', 'Autonomous Vehicle Project'],
        isOnline: false,
        age: 21,
        funTags: ['Robotics Geek', 'Outdoor Adventurer'],
        skills: {
          tech: ['C++', 'ROS', 'Arduino'],
          personal: ['Leadership', 'Communication']
        },
        socials: {
          github: 'https://github.com/bobwilliams',
          linkedin: 'https://linkedin.com/in/bobwilliams',
          twitter: 'https://twitter.com/bobwilliams',
          website: 'https://bobwilliams.com',
          email: 'bob.williams@example.com'
        }
      },
      timestamp: '1 day ago'
    },
    {
      id: 3,
      type: 'super_like' as const,
      user: {
        id: 103,
        name: 'Charlie Brown',
        department: 'Mechanical Engineering',
        year: '2nd Year',
        avatar: 'https://i.pravatar.cc/150?img=3',
        interests: ['Aerospace', 'Fluid Dynamics', 'Thermodynamics'],
        lookingFor: ['Research Opportunities', 'Team Projects'],
        bio: 'Aspiring aerospace engineer with a passion for space exploration.',
        matchPercentage: 78,
        location: 'Caltech',
        projects: ['Rocket Design Project', 'Wind Tunnel Testing'],
        isOnline: true,
        age: 20,
        funTags: ['Space Enthusiast', 'DIY Projects'],
        skills: {
          tech: ['MATLAB', 'CAD', 'CFD'],
          personal: ['Critical Thinking', 'Time Management']
        },
        socials: {
          github: 'https://github.com/charliebrown',
          linkedin: 'https://linkedin.com/in/charliebrown',
          twitter: 'https://twitter.com/charliebrown',
          website: 'https://charliebrown.com',
          email: 'charlie.brown@example.com'
        }
      },
      timestamp: '3 days ago'
    }
  ];

  return (
    <div className="space-y-4">
      {mockNotifications.map((notification) => (
        <NotificationCard
          key={notification.id}
          notification={notification}
          onViewProfile={onViewProfile}
        />
      ))}
    </div>
  );
};

export default NotificationsSection;
