import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Users, 
  Zap, 
  Heart, 
  MessageSquare, 
  Target, 
  Sparkles,
  ArrowRight,
  Star,
  CheckCircle,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";

interface LandingPageProps {
  onGetStarted: () => void;
}

// Add a reusable LoadingIcon component for rolling logo
function LoadingIcon({ size = 64, message }: { size?: number; message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center">
      <img
        src="/icon.png"
        alt="Fyndly Logo"
        className={`rounded-2xl shadow-xl animate-spin-slow`}
        style={{ width: size, height: size, animation: 'spin 1.2s linear infinite' }}
      />
      {message && <p className="text-gray-400 mt-4">{message}</p>}
      <style jsx global>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin 1.2s linear infinite;
        }
        @keyframes float {
          0% { transform: translateY(0px) rotate(-15deg); }
          50% { transform: translateY(-20px) rotate(-10deg); }
          100% { transform: translateY(0px) rotate(-15deg); }
        }
        @keyframes float-reverse {
          0% { transform: translateY(0px) rotate(15deg); }
          50% { transform: translateY(-20px) rotate(10deg); }
          100% { transform: translateY(0px) rotate(15deg); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        .animate-float-reverse {
          animation: float-reverse 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

const LandingPage = ({ onGetStarted }: LandingPageProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const features = [
    {
      icon: <Target className="h-8 w-8 text-[#CAFE33]" />,
      title: "Smart Matching",
      description: "AI-powered recommendations based on your interests, skills, and goals"
    },
    {
      icon: <Zap className="h-8 w-8 text-[#CAFE33]" />,
      title: "Swipe to Connect",
      description: "Tinder-style discovery to find your perfect collaboration partner"
    },
    {
      icon: <MessageSquare className="h-8 w-8 text-[#CAFE33]" />,
      title: "Interest Rooms",
      description: "Join community discussions around hackathons, startups, and study groups"
    },
    {
      icon: <Users className="h-8 w-8 text-[#CAFE33]" />,
      title: "Campus Community",
      description: "Connect with like-minded students from your university"
    }
  ];

  const stats = [
    { number: "10K+", label: "Active Students" },
    { number: "500+", label: "Successful Matches" },
    { number: "50+", label: "Universities" },
    { number: "100+", label: "Hackathon Teams" }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "CS Student, Stanford",
      text: "Found my co-founder through Fyndly! We built an AI startup that raised $2M seed funding.",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=60&h=60&fit=crop&crop=face"
    },
    {
      name: "Mike Rodriguez",
      role: "Business Student, MIT",
      text: "The perfect platform to find hackathon teammates. Won 3 hackathons this year!",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop&crop=face"
    }
  ];

  const navLinks = [
    { name: "Features", href: "#features" },
    { name: "How it Works", href: "#how-it-works" },
  ];

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Modern Scrollable Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-black/90 backdrop-blur-xl border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <img 
                src="/logo.png" 
                alt="Fyndly Logo" 
                className="h-10 w-auto"
              />
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                {navLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    className="text-gray-300 hover:text-[#CAFE33] px-3 py-2 text-sm font-medium transition-colors duration-200"
                  >
                    {link.name}
                  </a>
                ))}
              </div>
            </div>

            {/* Desktop CTA */}
            <div className="hidden md:block">
              <Button
                onClick={onGetStarted}
                className="bg-gradient-to-r from-[#CAFE33] to-[#B8E62E] text-black hover:from-[#B8E62E] hover:to-[#CAFE33] font-semibold px-6 py-2 rounded-full transition-all duration-300 hover:scale-105"
              >
                Get Started
              </Button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-400 hover:text-[#CAFE33]"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="md:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 bg-gray-900/95 rounded-lg mt-2">
                {navLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    className="text-gray-300 hover:text-[#CAFE33] block px-3 py-2 text-base font-medium transition-colors duration-200"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.name}
                  </a>
                ))}
                <div className="pt-4">
                  <Button
                    onClick={onGetStarted}
                    className="w-full bg-gradient-to-r from-[#CAFE33] to-[#B8E62E] text-black hover:from-[#B8E62E] hover:to-[#CAFE33] font-semibold py-2 rounded-full transition-all duration-300"
                  >
                    Get Started
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section - Updated with Emojis and Animations */}
      <div className="relative pt-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#CAFE33]/20 via-transparent to-purple-500/20"></div>
        
        {/* Floating Emojis */}
        <div className="absolute top-1/4 left-0 -translate-x-1/4 opacity-50 animate-float hidden lg:block" style={{ animationDelay: '0s' }}>
          <span className="text-9xl" role="img" aria-label="Sparkles Emoji">✨</span>
        </div>
        <div className="absolute top-1/3 right-0 translate-x-1/4 opacity-50 animate-float-reverse hidden lg:block" style={{ animationDelay: '1s' }}>
          <span className="text-9xl" role="img" aria-label="Rocket Emoji">🚀</span>
        </div>

        <div className="relative px-4 py-20 sm:py-32 max-w-7xl mx-auto">
          <div className="text-center space-y-10">
            {/* Main heading */}
            <div className="space-y-8">
              <Badge className="bg-gradient-to-r from-[#CAFE33]/20 to-purple-500/20 text-[#CAFE33] border-[#CAFE33]/30 px-4 py-2 text-base font-bold animate-bounce">
                🌱 New! Join the next-gen campus community
              </Badge>
              <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black leading-tight tracking-tight">
                Find Your
                <span className="block bg-gradient-to-r from-[#CAFE33] to-[#B8E62E] bg-clip-text text-transparent">
                  Campus Tribe
                </span>
                <span className="block text-3xl sm:text-4xl text-[#CAFE33] mt-4 font-bold animate-pulse">Swipe. Match. Build. 🚀</span>
              </h1>
              <p className="text-xl sm:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed font-light">
                Meet creative minds, collaborate on projects, and make friends for life. <span className="text-[#CAFE33] font-semibold">No numbers. No hype. Just real connections.</span>
              </p>
            </div>

            {/* Modern CTA Buttons */}
            <div className="flex justify-center items-center pt-8">
              <Button
                onClick={onGetStarted}
                className="bg-gradient-to-r from-[#CAFE33] to-[#B8E62E] text-black hover:from-[#B8E62E] hover:to-[#CAFE33] font-bold px-10 py-4 rounded-2xl text-lg transition-all duration-300 hover:scale-110 hover:shadow-2xl hover:shadow-[#CAFE33]/25 w-full sm:w-auto"
              >
                Start Connecting Now <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-24 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl sm:text-6xl font-black mb-6">
            Why You'll <span className="bg-gradient-to-r from-[#CAFE33] to-[#B8E62E] bg-clip-text text-transparent">Love Fyndly</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto font-light">
            Everything you need to find your perfect collaboration partner and build amazing projects together <span className="text-[#CAFE33]">✨</span>
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="bg-gradient-to-br from-gray-900/80 to-gray-800/50 border-gray-700 hover:border-[#CAFE33]/50 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-[#CAFE33]/10 group">
              <CardContent className="p-6 text-center">
                <div className="mb-4 flex justify-center group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* How it Works */}
      <div id="how-it-works" className="py-24 px-4 bg-gradient-to-r from-gray-900/50 to-gray-800/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-6xl font-black mb-6">
              Simple. Fast. <span className="bg-gradient-to-r from-[#CAFE33] to-[#B8E62E] bg-clip-text text-transparent">Effective.</span>
            </h2>
            <p className="text-xl text-gray-300 font-light">Get started in just 3 easy steps! 🚀</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              { step: "1", title: "Create Your Profile", desc: "Share your interests, skills, and what you're looking to build", emoji: "🎯" },
              { step: "2", title: "Discover & Match", desc: "Swipe through curated recommendations and connect with your tribe", emoji: "✨" },
              { step: "3", title: "Start Building", desc: "Connect directly and start your next big project together", emoji: "🚀" }
            ].map((item, index) => (
              <div key={index} className="text-center group">
                <div className="w-20 h-20 bg-gradient-to-r from-[#CAFE33] to-[#B8E62E] rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-all duration-300 shadow-lg">
                  <span className="text-3xl">{item.emoji}</span>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-white">{item.title}</h3>
                <p className="text-gray-400 leading-relaxed max-w-sm mx-auto">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="py-24 px-4 bg-gradient-to-r from-[#CAFE33]/10 via-purple-500/10 to-[#CAFE33]/10">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl sm:text-6xl font-black mb-8">
            Ready to Find Your <br/>
            <span className="bg-gradient-to-r from-[#CAFE33] to-[#B8E62E] bg-clip-text text-transparent">Perfect Match?</span>
          </h2>
          <p className="text-xl text-gray-300 mb-10 max-w-3xl mx-auto font-light leading-relaxed">
            Join the next wave of campus creators. Your future co-founder is waiting! 🌟
          </p>
          <Button
            onClick={onGetStarted}
            className="bg-gradient-to-r from-[#CAFE33] to-[#B8E62E] text-black hover:from-[#B8E62E] hover:to-[#CAFE33] font-black px-12 py-6 rounded-2xl text-2xl transition-all duration-300 hover:scale-110 hover:shadow-2xl hover:shadow-[#CAFE33]/25"
          >
            Start Your Journey Today
            <Sparkles className="ml-3 h-7 w-7" />
          </Button>
          <div className="flex items-center justify-center mt-8 text-gray-400">
            <CheckCircle className="h-6 w-6 mr-3 text-[#CAFE33]" />
            <span className="text-lg font-medium">Free forever • No credit card required • Join in 2 minutes</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <img 
            src="/logo.png" 
            alt="Fyndly Logo" 
            className="h-8 w-auto mx-auto mb-4"
          />
          <p className="text-gray-400">Built by SJ with ❤️ 2025</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
