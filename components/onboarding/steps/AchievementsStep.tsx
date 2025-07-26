import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, ExternalLink, Trophy, Briefcase, Star } from "lucide-react";

interface Achievement {
  id: string;
  title: string;
  description: string;
  link: string;
  type: 'project' | 'work' | 'achievement' | 'startup' | 'research' | 'competition';
}

interface AchievementsStepProps {
  data: any;
  updateData: (key: string, data: any) => void;
  onNext: () => void;
  goBack?: () => void;
}

const AchievementsStep = ({ data, updateData, onNext, goBack }: AchievementsStepProps) => {
  const [achievements, setAchievements] = useState<Achievement[]>(data.achievements || []);
  const [error, setError] = useState("");

  const achievementTypes = [
    { value: 'project', label: 'Project', icon: '💻', color: 'bg-blue-600' },
    { value: 'work', label: 'Work Experience', icon: '💼', color: 'bg-green-600' },
    { value: 'achievement', label: 'Achievement', icon: '🏆', color: 'bg-yellow-600' },
    { value: 'startup', label: 'Startup', icon: '🚀', color: 'bg-purple-600' },
    { value: 'research', label: 'Research', icon: '🔬', color: 'bg-indigo-600' },
    { value: 'competition', label: 'Competition', icon: '🥇', color: 'bg-orange-600' }
  ];

  useEffect(() => {
    setAchievements(data.achievements || []);
  }, [data.achievements]);

  // Always push current state to parent on mount
  useEffect(() => {
    updateData("achievements", achievements);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleContinue = () => {
    // No mandatory rule: allow continue even if no achievements or incomplete
    setError("");
    updateData("achievements", achievements);
    onNext();
  };

  const addAchievement = () => {
    const newAchievement: Achievement = {
      id: Date.now().toString(),
      title: "",
      description: "",
      link: "",
      type: 'project'
    };
    setAchievements(prev => [...prev, newAchievement]);
  };

  const updateAchievement = (id: string, field: keyof Achievement, value: string) => {
    setAchievements(prev => prev.map(achievement => 
      achievement.id === id ? { ...achievement, [field]: value } : achievement
    ));
  };

  const removeAchievement = (id: string) => {
    setAchievements(prev => prev.filter(achievement => achievement.id !== id));
  };

  const getTypeConfig = (type: string) => {
    return achievementTypes.find(t => t.value === type) || achievementTypes[0];
  };

  return (
    <div className="max-w-md mx-auto space-y-6 pb-24">
      {goBack && (
        <button onClick={goBack} className="text-[#CAFE33] hover:text-[#B8E62E] font-semibold mb-2">← Back</button>
      )}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-[#CAFE33] text-center text-2xl font-bold">
            Cool Stuff You've Done (Projects, Work, Achievements, etc.)
          </CardTitle>
          <p className="text-gray-400 text-sm text-center">
            Add anything you're proud of—projects, internships, competitions, research, startups, or just cool experiences! (Optional)
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {achievements.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-800 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Trophy className="text-[#CAFE33] h-8 w-8" />
              </div>
              <p className="text-gray-400 mb-4">No achievements added yet</p>
              <Button 
                onClick={addAchievement}
                className="bg-[#CAFE33] text-black hover:bg-[#B8E62E]"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Achievement
              </Button>
              <div className="mt-4">
                <Button
                  variant="outline"
                  className="flex-1 bg-gradient-to-r from-[#CAFE33] to-[#B8E62E] text-black hover:from-[#B8E62E] hover:to-[#CAFE33] font-bold"
                  onClick={onNext}
                >
                  Skip
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {achievements.map((achievement, index) => {
                const typeConfig = getTypeConfig(achievement.type);
                return (
                  <div key={achievement.id} className="bg-gray-800 p-4 rounded-lg space-y-3 border border-gray-700">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{typeConfig.icon}</span>
                        <h4 className="text-white font-medium">Entry {index + 1}</h4>
                        <Badge className={`${typeConfig.color} text-white text-xs`}>
                          {typeConfig.label}
                        </Badge>
                      </div>
                      <Button
                        onClick={() => removeAchievement(achievement.id)}
                        size="sm"
                        variant="ghost"
                        className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <Label className="text-gray-300 text-sm">Type</Label>
                        <select
                          value={achievement.type}
                          onChange={(e) => updateAchievement(achievement.id, "type", e.target.value)}
                          className="w-full mt-1 bg-gray-700 border-gray-600 text-white rounded-md p-2 focus:border-[#CAFE33] focus:outline-none"
                        >
                          {achievementTypes.map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.icon} {type.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <Label className="text-gray-300 text-sm">Title</Label>
                        <Input
                          value={achievement.title}
                          onChange={(e) => updateAchievement(achievement.id, "title", e.target.value)}
                          placeholder="e.g., E-commerce Web App, Summer Internship at Google, First Prize in Hackathon"
                          className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-[#CAFE33] mt-1"
                        />
                      </div>

                      <div>
                        <Label className="text-gray-300 text-sm">Description</Label>
                        <Textarea
                          value={achievement.description}
                          onChange={(e) => updateAchievement(achievement.id, "description", e.target.value)}
                          placeholder="Describe what you did, technologies used, impact, or skills gained..."
                          className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-[#CAFE33] mt-1 h-20 resize-none"
                        />
                      </div>

                      <div>
                        <Label className="text-gray-300 text-sm flex items-center">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Link (Optional)
                        </Label>
                        <Input
                          value={achievement.link}
                          onChange={(e) => updateAchievement(achievement.id, "link", e.target.value)}
                          placeholder="GitHub repo, portfolio, certificate, company website, etc."
                          className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-[#CAFE33] mt-1"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}

              <Button 
                onClick={addAchievement}
                variant="outline"
                className="w-full border-gray-700 text-gray-300 hover:border-[#CAFE33] hover:text-white"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Another Entry
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {achievements.length > 0 && (
        <div className="text-center">
          {error && (
            <div className="text-red-400 text-sm text-center mb-2">{error}</div>
          )}
          <Button onClick={handleContinue} className="w-full bg-[#CAFE33] text-black hover:bg-[#B8E62E] font-semibold py-3 rounded-lg mt-6">
            Continue
          </Button>
          <Button
            variant="outline"
            className="w-full border-[#CAFE33] text-[#CAFE33] hover:bg-black hover:text-[#B8E62E] hover:border-[#B8E62E] font-semibold transition-colors mt-2"
            onClick={onNext}
          >
            Skip
          </Button>
          <p className="text-gray-500 text-sm mt-2">
            Your achievements help showcase your experience and attract collaborators
          </p>
        </div>
      )}
    </div>
  );
};

export default AchievementsStep;
