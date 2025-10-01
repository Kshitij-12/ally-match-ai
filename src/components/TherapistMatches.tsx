import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Star, 
  MapPin, 
  Clock, 
  DollarSign, 
  Video, 
  Phone, 
  MessageCircle,
  Heart,
  Brain,
  Award,
  Calendar,
  ArrowLeft,
  ExternalLink,
  CheckCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import therapistsImage from "@/assets/therapists-group.jpg";

interface Therapist {
  id: string;
  name: string;
  title: string;
  specialties: string[];
  experience: number;
  rating: number;
  reviewCount: number;
  location: string;
  sessionTypes: string[];
  fee: string;
  availability: string;
  photo: string;
  bio: string;
  approach: string;
  education: string;
  matchScore: number;
  matchReasons: string[];
  personalityMatch: {
    empathy: number;
    directness: number;
    structure: number;
    warmth: number;
  };
}

interface TherapistMatchesProps {
  userData: any;
  onBack: () => void;
}

export const TherapistMatches = ({ userData, onBack }: TherapistMatchesProps) => {
  const [selectedTherapist, setSelectedTherapist] = useState<string | null>(null);
  const { toast } = useToast();

  // Debug: Log the actual API response to see the real field names
  console.log("API Response - userData.matches:", userData.matches);
  if (userData.matches && userData.matches.length > 0) {
    console.log("First match structure:", userData.matches[0]);
  }

  // Use real matches from AI analysis if available, otherwise fall back to mock data
  const therapistMatches = userData.matches || [
    {
      id: "1",
      name: "Dr. Sarah Chen",
      title: "Licensed Clinical Psychologist",
      specialties: ["Anxiety", "Depression", "CBT", "Mindfulness"],
      experience: 8,
      rating: 4.9,
      reviewCount: 127,
      location: "San Francisco, CA",
      sessionTypes: ["Video", "In-Person"],
      fee: "$150-180",
      availability: "Available this week",
      photo: therapistsImage,
      bio: "I believe in creating a warm, non-judgmental space where clients feel safe to explore their thoughts and feelings. My approach combines evidence-based techniques with genuine empathy.",
      approach: "Cognitive Behavioral Therapy with Mindfulness integration",
      education: "PhD in Clinical Psychology, Stanford University",
      matchScore: 94,
      matchReasons: [
        "Communication style perfectly matches your preference for collaborative approach",
        "Specializes in anxiety which aligns with your primary concerns",
        "High empathy and warmth scores match your personality profile"
      ],
      personalityMatch: {
        empathy: 0.92,
        directness: 0.65,
        structure: 0.78,
        warmth: 0.95
      }
    }
  ];

  const handleBookConsultation = (therapistId: string, therapistName: string) => {
    toast({
      title: "Consultation Requested",
      description: `We'll send you booking details for Dr. ${therapistName} within 24 hours.`,
    });
  };

  const handleSaveToFavorites = (therapistId: string) => {
    toast({
      title: "Saved to Favorites",
      description: "This therapist has been added to your favorites list.",
    });
  };

  // Helper function to safely extract therapist data with fallbacks
  const getTherapistData = (match: any) => {
    // Try multiple possible field names from your API
    const therapist = match.therapist || match.raw_therapist || match;
    
    return {
      id: therapist.id || therapist.therapist_id || `temp-${Math.random()}`,
      name: therapist.name || therapist.full_name || "Therapist",
      title: therapist.title || therapist.credentials || "Licensed Therapist",
      specialties: therapist.specialties || therapist.specializations || therapist.expertise || ["General practice"],
      experience: therapist.experience || therapist.years_experience || 5,
      rating: therapist.rating || therapist.avg_rating || 4.5,
      reviewCount: therapist.reviewCount || therapist.review_count || therapist.num_reviews || 50,
      location: therapist.location || therapist.city_state || "Available online",
      sessionTypes: therapist.sessionTypes || therapist.session_types || ["Video"],
      fee: therapist.fee || therapist.hourly_rate || therapist.session_fee || "$120-150",
      availability: therapist.availability || "Available this week",
      photo: therapist.photo || therapist.profile_picture || therapistsImage,
      bio: therapist.bio || therapist.biography || "Experienced therapist committed to helping clients achieve their goals.",
      approach: therapist.approach || therapist.approach_style || therapist.therapy_approach || "Various approaches",
      education: therapist.education || therapist.credentials_detail || "Licensed professional",
      matchScore: match.match_score || match.matchScore || match.score || 85,
      matchReasons: match.match_reasons || therapist.matchReasons || ["Communication style match", "Language compatibility", "Within budget range"],
      personalityMatch: therapist.personalityMatch || {
        empathy: 0.8,
        directness: 0.6,
        structure: 0.7,
        warmth: 0.8
      }
    };
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={onBack} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Assessment
          </Button>
          
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">Your Perfect Therapist Matches</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Based on your AI personality analysis, we've found {therapistMatches.length} therapists who align with your communication style and therapeutic needs.
            </p>
          </div>

          {/* AI Analysis Summary */}
          <Card className="p-6 card-gradient border-0 shadow-medium mb-8">
            <div className="flex items-center mb-4">
              <Brain className="w-6 h-6 text-primary mr-3" />
              <h2 className="text-xl font-semibold">Your AI Personality Profile</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Empathy Need</span>
                  <span>{Math.round((userData.aiAnalysis?.personalityScore?.empathy || 0.7) * 100)}%</span>
                </div>
                <Progress value={(userData.aiAnalysis?.personalityScore?.empathy || 0.7) * 100} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Direct Communication</span>
                  <span>{Math.round((userData.aiAnalysis?.personalityScore?.directness || 0.6) * 100)}%</span>
                </div>
                <Progress value={(userData.aiAnalysis?.personalityScore?.directness || 0.6) * 100} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Structure Preference</span>
                  <span>{Math.round((userData.aiAnalysis?.personalityScore?.structure || 0.5) * 100)}%</span>
                </div>
                <Progress value={(userData.aiAnalysis?.personalityScore?.structure || 0.5) * 100} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Warmth Need</span>
                  <span>{Math.round((userData.aiAnalysis?.personalityScore?.warmth || 0.8) * 100)}%</span>
                </div>
                <Progress value={(userData.aiAnalysis?.personalityScore?.warmth || 0.8) * 100} className="h-2" />
              </div>
            </div>
          </Card>
        </div>

        {/* Therapist Matches */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {therapistMatches.map((match, index) => {
            const therapist = getTherapistData(match);
            const matchScore = therapist.matchScore;

            return (
            <Card key={therapist.id} className="p-6 card-gradient border-0 shadow-medium hover:shadow-strong transition-smooth">
              {/* Match Score Badge */}
              <div className="flex justify-between items-start mb-4">
                <Badge variant="default" className="bg-success text-success-foreground">
                  {matchScore}% Match
                </Badge>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => handleSaveToFavorites(therapist.id)}
                >
                  <Heart className="w-4 h-4" />
                </Button>
              </div>

              {/* Therapist Info */}
              <div className="flex items-center mb-4">
                <img 
                  src={therapist.photo} 
                  alt={therapist.name}
                  className="w-16 h-16 rounded-full object-cover mr-4"
                />
                <div>
                  <h3 className="text-lg font-semibold">{therapist.name}</h3>
                  <p className="text-sm text-muted-foreground">{therapist.title}</p>
                  <div className="flex items-center mt-1">
                    <Star className="w-4 h-4 text-yellow-500 mr-1" />
                    <span className="text-sm">{therapist.rating} ({therapist.reviewCount} reviews)</span>
                  </div>
                </div>
              </div>

              {/* Specialties */}
              <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                  {therapist.specialties.slice(0, 3).map((specialty: string) => (
                    <Badge key={specialty} variant="secondary" className="text-xs">
                      {specialty}
                    </Badge>
                  ))}
                  {therapist.specialties.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{therapist.specialties.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>

              {/* Quick Info */}
              <div className="space-y-2 text-sm mb-4">
                <div className="flex items-center">
                  <Award className="w-4 h-4 text-muted-foreground mr-2" />
                  <span>{therapist.experience} years experience</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 text-muted-foreground mr-2" />
                  <span>{therapist.location}</span>
                </div>
                <div className="flex items-center">
                  <DollarSign className="w-4 h-4 text-muted-foreground mr-2" />
                  <span>{therapist.fee} per session</span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 text-muted-foreground mr-2" />
                  <span>{therapist.availability}</span>
                </div>
              </div>

              {/* Session Types */}
              <div className="flex gap-2 mb-4">
                {therapist.sessionTypes.includes("Video") && (
                  <Badge variant="outline" className="text-xs">
                    <Video className="w-3 h-3 mr-1" />
                    Video
                  </Badge>
                )}
                {therapist.sessionTypes.includes("Phone") && (
                  <Badge variant="outline" className="text-xs">
                    <Phone className="w-3 h-3 mr-1" />
                    Phone
                  </Badge>
                )}
                {therapist.sessionTypes.includes("In-Person") && (
                  <Badge variant="outline" className="text-xs">
                    <MessageCircle className="w-3 h-3 mr-1" />
                    In-Person
                  </Badge>
                )}
              </div>

              {/* Match Reasons */}
              <div className="mb-6">
                <h4 className="text-sm font-medium mb-2 flex items-center">
                  <CheckCircle className="w-4 h-4 text-success mr-2" />
                  Why This Match?
                </h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  {therapist.matchReasons.slice(0, 2).map((reason: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <span className="w-1 h-1 bg-primary rounded-full mt-2 mr-2 flex-shrink-0" />
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Personality Match Bars */}
              <div className="mb-6">
                <h4 className="text-sm font-medium mb-3">Match Details</h4>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Overall Score</span>
                      <span>{matchScore}%</span>
                    </div>
                    <Progress value={matchScore} className="h-1" />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <Button 
                  variant="therapy" 
                  className="w-full"
                  onClick={() => handleBookConsultation(therapist.id, therapist.name)}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Book Free Consultation
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => setSelectedTherapist(selectedTherapist === therapist.id ? null : therapist.id)}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  {selectedTherapist === therapist.id ? 'Hide Details' : 'View Full Profile'}
                </Button>
              </div>

              {/* Expanded Details */}
              {selectedTherapist === therapist.id && (
                <div className="mt-4 pt-4 border-t space-y-3 animate-fade-in">
                  <div>
                    <h5 className="font-medium text-sm mb-1">About</h5>
                    <p className="text-xs text-muted-foreground">{therapist.bio}</p>
                  </div>
                  <div>
                    <h5 className="font-medium text-sm mb-1">Approach</h5>
                    <p className="text-xs text-muted-foreground">{therapist.approach}</p>
                  </div>
                  <div>
                    <h5 className="font-medium text-sm mb-1">Specializations</h5>
                    <p className="text-xs text-muted-foreground">{therapist.specialties.join(', ')}</p>
                  </div>
                </div>
              )}
            </Card>
            );
          })}
        </div>

        {/* CTA Section */}
        <Card className="mt-12 p-8 text-center card-gradient border-0 shadow-medium">
          <h2 className="text-2xl font-bold mb-4">Not quite right?</h2>
          <p className="text-muted-foreground mb-6">
            We can refine your matches based on additional preferences or help you explore more options.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="outline">
              Refine My Matches
            </Button>
            <Button variant="therapy">
              View All Therapists
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
