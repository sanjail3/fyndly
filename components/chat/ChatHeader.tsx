import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Crown, Menu, Sparkles, PanelLeft 
} from 'lucide-react';

interface ChatHeaderProps {
  setSidebarOpen: (open: boolean) => void;
  sidebarOpen: boolean;
}

const ChatHeader = ({ setSidebarOpen, sidebarOpen }: ChatHeaderProps) => {
  return (
    <motion.div 
      className="sticky top-0 z-20 bg-gray-950/80 backdrop-blur-md border-b border-gray-800"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2, duration: 0.5 }}
    >
      <div className="px-4 py-3 sm:p-4 w-full mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Mobile sidebar toggle */}
            <motion.div 
              whileHover={{ scale: 1.1 }} 
              whileTap={{ scale: 0.9 }}
              className="md:hidden"
            >
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full text-[#C5F631] hover:bg-gray-800"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </Button>
            </motion.div>
            
            {/* Logo */}
            <motion.div 
              className="flex items-center gap-3" 
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <div className="relative">
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ 
                    repeat: Infinity, 
                    repeatType: "reverse",
                    duration: 2,
                    ease: "easeInOut"
                  }}
                >
                  <img 
                    src="/wizard_icon.png" 
                    alt="Leo Icon" 
                    className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
                  />
                </motion.div>
                <motion.div
                  className="absolute -bottom-1 -right-1 bg-[#C5F631] rounded-full flex items-center justify-center w-5 h-5 border-2 border-gray-900"
                  animate={{ 
                    scale: [1, 1.2, 1],
                    backgroundColor: ['#C5F631', '#8EC01D', '#C5F631']
                  }}
                  transition={{ 
                    repeat: Infinity,
                    duration: 3
                  }}
                >
                  <Crown className="w-3 h-3 text-white" />
                </motion.div>
              </div>
              
              <div>
                <motion.h1 
                  className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-[#C5F631] to-[#8EC01D] bg-clip-text text-transparent"
                  whileHover={{ scale: 1.05 }}
                >
                  Leo AI ✨
                </motion.h1>
                <p className="text-xs sm:text-sm text-gray-400">
                  Powered by advanced matching algorithms
                </p>
              </div>
            </motion.div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Stats badge */}
            <motion.div 
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-sm bg-gray-800 text-[#C5F631]"
              whileHover={{ scale: 1.05 }}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 10, 0],
                  scale: [1, 1.2, 1]
                }}
                transition={{ 
                  repeat: Infinity,
                  repeatDelay: 5,
                  duration: 1
                }}
              >
                <Sparkles className="w-4 h-4" />
              </motion.div>
              <span>1,000+ successful matches</span>
            </motion.div>
            
            {/* Desktop sidebar toggle button */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div 
                    whileHover={{ scale: 1.1 }} 
                    whileTap={{ scale: 0.9 }}
                    className="hidden md:flex"
                  >
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="rounded-full text-[#C5F631] hover:bg-gray-800"
                      onClick={() => setSidebarOpen(!sidebarOpen)}
                    >
                      <PanelLeft className="w-5 h-5" />
                    </Button>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>{sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ChatHeader; 