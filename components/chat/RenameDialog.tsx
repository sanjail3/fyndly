import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface RenameDialogProps {
  showRenameDialog: boolean;
  setShowRenameDialog: (show: boolean) => void;
  newChatTitle: string;
  setNewChatTitle: (title: string) => void;
  updateChatTitle: () => Promise<void>;
}

const RenameDialog = ({
  showRenameDialog,
  setShowRenameDialog,
  newChatTitle,
  setNewChatTitle,
  updateChatTitle
}: RenameDialogProps) => {
  return (
    <Dialog open={showRenameDialog} onOpenChange={setShowRenameDialog}>
      <DialogContent className="sm:max-w-md bg-gray-900 rounded-xl shadow-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-gray-100">Rename Chat</DialogTitle>
          <DialogDescription className="text-gray-400">
            Enter a new title for your chat.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Input 
            value={newChatTitle} 
            onChange={(e) => setNewChatTitle(e.target.value)} 
            placeholder="New chat title" 
            className="bg-gray-800 border-gray-700 text-gray-100 placeholder:text-gray-400 focus:ring-[#C5F631] focus:border-[#C5F631]"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowRenameDialog(false)} className="border-gray-700 text-gray-100 hover:bg-gray-800">
            Cancel
          </Button>
          <Button onClick={updateChatTitle} className="bg-[#C5F631] hover:bg-[#8EC01D] text-gray-950">
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RenameDialog; 