import { Button } from "@/components/ui/button";
import { Brain, Heart, Search, Sparkles } from "lucide-react";
import heroImage from "@/assets/hero-therapy.jpg";

interface HeroSectionProps {
  onGetStarted: () => void;
}

export const HeroSection = ({ onGetStarted }: HeroSectionProps) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImage} 
          alt="Professional therapy consultation setting"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-accent/80" />
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 animate-float">
        <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md">
          <Brain className="w-8 h-8 text-white" />
        </div>
      </div>
      <div className="absolute top-40 right-20 animate-float" style={{ animationDelay: '2s' }}>
        <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md">
          <Heart className="w-6 h-6 text-white" />
        </div>
      </div>
      <div className="absolute bottom-32 left-20 animate-float" style={{ animationDelay: '4s' }}>
        <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md">
          <Sparkles className="w-10 h-10 text-white" />
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
        <div className="animate-fade-in">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Find Your Perfect
            <span className="block bg-gradient-to-r from-white to-accent-light bg-clip-text text-transparent">
              Therapist Match
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
            Our AI-powered platform analyzes your personality, communication style, and preferences to connect you with therapists who truly understand you.
          </p>
        </div>

        <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button 
              variant="glass" 
              size="xl" 
              onClick={onGetStarted}
              className="group"
            >
              <Search className="w-6 h-6 mr-2 group-hover:scale-110 transition-transform" />
              Start AI Matching
            </Button>
            <Button variant="outline" size="xl" className="bg-white/10 text-white border-white/30 hover:bg-white/20">
              <Brain className="w-6 h-6 mr-2" />
              How It Works
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 animate-glow">
              <Brain className="w-12 h-12 text-accent-light mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">AI-Powered Analysis</h3>
              <p className="text-white/80">Advanced NLP processes your responses to understand your communication style and therapeutic needs.</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 animate-glow" style={{ animationDelay: '1s' }}>
              <Heart className="w-12 h-12 text-accent-light mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Perfect Matching</h3>
              <p className="text-white/80">Get matched with therapists whose approach and personality align with your preferences.</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 animate-glow" style={{ animationDelay: '2s' }}>
              <Sparkles className="w-12 h-12 text-accent-light mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Personalized Results</h3>
              <p className="text-white/80">Receive detailed compatibility scores and reasoning for each recommended therapist.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};