import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [word, setWord] = useState("");
  const [userMessage, setUserMessage] = useState("");
  const [jokeWord, setJokeWord] = useState("");
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

  const getDefinition = async () => {
    if (!word.trim()) {
      toast({
        title: "Error",
        description: "Please enter a word",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Create a new run
      const createRunResponse = await fetch(
        "https://nqspuwzqrwamccpqwwvj.supabase.co/functions/v1/api/workflows/definition/create-run",
        { method: "POST" }
      );
      
      if (!createRunResponse.ok) {
        throw new Error(`HTTP error! status: ${createRunResponse.status}`);
      }
      
      const runData = await createRunResponse.json();
      const runId = runData.runId;

      // Start the workflow
      const startResponse = await fetch(
        `https://nqspuwzqrwamccpqwwvj.supabase.co/functions/v1/api/workflows/definition/start?runId=${runId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            inputData: { word: word.trim() },
          }),
        }
      );

      if (!startResponse.ok) {
        throw new Error(`HTTP error! status: ${startResponse.status}`);
      }

      const result = await startResponse.json();
      setResponse(result);
      
      toast({
        title: "Success!",
        description: `Got definition for "${word}"`,
      });
    } catch (error) {
      console.error("Error getting definition:", error);
      toast({
        title: "Error",
        description: "Failed to get definition",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const triageIssue = async () => {
    if (!userMessage.trim()) {
      toast({
        title: "Error",
        description: "Please enter a user message",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Create a new run
      const createRunResponse = await fetch(
        "https://nqspuwzqrwamccpqwwvj.supabase.co/functions/v1/api/workflows/issue-triage/create-run",
        { method: "POST" }
      );
      
      if (!createRunResponse.ok) {
        throw new Error(`HTTP error! status: ${createRunResponse.status}`);
      }
      
      const runData = await createRunResponse.json();
      const runId = runData.runId;

      // Start the workflow
      const startResponse = await fetch(
        `https://nqspuwzqrwamccpqwwvj.supabase.co/functions/v1/api/workflows/issue-triage/start?runId=${runId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            inputData: { userMessage: userMessage.trim() },
          }),
        }
      );

      if (!startResponse.ok) {
        throw new Error(`HTTP error! status: ${startResponse.status}`);
      }

      const result = await startResponse.json();
      setResponse(result);
      
      toast({
        title: "Success!",
        description: "Issue triage completed and Slack notification sent",
      });
    } catch (error) {
      console.error("Error triaging issue:", error);
      toast({
        title: "Error",
        description: "Failed to triage issue",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateJoke = async () => {
    if (!jokeWord.trim()) {
      toast({
        title: "Error",
        description: "Please enter a word for the joke",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Create a new run
      const createRunResponse = await fetch(
        "https://nqspuwzqrwamccpqwwvj.supabase.co/functions/v1/api/workflows/joke/create-run",
        { method: "POST" }
      );
      
      if (!createRunResponse.ok) {
        throw new Error(`HTTP error! status: ${createRunResponse.status}`);
      }
      
      const runData = await createRunResponse.json();
      const runId = runData.runId;

      // Start the workflow
      const startResponse = await fetch(
        `https://nqspuwzqrwamccpqwwvj.supabase.co/functions/v1/api/workflows/joke/start?runId=${runId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            inputData: { word: jokeWord.trim() },
          }),
        }
      );

      if (!startResponse.ok) {
        throw new Error(`HTTP error! status: ${startResponse.status}`);
      }

      const result = await startResponse.json();
      setResponse(result);
      
      toast({
        title: "Success!",
        description: `Generated joke for "${jokeWord}"`,
      });
    } catch (error) {
      console.error("Error generating joke:", error);
      toast({
        title: "Error",
        description: "Failed to generate joke",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-8">
      <div className="text-center max-w-2xl">
        <h1 className="text-4xl font-bold mb-4">Mastra Workflows</h1>
        <p className="text-xl text-gray-600 mb-8">Test your workflows here!</p>
        
        <div className="space-y-6 mb-8">
          <Button 
            onClick={callWorkflowEndpoint} 
            disabled={loading}
            className="w-full"
          >
            {loading ? "Calling Workflow..." : "Call Dummy Workflow"}
          </Button>

          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Enter a word to define..."
              value={word}
              onChange={(e) => setWord(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && getDefinition()}
              className="flex-1"
            />
            <Button 
              onClick={getDefinition} 
              disabled={loading || !word.trim()}
            >
              {loading ? "Getting..." : "Get Definition"}
            </Button>
          </div>

          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Enter a word for a joke..."
              value={jokeWord}
              onChange={(e) => setJokeWord(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && generateJoke()}
              className="flex-1"
            />
            <Button 
              onClick={generateJoke} 
              disabled={loading || !jokeWord.trim()}
              variant="outline"
            >
              {loading ? "Generating..." : "Generate Joke"}
            </Button>
          </div>

          <div className="space-y-2">
            <Textarea
              placeholder="Enter user support message to triage..."
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
              className="w-full min-h-[100px]"
            />
            <Button 
              onClick={triageIssue} 
              disabled={loading || !userMessage.trim()}
              className="w-full"
              variant="secondary"
            >
              {loading ? "Triaging..." : "Triage Issue & Notify Slack"}
            </Button>
          </div>
        </div>

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
