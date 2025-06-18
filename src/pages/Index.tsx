
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const callWorkflowEndpoint = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        "https://nqspuwzqrwamccpqwwvj.supabase.co/functions/v1/api/workflows/dummy"
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setResponse(data);
      
      toast({
        title: "Success!",
        description: "Workflow endpoint called successfully",
      });
    } catch (error) {
      console.error("Error calling workflow endpoint:", error);
      toast({
        title: "Error",
        description: "Failed to call workflow endpoint",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-8">
      <div className="text-center max-w-2xl">
        <h1 className="text-4xl font-bold mb-4">Welcome to Your Blank App</h1>
        <p className="text-xl text-gray-600 mb-8">Start building your amazing project here!</p>
        
        <Button 
          onClick={callWorkflowEndpoint} 
          disabled={loading}
          className="mb-8"
        >
          {loading ? "Calling Workflow..." : "Call Workflow Endpoint"}
        </Button>

        {response && (
          <div className="mt-8 p-6 bg-white rounded-lg shadow-lg text-left">
            <h2 className="text-2xl font-semibold mb-4">Workflow Response:</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
              {JSON.stringify(response, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
