import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

interface SidebarHintProps {
  sidebarOpen: boolean;
  sidebarHintShown: boolean;
}

const SidebarHint = ({ sidebarOpen, sidebarHintShown }: SidebarHintProps) => {
  return (
    <AnimatePresence>
      {!sidebarOpen && sidebarHintShown && (
        <motion.div 
          className="fixed left-0 top-24 z-10 hidden md:block"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -20, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div 
            className="flex items-center space-x-2 bg-[#C5F631] text-gray-950 px-3 py-2 rounded-r-lg shadow-lg"
            animate={{ x: [0, 5, 0] }}
            transition={{ repeat: 2, duration: 1 }}
          >
            <ChevronRight className="w-4 h-4" />
            <span className="text-sm font-medium">Open chat history</span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SidebarHint; 