import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Brain, Loader2, Calendar, MessageCircle, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = "https://zuzlmfntigskoxhwbiav.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1emxtZm50aWdza294aHdiaWF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxNDI2NTIsImV4cCI6MjA3NDcxODY1Mn0.DEMV45Eo4UVfcCTKM3I6XgAmbL8owzJyKnNXZn1lvDc";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});

interface FormData {
  name: string;
  email: string;
  age: string;
  concerns: string;
  background: string;
  preferences: string;
  communicationStyle: string;
  therapyType: string[];
  previousExperience: string;
}

interface Therapist {
  id: string;
  name: string;
  title?: string;
  specializations?: string[];
  therapy_types?: string[];
  communication_style?: string;
  approach_style?: string;
  years_experience?: number;
  hourly_rate?: number;
  languages?: string[];
  availability_status?: string;
}

interface Match {
  id: string;
  match_score: number;
  confidence_level: string;
  match_reasons: string[];
  ai_explanation?: string;
  therapist: Therapist;
}

// Simple Badge component since we don't have the UI one
const Badge = ({ children, variant = "default", className = "" }: { children: React.ReactNode; variant?: "default" | "secondary" | "outline"; className?: string }) => {
  const baseStyles = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
  const variants = {
    default: "bg-primary text-primary-foreground",
    secondary: "bg-secondary text-secondary-foreground",
    outline: "border border-input bg-background"
  };

  return (
    <span className={`${baseStyles} ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

// Match Results Component
const MatchResults = ({ matches, onBack }: { matches: Match[]; onBack: () => void }) => {
  if (!matches || matches.length === 0) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="max-w-4xl mx-auto px-6">
          <Card className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">No Matches Found</h2>
            <p className="text-muted-foreground mb-6">
              We couldn't find any therapists matching your criteria. Try adjusting your preferences.
            </p>
            <Button onClick={onBack}>Adjust Preferences</Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Your Therapist Matches</h1>
          <p className="text-muted-foreground">
            We found {matches.length} therapists that match your preferences
          </p>
        </div>

        <div className="space-y-6">
          {matches.map((match, index) => (
            <Card key={match.id || index} className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold">
                        {match.therapist?.name || "Therapist"}
                      </h3>
                      <p className="text-muted-foreground">
                        {match.therapist?.title || "Licensed Therapist"}
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-sm">
                      {Math.round((match.match_score || 0) * 100)}% Match
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h4 className="font-medium mb-2">Specializations</h4>
                      <div className="flex flex-wrap gap-1">
                        {match.therapist?.specializations?.slice(0, 3).map((spec, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {spec}
                          </Badge>
                        ))}
                        {(!match.therapist?.specializations || match.therapist.specializations.length === 0) && (
                          <span className="text-muted-foreground text-sm">General practice</span>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Approaches</h4>
                      <div className="flex flex-wrap gap-1">
                        {match.therapist?.therapy_types?.slice(0, 3).map((type, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {type}
                          </Badge>
                        ))}
                        {(!match.therapist?.therapy_types || match.therapist.therapy_types.length === 0) && (
                          <span className="text-muted-foreground text-sm">Various approaches</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {match.match_reasons && match.match_reasons.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-medium mb-2">Why This Match?</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {match.match_reasons.slice(0, 3).map((reason, i) => (
                          <li key={i}>• {reason}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    {match.therapist?.years_experience && (
                      <span>📅 {match.therapist.years_experience} years experience</span>
                    )}
                    {match.therapist?.hourly_rate && (
                      <span>💵 ${match.therapist.hourly_rate}/session</span>
                    )}
                    {match.therapist?.languages && match.therapist.languages.length > 0 && (
                      <span>🗣️ {match.therapist.languages.join(", ")}</span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-3 min-w-[200px]">
                  <Button className="w-full">
                    <Calendar className="w-4 h-4 mr-2" />
                    Book Session
                  </Button>
                  <Button variant="outline" className="w-full">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center mt-8">
          <Button variant="outline" onClick={onBack}>
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

// Loading Component
const AnalysisLoading = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <Card className="p-12 max-w-md mx-auto text-center card-gradient border-0 shadow-strong">
      <div className="animate-glow mb-6">
        <Brain className="w-16 h-16 text-primary mx-auto animate-pulse" />
      </div>
      <h2 className="text-2xl font-bold mb-4">Analyzing Your Profile</h2>
      <p className="text-muted-foreground mb-6">
        Our AI is processing your responses to find the perfect therapist matches...
      </p>
      <div className="space-y-3">
        <Progress value={33} className="h-2" />
        <p className="text-sm text-muted-foreground">Processing personality traits...</p>
      </div>
    </Card>
  </div>
);

// Main Component
export const AIIntakeForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [matches, setMatches] = useState<Match[]>([]);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    age: "",
    concerns: "",
    background: "",
    preferences: "",
    communicationStyle: "",
    therapyType: [],
    previousExperience: "",
  });
  const { toast } = useToast();

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsAnalyzing(true);
   
    try {
      // Basic client-side validation for critical fields
      if (!formData.concerns || formData.concerns.trim().length === 0) {
        throw new Error("Please describe your main concerns before proceeding.");
      }

      // Authentication Check
      let { data: { session } } = await supabase.auth.getSession();
      
      // If no session, attempt anonymous sign-in
      if (!session) {
        console.log("No active session found. Attempting anonymous sign-in...");
        const { data: authData, error: authError } = await supabase.auth.signInAnonymously();

        if (authError || !authData.session) {
          console.error("Anonymous authentication failed:", authError);
          throw new Error("Authentication failed. Please refresh and try again.");
        }
        session = authData.session;
      }

      if (!session || !session.user.id) {
        throw new Error("User session is invalid. Cannot proceed with analysis.");
      }
      console.log("Authenticated successfully with user ID:", session.user.id);

      // Prepare intake data for AI analysis
      const intakeData = {
        currentSituation: formData.concerns,
        goals: formData.preferences,
        specificConcerns: formData.therapyType,
        urgencyLevel: 'moderate',
        budgetRange: '$100-150',
        sessionFormatPreference: 'video',
        therapyTypePreference: formData.therapyType.join(', '),
        communicationStylePreference: formData.communicationStyle,
        preferredLanguage: 'English',
        previousTherapy: formData.previousExperience.length > 0,
        preferredGender: 'any'
      };

      // Real AI analysis with OpenAI
      console.log("Submitting intake to analyze-intake:", intakeData);
      const { data: analysisResult, error: analysisError } = await supabase.functions.invoke('analyze-intake', {
        body: { intakeData }
      });
     
      if (analysisError) {
        console.error("analyze-intake error:", analysisError);
        throw new Error(analysisError.message || "Analysis service failed");
      }
     
      // Generate therapist matches
      const { data: matchesData, error: matchesError } = await supabase.functions.invoke('generate-matches', {
        body: { intakeResponseId: analysisResult.intakeResponseId }
      });
     
      if (matchesError) {
        console.error("generate-matches error:", matchesError);
        throw new Error(matchesError.message || "Match generation failed");
      }

      console.log("Matches received:", matchesData.matches);
      
      // Set matches and show results
      setMatches(matchesData.matches || []);
      setShowResults(true);
     
      toast({
        title: "Analysis Complete!",
        description: `AI has analyzed your responses and found ${matchesData.matches?.length || 0} personalized therapist matches.`,
      });
    } catch (error) {
      let errorMsg = "There was an error processing your responses. Please try again.";
      if (error instanceof Error) {
        errorMsg = error.message;
      } else if (typeof error === 'string') {
        errorMsg = error;
      }
      console.error('Analysis error:', error, '\nForm data:', formData);
      toast({
        title: "Analysis Failed",
        description: errorMsg + " If this persists, please contact support.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const updateFormData = (field: keyof FormData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleBackToForm = () => {
    setShowResults(false);
    setMatches([]);
    setCurrentStep(1);
  };

  // Show loading state
  if (isAnalyzing) {
    return <AnalysisLoading />;
  }

  // Show results
  if (showResults) {
    return <MatchResults matches={matches} onBack={handleBackToForm} />;
  }

  // Show form
  return (
    <div className="min-h-screen bg-background py-12">
      <style>
        {`
        @keyframes fade-in {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
            animation: fade-in 0.5s ease-out forwards;
        }
        .card-gradient {
            background: linear-gradient(145deg, #ffffff 0%, #f0f4f8 100%);
        }
        .shadow-strong {
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
        }
        .shadow-medium {
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
        }
        .button-therapy {
          background-color: #6366f1;
          color: white;
        }
        .button-therapy:hover {
          background-color: #4f46e5;
        }
        .animate-glow {
            animation: glow 1.5s infinite alternate;
        }
        @keyframes glow {
            from { filter: drop-shadow(0 0 5px rgba(99, 102, 241, 0.5)); }
            to { filter: drop-shadow(0 0 10px rgba(99, 102, 241, 0.8)); }
        }
        `}
      </style>
      <div className="max-w-3xl mx-auto px-6">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold">AI Intake Assessment</h1>
            <span className="text-sm text-muted-foreground">
              Step {currentStep} of {totalSteps}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Card className="p-8 card-gradient border-0 shadow-medium">
          {currentStep === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-2xl font-semibold mb-2">Basic Information</h2>
                <p className="text-muted-foreground mb-6">Tell us a bit about yourself</p>
              </div>
             
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => updateFormData('name', e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateFormData('email', e.target.value)}
                    placeholder="Enter your email"
                  />
                </div>
              </div>
             
              <div>
                <Label htmlFor="age">Age Range</Label>
                <RadioGroup 
                  value={formData.age} 
                  onValueChange={(value) => updateFormData('age', value)}
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="18-25" id="18-25" />
                    <Label htmlFor="18-25">18-25</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="26-35" id="26-35" />
                    <Label htmlFor="26-35">26-35</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="36-45" id="36-45" />
                    <Label htmlFor="36-45">36-45</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="46+" id="46+" />
                    <Label htmlFor="46+">46+</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-2xl font-semibold mb-2">Your Current Situation</h2>
                <p className="text-muted-foreground mb-6">Help us understand what you're facing</p>
              </div>
             
              <div>
                <Label htmlFor="concerns">
                  What brings you to therapy? Describe your main concerns or challenges.
                </Label>
                <Textarea
                  id="concerns"
                  value={formData.concerns}
                  onChange={(e) => updateFormData('concerns', e.target.value)}
                  placeholder="Take your time to describe what's been on your mind lately. The more detail you provide, the better we can match you with the right therapist."
                  className="min-h-[120px] mt-2"
                />
              </div>
             
              <div>
                <Label htmlFor="background">
                  Tell us about relevant background information that might help a therapist understand you better.
                </Label>
                <Textarea
                  id="background"
                  value={formData.background}
                  onChange={(e) => updateFormData('background', e.target.value)}
                  placeholder="This could include family history, major life events, current stressors, or anything else you think is important to share."
                  className="min-h-[100px] mt-2"
                />
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-2xl font-semibold mb-2">Communication & Preferences</h2>
                <p className="text-muted-foreground mb-6">How do you prefer to communicate and receive support?</p>
              </div>
             
              <div>
                <Label>Communication Style Preference</Label>
                <RadioGroup 
                  value={formData.communicationStyle} 
                  onValueChange={(value) => updateFormData('communicationStyle', value)}
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="direct" id="direct" />
                    <Label htmlFor="direct">Direct and straightforward - give me practical advice</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="gentle" id="gentle" />
                    <Label htmlFor="gentle">Gentle and supportive - help me explore my feelings</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="collaborative" id="collaborative" />
                    <Label htmlFor="collaborative">Collaborative - work together to find solutions</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="challenging" id="challenging" />
                    <Label htmlFor="challenging">Challenging - push me to grow and change</Label>
                  </div>
                </RadioGroup>
              </div>
             
              <div>
                <Label htmlFor="preferences">
                  What specific qualities or approaches would you want in a therapist?
                </Label>
                <Textarea
                  id="preferences"
                  value={formData.preferences}
                  onChange={(e) => updateFormData('preferences', e.target.value)}
                  placeholder="For example: someone who is warm and empathetic, uses humor, has experience with specific issues, or follows certain therapeutic approaches."
                  className="min-h-[100px] mt-2"
                />
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-2xl font-semibold mb-2">Therapy Preferences</h2>
                <p className="text-muted-foreground mb-6">Final details to help us find your perfect match</p>
              </div>
             
              <div>
                <Label>Types of therapy you're interested in (select all that apply)</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {[
                    "Cognitive Behavioral Therapy (CBT)",
                    "Psychodynamic Therapy", 
                    "Humanistic/Person-Centered",
                    "Dialectical Behavior Therapy (DBT)",
                    "EMDR",
                    "Family/Couples Therapy"
                  ].map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox 
                        id={type}
                        checked={formData.therapyType.includes(type)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            updateFormData('therapyType', [...formData.therapyType, type]);
                          } else {
                            updateFormData('therapyType', formData.therapyType.filter(t => t !== type));
                          }
                        }}
                      />
                      <Label htmlFor={type} className="text-sm">{type}</Label>
                    </div>
                  ))}
                </div>
              </div>
             
              <div>
                <Label htmlFor="previousExperience">
                  Previous therapy experience (optional)
                </Label>
                <Textarea
                  id="previousExperience"
                  value={formData.previousExperience}
                  onChange={(e) => updateFormData('previousExperience', e.target.value)}
                  placeholder="Tell us about any previous therapy experiences - what worked well or didn't work for you?"
                  className="min-h-[100px] mt-2"
                />
              </div>
            </div>
          )}

          <div className="flex justify-between mt-8 pt-6 border-t">
            <Button variant="outline" onClick={handlePrevious}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              {currentStep === 1 ? 'Back to Home' : 'Previous'}
            </Button>
           
            <Button 
              className={currentStep === totalSteps ? "button-therapy" : ""}
              onClick={handleNext}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : currentStep === totalSteps ? (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  Analyze & Find Matches
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
