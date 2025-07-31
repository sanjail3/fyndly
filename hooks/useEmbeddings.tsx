import { useToast } from './use-toast';

export const useEmbeddings = () => {
  const { toast } = useToast();

  const generateEmbedding = async (userId: string): Promise<boolean> => {
    try {
      if (!userId || userId.trim() === '') {
        toast({
          title: "Error",
          description: "Invalid user ID. Please try logging out and back in.",
          variant: "destructive"
        });
        return false;
      }

      // Call the generate-embedding API route
      const response = await fetch('/api/user/generate-embedding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: userId.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: `Failed to generate user embedding: ${errorData.error || 'Unknown error'}`,
          variant: "destructive"
        });
        return false;
      }

      const data = await response.json();
      if (!data.success) {
        toast({
          title: "Error",
          description: "Failed to generate user embedding. Please try again.",
          variant: "destructive"
        });
        return false;
      }

      toast({
        title: "Success",
        description: "User profile vector generated successfully!",
      });
      return true;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };

  return { generateEmbedding };
};