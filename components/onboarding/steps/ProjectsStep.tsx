
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, ExternalLink } from "lucide-react";

interface Project {
  id: string;
  title: string;
  description: string;
  githubLink: string;
  portfolioLink: string;
}

interface ProjectsStepProps {
  data: any;
  updateData: (key: string, data: any) => void;
  onNext: () => void;
}

const ProjectsStep = ({ data, updateData, onNext }: ProjectsStepProps) => {
  const [projects, setProjects] = useState<Project[]>(data.projects || []);

  useEffect(() => {
    updateData("projects", projects);
  }, [projects, updateData]);

  const addProject = () => {
    const newProject: Project = {
      id: Date.now().toString(),
      title: "",
      description: "",
      githubLink: "",
      portfolioLink: ""
    };
    setProjects(prev => [...prev, newProject]);
  };

  const updateProject = (id: string, field: keyof Project, value: string) => {
    setProjects(prev => prev.map(project => 
      project.id === id ? { ...project, [field]: value } : project
    ));
  };

  const removeProject = (id: string) => {
    setProjects(prev => prev.filter(project => project.id !== id));
  };

  return (
    <div className="max-w-md mx-auto space-y-6 pb-24">
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-[#CAFE33] text-center">Show your work</CardTitle>
          <p className="text-gray-400 text-sm text-center">
            Share your projects and achievements to stand out
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {projects.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-800 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">🚀</span>
              </div>
              <p className="text-gray-400 mb-4">No projects added yet</p>
              <Button 
                onClick={addProject}
                className="bg-[#CAFE33] text-black hover:bg-[#B8E62E]"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Project
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {projects.map((project, index) => (
                <div key={project.id} className="bg-gray-800 p-4 rounded-lg space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="text-white font-medium">Project {index + 1}</h4>
                    <Button
                      onClick={() => removeProject(project.id)}
                      size="sm"
                      variant="ghost"
                      className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <Label className="text-gray-300 text-sm">Project Title</Label>
                      <Input
                        value={project.title}
                        onChange={(e) => updateProject(project.id, "title", e.target.value)}
                        placeholder="My awesome project"
                        className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-[#CAFE33] mt-1"
                      />
                    </div>

                    <div>
                      <Label className="text-gray-300 text-sm">Description</Label>
                      <Textarea
                        value={project.description}
                        onChange={(e) => updateProject(project.id, "description", e.target.value)}
                        placeholder="Brief description of your project and what technologies you used"
                        className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-[#CAFE33] mt-1 h-20 resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      <div>
                        <Label className="text-gray-300 text-sm flex items-center">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          GitHub Link
                        </Label>
                        <Input
                          value={project.githubLink}
                          onChange={(e) => updateProject(project.id, "githubLink", e.target.value)}
                          placeholder="https://github.com/username/project"
                          className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-[#CAFE33] mt-1"
                        />
                      </div>

                      <div>
                        <Label className="text-gray-300 text-sm flex items-center">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Live Demo/Portfolio
                        </Label>
                        <Input
                          value={project.portfolioLink}
                          onChange={(e) => updateProject(project.id, "portfolioLink", e.target.value)}
                          placeholder="https://myproject.com"
                          className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-[#CAFE33] mt-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <Button 
                onClick={addProject}
                variant="outline"
                className="w-full border-gray-700 text-gray-300 hover:border-[#CAFE33] hover:text-white"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Another Project
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {projects.length > 0 && (
        <div className="text-center">
          <p className="text-gray-500 text-sm">
            Projects help showcase your skills and experience
          </p>
        </div>
      )}
    </div>
  );
};

export default ProjectsStep;
