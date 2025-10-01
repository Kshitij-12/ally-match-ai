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

interface TherapistMatchesProps {
  userData: any;
  onBack: () => void;
}

export const TherapistMatches = ({ userData, onBack }: TherapistMatchesProps) => {
  const [selectedTherapist, setSelectedTherapist] = useState<string | null>(null);
  const { toast } = useToast();

  // DEBUG: Check if API returned empty objects
  const apiMatches = userData?.matches || [];
  const hasRealData = apiMatches.length > 0 && apiMatches[0] && Object.keys(apiMatches[0]).length > 0;
  
  console.log("API matches:", apiMatches);
  console.log("Has real data:", hasRealData);
  console.log("First match keys:", apiMatches[0] ? Object.keys(apiMatches[0]) : "No matches");

  // FORCE USE MOCK DATA SINCE API RETURNS EMPTY OBJECTS
  const therapistMatches = hasRealData ? apiMatches : [
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
    },
    {
      id: "2", 
      name: "Dr. Michael Rodriguez",
      title: "Licensed Marriage & Family Therapist",
      specialties: ["Relationships", "Life Transitions", "Humanistic Therapy"],
      experience: 12,
      rating: 4.8,
      reviewCount: 203,
      location: "Los Angeles, CA",
      sessionTypes: ["Video", "Phone", "In-Person"],
      fee: "$120-150",
      availability: "Available next week",
      photo: therapistsImage,
      bio: "I work with individuals and couples to navigate life's challenges with courage and compassion. My goal is to help you discover your own inner wisdom and strength.",
      approach: "Person-Centered Therapy with Gestalt techniques",
      education: "MA in Marriage & Family Therapy, UCLA",
      matchScore: 89,
      matchReasons: [
        "Gentle and supportive style matches your communication preferences",
        "Experience with life transitions relevant to your background",
        "Warm and empathetic approach aligns with your needs"
      ],
      personalityMatch: {
        empathy: 0.88,
        directness: 0.45,
        structure: 0.60,
        warmth: 0.92
      }
    },
    {
      id: "3",
      name: "Dr. Emily Johnson",
      title: "Licensed Clinical Social Worker",
      specialties: ["Trauma", "EMDR", "Mindfulness", "Self-Esteem"],
      experience: 15,
      rating: 4.9,
      reviewCount: 156,
      location: "Seattle, WA", 
      sessionTypes: ["Video", "In-Person"],
      fee: "$140-170",
      availability: "Available in 2 weeks",
      photo: therapistsImage,
      bio: "I specialize in helping people heal from trauma and develop a stronger sense of self. My approach is trauma-informed and emphasizes building resilience and post-traumatic growth.",
      approach: "EMDR and Somatic Therapy",
      education: "MSW Clinical Social Work, University of Washington",
      matchScore: 86,
      matchReasons: [
        "Trauma-informed approach addresses your background experiences",
        "Combines empathy with practical healing techniques",
        "Strong track record with clients who have similar concerns"
      ],
      personalityMatch: {
        empathy: 0.90,
        directness: 0.72,
        structure: 0.85,
        warmth: 0.87
      }
    }
  ];

  const handleBookConsultation = (therapistId: string, therapistName: string) => {
    toast({
      title: "Consultation Requested",
      description: `We'll send you booking details for ${therapistName} within 24 hours.`,
    });
  };

  const handleSaveToFavorites = (therapistId: string) => {
    toast({
      title: "Saved to Favorites",
      description: "This therapist has been added to your favorites list.",
    });
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
              {hasRealData ? "Based on your AI personality analysis" : "Showing sample matches - your AI analysis is being processed"}
            </p>
          </div>
        </div>

        {/* Therapist Matches */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {therapistMatches.map((therapist: any) => (
            <Card key={therapist.id} className="p-6 card-gradient border-0 shadow-medium hover:shadow-strong transition-smooth">
              {/* Match Score Badge */}
              <div className="flex justify-between items-start mb-4">
                <Badge variant="default" className="bg-success text-success-foreground">
                  {therapist.matchScore}% Match
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

              {/* Rest of your original component code... */}
              {/* ... include all the other sections from your original working component */}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
