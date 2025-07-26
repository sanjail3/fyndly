import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface AboutStepProps {
  data: any;
  updateData: (key: string, data: any) => void;
  onNext: () => void;
  goBack?: () => void;
}

const AboutStep = ({ data, updateData, onNext, goBack }: AboutStepProps) => {
  const [about, setAbout] = useState(data.about || "");
  const [error, setError] = useState("");

  useEffect(() => {
    setAbout(data.about || "");
  }, [data.about]);

  // Always push current state to parent on mount
  useEffect(() => {
    updateData("about", about);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const characterLimit = 300;
  const remainingChars = characterLimit - about.length;

  const handleContinue = () => {
    if (about.trim().length < 30) {
      setError("Please write at least 30 characters about yourself.");
      return;
    }
    setError("");
    updateData("about", about);
    onNext();
  };

  return (
    <div className="max-w-md mx-auto space-y-6 pb-24">
      {goBack && (
        <button onClick={goBack} className="text-[#CAFE33] hover:text-[#B8E62E] font-semibold mb-2">← Back</button>
      )}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-[#CAFE33] text-center">Tell us about yourself</CardTitle>
          <p className="text-gray-400 text-sm text-center">
            Share what makes you unique and what you're passionate about
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="about" className="text-white">About You</Label>
            <Textarea
              id="about"
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              placeholder="I'm a passionate computer science student who loves building innovative solutions. I enjoy working on web development projects and participating in hackathons. When I'm not coding, you can find me exploring new technologies or playing guitar."
              className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-[#CAFE33] min-h-[120px] resize-none"
              maxLength={characterLimit}
            />
            <div className="flex justify-between text-xs">
              <p className="text-gray-500">
                Help others understand your personality and goals
              </p>
              <p className={`${remainingChars < 50 ? 'text-[#CAFE33]' : 'text-gray-500'}`}>
                {remainingChars} characters left
              </p>
            </div>
          </div>

          {/* Sample prompts */}
          <div className="space-y-2">
            <h4 className="text-white text-sm font-medium">Need inspiration? Try mentioning:</h4>
            <div className="grid grid-cols-1 gap-2 text-xs text-gray-400">
              <div className="bg-gray-800 p-2 rounded">
                💡 What you're passionate about
              </div>
              <div className="bg-gray-800 p-2 rounded">
                🎯 Your current goals or projects
              </div>
              <div className="bg-gray-800 p-2 rounded">
                🌟 What makes you unique
              </div>
              <div className="bg-gray-800 p-2 rounded">
                🤝 What you're looking to collaborate on
              </div>
            </div>
          </div>

          {error && (
            <div className="text-red-400 text-sm text-center mb-2">{error}</div>
          )}
          <Button onClick={handleContinue} className="w-full bg-[#CAFE33] text-black hover:bg-[#B8E62E] font-semibold py-3 rounded-lg mt-6">
            Continue
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AboutStep;
