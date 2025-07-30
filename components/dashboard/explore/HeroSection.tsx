
import TasteAnalysisHeroCTA from "./TasteAnalysisHeroCTA";

interface HeroSectionProps {
  scrollY: number;
}

const HeroSection = ({ scrollY }: HeroSectionProps) => {
  return (
    <div 
      className="relative h-64 sm:h-72 md:h-80 bg-gradient-to-br from-gray-900 via-black to-gray-900 overflow-hidden"
      style={{
        transform: `translateY(${scrollY * 0.3}px)`,
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-[#CAFE33]/5 via-[#CAFE33]/10 to-[#CAFE33]/5"></div>
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=60 height=60 viewBox=0 0 60 60 xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cg fill=\\'none\\' fill-rule=\\'evenodd\\'%3E%3Cg fill=\\'%23CAFE33\\' fill-opacity=\\'0.03\\'%3E%3Ccircle cx=30 cy=30 r=2/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
      
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-3 sm:px-4">
        <div className="animate-fade-in">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-3 sm:mb-4 bg-gradient-to-r from-white via-[#CAFE33] to-white bg-clip-text text-transparent leading-tight">
            Find Your Perfect Match 🎯
          </h1>
          <p className="text-gray-300 text-base sm:text-lg md:text-xl font-medium max-w-2xl mx-auto">
            Connect with amazing people who share your vision and goals
          </p>
          <div className="mt-4 flex flex-wrap gap-2 justify-center">
            <span className="bg-[#CAFE33]/20 text-[#CAFE33] px-3 py-1 rounded-full text-sm font-medium">
              ✨ Smart Matching
            </span>
            <span className="bg-[#CAFE33]/20 text-[#CAFE33] px-3 py-1 rounded-full text-sm font-medium">
              🚀 Real Collaboration
            </span>
            <span className="bg-[#CAFE33]/20 text-[#CAFE33] px-3 py-1 rounded-full text-sm font-medium">
              🎓 Campus Network
            </span>
          </div>
          
          {/* Taste Analysis CTA */}
          <TasteAnalysisHeroCTA />
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
