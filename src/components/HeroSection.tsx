import { Button } from "@/components/ui/button";
import { Brain, Heart, Search, Sparkles } from "lucide-react";
import heroImage from "@/assets/hero-therapy.jpg";

interface HeroSectionProps {
  onGetStarted: () => void;
}

export const HeroSection = ({ onGetStarted }: HeroSectionProps) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-4xl mx-auto px-6 text-center py-24">
        <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight">
          Find Your Perfect
          <span className="block text-accent font-bold">Therapist Match</span>
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed">
          Our AI-powered platform analyzes your personality, communication style, and preferences to connect you with therapists who truly understand you.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <Button 
            variant="outline" 
            size="xl" 
            onClick={onGetStarted}
            className="group"
          >
            <Search className="w-6 h-6 mr-2 group-hover:scale-110 transition-transform" />
            Start AI Matching
          </Button>
          <Button variant="outline" size="xl">
            <Brain className="w-6 h-6 mr-2" />
            How It Works
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="rounded-xl p-6 border bg-card shadow-soft">
            <Brain className="w-12 h-12 text-accent mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-foreground">AI-Powered Analysis</h3>
            <p className="text-muted-foreground">Advanced NLP processes your responses to understand your communication style and therapeutic needs.</p>
          </div>
          <div className="rounded-xl p-6 border bg-card shadow-soft">
            <Heart className="w-12 h-12 text-accent mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-foreground">Perfect Matching</h3>
            <p className="text-muted-foreground">Get matched with therapists whose approach and personality align with your preferences.</p>
          </div>
          <div className="rounded-xl p-6 border bg-card shadow-soft">
            <Sparkles className="w-12 h-12 text-accent mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-foreground">Personalized Results</h3>
            <p className="text-muted-foreground">Receive detailed compatibility scores and reasoning for each recommended therapist.</p>
          </div>
        </div>
      </div>
    </section>
  );
};