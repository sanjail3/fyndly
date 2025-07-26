import React, { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Loader2, 
  X,
  Check,
  Plus
} from "lucide-react";
import { NewListData } from "../shared/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";

// Predefined emojis for investor lists
const SUGGESTED_EMOJIS = [
  "📋", "💼", "💰", "🏦", "📊", 
  "📈", "🚀", "⭐", "🔍", "🎯", 
  "💡", "🌟", "💸", "📱", "🔔", 
  "🌈", "🔑", "🤝", "👑", "🏆",
  "💎", "🌐", "📲", "🔮", "📢"
];

// Suggested tags for investor lists
const SUGGESTED_STAGE_TAGS = ["Early Stage", "Series A", "Series B", "Growth", "Angel", "VC", "PE", "Strategic"];
const SUGGESTED_INDUSTRY_TAGS = ["International", "Fintech", "SaaS", "Healthcare", "AI", "Climate", "Enterprise", "Consumer"];

interface ListDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedInvestors: string[];
  listIdParam?: string | null;
}

const ListDialog: React.FC<ListDialogProps> = ({
  isOpen,
  onClose,
  selectedInvestors,
  listIdParam = null
}) => {
  // Local state for the dialog
  const [isCreating, setIsCreating] = React.useState(false);
  const [newTag, setNewTag] = React.useState('');
  const [existingLists, setExistingLists] = React.useState<any[]>([]);
  const [selectedExistingList, setSelectedExistingList] = React.useState<string | null>(null);
  const [selectedTab, setSelectedTab] = React.useState(listIdParam ? "existing" : "new");
  const [newListData, setNewListData] = React.useState<NewListData>({
    name: '',
    description: '',
    emoji: '📋',
    tags: []
  });
  
  // Fetch existing lists when dialog opens
  useEffect(() => {
    if (isOpen) {
      fetchExistingLists();
    }
  }, [isOpen]);

  // Update selected tab when lists are loaded or listIdParam changes
  useEffect(() => {
    if (isOpen) {
      // Reset to appropriate tab based on data
      if (listIdParam && existingLists.find((l: any) => l.id === listIdParam)) {
        setSelectedTab("existing");
        setSelectedExistingList(listIdParam);
      } else if (existingLists.length > 0) {
        setSelectedTab("existing");
      } else {
        setSelectedTab("new");
      }
    }
  }, [isOpen, listIdParam, existingLists]);

  // Reset form state when dialog closes
  useEffect(() => {
    if (!isOpen) {
      // Reset only if not currently creating
      if (!isCreating) {
        setNewListData({
          name: '',
          description: '',
          emoji: '📋',
          tags: []
        });
        setNewTag('');
        // Don't reset selectedExistingList if we have a listIdParam
        if (!listIdParam) {
          setSelectedExistingList(null);
        }
      }
    }
  }, [isOpen, isCreating, listIdParam]);

  // Fetch existing lists from the backend
  const fetchExistingLists = async () => {
    console.log("Fetching existing lists...");
    try {
      const response = await fetch('/api/lists');
      const contentType = response.headers.get('content-type');
      
      if (!response.ok) {
        console.error('Error response from /api/lists:', response.status, response.statusText);
        toast?.error?.('Failed to load lists. Please try again.');
        setExistingLists([]);
        return;
      }
      
      // Check if response is JSON before parsing
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        console.log("Fetched lists:", data);
        setExistingLists(data || []);
      } else {
        console.error('Response is not JSON:', await response.text());
        toast?.error?.('Invalid response format. Please try again later.');
        setExistingLists([]);
      }
    } catch (error) {
      console.error('Error fetching lists:', error);
      toast?.error?.('Failed to load lists. Please try again.');
      setExistingLists([]);
    }
  };
  
  // Add tag to new list
  const addTag = () => {
    if (newTag.trim() && !newListData.tags.includes(newTag.trim())) {
      setNewListData({
        ...newListData,
        tags: [...newListData.tags, newTag.trim()]
      });
      setNewTag('');
    }
  };
  
  // Remove tag from new list
  const removeTag = (tag: string) => {
    setNewListData({
      ...newListData,
      tags: newListData.tags.filter((t: string) => t !== tag)
    });
  };
  
  // Create a new list
  const createNewList = async (): Promise<boolean | undefined> => {
    if (!newListData.name.trim() || isCreating || selectedInvestors.length === 0) return false;
    
    setIsCreating(true);
    console.log("Creating new list with investors:", selectedInvestors.length);
    
    try {
      const response = await fetch('/api/lists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newListData,
          investorIds: selectedInvestors
        }),
      });
      
      const contentType = response.headers.get('content-type');
      
      if (!response.ok) {
        let errorMessage = "Failed to create list";
        
        // Try to parse error message if it's JSON
        if (contentType && contentType.includes('application/json')) {
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } catch (parseError) {
            console.error('Error parsing error response:', parseError);
            // If error response isn't valid JSON, get text
            const textError = await response.text();
            errorMessage = textError || errorMessage;
          }
        } else {
          // Not JSON, try to get text
          const textError = await response.text();
          errorMessage = textError || errorMessage;
        }
        
        throw new Error(errorMessage);
      }
      
      // Check if response is JSON
      if (contentType && contentType.includes('application/json')) {
        const result = await response.json();
        console.log("List created successfully:", result);
        toast?.success?.('New investor list created successfully!');
      } else {
        console.log("List created with non-JSON response");
        toast?.success?.('New investor list created successfully!');
      }
      
      // Reset form and close dialog
      setNewListData({
        name: '',
        description: '',
        emoji: '📋',
        tags: []
      });
      onClose();
      return true;
    } catch (error: any) {
      console.error('Error creating list:', error);
      toast?.error?.('Failed to create list: ' + error.message);
      return false;
    } finally {
      setIsCreating(false);
    }
  };
  
  // Add investors to an existing list
  const handleAddInvestorsToExistingList = async (): Promise<boolean | undefined> => {
    if (!selectedExistingList || isCreating || selectedInvestors.length === 0) return false;
    
    setIsCreating(true);
    console.log("Adding investors to list:", selectedExistingList, "Investors:", selectedInvestors.length);
    
    try {
      const response = await fetch(`/api/lists/${selectedExistingList}/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          investorIds: selectedInvestors
        }),
      });
      
      const contentType = response.headers.get('content-type');
      
      if (!response.ok) {
        let errorMessage = "Failed to add investors";
        
        // Try to extract error message
        if (contentType && contentType.includes('application/json')) {
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } catch (parseError) {
            console.error('Error parsing error response:', parseError);
            const textError = await response.text();
            errorMessage = textError || errorMessage;
          }
        } else {
          const textError = await response.text();
          errorMessage = textError || errorMessage;
        }
        
        throw new Error(errorMessage);
      }
      
      // Check if response is JSON before parsing
      if (contentType && contentType.includes('application/json')) {
        const result = await response.json();
        console.log("Investors added successfully:", result);
      } else {
        console.log("Investors added with non-JSON response");
      }
      
      toast?.success?.('Investors added to list successfully');
      
      // Reset and close dialog
      onClose();
      setSelectedExistingList(null);
      return true;
    } catch (error: any) {
      console.error('Error adding investors to list:', error);
      toast?.error?.('Failed to add investors to list: ' + error.message);
      return false;
    } finally {
      setIsCreating(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl bg-gray-900 rounded-xl shadow-2xl p-6 border border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-gray-100 text-2xl font-bold flex items-center justify-between">
            {selectedTab === "new" ? (
              <>Create New Investor List</>
            ) : (
              <>Add to Existing Investor List</>
            )}
            <Badge className="bg-gradient-to-r from-[#C5F631] to-[#8EC01D] text-gray-950 font-semibold text-sm px-3 py-1.5 rounded-full shadow-md">
              {selectedInvestors.length} Investors Selected
            </Badge>
          </DialogTitle>
          <DialogDescription className="text-gray-400 mt-2">
            {selectedTab === "new" ? 
              "Define a new list to add your selected investors to." : 
              "Select an existing list to add your selected investors to."}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full mt-4">
          <TabsList className="grid w-full grid-cols-2 bg-gray-800 rounded-lg p-1">
            <TabsTrigger 
              value="new" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#C5F631] data-[state=active]:to-[#8EC01D] data-[state=active]:text-gray-950 data-[state=active]:shadow-sm rounded-md py-2"
            >
              New List
            </TabsTrigger>
            <TabsTrigger 
              value="existing" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#C5F631] data-[state=active]:to-[#8EC01D] data-[state=active]:text-gray-950 data-[state=active]:shadow-sm rounded-md py-2"
            >
              Existing List
            </TabsTrigger>
          </TabsList>
          
          {/* New List Tab Content */}
          <TabsContent value="new" className="mt-4 space-y-4">
            <div>
              <label htmlFor="list-name" className="text-gray-200 text-sm font-medium mb-2 block">List Name</label>
              <Input
                id="list-name"
                placeholder="e.g., Early-Stage Fintech Investors"
                value={newListData.name}
                onChange={(e) => setNewListData({ ...newListData, name: e.target.value })}
                className="bg-gray-800 border-gray-700 text-gray-100 placeholder:text-gray-500 focus:ring-[#C5F631] focus:border-[#C5F631]"
              />
                      </div>

            <div>
              <label htmlFor="list-description" className="text-gray-200 text-sm font-medium mb-2 block">Description (Optional)</label>
              <Textarea
                id="list-description"
                placeholder="e.g., Investors interested in seed to Series A fintech startups in North America."
                value={newListData.description}
                onChange={(e) => setNewListData({ ...newListData, description: e.target.value })}
                className="bg-gray-800 border-gray-700 text-gray-100 placeholder:text-gray-500 focus:ring-[#C5F631] focus:border-[#C5F631] min-h-[80px]"
              />
              </div>

            <div>
              <label htmlFor="list-emoji" className="text-gray-200 text-sm font-medium mb-2 block">Emoji (Optional)</label>
                  <Popover>
                    <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-between bg-gray-800 border-gray-700 text-gray-100 hover:bg-gray-700">
                    {newListData.emoji} Select Emoji <span className="text-gray-400">(Optional)</span>
                      </Button>
                    </PopoverTrigger>
                <PopoverContent className="bg-gray-800 border-gray-700 p-2 grid grid-cols-6 gap-1 w-80 shadow-lg">
                  {SUGGESTED_EMOJIS.map(emoji => (
                          <Button
                            key={emoji}
                            variant="ghost"
                      className="text-xl p-2 hover:bg-gray-700"
                      onClick={() => setNewListData({ ...newListData, emoji })}
                          >
                            {emoji}
                          </Button>
                        ))}
                    </PopoverContent>
                  </Popover>
                </div>

            <div>
              <label className="text-gray-200 text-sm font-medium mb-2 block">Tags (Optional)</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {newListData.tags.map(tag => (
                  <Badge 
                    key={tag} 
                    className="bg-gray-700 text-gray-100 border border-gray-600 rounded-full px-3 py-1 flex items-center gap-1"
                  >
                    {tag}
                    <button onClick={() => removeTag(tag)} className="ml-1 text-gray-400 hover:text-white">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                    <Input
                  placeholder="Add a new tag..."
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="flex-1 bg-gray-800 border-gray-700 text-gray-100 placeholder:text-gray-500 focus:ring-[#C5F631] focus:border-[#C5F631]"
                    />
                <Button onClick={addTag} className="bg-[#C5F631] hover:bg-[#8EC01D] text-gray-950">
                      Add
                    </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {SUGGESTED_STAGE_TAGS.map(tag => (
                  <Badge 
                          key={tag}
                    onClick={() => setNewListData(prev => ({...prev, tags: prev.tags.includes(tag) ? prev.tags : [...prev.tags, tag]}))}
                    className="cursor-pointer bg-gray-700 hover:bg-gray-600 text-gray-200 border border-gray-600"
                        >
                          {tag}
                  </Badge>
                      ))}
                {SUGGESTED_INDUSTRY_TAGS.map(tag => (
                        <Badge 
                          key={tag} 
                    onClick={() => setNewListData(prev => ({...prev, tags: prev.tags.includes(tag) ? prev.tags : [...prev.tags, tag]}))}
                    className="cursor-pointer bg-gray-700 hover:bg-gray-600 text-gray-200 border border-gray-600"
                        >
                    {tag}
                  </Badge>
                ))}
            </div>
          </div>

            <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
                onClick={onClose}
                className="border-gray-700 text-gray-100 hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button
              onClick={createNewList}
                disabled={!newListData.name.trim() || isCreating || selectedInvestors.length === 0}
                className="bg-gradient-to-r from-[#C5F631] to-[#8EC01D] hover:from-[#A3D224] hover:to-[#5A8012] text-gray-950 font-semibold gap-2"
            >
              {isCreating ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="mr-2 h-4 w-4" />
                )}
                Create & Add Investors
              </Button>
            </DialogFooter>
          </TabsContent>

          {/* Existing List Tab Content */}
          <TabsContent value="existing" className="mt-4 space-y-4">
            <div>
              <label htmlFor="existing-list-select" className="text-gray-200 text-sm font-medium mb-2 block">Select Existing List</label>
              <Select onValueChange={setSelectedExistingList} value={selectedExistingList || ''}>
                <SelectTrigger id="existing-list-select" className="w-full bg-gray-800 border-gray-700 text-gray-100 focus:ring-[#C5F631] focus:border-[#C5F631]">
                  <SelectValue placeholder="Select a list" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-gray-100">
                  {existingLists.length > 0 ? (
                    existingLists.map((list) => (
                      <SelectItem key={list.id} value={list.id}>
                        {list.emoji} {list.name} ({list.investorIds?.length || 0} investors)
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-lists" disabled>
                      No existing lists found
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 overflow-auto rounded-lg border border-gray-700 bg-gray-800 p-4 max-h-[200px]">
              {selectedExistingList ? (
                <div className="space-y-2">
                  {existingLists.find(l => l.id === selectedExistingList)?.investorIds?.map((investorId: string) => (
                    <Badge key={investorId} className="bg-gray-700 text-gray-100 border border-gray-600 px-3 py-1 rounded-full">
                      Investor ID: {investorId}
                    </Badge>
                  ))}
                  {existingLists.find(l => l.id === selectedExistingList)?.investorIds?.length === 0 && (
                    <p className="text-gray-400 text-sm">This list currently has no investors.</p>
                  )}
                  </div>
              ) : (
                <p className="text-gray-400 text-sm">Select a list to view its current investors.</p>
              )}
            </div>

            <DialogFooter className="mt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                className="border-gray-700 text-gray-100 hover:bg-gray-800"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAddInvestorsToExistingList}
                disabled={!selectedExistingList || isCreating || selectedInvestors.length === 0}
                className="bg-gradient-to-r from-[#C5F631] to-[#8EC01D] hover:from-[#A3D224] hover:to-[#5A8012] text-gray-950 font-semibold gap-2"
              >
                {isCreating ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Check className="mr-2 h-4 w-4" />
                )}
                Add to Selected List
            </Button>
          </DialogFooter>
          </TabsContent>
        </Tabs>
    </DialogContent>
    </Dialog>
  );
};

export default ListDialog; 