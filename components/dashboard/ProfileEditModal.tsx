import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Shuffle, X, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useEmbeddings } from "@/hooks/useEmbeddings";

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: any;
  onUpdate: (updates: any) => void;
}

interface ProfileFormData {
  full_name: string;
  about: string;
  department: string;
  academic_year: number;
  college: string;
  state: string;
  interests: string[];
  tech_skills: string[];
  creative_skills: string[];
  leadership_skills: string[];
  looking_for: string[];
  weekly_availability: string;
  meeting_preference: string;
  personality_tags: string[];
  github: string;
  linkedin: string;
  twitter: string;
  instagram: string;
  personal_website: string;
  avatar_url: string;
  avatar_regeneration_count: number;
}

type ArrayField =
  | "interests"
  | "tech_skills"
  | "creative_skills"
  | "leadership_skills"
  | "looking_for"
  | "personality_tags";

const MAX_REGENERATIONS = 4;

// LoadingIcon for avatar generation (copied from LandingPage)
function LoadingIcon({ size = 64, message }: { size?: number; message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center">
      <img
        src="/icon.png"
        alt="Fyndly Logo"
        className={`rounded-2xl shadow-xl animate-spin-slow`}
        style={{ width: size, height: size, animation: 'spin 1.2s linear infinite' }}
      />
      {message && <p className="text-green-300 mt-4">{message}</p>}
      <style jsx global>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin 1.2s linear infinite;
        }
      `}</style>
    </div>
  );
}

const ProfileEditModal = ({ isOpen, onClose, profile, onUpdate }: ProfileEditModalProps) => {
  const [formData, setFormData] = useState<ProfileFormData>({
    full_name: profile?.full_name || "",
    about: profile?.about || "",
    department: profile?.department || "",
    academic_year: profile?.academic_year || 1,
    college: profile?.college || "",
    state: profile?.state || "",
    interests: profile?.interests || [],
    tech_skills: profile?.tech_skills || [],
    creative_skills: profile?.creative_skills || [],
    leadership_skills: profile?.leadership_skills || [],
    looking_for: profile?.looking_for || [],
    weekly_availability: profile?.weekly_availability || "",
    meeting_preference: profile?.meeting_preference || "",
    personality_tags: profile?.personality_tags || [],
    github: profile?.github || "",
    linkedin: profile?.linkedin || "",
    twitter: profile?.twitter || "",
    instagram: profile?.instagram || "",
    personal_website: profile?.personal_website || "",
    avatar_url: profile?.avatar_url || "",
    avatar_regeneration_count: profile?.avatar_regeneration_count || 0,
  });

  const [isRegenerating, setIsRegenerating] = useState(false);
  const { toast } = useToast();
  const { generateEmbedding } = useEmbeddings();
  const [isEmbedding, setIsEmbedding] = useState(false);

  useEffect(() => {
    if (isOpen && profile) {
      setFormData({
        full_name: profile.full_name || "",
        about: profile.about || "",
        department: profile.department || "",
        academic_year: profile.academic_year || 1,
        college: profile.college || "",
        state: profile.state || "",
        interests: profile.interests || [],
        tech_skills: profile.tech_skills || [],
        creative_skills: profile.creative_skills || [],
        leadership_skills: profile.leadership_skills || [],
        looking_for: profile.looking_for || [],
        weekly_availability: profile.weekly_availability || "",
        meeting_preference: profile.meeting_preference || "",
        personality_tags: profile.personality_tags || [],
        github: profile.github || "",
        linkedin: profile.linkedin || "",
        twitter: profile.twitter || "",
        instagram: profile.instagram || "",
        personal_website: profile.personal_website || "",
        avatar_url: profile.avatar_url || "",
        avatar_regeneration_count: profile.avatar_regeneration_count || 0,
      });
    }
  }, [isOpen, profile]);

  const [newInterest, setNewInterest] = useState("");
  const [newSkill, setNewSkill] = useState("");

  const departmentOptions = [
    "Computer Science & Engineering", "Electronics & Communication Engineering", 
    "Mechanical Engineering", "Civil Engineering", "Electrical Engineering",
    "Chemical Engineering", "Aerospace Engineering", "Biotechnology", 
    "Information Technology", "Business Administration", "Economics", 
    "Psychology", "Biology", "Chemistry", "Physics", "Mathematics", 
    "English Literature", "Political Science", "History", "Philosophy", 
    "Art & Design", "Music", "Theater Arts", "Communications", "Journalism",
    "Pre-Med", "Pre-Law", "International Relations", "Environmental Science",
    "Data Science", "Bioengineering", "Materials Science", "Statistics", 
    "Architecture", "Law", "Medicine", "Pharmacy", "Nursing", "Commerce",
    "Finance", "Marketing", "Human Resources", "Other"
  ];

  const indianStates = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
    "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
    "Delhi", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
    "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
  ];

  const skillOptions = [
    "React", "JavaScript", "Python", "Java", "Node.js", "TypeScript", "HTML/CSS",
    "Machine Learning", "Data Analysis", "UI/UX Design", "Graphic Design",
    "Photography", "Video Editing", "Writing", "Public Speaking", "Leadership",
    "Project Management", "Marketing", "Sales", "Finance", "Business Strategy"
  ];

  const lookingForOptions = [
    "Co-founder", "Hackathon Partner", "Study Buddy", "Project Collaborator",
    "Startup Team Member", "Research Partner", "Mentor", "Mentee", "Friend",
    "Gaming Partner", "Sports Partner", "Travel Buddy", "Creative Partner"
  ];

  const personalityTags = [
    "🎯 Goal-oriented", "🚀 Ambitious", "🤝 Team Player", "💡 Creative", 
    "📚 Bookworm", "🎮 Gamer", "🏃‍♂️ Fitness Enthusiast", "🎵 Music Lover",
    "☕ Coffee Addict", "🌙 Night Owl", "🌅 Early Bird", "🧘‍♀️ Mindful",
    "🎭 Drama Queen", "🤓 Tech Geek", "🎨 Artistic", "📱 Social Media Pro"
  ];

  const handleRegenerateAvatar = async () => {
    setIsRegenerating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const response = await fetch('/api/user/generate-avatar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ name: formData.full_name, gender: profile.gender })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to regenerate avatar.');
      }

      setFormData(prev => ({
        ...prev,
        avatar_url: result.avatarUrl,
        avatar_regeneration_count: prev.avatar_regeneration_count + 1,
      }));

      toast({
        title: "Avatar Regenerated!",
        description: "Your new avatar has been generated and saved.",
      });

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsRegenerating(false);
    }
  };

  const remainingRegenerations = MAX_REGENERATIONS - formData.avatar_regeneration_count;

  const addItem = (field: ArrayField, value: string) => {
    if (value.trim() && !formData[field].includes(value.trim())) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()]
      }));
    }
  };

  const removeItem = (field: ArrayField, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_: string, i: number) => i !== index)
    }));
  };

  const handleSave = async () => {
    setIsEmbedding(true);
    await onUpdate(formData);
    // Regenerate embedding after profile update
    if (profile?.id) {
      await generateEmbedding(profile.id);
    }
    setIsEmbedding(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gray-900 border-[#CAFE33]/50 text-[#CAFE33]">
        <DialogHeader>
          <DialogTitle className="text-2xl text-[#CAFE33] flex items-center gap-2">
            ✏️ Edit Profile
          </DialogTitle>
        </DialogHeader>
        {isEmbedding && (
          <div className="flex flex-col items-center justify-center py-4">
            <LoadingIcon size={48} message="Updating your profile vector..." />
            <p className="text-xs text-[#CAFE33] mt-2">Regenerating your smart profile for better matches...</p>
          </div>
        )}
        <div className="space-y-6">
          {/* Avatar Section */}
          <div className="text-center">
            {isRegenerating && (
              <div className="mb-4 flex flex-col items-center justify-center">
                <LoadingIcon size={56} message="Generating your new avatar..." />
              </div>
            )}
            <Avatar className="h-24 w-24 mx-auto mb-4 border-4 border-[#CAFE33]/40">
              <AvatarImage src={formData.avatar_url} />
              <AvatarFallback className="bg-gradient-to-br from-[#CAFE33] to-[#B8E62E] text-black text-xl font-bold">
                {formData.full_name.split(' ').map((n: string) => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className="text-[#CAFE33] border-[#CAFE33] bg-transparent hover:bg-[#CAFE33]/20 hover:text-black hover:border-[#B8E62E] font-semibold transition-colors"
                onClick={handleRegenerateAvatar}
                disabled={isRegenerating || remainingRegenerations <= 0}
              >
                <Shuffle className={`h-4 w-4 mr-2 ${isRegenerating ? 'animate-spin' : ''}`} />
                {isRegenerating ? "Regenerating..." : "Regenerate Avatar"}
              </Button>
              <p className="text-xs text-green-300">
                {remainingRegenerations > 0
                  ? `You have ${remainingRegenerations} regenerations left.`
                  : "You have no regenerations left."}
              </p>
            </div>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-[#CAFE33]">Full Name</Label>
              <Input
                value={formData.full_name}
                onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                className="bg-gray-800 border-gray-600 text-[#CAFE33]"
              />
            </div>
            
            <div>
              <Label className="text-[#CAFE33]">Department</Label>
              <Select value={formData.department} onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}>
                <SelectTrigger className="bg-gray-800 border-gray-600 text-[#CAFE33]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600 max-h-60 z-50">
                  {departmentOptions.map((dept) => (
                    <SelectItem key={dept} value={dept} className="text-[#CAFE33] hover:bg-gray-700">
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* College and State */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-[#CAFE33]">College</Label>
              <Input
                value={formData.college}
                onChange={(e) => setFormData(prev => ({ ...prev, college: e.target.value }))}
                className="bg-gray-800 border-gray-600 text-[#CAFE33]"
              />
            </div>
            
            <div>
              <Label className="text-[#CAFE33]">State</Label>
              <Select value={formData.state} onValueChange={(value) => setFormData(prev => ({ ...prev, state: value }))}>
                <SelectTrigger className="bg-gray-800 border-gray-600 text-[#CAFE33]">
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600 max-h-60 z-50">
                  {indianStates.map((state) => (
                    <SelectItem key={state} value={state} className="text-[#CAFE33] hover:bg-gray-700">
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* About */}
          <div>
            <Label className="text-[#CAFE33]">About</Label>
            <Textarea
              value={formData.about}
              onChange={(e) => setFormData(prev => ({ ...prev, about: e.target.value }))}
              className="bg-gray-800 border-gray-600 text-[#CAFE33] min-h-[100px]"
              placeholder="Tell us about yourself..."
            />
          </div>

          {/* Interests */}
          <div>
            <Label className="text-[#CAFE33] mb-3 block">Interests</Label>
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.interests.map((interest: string, index: number) => (
                <Badge key={index} className="bg-blue-600/20 text-blue-400 border-blue-600/30">
                  {interest}
                  <X 
                    className="h-3 w-3 ml-1 cursor-pointer" 
                    onClick={() => removeItem('interests', index)}
                  />
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                placeholder="Add interest..."
                className="bg-gray-800 border-gray-600 text-[#CAFE33]"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    addItem('interests', newInterest);
                    setNewInterest('');
                  }
                }}
              />
              <Button
                onClick={() => {
                  addItem('interests', newInterest);
                  setNewInterest('');
                }}
                className="bg-[#CAFE33] text-black hover:bg-[#B8E62E]"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Skills */}
          <div>
            <Label className="text-[#CAFE33] mb-3 block">Skills</Label>
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.tech_skills.map((skill: string, index: number) => (
                <Badge key={index} className="bg-purple-600/20 text-purple-400 border-purple-600/30">
                  {skill}
                  <X 
                    className="h-3 w-3 ml-1 cursor-pointer" 
                    onClick={() => removeItem('tech_skills', index)}
                  />
                </Badge>
              ))}
            </div>
            <Select onValueChange={(value) => {
              addItem('tech_skills', value);
            }}>
              <SelectTrigger className="bg-gray-800 border-gray-600 text-[#CAFE33]">
                <SelectValue placeholder="Add skill..." />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600 max-h-60 z-50">
                {skillOptions.map((skill) => (
                  <SelectItem key={skill} value={skill} className="text-[#CAFE33] hover:bg-gray-700">
                    {skill}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Looking For */}
          <div>
            <Label className="text-[#CAFE33] mb-3 block">Looking For</Label>
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.looking_for.map((item: string, index: number) => (
                <Badge key={index} className="bg-[#CAFE33]/20 text-[#CAFE33] border-[#CAFE33]/30">
                  {item}
                  <X 
                    className="h-3 w-3 ml-1 cursor-pointer" 
                    onClick={() => removeItem('looking_for', index)}
                  />
                </Badge>
              ))}
            </div>
            <Select onValueChange={(value) => {
              addItem('looking_for', value);
            }}>
              <SelectTrigger className="bg-gray-800 border-gray-600 text-[#CAFE33]">
                <SelectValue placeholder="Add what you're looking for..." />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600 max-h-60 z-50">
                {lookingForOptions.map((option) => (
                  <SelectItem key={option} value={option} className="text-[#CAFE33] hover:bg-gray-700">
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Personality Tags */}
          <div>
            <Label className="text-[#CAFE33] mb-3 block">Personality Tags</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {personalityTags.map((tag) => (
                <Button
                  key={tag}
                  variant={formData.personality_tags.includes(tag) ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    if (formData.personality_tags.includes(tag)) {
                      setFormData(prev => ({
                        ...prev,
                        personality_tags: prev.personality_tags.filter((t: string) => t !== tag)
                      }));
                    } else {
                      setFormData(prev => ({
                        ...prev,
                        personality_tags: [...prev.personality_tags, tag]
                      }));
                    }
                  }}
                  className={formData.personality_tags.includes(tag) 
                    ? "bg-[#CAFE33] text-black border-[#CAFE33] font-semibold transition-colors" 
                    : "bg-transparent border-[#CAFE33] text-[#CAFE33] hover:bg-[#CAFE33]/10 hover:text-black hover:border-[#B8E62E] font-semibold transition-colors"
                  }
                >
                  {tag}
                </Button>
              ))}
            </div>
          </div>

          {/* Social Links - Updated with Instagram */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-[#CAFE33]">GitHub</Label>
              <Input
                value={formData.github}
                onChange={(e) => setFormData(prev => ({ ...prev, github: e.target.value }))}
                className="bg-gray-800 border-gray-600 text-[#CAFE33]"
                placeholder="https://github.com/username"
              />
            </div>
            <div>
              <Label className="text-[#CAFE33]">LinkedIn</Label>
              <Input
                value={formData.linkedin}
                onChange={(e) => setFormData(prev => ({ ...prev, linkedin: e.target.value }))}
                className="bg-gray-800 border-gray-600 text-[#CAFE33]"
                placeholder="https://linkedin.com/in/username"
              />
            </div>
            <div>
              <Label className="text-[#CAFE33]">Instagram</Label>
              <Input
                value={formData.instagram}
                onChange={(e) => setFormData(prev => ({ ...prev, instagram: e.target.value }))}
                className="bg-gray-800 border-gray-600 text-[#CAFE33]"
                placeholder="https://instagram.com/username"
              />
            </div>
            <div>
              <Label className="text-[#CAFE33]">Twitter</Label>
              <Input
                value={formData.twitter}
                onChange={(e) => setFormData(prev => ({ ...prev, twitter: e.target.value }))}
                className="bg-gray-800 border-gray-600 text-[#CAFE33]"
                placeholder="https://twitter.com/username"
              />
            </div>
            <div className="md:col-span-2">
              <Label className="text-[#CAFE33]">Website</Label>
              <Input
                value={formData.personal_website}
                onChange={(e) => setFormData(prev => ({ ...prev, personal_website: e.target.value }))}
                className="bg-gray-800 border-gray-600 text-[#CAFE33]"
                placeholder="https://yourwebsite.com"
              />
            </div>
          </div>

          {/* Availability */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-[#CAFE33]">Weekly Availability</Label>
              <Select value={formData.weekly_availability} onValueChange={(value) => setFormData(prev => ({ ...prev, weekly_availability: value }))}>
                <SelectTrigger className="bg-gray-800 border-gray-600 text-[#CAFE33]">
                  <SelectValue placeholder="Select availability" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600 z-50">
                  <SelectItem value="5-10 hours" className="text-[#CAFE33] hover:bg-gray-700">5-10 hours</SelectItem>
                  <SelectItem value="10-20 hours" className="text-[#CAFE33] hover:bg-gray-700">10-20 hours</SelectItem>
                  <SelectItem value="20+ hours" className="text-[#CAFE33] hover:bg-gray-700">20+ hours</SelectItem>
                  <SelectItem value="Flexible" className="text-[#CAFE33] hover:bg-gray-700">Flexible</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[#CAFE33]">Meeting Preference</Label>
              <Select value={formData.meeting_preference} onValueChange={(value) => setFormData(prev => ({ ...prev, meeting_preference: value }))}>
                <SelectTrigger className="bg-gray-800 border-gray-600 text-[#CAFE33]">
                  <SelectValue placeholder="Select preference" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600 z-50">
                  <SelectItem value="In-person" className="text-[#CAFE33] hover:bg-gray-700">In-person</SelectItem>
                  <SelectItem value="Virtual" className="text-[#CAFE33] hover:bg-gray-700">Virtual</SelectItem>
                  <SelectItem value="Hybrid" className="text-[#CAFE33] hover:bg-gray-700">Hybrid</SelectItem>
                  <SelectItem value="Flexible" className="text-[#CAFE33] hover:bg-gray-700">Flexible</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 border-[#CAFE33] text-[#CAFE33] hover:bg-[#CAFE33]/10 hover:text-black hover:border-[#B8E62E] font-semibold"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1 bg-gradient-to-r from-[#CAFE33] to-[#B8E62E] text-black hover:from-[#B8E62E] hover:to-[#CAFE33] font-bold"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileEditModal;
