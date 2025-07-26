import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Check, Plus } from 'lucide-react';

interface BulkActionPanelProps {
  selectedSuggestions: string[];
  setSelectedSuggestions: (suggestions: string[]) => void;
  setShowAddInvestorsDialog: (show: boolean) => void;
}

const BulkActionPanel = ({ 
  selectedSuggestions, 
  setSelectedSuggestions, 
  setShowAddInvestorsDialog 
}: BulkActionPanelProps) => {
  if (selectedSuggestions.length === 0) return null;

  return (
    <div 
      className="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm flex items-center justify-center"
      style={{ animation: "fade-in 0.2s ease-out" }}
    >
      <div 
        className="bg-gray-900/95 backdrop-blur-sm rounded-xl shadow-2xl p-6 border border-[#8EC01D]/20 mx-4 max-w-md w-full"
        style={{
          animation: "scale-up 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          transformOrigin: "center center"
        }}
      >
        <div className="flex flex-col items-center text-center gap-4">
          <div className="bg-[#8EC01D]/30 p-3 rounded-full">
            <Check className="w-6 h-6 text-gray-100" />
          </div>
          
          <div>
            <h3 className="text-xl font-bold text-gray-50 mb-2">
              {selectedSuggestions.length} Selected Investors
            </h3>
            <p className="text-gray-200/90 text-sm">
              What would you like to do with these selections?
            </p>
          </div>

          <div className="flex flex-col w-full gap-3 mt-4">
            <Button 
              onClick={() => setShowAddInvestorsDialog(true)}
              className="bg-white/90 hover:bg-white text-[#C5F631] shadow-lg hover:shadow-[#C5F631]/50 gap-2 py-3 text-base"
              size="lg"
            >
              <Plus className="w-5 h-5" />
              Add to Investor List
            </Button>
            
            <Button
              variant="ghost"
              className="text-gray-100 hover:bg-[#8EC01D]/40 hover:text-white"
              onClick={() => setSelectedSuggestions([])}
            >
              Clear Selections
            </Button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-up {
          from {
            transform: translateY(20px) scale(0.95);
            opacity: 0;
          }
          to {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default BulkActionPanel; 