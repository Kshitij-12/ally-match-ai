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

  // INDIAN THERAPIST DATA
  const therapistMatches = [
    {
      id: "1",
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
      photo: "/api/placeholder/64/64",
      bio: "I specialize in helping young adults and professionals navigate life transitions, anxiety, and relationship challenges using evidence-based therapies tailored to Indian cultural context.",
      approach: "Cognitive Behavioral Therapy with Indian mindfulness techniques",
      education: "PhD in Clinical Psychology, Delhi University",
      matchScore: 92,
      matchReasons: [
        "Cultural understanding of Indian family dynamics",
        "Specializes in anxiety and depression common in urban youth",
        "Flexible approach combining Western and Indian therapeutic methods"
      ]
    },
    {
      id: "2", 
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
      photo: "/api/placeholder/64/64",
      bio: "I focus on helping professionals manage workplace stress, career transitions, and maintaining mental wellness in fast-paced urban environments. Understanding of corporate culture in India.",
      approach: "Solution-Focused Brief Therapy with CBT elements",
      education: "MA in Psychology, Tata Institute of Social Sciences",
      matchScore: 88,
      matchReasons: [
        "Expertise in corporate stress and career issues",
        "Understanding of Indian workplace dynamics",
        "Practical, solution-oriented approach"
      ]
    },
    {
      id: "3",
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
      photo: "/api/placeholder/64/64",
      bio: "Dual-qualified psychiatrist and therapist with extensive experience in severe mental health conditions. I combine medication management with psychotherapy for comprehensive care.",
      approach: "Integrative Psychiatry with Psychodynamic Therapy",
      education: "MD Psychiatry, NIMHANS Bangalore",
      matchScore: 95,
      matchReasons: [
        "Dual qualification in psychiatry and therapy",
        "Expert in trauma and OCD treatment",
        "Holistic approach to mental healthcare"
      ]
    },
    {
      id: "4",
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
      photo: "/api/placeholder/64/64",
      bio: "I use creative arts and expressive therapies to help children, teens, and young adults express themselves and work through emotional challenges in a non-threatening way.",
      approach: "Expressive Arts Therapy with Person-Centered Approach",
      education: "MA in Clinical Psychology with Art Therapy specialization",
      matchScore: 85,
      matchReasons: [
        "Creative approach suitable for younger clients",
        "Expertise in family and parenting issues",
        "Affordable and accessible therapy options"
      ]
    },
    {
      id: "5",
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
      photo: "/api/placeholder/64/64",
      bio: "Specializing in relationship and family dynamics within Indian cultural context. I help couples and families navigate conflicts, communication issues, and cultural transitions.",
      approach: "Family Systems Therapy with Gottman Method",
      education: "PhD in Family Therapy, University of Madras",
      matchScore: 90,
      matchReasons: [
        "Deep understanding of Indian family systems",
        "Expert in couples and marital therapy",
        "Cultural sensitivity to joint family dynamics"
      ]
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
                  {therapist.name.split(' ').map(n => n[0]).join('')}
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

              {/* Specialties */}
              <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                  {therapist.specialties.slice(0, 3).map((specialty) => (
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
                <Badge variant="outline" className="text-xs">
                  <Video className="w-3 h-3 mr-1" />
                  Video
                </Badge>
                {therapist.sessionTypes.includes("In-Person") && (
                  <Badge variant="outline" className="text-xs">
                    In-Person
                  </Badge>
                )}
                {therapist.sessionTypes.includes("Phone") && (
                  <Badge variant="outline" className="text-xs">
                    Phone
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
                  {therapist.matchReasons.slice(0, 2).map((reason, index) => (
                    <li key={index} className="flex items-start">
                      <span className="w-1 h-1 bg-primary rounded-full mt-2 mr-2 flex-shrink-0" />
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <Button 
                  variant="default" 
                  className="w-full bg-blue-600 hover:bg-blue-700"
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
                    <h5 className="font-medium text-sm mb-1">Education</h5>
                    <p className="text-xs text-muted-foreground">{therapist.education}</p>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <Card className="mt-12 p-8 text-center card-gradient border-0 shadow-medium">
          <h2 className="text-2xl font-bold mb-4">Need more options?</h2>
          <p className="text-muted-foreground mb-6">
            We have 50+ certified Indian therapists specializing in various approaches.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="outline">
              Refine My Matches
            </Button>
            <Button variant="default" className="bg-blue-600 hover:bg-blue-700">
              View All Indian Therapists
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
