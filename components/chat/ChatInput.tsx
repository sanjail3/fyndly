import { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Rocket } from "lucide-react";
import { toast } from "sonner";

interface ChatInputProps {
  input: string;
  setInput: (input: string) => void;
  sendMessage: (e: React.FormEvent) => Promise<void>;
  isTyping: boolean;
  handleSlashCommand?: (command: string) => void;
}

const ChatInput = ({ input, setInput, sendMessage, isTyping, handleSlashCommand }: ChatInputProps) => {
  const [showCommandsPopup, setShowCommandsPopup] = useState(false);
  
  // Check if the input starts with / to show the commands popup
  useEffect(() => {
    if (input === '/') {
      setShowCommandsPopup(true);
    } else {
      setShowCommandsPopup(false);
    }
  }, [input]);

  // Handle command selection from popup
  const handleCommandSelect = async (command: string) => {
    setShowCommandsPopup(false);
    
    if (command === '/startup') {
      try {
        // Fetch user profile data
        const response = await fetch('/api/user/profile');
        const data = await response.json();
        
        if (data.success && data.user) {
          const user = data.user;
          
          // Create startup template with real user data
          let startupTemplate = "";
          
          if (user.startupName) {
            startupTemplate = `I'm building ${user.startupName}`;
          } else {
            startupTemplate = "I'm building [startup name]";
          }
          
          if (user.startupIndustry && user.startupIndustry.length > 0) {
            startupTemplate += ` in the ${user.startupIndustry.join(', ')} space`;
          } else {
            startupTemplate += " in the [industry] space";
          }
          
          if (user.startupStage) {
            startupTemplate += `. We're currently at ${user.startupStage}`;
          } else {
            startupTemplate += ". We're currently at [stage]";
          }
          
          startupTemplate += " and looking for investors";
          
          if (user.startupFundraisingGoal) {
            const formattedGoal = new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              maximumFractionDigits: 0
            }).format(user.startupFundraisingGoal);
            
            startupTemplate += ` to help us raise ${formattedGoal}`;
          }
          
          if (user.startupDescription) {
            startupTemplate += `. ${user.startupDescription}`;
          } else {
            startupTemplate += ". [Additional information about your startup]";
          }
          
          // Set the input with the populated template
          setInput(startupTemplate);
        } else {
          // Fallback to template if no user data
          setInput(`I'm building a [startup name] in the [industry] space. We're currently at [stage] and looking for investors who specialize in [focus area]. Our target market is [target market], and we've already achieved [traction/milestone]. We're seeking [investment amount] to help us [goal].`);
          console.error("Error fetching user profile:", data);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        // Fallback to template if error
        setInput(`I'm building a [startup name] in the [industry] space. We're currently at [stage] and looking for investors who specialize in [focus area]. Our target market is [target market], and we've already achieved [traction/milestone]. We're seeking [investment amount] to help us [goal].`);
      }
    } else {
      // For other commands, use the handler if available
      if (handleSlashCommand) {
        handleSlashCommand(command);
      }
    }
  };

  // Handle input change with slash command detection
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);

    // Check for /startup command
    if (value === '/startup') {
      handleCommandSelect('/startup');
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 border-t bg-gray-950/50 backdrop-blur-sm">
      <form onSubmit={sendMessage} className="max-w-5xl mx-auto">
        <div className="flex space-x-2 sm:space-x-4 relative">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Describe your startup idea... (type /startup to insert your profile info)"
            className="flex-1 bg-gray-900 border-gray-700 focus:ring-[#C5F631] focus:border-[#C5F631] text-base sm:text-lg py-4 sm:py-6 text-gray-100"
          />
          <Button 
            type="submit"
            className="bg-[#C5F631] hover:bg-[#8EC01D] text-gray-950 px-4 sm:px-8 py-4 sm:py-6"
            disabled={isTyping || !input.trim()}
          >
            <Send className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
          
          {/* Commands Popup */}
          {showCommandsPopup && (
            <div className="absolute bottom-full left-0 mb-2 bg-gray-900 rounded-lg shadow-lg p-2 border border-gray-700 w-64 z-10">
              <div className="text-sm font-medium text-gray-400 px-2 py-1 mb-1">Available Commands</div>
              <div 
                className="flex items-center px-2 py-2 hover:bg-gray-800 rounded cursor-pointer"
                onClick={() => handleCommandSelect('/startup')}
              >
                <div className="flex-shrink-0 w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
                  <Rocket size={16} className="text-[#C5F631]" />
                </div>
                <div className="ml-2">
                  <div className="text-sm font-medium text-gray-100">/startup</div>
                  <div className="text-xs text-gray-400">Insert your startup information</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default ChatInput; 