"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react"; 
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSearchParams } from "next/navigation";
import { Loader2, MessageSquare } from "lucide-react";
import { toast, Toaster } from "sonner";
import { motion, AnimatePresence } from 'framer-motion';
import "./index.css";

// Import our custom components
import FormattedMessage from "@/components/chat/FormattedMessage";
import HeroMessage from "@/components/chat/HeroMessage";
import ChatBubble from "@/components/chat/ChatBubble";
import ChatSidebar from "@/components/chat/ChatSidebar";
import ChatInput from "@/components/chat/ChatInput";
import ChatHeader from "@/components/chat/ChatHeader";
import RenameDialog from "@/components/chat/RenameDialog";
import BulkActionPanel from "@/components/chat/BulkActionPanel";
import SidebarHint from "@/components/chat/SidebarHint";
import TypingIndicator from "@/components/chat/TypingIndicator";
import { ChatMessage, ChatHistory } from "@/components/chat/types";
import ChatRecommendationBubble from '@/components/chat/ChatRecommendationBubble';

// Import other related components
import ListDialog from '@/components/shared/ListDialog';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Helper to fetch with Supabase access token in Authorization header
async function fetchWithSupabaseAuth(url: string, options: any = {}) {
  const supabase = createClientComponentClient();
  const { data: { session } } = await supabase.auth.getSession();
  const accessToken = session?.access_token;
  console.log('fetchWithSupabaseAuth: session', session);
  console.log('fetchWithSupabaseAuth: accessToken', accessToken);
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session?.access_token || ''}`,
      ...(options.headers || {}),
    },
    credentials: 'include',
  });
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      type: "bot",
      isHero: true,
      content: {
        title: "Discover Your Perfect Connections",
        subtitle: "Find like-minded people, discover amazing content, and build meaningful relationships.",
        prompt: "What are you looking for? I can help you find friends, recommend books, movies, podcasts, TV shows, and more!"
      }
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [userProfileData, setUserProfileData] = useState<any>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(false);

  // Investors related state
  const searchParams = useSearchParams();
  const listIdParam = searchParams.get("listId");
  const [selectedSuggestions, setSelectedSuggestions] = useState<string[]>([]);
  const [showAddInvestorsDialog, setShowAddInvestorsDialog] = useState(false);
  const [sidebarHintShown, setSidebarHintShown] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [userIcon, setUserIcon] = useState<string | null>(null);
  
  // Dialog related state
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [renameChatId, setRenameChatId] = useState<string | null>(null);
  const [newChatTitle, setNewChatTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Trigger animation after component mounts
    setIsVisible(true);
  }, []);

  useEffect(() => {
    fetch('/api/auth/user', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        if (data.user && data.user.user_metadata && data.user.user_metadata.avatar_url) {
          setUserIcon(data.user.user_metadata.avatar_url);
        }
      })
      .catch((error) => console.error("Error fetching user icon:", error));
  }, []);

  useEffect(() => {
    if (sidebarHintShown) {
      const timer = setTimeout(() => {
        setSidebarHintShown(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [sidebarHintShown]);

  // Show hint again when sidebar closes
  useEffect(() => {
    if (!sidebarOpen) {
      setSidebarHintShown(true);
    }
  }, [sidebarOpen]);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch chat history when component mounts
  useEffect(() => {
    fetchChatHistory();
    fetchUserProfile();
  }, []);

  // Helper function to detect if content is likely formatted
  const isFormattedContent = (content: string): boolean => {
    // Check for common markdown patterns
    const markdownPatterns = [
      /^#+ /m,                 // Headers
      /\*\*.*?\*\*/,           // Bold
      /\*.*?\*/,               // Italic
      /`.*?`/,                 // Inline code
      /```[\s\S]*?```/,        // Code blocks
      /\[.*?\]\(.*?\)/,        // Links
      /^\s*[-*+]\s/m,          // List items
      /^\s*\d+\.\s/m,          // Numbered list
      /^\s*>\s/m,              // Blockquotes
      /\|.*\|.*\|/,            // Tables
      /!\[.*?\]\(.*?\)/        // Images
    ];

    // Return true if any markdown pattern is found
    return markdownPatterns.some(pattern => pattern.test(content));
  };

 
  const fetchUserProfile = async () => {
    setIsProfileLoading(true);
    try {
      const response = await fetch('/api/profile', { credentials: 'include' });
      const data = await response.json();
      
      if (data.success && data.user) {
        setUserProfileData(data.user);
        return data.user;
      } else {
        console.error("Error in user profile API response:", data);
        return null;
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return null;
    } finally {
      setIsProfileLoading(false);
    }
  };

  // Fetch chat history from the API
  const fetchChatHistory = async () => {
    try {
      const response = await fetchWithSupabaseAuth('/api/chat/history');
      if (response.ok) {
        const data = await response.json();
        setChatHistory(data);
      }
    } catch (error) {
      console.error('Error fetching chat history:', error);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  // Save chat history to the API
  const saveChatHistory = async (msgs: any[]) => {
    try {
      const body = { chatId: activeChat, messages: msgs };
      const response = await fetchWithSupabaseAuth('/api/chat/history', {
        method: 'POST',
        body: JSON.stringify(body)
      });
      if (response.ok) {
        const data = await response.json();
        if (!activeChat && data.id) {
          setActiveChat(data.id);
        }
      }
    } catch (error) {
      console.error('Error saving chat history:', error);
    }
  };

  // Load a specific chat from history
  const loadChat = async (chatId: string) => {
    setIsChatLoading(true);
    try {
      const response = await fetchWithSupabaseAuth(`/api/chat/history/${chatId}`);
      if (response.ok) {
        const data = await response.json();
        
        // Process messages to detect formatted content
        const processedMessages = data.messages.map((msg: ChatMessage) => {
          if (msg.type === "bot" && typeof msg.content === 'string') {
            return {
              ...msg,
              isFormatted: isFormattedContent(msg.content)
            };
          }
          return msg;
        });
        
        setMessages(processedMessages);
        setActiveChat(chatId);
        
        // Close sidebar on mobile after selection
        if (window.innerWidth < 768) {
          setSidebarOpen(false);
        }
      }
    } catch (error) {
      console.error('Error loading chat:', error);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Create a new chat
  const startNewChat = () => {
    setMessages([
      {
        type: "bot",
        isHero: true,
        content: {
          title: "Discover Your Perfect Connections",
          subtitle: "Find like-minded people, discover amazing content, and build meaningful relationships.",
          prompt: "What are you looking for? I can help you find friends, recommend books, movies, podcasts, TV shows, and more!"
        }
      }
    ]);
    setActiveChat(null);
    
    // Close sidebar on mobile after starting new chat
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100000).toFixed(0)}K`;
  };
  
  const toggleSuggestion = (suggestion: any) => {
    const id = suggestion.id || suggestion.name;
    setSelectedSuggestions(prev => prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]);
  };

  const handleBulkSelectSuggestions = (suggestions: any[]) => {
    const allIds = suggestions.map(s => s.id || s.name);
    setSelectedSuggestions(allIds);
  };

  const handleDeleteChat = async (chatId: string) => {
    setIsHistoryLoading(true);
    try {
      const res = await fetchWithSupabaseAuth(`/api/chat/history/${chatId}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success("Chat deleted successfully");
        setChatHistory(prev => prev.filter(chat => chat.id !== chatId));
        if(activeChat === chatId) {
           setActiveChat(null);
           setMessages([
             {
               type: "bot",
               isHero: true,
               content: {
                 title: "Discover Your Perfect Connections",
                 subtitle: "Find like-minded people, discover amazing content, and build meaningful relationships.",
                 prompt: "What are you looking for? I can help you find friends, recommend books, movies, podcasts, TV shows, and more!"
               }
             }
           ]);
        }
      } else {
        toast.error("Failed to delete chat");
      }
    } catch (error) {
      console.error("Error deleting chat:", error);
      toast.error("Error deleting chat");
    } finally {
      setIsHistoryLoading(false);
    }
  };

  const openRenameDialog = (chatId: string, currentTitle: string) => {
    setRenameChatId(chatId);
    setNewChatTitle(currentTitle);
    setShowRenameDialog(true);
  };

  const updateChatTitle = async () => {
    if (!renameChatId) return;
    setIsHistoryLoading(true);
    try {
      const updateRes = await fetchWithSupabaseAuth('/api/chat/history', {
        method: 'POST',
        body: JSON.stringify({
          chatId: renameChatId,
          title: newChatTitle
        }),
      });
      if (!updateRes.ok) {
        toast.error("Failed to update chat title");
        return;
      }
      toast.success("Chat title updated!");
      fetchChatHistory();
      setShowRenameDialog(false);
    } catch (error) {
      toast.error("Error updating chat title");
    } finally {
      setIsHistoryLoading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
  
    // Create user message and add to UI immediately
    const userMessage = {
      type: "user",
      role: "user",
      content: input,
    };
    
    // Create a reference to current messages before adding new ones
    const currentMessages = [...messages];
    
    // Add user message to UI state
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);
  
    try {
      // Create a temporary bot message slot (will be updated with content)
      const tempBotMessage = {
        type: "bot",
        role: "assistant",
        content: "",
        suggestions: [],
      };
      
      // Add the temporary bot message to UI
      setMessages((prev) => [...prev, tempBotMessage]);
      
      // Prepare API messages - remove hero message for API call only
      const apiMessages = [...currentMessages.filter(m => !m.isHero), userMessage].map(m => ({
        role: m.type === "user" ? "user" : "assistant",
        content: typeof m.content === 'string' ? m.content : JSON.stringify(m.content)
      }));
      
      // Send the request to chat API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: apiMessages,
          userId: "user-id-here",
          chatId: activeChat,
        }),
        credentials: 'include',
      });
  
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
  
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No reader available');
      }
  
      // Process streaming response
      const decoder = new TextDecoder();
      let functionCallData = null;
      let responseText = "";
      let isFormatted = false;
      let hasFunctionCall = false;
      let functionCallStarted = false;
      let displayBuffer = "";
      
      // Set initial loading state
      setMessages((prev) => {
        const updatedMessages = [...prev];
        const lastBotIndex = updatedMessages.findLastIndex(m => m.type === "bot");
        
        if (lastBotIndex >= 0) {
          updatedMessages[lastBotIndex] = {
            ...updatedMessages[lastBotIndex],
            content: "...",
            isFormatted: false
          };
        }
        
        return updatedMessages;
      });
      
      // Read chunks from stream
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
  
        const chunk = decoder.decode(value, { stream: true });
        responseText += chunk;
        
        // Early detection of function call start pattern
        if (!functionCallStarted && chunk.includes('{"function_call"')) {
          functionCallStarted = true;
          hasFunctionCall = true;
          
          // Show loading message immediately when we detect function call start
          setMessages((prev) => {
            const updatedMessages = [...prev];
            const lastBotIndex = updatedMessages.findLastIndex(m => m.type === "bot");
            
            if (lastBotIndex >= 0) {
              const loadingMessages = [
                "Analyzing your interests and preferences...",
                "Finding like-minded people in your area...",
                "Searching for content that matches your taste...",
                "Looking for friends who share your interests...",
                "Discovering recommendations just for you...",
                "Matching you with the perfect connections..."
              ];
              const randomIndex = Math.floor(Math.random() * loadingMessages.length);
              
              updatedMessages[lastBotIndex] = {
                ...updatedMessages[lastBotIndex],
                content: loadingMessages[randomIndex],
                isFormatted: false
              };
            }
            
            return updatedMessages;
          });
          
          continue; // Skip rendering this chunk
        }
        
        // Check for formatting
        isFormatted = isFormattedContent(responseText);
        
        // Look for function call data in the response
        try {
          const jsonMatches = responseText.match(/\{(?:[^{}]|(?:\{(?:[^{}]|(?:\{[^{}]*\}))*\}))*\}/g) || [];
          
          for (const jsonStr of jsonMatches) {
            try {
              const jsonObj = JSON.parse(jsonStr);
              if (
                jsonObj.function_call && (
                  jsonObj.function_call.name === 'findFriends' ||
                  [
                    'recommendBooks',
                    'recommendMovies',
                    'recommendPodcasts',
                    'recommendTVShows'
                  ].includes(jsonObj.function_call.name)
                )
              ) {
                functionCallData = {
                  name: jsonObj.function_call.name,
                  ...JSON.parse(jsonObj.function_call.arguments)
                };
                hasFunctionCall = true;
                break; // Found valid function call data
              }
            } catch (jsonError) {
              // Skip invalid JSON
            }
          }
        } catch (e) {
          console.log("Error processing chunks:", e);
        }
        
        // If we've detected a function call at any point, continue showing the loading message
        if (hasFunctionCall) {
          continue;
        }
        
        // Filter function call JSON from display content
        let displayContent = responseText;
        const functionCallPattern = /\{(?:[^{}]|(?:\{(?:[^{}]|(?:\{[^{}]*\}))*\}))*\}/g;
        const potentialFunctionCalls = responseText.match(functionCallPattern) || [];
        
        for (const jsonStr of potentialFunctionCalls) {
          try {
            const jsonObj = JSON.parse(jsonStr);
            if (jsonObj.function_call) {
              // Remove the function call JSON from display content
              displayContent = displayContent.replace(jsonStr, "");
              hasFunctionCall = true;
            }
          } catch (e) {
            // Not valid JSON, ignore
          }
        }
        
        // Clean up any leftover empty spaces from removing JSON
        displayContent = displayContent.trim();
        
        // Buffer the display content
        if (displayContent && displayContent !== displayBuffer) {
          displayBuffer = displayContent;
          
          // Only update UI if there's meaningful content (not just whitespace) and no function call
          if (!hasFunctionCall && displayContent.replace(/\s+/g, '').length > 0) {
            setMessages((prev) => {
              const updatedMessages = [...prev];
              const lastBotIndex = updatedMessages.findLastIndex(m => m.type === "bot");
              
              if (lastBotIndex >= 0) {
                updatedMessages[lastBotIndex] = {
                  ...updatedMessages[lastBotIndex],
                  content: displayContent,
                  isFormatted
                };
              }
              
              return updatedMessages;
            });
          }
        }
      }
      console.log("function call data")
      console.log(functionCallData)
  
    
      if (functionCallData) {
        try {
          // Save a snapshot of the current messages
          const messagesBeforeFunctionCall = [...messages];

          // Make sure the user message is included
          if (!messagesBeforeFunctionCall.some(m => 
              m.type === "user" && m.content === userMessage.content)) {
            messagesBeforeFunctionCall.push({...userMessage});
          }

          if (functionCallData.name && [
            'recommendBooks',
            'recommendMovies',
            'recommendPodcasts',
            'recommendTVShows'
          ].includes(functionCallData.name)) {
         
            const recResponse = await fetch('/api/chat/qloo-recommendation', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ functionCall: functionCallData }),
              credentials: 'include',
            });

            if (!recResponse.ok) {
              throw new Error(`Recommendations API error: ${recResponse.status}`);
            }

            const recData = await recResponse.json();

            setMessages(() => {
              const baseMessages = [...messagesBeforeFunctionCall];
              const lastMessage = baseMessages[baseMessages.length - 1];
              if (lastMessage && lastMessage.type === "bot") {
                baseMessages[baseMessages.length - 1] = {
                  ...lastMessage,
                  content: "Here are some recommendations for you:",
                  isFormatted: false,
                  suggestions: recData
                };
              } else {
                baseMessages.push({
                  type: "bot",
                  role: "assistant",
                  content: "Here are some recommendations for you:",
                  isFormatted: false,
                  suggestions: recData
                });
              }
              return baseMessages;
            });

            // Save chat history
            const finalMessages = await new Promise<ChatMessage[]>((resolve) => {
              setTimeout(() => {
                setMessages((current) => {
                  resolve([...current]);
                  return current;
                });
              }, 0);
            });
            await saveChatHistory(finalMessages);
            return;
          }

      
          const {
            college,
            department,
            academic_year,
            interests,
            tech_skills,
            creative_skills,
            sports_skills,
            leadership_skills,
            other_skills,
            personality_tags,
            limit
          } = functionCallData;

        
          const friendsResponse = await fetch('/api/chat/friends', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              messages,
              userId: userProfileData?.id,
              functionCall: {
                college,
                department,
                academic_year,
                interests,
                tech_skills,
                creative_skills,
                sports_skills,
                leadership_skills,
                other_skills,
                personality_tags,
                limit
              }
            }),
            credentials: 'include',
          });

          if (!friendsResponse.ok) {
            throw new Error(`Friends API error: ${friendsResponse.status}`);
          }

          const friendsData = await friendsResponse.json();

          // Format the friends data for display
          const formattedFriends = friendsData.map((friend: any) => ({
            id: friend.id,
            full_name: friend.full_name,
            college: friend.college,
            department: friend.department,
            academic_year: friend.academic_year,
            avatar_url: friend.avatar_url,
            interests: friend.interests,
            tech_skills: friend.tech_skills,
            creative_skills: friend.creative_skills,
            sports_skills: friend.sports_skills,
            leadership_skills: friend.leadership_skills,
            other_skills: friend.other_skills,
            looking_for: friend.looking_for,
            personality_tags: friend.personality_tags,
            about: friend.about,
            place: friend.place,
            github: friend.github,
            linkedin: friend.linkedin,
            twitter: friend.twitter,
            personal_website: friend.personal_website,
            instagram: friend.instagram,
            behance: friend.behance,
            created_at: friend.created_at,
            matchScore: friend.similarity ? Math.round(friend.similarity * 100) : undefined,
            similarity: friend.similarity // Keep similarity for color logic
          }));

          // Update the UI with friend suggestions
          setMessages(() => {
            const baseMessages = [...messagesBeforeFunctionCall];
            const lastMessage = baseMessages[baseMessages.length - 1];
            
            if (lastMessage && lastMessage.type === "bot") {
              baseMessages[baseMessages.length - 1] = {
                ...lastMessage,
                content: "\n\nI've found some amazing people that might be perfect matches for you:",
                isFormatted: false,
                suggestions: formattedFriends
              };
            } else {
              baseMessages.push({
                type: "bot",
                role: "assistant",
                content: "\n\nI've found some amazing people that might be perfect matches for you:",
                isFormatted: false,
                suggestions: formattedFriends
              });
            }
            return baseMessages;
          });

          // Ensure the messages are fully updated before saving
          const finalMessages = await new Promise<ChatMessage[]>((resolve) => {
            setTimeout(() => {
              setMessages((current) => {
                resolve([...current]);
                return current;
              });
            }, 0);
          });

          // Save the chat history
          await saveChatHistory(finalMessages);

        } catch (friendError) {
          console.error("Error fetching friends:", friendError);
          // Handle error case
          const messagesBeforeFunctionCall = [...messages];
          if (!messagesBeforeFunctionCall.some(m => 
              m.type === "user" && m.content === userMessage.content)) {
            messagesBeforeFunctionCall.push({...userMessage});
          }
          setMessages(() => {
            const baseMessages = [...messagesBeforeFunctionCall];
            const lastMessage = baseMessages[baseMessages.length - 1];
            if (lastMessage && lastMessage.type === "bot") {
              baseMessages[baseMessages.length - 1] = {
                ...lastMessage,
                content: "Sorry, I couldn't find any matches at the moment. Try adjusting your preferences!",
                isFormatted: false,
              };
            } else {
              baseMessages.push({
                type: "bot",
                role: "assistant",
                content: "Sorry, I couldn't find any matches at the moment. Try adjusting your preferences!",
                isFormatted: false,
              });
            }
            return baseMessages;
          });
        }
      } else {
        // Handle regular text response (no function call)
        const finalIsFormatted = isFormattedContent(responseText);
        
        // Filter out any potential function call JSON from the final response
        let finalDisplayContent = responseText;
        const functionCallPattern = /\{(?:[^{}]|(?:\{(?:[^{}]|(?:\{[^{}]*\}))*\}))*\}/g;
        const potentialFunctionCalls = responseText.match(functionCallPattern) || [];
        
        for (const jsonStr of potentialFunctionCalls) {
          try {
            const jsonObj = JSON.parse(jsonStr);
            if (jsonObj.function_call) {
              // Remove the function call JSON from display content
              finalDisplayContent = finalDisplayContent.replace(jsonStr, "");
            }
          } catch (e) {
            // Not valid JSON, ignore
          }
        }
        
        // Clean up any whitespace artifacts
        finalDisplayContent = finalDisplayContent.trim();
        
        const updatedMessages = await new Promise<ChatMessage[]>((resolve) => {
          setMessages((currentMessages) => {
            const messages = [...currentMessages];
            const lastBotIndex = messages.findLastIndex(m => m.type === "bot");
            
            if (lastBotIndex >= 0) {
              messages[lastBotIndex] = {
                ...messages[lastBotIndex],
                content: finalDisplayContent,
                isFormatted: finalIsFormatted,
                suggestions: messages[lastBotIndex]?.suggestions || []
              };
            }
            
            resolve(messages);
            return messages;
          });
        });

        // Save the chat history
        if (!activeChat) {
          try {
            const messagesForExtraction = updatedMessages.filter((msg: ChatMessage) => !msg.isHero);
            const titleResponse = await fetch('/api/title', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ messages: messagesForExtraction }),
              credentials: 'include',
            });
            
            if (titleResponse.ok) {
              const titleData = await titleResponse.json();
              
              const saveChatResponse = await fetchWithSupabaseAuth('/api/chat/history', {
                method: 'POST',
                body: JSON.stringify({
                  chatId: activeChat,
                  messages: updatedMessages,
                  userId: "user-id-here",
                  title: titleData.title || "",
                  subtitle: titleData.subtitle || ""
                }),
              });
              
              if (saveChatResponse.ok) {
                const savedChat = await saveChatResponse.json();
                if (!activeChat && savedChat.id) {
                  setActiveChat(savedChat.id);
                }
                fetchChatHistory();
              }
            } else {
              await saveChatHistory(updatedMessages);
            }
          } catch (err) {
            console.error('Error in title extraction:', err);
            await saveChatHistory(updatedMessages);
          }
        } else {
          await saveChatHistory(updatedMessages);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Handle errors in UI
      setMessages((prev) => {
        const messages = [...prev];
        const lastBotIndex = messages.findLastIndex(m => m.type === "bot");
        
        if (lastBotIndex >= 0 && messages[lastBotIndex].content === "") {
          messages[lastBotIndex] = {
            ...messages[lastBotIndex],
            content: "I'm sorry, I encountered an error processing your request. Please try again."
          };
        } else {
          messages.push({
            type: "bot",
            role: "assistant",
            content: "I'm sorry, I encountered an error processing your request. Please try again."
          });
        }
        
        return messages;
      });
      
      const errorMessages = await new Promise<ChatMessage[]>((resolve) => {
        setTimeout(() => {
          setMessages((current) => {
            resolve([...current]);
            return current;
          });
        }, 0);
      });
      
      await saveChatHistory(errorMessages);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-gradient-to-b from-gray-950 to-black">
      {/* Mobile Sidebar Toggle Button - Only shows on mobile */}
      {isMobile && !sidebarOpen && (
        <motion.button
          className="fixed bottom-24 left-4 z-30 bg-[#C5F631] text-gray-950 rounded-full p-3 shadow-lg"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setSidebarOpen(true)}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <MessageSquare className="w-6 h-6" />
        </motion.button>
      )}
      
      {/* Mobile Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>
      
      {/* Sidebar Component */}
      <ChatSidebar 
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isHistoryLoading={isHistoryLoading}
        chatHistory={chatHistory}
        activeChat={activeChat}
        loadChat={loadChat}
        startNewChat={startNewChat}
        openRenameDialog={openRenameDialog}
        handleDeleteChat={handleDeleteChat}
      />

      {/* Main Content Area */}
      <motion.div 
        className="flex-1 flex flex-col h-full w-full"
        animate={{ 
          marginLeft: sidebarOpen ? (isMobile ? "0" : "0") : "0",
          width: "100%",
          maxWidth: sidebarOpen ? "100%" : "1400px",
          margin: sidebarOpen ? "0" : "0 auto"
        }}
        transition={{ type: "spring", stiffness: 400, damping: 40 }}
      >
        {/* Sidebar Hint */}
        <SidebarHint 
          sidebarOpen={sidebarOpen} 
          sidebarHintShown={sidebarHintShown} 
        />

        {/* Header */}
        <ChatHeader 
          setSidebarOpen={setSidebarOpen} 
          sidebarOpen={sidebarOpen}
        />

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="space-y-6 max-w-5xl mx-auto">
            {messages.map((message, i) => (
              <div
                key={i}
                className={`flex ${
                  message.type === "user" ? "justify-end" : "justify-start"
                } animate-fade-in`}
              >
                {message.isHero ? (
                  <HeroMessage content={message.content} isVisible={isVisible} />
                ) : message.suggestions && Array.isArray(message.suggestions) && message.suggestions.length > 0 && message.suggestions[0].entity_type ? (
                  <ChatRecommendationBubble recommendations={message.suggestions} message={message.content} />
                ) : (
                  <ChatBubble 
                    message={message}
                    toggleSuggestion={toggleSuggestion}
                    selectedSuggestions={selectedSuggestions}
                    handleBulkSelectSuggestions={handleBulkSelectSuggestions}
                    userIcon={userIcon}
                  />
                )}
              </div>
            ))}
            <TypingIndicator isTyping={isTyping} />
          </div>
        </ScrollArea>
        
        {/* Bulk Action Panel */}
        <BulkActionPanel 
          selectedSuggestions={selectedSuggestions}
          setSelectedSuggestions={setSelectedSuggestions}
          setShowAddInvestorsDialog={setShowAddInvestorsDialog}
        />

        {/* Chat Input */}
        <ChatInput 
          input={input}
          setInput={setInput}
          sendMessage={sendMessage}
          isTyping={isTyping}
        />

        {/* Add Investors Dialog */}
        {showAddInvestorsDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-0 overflow-y-auto">
            <div className="relative w-full max-w-md md:max-w-lg max-h-[95vh] overflow-y-auto bg-white rounded-xl shadow-lg">
              <ListDialog
                isOpen={showAddInvestorsDialog}
                onClose={() => setShowAddInvestorsDialog(false)}
                selectedInvestors={selectedSuggestions}
                listIdParam={listIdParam}
              />
            </div>
          </div>
        )}

        {/* Rename Dialog */}
        <RenameDialog 
          showRenameDialog={showRenameDialog} 
          setShowRenameDialog={setShowRenameDialog}
          newChatTitle={newChatTitle}
          setNewChatTitle={setNewChatTitle}
          updateChatTitle={updateChatTitle}
        />

        {/* Loading States */}
        {isLoading && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
            <Loader2 className="w-12 h-12 animate-spin text-white" />
          </div>
        )}

        {isHistoryLoading && (
          <div className="absolute inset-0 bg-black/20 z-10 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#C5F631]" />
          </div>
        )}

        {isChatLoading && (
          <div className="absolute inset-0 bg-black/20 z-20 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#C5F631]" />
          </div>
        )}
      </motion.div>
      <Toaster position="top-right" />
    </div>
  );
} 