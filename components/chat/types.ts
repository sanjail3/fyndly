export interface ChatMessage {
  type: string;
  role?: string;
  isHero?: boolean;
  content: any;
  suggestions?: any[];
  quickReplies?: string[];
  isFormatted?: boolean; 
}

export interface ChatHistory {
  id: string;
  title: string;
  subtitle: string;
  timestamp: string;
  messages?: ChatMessage[];
}

export interface InvestorSuggestion {
  id: string;
  name: string;
  company: string;
  jobTitle: string;
  location: string;
  stage: string;
  focus: string;
  industries: string[];
  ticketSize: string;
  successStories: string;
  image: string;
  similarity: number;
  linkedinUrl?: string;
  websiteUrl?: string;
  email?: string;
  phone?: string;
  about?: string;
} 