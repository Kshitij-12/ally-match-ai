import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Brain, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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

interface AIIntakeFormProps {
  onComplete: (data: FormData & { aiAnalysis: any; matches?: any[] }) => void;
  onBack: () => void;
}

export const AIIntakeForm = ({ onComplete, onBack }: AIIntakeFormProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
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
    } else {
      onBack();
    }
  };

  const handleSubmit = async () => {
    setIsAnalyzing(true);
    
    try {
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
      const { data: analysisResult, error: analysisError } = await supabase.functions.invoke('analyze-intake', {
        body: { intakeData }
      });
      
      if (analysisError) throw analysisError;
      
      // Generate therapist matches
      const { data: matchesData, error: matchesError } = await supabase.functions.invoke('generate-matches', {
        body: { intakeResponseId: analysisResult.intakeResponseId }
      });
      
      if (matchesError) throw matchesError;
      
      onComplete({ 
        ...formData, 
        aiAnalysis: analysisResult.analysis,
        matches: matchesData.matches || []
      });
      
      toast({
        title: "Analysis Complete!",
        description: "AI has analyzed your responses and found personalized therapist matches.",
      });
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: "There was an error processing your responses. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const updateFormData = (field: keyof FormData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (isAnalyzing) {
    return (
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
  }

  return (
    <div className="min-h-screen bg-background py-12">
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
              variant={currentStep === totalSteps ? "therapy" : "default"}
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