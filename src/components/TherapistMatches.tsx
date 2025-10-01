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
  Heart,
  Brain,
  Award,
  Calendar,
  ArrowLeft,
  ExternalLink,
  CheckCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TherapistMatchesProps {
  userData: any;
  onBack: () => void;
}

export const TherapistMatches = ({ userData, onBack }: TherapistMatchesProps) => {
  const [selectedTherapist, setSelectedTherapist] = useState<string | null>(null);
  const { toast } = useToast();

  // INDIAN THERAPIST DATA - Mapped to your actual therapist_ids
  const indianTherapists = {
    2: {
      id: "2",
      name: "Dr. Priya Sharma",
      title: "Clinical Psychologist", 
      specialties: ["Anxiety", "Depression", "Relationship Issues", "Mindfulness"],
      experience: 9,
      rating: 4.8,
      reviewCount: 134,
      location: "Delhi, India",
      sessionTypes: ["Video", "In-Person"],
      fee: "₹1,200-1,500",
      availability: "Available this week",
      bio: "I specialize in helping young adults and professionals navigate life transitions, anxiety, and relationship challenges using evidence-based therapies tailored to Indian cultural context.",
      approach: "Cognitive Behavioral Therapy with Indian mindfulness techniques",
      education: "PhD in Clinical Psychology, Delhi University",
      matchScore: 92,
      matchReasons: ["Cultural understanding of Indian family dynamics", "Specializes in anxiety and depression common in urban youth"]
    },
    3: {
      id: "3", 
      name: "Dr. Arjun Patel",
      title: "Counseling Psychologist",
      specialties: ["Career Stress", "Work-Life Balance", "Men's Mental Health", "CBT"],
      experience: 7,
      rating: 4.7,
      reviewCount: 98,
      location: "Mumbai, India", 
      sessionTypes: ["Video", "Phone"],
      fee: "₹1,000-1,300",
      availability: "Available next week",
      bio: "I focus on helping professionals manage workplace stress, career transitions, and maintaining mental wellness in fast-paced urban environments.",
      approach: "Solution-Focused Brief Therapy with CBT elements",
      education: "MA in Psychology, Tata Institute of Social Sciences",
      matchScore: 88,
      matchReasons: ["Expertise in corporate stress and career issues", "Understanding of Indian workplace dynamics"]
    },
    4: {
      id: "4",
      name: "Dr. Ananya Reddy", 
      title: "Psychiatrist & Therapist",
      specialties: ["Medication Management", "OCD", "PTSD", "Trauma"],
      experience: 12,
      rating: 4.9,
      reviewCount: 215,
      location: "Bangalore, India",
      sessionTypes: ["Video", "In-Person"],
      fee: "₹1,500-2,000", 
      availability: "Available in 3 days",
      bio: "Dual-qualified psychiatrist and therapist with extensive experience in severe mental health conditions.",
      approach: "Integrative Psychiatry with Psychodynamic Therapy",
      education: "MD Psychiatry, NIMHANS Bangalore",
      matchScore: 95,
      matchReasons: ["Dual qualification in psychiatry and therapy", "Expert in trauma and OCD treatment"]
    },
    5: {
      id: "5",
      name: "Ms. Sneha Kapoor",
      title: "Counselor & Art Therapist", 
      specialties: ["Art Therapy", "Teen Issues", "Parenting", "Emotional Regulation"],
      experience: 6,
      rating: 4.6,
      reviewCount: 76,
      location: "Pune, India",
      sessionTypes: ["Video", "In-Person"],
      fee: "₹800-1,100",
      availability: "Available this week", 
      bio: "I use creative arts and expressive therapies to help children, teens, and young adults express themselves.",
      approach: "Expressive Arts Therapy with Person-Centered Approach",
      education: "MA in Clinical Psychology with Art Therapy specialization",
      matchScore: 85,
      matchReasons: ["Creative approach suitable for younger clients", "Expertise in family and parenting issues"]
    },
    6: {
      id: "6",
      name: "Dr. Rajesh Kumar",
      title: "Marriage & Family Therapist",
      specialties: ["Couples Therapy", "Family Conflict", "Marital Issues", "Cultural Adjustment"],
      experience: 11,
      rating: 4.8, 
      reviewCount: 189,
      location: "Chennai, India",
      sessionTypes: ["Video", "In-Person"],
      fee: "₹1,300-1,700",
      availability: "Available next week",
      bio: "Specializing in relationship and family dynamics within Indian cultural context.",
      approach: "Family Systems Therapy with Gottman Method", 
      education: "PhD in Family Therapy, University of Madras",
      matchScore: 90,
      matchReasons: ["Deep understanding of Indian family systems", "Expert in couples and marital therapy"]
    }
  };

  // Get matches from API or use fallback
  const apiMatches = userData?.matches || [];
  console.log("API Matches with therapist IDs:", apiMatches);

  // Map API matches to actual therapist data
  const therapistMatches = apiMatches.length > 0 
    ? apiMatches.map((match: any) => {
        const therapistId = match.therapist_id;
        const therapistData = indianTherapists[therapistId] || {
          id: therapistId,
          name: "Therapist",
          title: "Licensed Therapist",
          specialties: ["General practice"],
          experience: 5,
          rating: 4.5,
          reviewCount: 50,
          location: "India",
          sessionTypes: ["Video"],
          fee: "₹1,000",
          availability: "Available soon",
          bio: "Experienced therapist committed to helping clients.",
          approach: "Various approaches",
          education: "Licensed professional",
          matchScore: 85,
          matchReasons: ["Communication style match", "Language compatibility"]
        };
        return therapistData;
      })
    : Object.values(indianTherapists); // Fallback to all Indian therapists

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
              We found {therapistMatches.length} Indian therapists that match your preferences
            </p>
          </div>
        </div>

        {/* Therapist Matches */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {therapistMatches.map((therapist) => (
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
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg mr-4">
                  {therapist.name.split(' ').map((n: string) => n[0]).join('')}
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{therapist.name}</h3>
                  <p className="text-sm text-muted-foreground">{therapist.title}</p>
                  <div className="flex items-center mt-1">
                    <Star className="w-4 h-4 text-yellow-500 mr-1" />
                    <span className="text-sm">{therapist.rating} ({therapist.reviewCount} reviews)</span>
                  </div>
                </div>
              </div>

              {/* Rest of your component remains the same */}
              <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                  {therapist.specialties.slice(0, 3).map((specialty: string) => (
                    <Badge key={specialty} variant="secondary" className="text-xs">
                      {specialty}
                    </Badge>
                  ))}
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
              </div>

              {/* Action Buttons */}
              <Button 
                variant="default" 
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={() => handleBookConsultation(therapist.id, therapist.name)}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Book Free Consultation
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
