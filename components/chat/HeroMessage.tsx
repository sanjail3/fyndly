import { motion } from 'framer-motion';

interface HeroMessageProps {
  content: {
    title: string;
    subtitle: string;
    prompt: string;
  };
  isVisible: boolean;
}

const HeroMessage = ({ content, isVisible }: HeroMessageProps) => {
  return (
    <div className="w-full max-w-3xl mx-auto text-center space-y-6 py-8 sm:py-12 overflow-hidden">
      {/* Animated title with gradient */}
      <h1 
        className={`text-4xl sm:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#C5F631] to-[#8EC01D] transform transition-all duration-700 ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        }`}
      >
        ✨ {content.title} ✨
      </h1>
      
      {/* Animated subtitle */}
      <p 
        className={`text-lg sm:text-xl text-gray-300 transform transition-all duration-700 delay-300 ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        }`}
      >
        {content.subtitle}
      </p>
      
      {/* Animated prompt box with subtle hover effect */}
      <div 
        className={`mt-8 p-4 sm:p-6 bg-gray-900 rounded-2xl shadow-sm border border-gray-800 transform transition-all duration-700 delay-500 hover:shadow-md hover:bg-gray-800 ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        }`}
      >
        <p className="text-base sm:text-lg text-gray-200 font-medium">
          💬 {content.prompt}
        </p>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute -z-10 top-10 left-10 w-32 h-32 bg-[#8EC01D] rounded-full blur-3xl opacity-20"></div>
      <div className="absolute -z-10 bottom-10 right-10 w-32 h-32 bg-[#C5F631] rounded-full blur-3xl opacity-20"></div>
    </div>
  );
};

export default HeroMessage; 