interface TypingIndicatorProps {
  isTyping: boolean;
}

const TypingIndicator = ({ isTyping }: TypingIndicatorProps) => {
  if (!isTyping) return null;
  
  return (
    <div className="flex items-center space-x-3 text-gray-400 animate-pulse">
      <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center">
        <img 
          src="/bot-icon.png" 
          alt="Bot" 
          className="w-8 h-8 animate-spin-slow"
          style={{ animation: 'spin 3s linear infinite' }}
        />
      </div>
      <div className="text-sm text-[#C5F631]">Analyzing your request...</div>
    </div>
  );
};

export default TypingIndicator; 