import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface SocialLinksStepProps {
  data: any;
  updateData: (key: string, data: any) => void;
  onNext: () => void;
  goBack?: () => void;
}

const SocialLinksStep = ({ data, updateData, onNext, goBack }: SocialLinksStepProps) => {
  const [socialLinks, setSocialLinks] = useState({
    github: "",
    linkedin: "",
    twitter: "",
    instagram: "",
    website: "",
    ...data.socialLinks
  });

  const [validationError, setValidationError] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setSocialLinks({
      github: "",
      linkedin: "",
      twitter: "",
      instagram: "",
      website: "",
      ...data.socialLinks
    });
  }, [data.socialLinks]);

  // Always push current state to parent on mount
  useEffect(() => {
    updateData("socialLinks", socialLinks);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const validateSocialLinksFormat = () => {
    // LinkedIn
    if (socialLinks.linkedin.trim()) {
      const url = socialLinks.linkedin.trim();
      if (!/^https:\/\/(www\.)?linkedin\.com\/in\//.test(url) || !isValidUrl(url)) {
        setError("Please enter a valid LinkedIn profile URL (e.g., https://linkedin.com/in/username)");
        return false;
      }
    }
    // GitHub
    if (socialLinks.github.trim()) {
      const url = socialLinks.github.trim();
      if (!/^https:\/\/(www\.)?github\.com\//.test(url) || !isValidUrl(url)) {
        setError("Please enter a valid GitHub URL (e.g., https://github.com/username)");
        return false;
      }
    }
    // Twitter
    if (socialLinks.twitter.trim()) {
      const url = socialLinks.twitter.trim();
      if (!/^https:\/\/(www\.)?(twitter\.com|x\.com)\//.test(url) || !isValidUrl(url)) {
        setError("Please enter a valid Twitter/X URL (e.g., https://twitter.com/username)");
        return false;
      }
    }
    // Instagram
    if (socialLinks.instagram.trim()) {
      const url = socialLinks.instagram.trim();
      if (!/^https:\/\/(www\.)?instagram\.com\//.test(url) || !isValidUrl(url)) {
        setError("Please enter a valid Instagram URL (e.g., https://instagram.com/username)");
        return false;
      }
    }
    // Website
    if (socialLinks.website.trim()) {
      const url = socialLinks.website.trim();
      if (!isValidUrl(url)) {
        setError("Please enter a valid website URL (e.g., https://yourwebsite.com)");
      return false;
      }
    }
    setError("");
    return true;
  };

  const handleChange = (field: string, value: string) => {
    setSocialLinks((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleContinue = () => {
    if (!socialLinks.linkedin.trim()) {
      setError("LinkedIn profile is required.");
      return;
    }
    const otherProfiles = [
      socialLinks.github,
      socialLinks.twitter,
      socialLinks.instagram,
      socialLinks.website
    ].filter(link => link.trim());
    if (otherProfiles.length === 0) {
      setError("Please add at least one other social profile (GitHub, Twitter, Instagram, or Website)");
      return;
    }
    // Validate URL formats
    if (!validateSocialLinksFormat()) {
      return;
    }
    setError("");
    updateData("socialLinks", socialLinks);
    onNext();
  };

  const socialPlatforms = [
    {
      key: "linkedin",
      label: "LinkedIn *",
      placeholder: "https://linkedin.com/in/username",
      icon: "💼",
      description: "Professional network and experience (Required)",
      required: true
    },
    {
      key: "github",
      label: "GitHub",
      placeholder: "https://github.com/username",
      icon: "💻",
      description: "Show your code and contributions"
    },
    {
      key: "instagram",
      label: "Instagram",
      placeholder: "https://instagram.com/username",
      icon: "📸",
      description: "Share your visual stories and moments"
    },
    {
      key: "twitter",
      label: "Twitter/X",
      placeholder: "https://twitter.com/username",
      icon: "🐦",
      description: "Thoughts and quick updates"
    },
    {
      key: "website",
      label: "Personal Website",
      placeholder: "https://yourwebsite.com",
      icon: "🌐",
      description: "Your portfolio or blog"
    }
  ];

  return (
    <div className="max-w-md mx-auto space-y-6 pb-24">
      {goBack && (
        <button onClick={goBack} className="text-[#CAFE33] hover:text-[#B8E62E] font-semibold mb-2">← Back</button>
      )}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-[#CAFE33] text-center">Connect your socials</CardTitle>
          <p className="text-gray-400 text-sm text-center">
            LinkedIn is required + at least one other profile
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {validationError && (
            <Alert className="border-red-600/50 bg-red-600/10">
              <AlertCircle className="h-4 w-4 text-red-400" />
              <AlertDescription className="text-red-400">
                {validationError}
              </AlertDescription>
            </Alert>
          )}

          {socialPlatforms.map((platform) => (
            <div key={platform.key} className="space-y-2">
              <Label 
                htmlFor={platform.key} 
                className={`${platform.required ? 'text-[#CAFE33]' : 'text-white'} flex items-center`}
              >
                <span className="mr-2">{platform.icon}</span>
                {platform.label}
                <ExternalLink className="h-3 w-3 ml-1 text-gray-400" />
              </Label>
              <Input
                id={platform.key}
                value={socialLinks[platform.key]}
                onChange={(e) => handleChange(platform.key, e.target.value)}
                placeholder={platform.placeholder}
                className={`bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-[#CAFE33] ${
                  platform.required && !socialLinks[platform.key].trim() ? 'border-red-500' : ''
                }`}
              />
              <p className="text-xs text-gray-500">{platform.description}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">🔒</div>
            <div>
              <h4 className="text-white text-sm font-medium">Privacy Note</h4>
              <p className="text-gray-400 text-xs">
                Your social links will only be visible to people you match with
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="text-center">
        <p className="text-gray-500 text-sm">
          <span className="text-[#CAFE33]">*</span> Required fields
        </p>
      </div>

      {error && (
        <div className="text-red-400 text-sm text-center mb-2">{error}</div>
      )}

      <Button onClick={handleContinue} className="w-full bg-[#CAFE33] text-black hover:bg-[#B8E62E] font-semibold py-3 rounded-lg mt-6">
        Continue
      </Button>
    </div>
  );
};

export default SocialLinksStep;
