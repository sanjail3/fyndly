import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { 
  BookOpen, X, Zap, Laugh, Brain, MoreHorizontal, 
  Edit, Trash2, ChevronLeft, ChevronRight 
} from "lucide-react";
import { ChatHistory } from './types';

interface ChatSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  isHistoryLoading: boolean;
  chatHistory: ChatHistory[];
  activeChat: string | null;
  loadChat: (chatId: string) => void;
  startNewChat: () => void;
  openRenameDialog: (chatId: string, currentTitle: string) => void;
  handleDeleteChat: (chatId: string) => void;
}

const ChatSidebar = ({
  sidebarOpen,
  setSidebarOpen,
  isHistoryLoading,
  chatHistory,
  activeChat,
  loadChat,
  startNewChat,
  openRenameDialog,
  handleDeleteChat
}: ChatSidebarProps) => {
  return (
    <motion.div 
      initial={{ x: -320 }}
      animate={{ 
        x: sidebarOpen ? 0 : -320,
        boxShadow: sidebarOpen ? "5px 0 25px rgba(0,0,0,0.1)" : "none",
      }}
      transition={{ 
        type: "spring", 
        stiffness: 400, 
        damping: 40 
      }}
      className="fixed md:relative top-0 left-0 h-full z-40 md:z-10"
    >
      <div className="h-full w-80 bg-gray-900 rounded-r-xl flex flex-col">
        {/* Sidebar Drag Handle/Indicator - only shown on desktop */}
        <div className="absolute -right-3 top-1/2 transform -translate-y-1/2 hidden md:block">
          <motion.div 
            className="flex items-center justify-center w-6 h-24 bg-[#C5F631] rounded-full cursor-pointer shadow-lg"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <motion.div animate={{ x: [0, 3, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
              {sidebarOpen ? (
                <ChevronLeft className="w-4 h-4 text-white" />
              ) : (
                <ChevronRight className="w-4 h-4 text-white" />
              )}
            </motion.div>
          </motion.div>
        </div>

        {/* Sidebar Header */}
        <div className="p-4 bg-gradient-to-r from-[#8EC01D] to-black text-white rounded-tr-xl flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <motion.div
              whileHover={{ rotate: 15 }}
              transition={{ type: "spring", stiffness: 500 }}
            >
              <BookOpen className="w-5 h-5" />
            </motion.div>
            <h2 className="font-semibold text-lg">Chat History</h2>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white hover:bg-purple-700/50 rounded-full md:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
        
        {/* New Chat Button */}
        <div className="p-4 border-b border-gray-800">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button 
              className="w-full bg-gradient-to-r from-[#C5F631] to-[#8EC01D] hover:from-[#A3D224] hover:to-[#5A8012] gap-2 rounded-lg font-medium shadow-md text-gray-950"
              onClick={startNewChat}
            >
              <Zap className="w-4 h-4" />
              New Chat ✨
            </Button>
          </motion.div>
        </div>
        
        {/* Chat History List */}
        <ScrollArea className="flex-1 px-2">
          {isHistoryLoading ? (
            <div className="p-6 text-center">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="mx-auto w-8 h-8 text-[#C5F631]"
              >
                <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </motion.div>
              <p className="mt-2 text-sm text-gray-400">Loading your conversations...</p>
            </div>
          ) : chatHistory.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <Laugh className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No chat history yet</p>
              <p className="text-sm mt-2">Start a new conversation!</p>
            </div>
          ) : (
            <div className="space-y-2 p-2 mt-2">
              {chatHistory.map((chat) => (
                <motion.div 
                  key={chat.id}
                  className={`p-3 rounded-xl cursor-pointer transition-all duration-200 flex items-center justify-between shadow-sm hover:shadow-md
                    ${activeChat === chat.id ? 
                      'bg-gradient-to-r from-gray-800 to-gray-700 border-l-4 border-[#C5F631]' : 
                      'hover:bg-gray-800 border border-gray-700'}
                  `}
                  onClick={() => loadChat(chat.id)}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex flex-col flex-1 overflow-hidden">
                    <div className="flex items-center">
                      <Brain className="w-4 h-4 mr-2 text-[#C5F631]" />
                      <h3 className="text-base font-semibold truncate text-gray-100">
                        {chat.title}
                      </h3>
                    </div>
                    <p className="text-sm truncate mt-1 text-gray-400">
                      {chat.subtitle}
                    </p>
                    <p className="text-xs mt-1 text-gray-400">
                      {chat.timestamp}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="flex-shrink-0 rounded-full hover:bg-gray-800"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        onClick={(e) => { e.stopPropagation(); openRenameDialog(chat.id, chat.title); }}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={(e) => { e.stopPropagation(); handleDeleteChat(chat.id); }} 
                        className="text-red-500"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </motion.div>
              ))}
            </div>
          )}
        </ScrollArea>
        
        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-700 bg-gray-900">
          <div className="flex items-center justify-center">
            <div className="text-xs text-[#C5F631] font-medium">
              Made with 💚 | Leo AI ✨
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ChatSidebar; 