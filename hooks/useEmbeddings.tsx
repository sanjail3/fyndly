import { supabase } from '@/integrations/supabase/client';
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

      // Get the current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        toast({
          title: "Error",
          description: "Authentication error. Please try logging out and back in.",
          variant: "destructive"
        });
        return false;
      }
      if (!session) {
        toast({
          title: "Error",
          description: "No active session. Please log in again.",
          variant: "destructive"
        });
        return false;
      }

      // Call the generate-embeddings edge function
      const { data, error } = await supabase.functions.invoke('generate-embeddings', {
        body: { userId: userId.trim() },
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (error) {
        toast({
          title: "Error",
          description: `Failed to generate user embedding: ${error.message}`,
          variant: "destructive"
        });
        return false;
      }

      if (data && !data.success) {
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