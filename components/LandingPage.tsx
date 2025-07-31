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
  X,
  BookOpen,
  Film,
  Headphones,
  Tv,
  Brain,
  Wand2
} from "lucide-react";
import { useState, useEffect } from "react";

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
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: <Target className="h-8 w-8 text-[#CAFE33]" />,
      emoji: "🎯",
      title: "AI-Powered Recommendations",
      description: "Get personalized suggestions for books, movies, podcasts, and TV shows that match your taste"
    },
    {
      icon: <Brain className="h-8 w-8 text-[#CAFE33]" />,
      emoji: "🧠",
      title: "Taste Analysis",
      description: "Discover your unique content DNA with our AI-powered taste analysis and visualization"
    },
    {
      icon: <Wand2 className="h-8 w-8 text-[#CAFE33]" />,
      emoji: "✨",
      title: "Smart AI Assistant",
      description: "Your personal AI guide to discover content and connect with like-minded people"
    },
    {
      icon: <Users className="h-8 w-8 text-[#CAFE33]" />,
      emoji: "👥",
      title: "Social Discovery",
      description: "Connect with people who share your interests in books, movies, and more"
    }
  ];

  const contentTypes = [
    { icon: <BookOpen className="h-6 w-6" />, label: "Books", emoji: "📚" },
    { icon: <Film className="h-6 w-6" />, label: "Movies", emoji: "🎬" },
    { icon: <Headphones className="h-6 w-6" />, label: "Podcasts", emoji: "🎧" },
    { icon: <Tv className="h-6 w-6" />, label: "TV Shows", emoji: "📺" }
  ];

  const stats = [
    { number: "50K+", label: "Content Recommendations" },
    { number: "1000+", label: "Active Users" },
    { number: "100+", label: "Interest Categories" },
    { number: "4.9★", label: "User Rating" }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Book Enthusiast",
      text: "Fyndly's AI recommendations are spot-on! Found amazing books and podcasts I never would have discovered otherwise.",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=60&h=60&fit=crop&crop=face"
    },
    {
      name: "Mike Rodriguez",
      role: "Movie Buff",
      text: "The taste analysis feature is mind-blowing! It's like having a personal content curator who really gets me.",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop&crop=face"
    }
  ];

  const navLinks = [
    { name: "Features", href: "#features" },
    { name: "How it Works", href: "#how-it-works" },
  ];

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Modern Scrollable Navbar with Glassmorphism */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? "bg-black/90 backdrop-blur-xl" : "bg-transparent"
      } border-b border-gray-800/50`}>
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

      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_#CAFE33_0%,_transparent_25%)] opacity-10 animate-pulse"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,_purple_0%,_transparent_25%)] opacity-10 animate-pulse delay-1000"></div>
      </div>

      {/* Hero Section with Floating Elements */}
      <div className="relative pt-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#CAFE33]/20 via-transparent to-purple-500/20"></div>
        
        {/* Floating Icons */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {contentTypes.map((type, index) => (
            <div
              key={type.label}
              className="absolute animate-float"
              style={{
                top: `${20 + index * 25}%`,
                left: `${10 + index * 20}%`,
                animationDelay: `${index * 0.5}s`,
                transform: `scale(${0.8 + index * 0.2})`
              }}
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-[#CAFE33]/20 to-purple-500/20 backdrop-blur-sm border border-[#CAFE33]/30">
                <span className="text-2xl">{type.emoji}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="relative px-4 py-20 sm:py-32 max-w-7xl mx-auto">
          <div className="text-center space-y-10">
            {/* Main heading with animated gradient */}
            <div className="space-y-8">
              <Badge className="bg-gradient-to-r from-[#CAFE33]/20 to-purple-500/20 text-[#CAFE33] border-[#CAFE33]/30 px-4 py-2 text-base font-bold animate-bounce">
                ✨ Your Personal Content Discovery Platform 🎯
              </Badge>
              <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black leading-tight tracking-tight">
                Discover What
                <span className="block bg-gradient-to-r from-[#CAFE33] via-[#B8E62E] to-[#CAFE33] bg-clip-text text-transparent bg-size-200 animate-gradient">
                  Interests You
                </span>
                <span className="block text-3xl sm:text-4xl text-[#CAFE33] mt-4 font-bold animate-pulse">
                  Content 📚 • People 👥 • Insights 🧠
                </span>
              </h1>
              <p className="text-xl sm:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed font-light">
                Your all-in-one platform for discovering amazing content and connecting with like-minded people. 
                <span className="text-[#CAFE33] font-semibold"> Powered by AI ✨, personalized for you 🎯</span>
              </p>
            </div>

            {/* Modern CTA Buttons */}
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-8">
              <Button
                onClick={onGetStarted}
                className="group relative bg-gradient-to-r from-[#CAFE33] to-[#B8E62E] text-black hover:from-[#B8E62E] hover:to-[#CAFE33] font-bold px-8 py-4 rounded-xl text-lg transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-[#CAFE33]/25"
              >
                Get Started Now
                <ArrowRight className="ml-2 h-5 w-5 inline-block transition-transform group-hover:translate-x-1" />
                <div className="absolute inset-0 rounded-xl bg-white/20 blur opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </Button>
              <a
                href="#features"
                className="text-[#CAFE33] hover:text-[#B8E62E] font-semibold flex items-center gap-2 group transition-colors"
              >
                Learn More
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section with Hover Effects */}
      <div className="py-24 px-4" id="features">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-black mb-6">
              Discover the <span className="text-[#CAFE33]">Magic</span> ✨
            </h2>
            <p className="text-xl text-gray-300">Everything you need to explore your interests</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <Card
                key={feature.title}
                className="group relative overflow-hidden border-0 bg-gradient-to-br from-gray-900 to-gray-800 hover:from-[#CAFE33]/10 hover:to-purple-500/10 transition-all duration-500"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#CAFE33]/0 to-purple-500/0 group-hover:from-[#CAFE33]/10 group-hover:to-purple-500/10 transition-all duration-500"></div>
                <CardContent className="p-8 relative">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-[#CAFE33]/20 to-purple-500/20 backdrop-blur-sm">
                      {feature.icon}
                    </div>
                    <span className="text-3xl">{feature.emoji}</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-[#CAFE33] group-hover:text-[#B8E62E] transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Section with Animated Counters */}
      <div className="py-24 px-4 bg-gradient-to-r from-[#CAFE33]/5 via-purple-500/5 to-[#CAFE33]/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="text-center p-6 rounded-xl bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm border border-[#CAFE33]/10 hover:border-[#CAFE33]/30 transition-all duration-300"
              >
                <div className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-[#CAFE33] to-[#B8E62E] bg-clip-text text-transparent mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-300 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials with Modern Cards */}
      <div className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-black mb-6">
              What Our Users <span className="text-[#CAFE33]">Say</span> 💬
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((testimonial) => (
              <Card
                key={testimonial.name}
                className="group relative overflow-hidden border-0 bg-gradient-to-br from-gray-900 to-gray-800 hover:from-[#CAFE33]/10 hover:to-purple-500/10 transition-all duration-500"
              >
                <CardContent className="p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full"
                    />
                    <div>
                      <div className="font-bold text-[#CAFE33]">{testimonial.name}</div>
                      <div className="text-gray-400">{testimonial.role}</div>
                    </div>
                  </div>
                  <p className="text-gray-300 italic">"{testimonial.text}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Final CTA with Animated Background */}
      <div className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#CAFE33]/10 via-purple-500/10 to-[#CAFE33]/10"></div>
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-72 h-72 bg-[#CAFE33] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
          <div className="absolute top-0 right-0 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-[#B8E62E] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
        </div>
        <div className="max-w-5xl mx-auto text-center relative">
          <h2 className="text-4xl sm:text-6xl font-black mb-8">
            Ready to Discover Your <br/>
            <span className="bg-gradient-to-r from-[#CAFE33] via-[#B8E62E] to-[#CAFE33] bg-clip-text text-transparent bg-size-200 animate-gradient">
              Perfect Content? 🎯
            </span>
          </h2>
          <p className="text-xl text-gray-300 mb-10 max-w-3xl mx-auto font-light leading-relaxed">
            Join thousands of users exploring their interests and finding amazing recommendations! ✨
          </p>
          <Button
            onClick={onGetStarted}
            className="group relative bg-gradient-to-r from-[#CAFE33] to-[#B8E62E] text-black hover:from-[#B8E62E] hover:to-[#CAFE33] font-black px-12 py-6 rounded-2xl text-2xl transition-all duration-300 hover:scale-110 hover:shadow-2xl hover:shadow-[#CAFE33]/25"
          >
            Start Your Journey Today
            <Sparkles className="ml-3 h-7 w-7" />
            <div className="absolute inset-0 rounded-2xl bg-white/20 blur opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </Button>
          <div className="flex items-center justify-center mt-8 text-gray-400">
            <CheckCircle className="h-6 w-6 mr-3 text-[#CAFE33]" />
            <span className="text-lg font-medium">Free forever • No credit card required • Join in 2 minutes ⚡️</span>
          </div>
        </div>
      </div>

      {/* Footer with Gradient Border */}
      <footer className="border-t border-gradient-to-r from-[#CAFE33]/30 via-purple-500/30 to-[#CAFE33]/30 py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <img 
            src="/logo.png" 
            alt="Fyndly Logo" 
            className="h-8 w-auto mx-auto mb-4 hover:scale-105 transition-transform"
          />
          <p className="text-gray-400">Built with 💚 by SJ • 2025</p>
        </div>
      </footer>

      {/* Add these styles to your global CSS or within a style tag */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-gradient {
          animation: gradient 8s linear infinite;
        }
        .bg-size-200 {
          background-size: 200% 200%;
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
