import { useState } from "react";
import { HeroSection } from "@/components/HeroSection";
import { AIIntakeForm } from "@/components/AIIntakeForm";
import { TherapistMatches } from "@/components/TherapistMatches";

type AppState = 'hero' | 'intake' | 'matches';

interface UserData {
  name: string;
  email: string;
  age: string;
  concerns: string;
  background: string;
  preferences: string;
  communicationStyle: string;
  therapyType: string[];
  previousExperience: string;
  aiAnalysis: any;
}

const Index = () => {
  const [currentView, setCurrentView] = useState<AppState>('hero');
  const [userData, setUserData] = useState<UserData | null>(null);

  const handleGetStarted = () => {
    setCurrentView('intake');
  };

  const handleIntakeComplete = (data: UserData) => {
    setUserData(data);
    setCurrentView('matches');
  };

  const handleBackToHero = () => {
    setCurrentView('hero');
    setUserData(null);
  };

  const handleBackToIntake = () => {
    setCurrentView('intake');
  };

  if (currentView === 'intake') {
    return (
      <AIIntakeForm 
        onComplete={handleIntakeComplete}
        onBack={handleBackToHero}
      />
    );
  }

  if (currentView === 'matches' && userData) {
    return (
      <TherapistMatches 
        userData={userData}
        onBack={handleBackToIntake}
      />
    );
  }

  return (
    <HeroSection onGetStarted={handleGetStarted} />
  );
};

export default Index;
