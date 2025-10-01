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

  // DEBUG: Let's see EXACTLY what we're getting
  console.log("=== DEBUG THERAPIST MATCHES ===");
  console.log("Full userData:", userData);
  console.log("userData.matches:", userData?.matches);
  console.log("Matches length:", userData?.matches?.length);
  
  if (userData?.matches && userData.matches.length > 0) {
    console.log("First match object:", userData.matches[0]);
    console.log("All keys in first match:", Object.keys(userData.matches[0]));
  } else {
    console.log("NO MATCHES FOUND - using fallback data");
  }

  // Use real matches from AI analysis if available, otherwise fall back to mock data
  const therapistMatches = userData?.matches || [
    {
      id: "debug-1",
      name: "DEBUG Dr. Sarah Chen",
      title: "DEBUG Licensed Clinical Psychologist", 
      specialties: ["DEBUG Anxiety", "DEBUG Depression"],
      experience: 8,
      rating: 4.9,
      reviewCount: 127,
      location: "DEBUG San Francisco, CA",
      sessionTypes: ["Video"],
      fee: "$150",
      availability: "Available this week",
      photo: therapistsImage,
      bio: "DEBUG Bio here",
      approach: "DEBUG Approach",
      education: "DEBUG Education",
      matchScore: 94,
      matchReasons: ["DEBUG Reason 1", "DEBUG Reason 2"],
      personalityMatch: {
        empathy: 0.92,
        directness: 0.65,
        structure: 0.78,
        warmth: 0.95
      }
    }
  ];

  console.log("Final therapistMatches to render:", therapistMatches);

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
              Based on your AI personality analysis, we've found {therapistMatches.length} therapists.
            </p>
          </div>

          {/* DEBUG INFO - Remove this card later */}
          <Card className="p-4 mb-4 bg-yellow-100 border-yellow-400">
            <h3 className="font-bold mb-2">🚨 DEBUG INFO 🚨</h3>
            <p><strong>Matches count:</strong> {therapistMatches.length}</p>
            <p><strong>Using real data:</strong> {!!userData?.matches ? "YES" : "NO"}</p>
            <p><strong>First therapist name:</strong> {therapistMatches[0]?.name || "NOT FOUND"}</p>
            <p><strong>First therapist keys:</strong> {therapistMatches[0] ? Object.keys(therapistMatches[0]).join(", ") : "No data"}</p>
          </Card>
        </div>

        {/* Therapist Matches */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {therapistMatches.map((therapist: any, index: number) => {
            console.log(`Rendering therapist ${index}:`, therapist);
            
            return (
            <Card key={therapist.id || `therapist-${index}`} className="p-6 border-2 border-blue-500">
              {/* DEBUG Badge */}
              <Badge variant="outline" className="mb-2 bg-red-100 text-red-800">
                DEBUG: {therapist.name ? "HAS NAME" : "NO NAME"}
              </Badge>

              {/* Match Score Badge */}
              <div className="flex justify-between items-start mb-4">
                <Badge variant="default" className="bg-success text-success-foreground">
                  {therapist.matchScore || therapist.match_score || 85}% Match
                </Badge>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => handleSaveToFavorites(therapist.id)}
                >
                  <Heart className="w-4 h-4" />
                </Button>
              </div>

              {/* Therapist Info - SIMPLIFIED FOR DEBUGGING */}
              <div className="flex items-center mb-4">
                <img 
                  src={therapist.photo || therapistsImage} 
                  alt={therapist.name || "Therapist"}
                  className="w-16 h-16 rounded-full object-cover mr-4 border-2 border-green-500"
                />
                <div>
                  <h3 className="text-lg font-semibold text-red-600">
                    {therapist.name || "NO NAME FOUND"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {therapist.title || therapist.credentials || "Licensed Therapist"}
                  </p>
                  <div className="flex items-center mt-1">
                    <Star className="w-4 h-4 text-yellow-500 mr-1" />
                    <span className="text-sm">
                      {therapist.rating || 4.5} ({therapist.reviewCount || therapist.review_count || 50} reviews)
                    </span>
                  </div>
                </div>
              </div>

              {/* Specialties */}
              <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                  {(therapist.specialties || therapist.specializations || ["General practice"]).slice(0, 3).map((specialty: string) => (
                    <Badge key={specialty} variant="secondary" className="text-xs">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Simple Action Button */}
              <Button 
                variant="therapy" 
                className="w-full"
                onClick={() => handleBookConsultation(therapist.id, therapist.name || "Therapist")}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Book Free Consultation
              </Button>

              {/* RAW DATA DEBUG */}
              <div className="mt-4 p-2 bg-gray-100 rounded text-xs">
                <strong>Raw data:</strong>
                <pre>{JSON.stringify(therapist, null, 2)}</pre>
              </div>
            </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};
