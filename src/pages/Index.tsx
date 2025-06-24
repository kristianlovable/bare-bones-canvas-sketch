import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Index = () => {
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [word, setWord] = useState("");
  const [userMessage, setUserMessage] = useState("");
  const [jokeWord, setJokeWord] = useState("");
  const [cityForActivities, setCityForActivities] = useState("");
  const [rapTheme, setRapTheme] = useState("");
  const [contentTopic, setContentTopic] = useState("");
  const [wordLengthInput, setWordLengthInput] = useState("");
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

  const planActivities = async () => {
    if (!cityForActivities.trim()) {
      toast({
        title: "Error",
        description: "Please enter a city name",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Create a new run
      const createRunResponse = await fetch(
        "https://nqspuwzqrwamccpqwwvj.supabase.co/functions/v1/api/workflows/activity-planning/create-run",
        { method: "POST" }
      );
      
      if (!createRunResponse.ok) {
        throw new Error(`HTTP error! status: ${createRunResponse.status}`);
      }
      
      const runData = await createRunResponse.json();
      const runId = runData.runId;

      // Start the workflow
      const startResponse = await fetch(
        `https://nqspuwzqrwamccpqwwvj.supabase.co/functions/v1/api/workflows/activity-planning/start?runId=${runId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            inputData: { city: cityForActivities.trim() },
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
        description: `Generated activity plan for ${cityForActivities}`,
      });
    } catch (error) {
      console.error("Error planning activities:", error);
      toast({
        title: "Error",
        description: "Failed to plan activities",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateRapSong = async () => {
    if (!rapTheme.trim()) {
      toast({
        title: "Error",
        description: "Please enter a theme for the rap song",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Create a new run
      const createRunResponse = await fetch(
        "https://nqspuwzqrwamccpqwwvj.supabase.co/functions/v1/api/workflows/rap-song/create-run",
        { method: "POST" }
      );
      
      if (!createRunResponse.ok) {
        throw new Error(`HTTP error! status: ${createRunResponse.status}`);
      }
      
      const runData = await createRunResponse.json();
      const runId = runData.runId;

      // Start the workflow
      const startResponse = await fetch(
        `https://nqspuwzqrwamccpqwwvj.supabase.co/functions/v1/api/workflows/rap-song/start?runId=${runId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            inputData: { theme: rapTheme.trim() },
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
        description: `Generated rap song about "${rapTheme}"`,
      });
    } catch (error) {
      console.error("Error generating rap song:", error);
      toast({
        title: "Error",
        description: "Failed to generate rap song",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createContent = async () => {
    if (!contentTopic.trim()) {
      toast({
        title: "Error",
        description: "Please enter a topic for content creation",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Create a new run
      const createRunResponse = await fetch(
        "https://nqspuwzqrwamccpqwwvj.supabase.co/functions/v1/api/workflows/content-creation/create-run",
        { method: "POST" }
      );
      
      if (!createRunResponse.ok) {
        throw new Error(`HTTP error! status: ${createRunResponse.status}`);
      }
      
      const runData = await createRunResponse.json();
      const runId = runData.runId;

      // Start the workflow
      const startResponse = await fetch(
        `https://nqspuwzqrwamccpqwwvj.supabase.co/functions/v1/api/workflows/content-creation/start?runId=${runId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            inputData: { topic: contentTopic.trim() },
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
        description: `Created content about "${contentTopic}"`,
      });
    } catch (error) {
      console.error("Error creating content:", error);
      toast({
        title: "Error",
        description: "Failed to create content",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const checkWordLength = async () => {
    if (!wordLengthInput.trim()) {
      toast({
        title: "Error",
        description: "Please enter a word to check its length",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Create a new run
      const createRunResponse = await fetch(
        "https://nqspuwzqrwamccpqwwvj.supabase.co/functions/v1/api/workflows/word-length/create-run",
        { method: "POST" }
      );
      
      if (!createRunResponse.ok) {
        throw new Error(`HTTP error! status: ${createRunResponse.status}`);
      }
      
      const runData = await createRunResponse.json();
      const runId = runData.runId;

      // Start the workflow
      const startResponse = await fetch(
        `https://nqspuwzqrwamccpqwwvj.supabase.co/functions/v1/api/workflows/word-length/start?runId=${runId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            inputData: { word: wordLengthInput.trim() },
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
        description: `Analyzed word "${wordLengthInput}"`,
      });
    } catch (error) {
      console.error("Error checking word length:", error);
      toast({
        title: "Error",
        description: "Failed to check word length",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderWorkflowResult = () => {
    if (!response) return null;

    // Check if this is a word length result
    if (response.result && typeof response.result === 'object' && response.result.category) {
      return (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>📏 Word Length Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-lg font-semibold">
                Word: "{response.result.word}"
              </div>
              <div className="text-md">
                Category: <span className={`font-bold ${response.result.category === 'long' ? 'text-blue-600' : 'text-green-600'}`}>
                  {response.result.category.toUpperCase()}
                </span>
              </div>
              <div className="text-md">
                Length: {response.result.length} characters
              </div>
              <div className="text-sm bg-gray-50 p-3 rounded border mt-3">
                {response.result.message}
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    // Check if this is a content creation result
    if (response.result && typeof response.result === 'string' && (response.result.includes('introduction') || response.result.includes('conclusion') || response.result.length > 500)) {
      return (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>📝 Generated Content</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-wrap bg-purple-50 p-4 rounded border border-purple-200">
              {response.result}
            </div>
          </CardContent>
        </Card>
      );
    }

    // Check if this is a rap song result
    if (response.result && typeof response.result === 'string' && (response.result.includes('verse') || response.result.includes('chorus'))) {
      return (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>🎤 Generated Rap Song</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-wrap font-mono text-sm bg-gray-50 p-4 rounded border">
              {response.result}
            </div>
          </CardContent>
        </Card>
      );
    }

    // Check if this is a definition result
    if (response.result && typeof response.result === 'string' && response.result.includes('definition')) {
      return (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>📖 Word Definition</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-base bg-blue-50 p-4 rounded border border-blue-200">
              {response.result}
            </div>
          </CardContent>
        </Card>
      );
    }

    // Check if this is an activity planning result
    if (response.result && typeof response.result === 'string' && (response.result.includes('activity') || response.result.includes('activities'))) {
      return (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>🗺️ Activity Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-wrap bg-green-50 p-4 rounded border border-green-200">
              {response.result}
            </div>
          </CardContent>
        </Card>
      );
    }

    // Default fallback - show raw JSON for other results
    return (
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>⚙️ Workflow Response</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm whitespace-pre-wrap">
            {JSON.stringify(response, null, 2)}
          </pre>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-8">
      <div className="text-center max-w-2xl w-full">
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

          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Enter a word to check length..."
              value={wordLengthInput}
              onChange={(e) => setWordLengthInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && checkWordLength()}
              className="flex-1"
            />
            <Button 
              onClick={checkWordLength} 
              disabled={loading || !wordLengthInput.trim()}
              variant="outline"
            >
              {loading ? "Checking..." : "Check Word Length"}
            </Button>
          </div>

          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Enter a theme for rap song..."
              value={rapTheme}
              onChange={(e) => setRapTheme(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && generateRapSong()}
              className="flex-1"
            />
            <Button 
              onClick={generateRapSong} 
              disabled={loading || !rapTheme.trim()}
              variant="outline"
            >
              {loading ? "Generating..." : "Generate Rap Song"}
            </Button>
          </div>

          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Enter a city for activity planning..."
              value={cityForActivities}
              onChange={(e) => setCityForActivities(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && planActivities()}
              className="flex-1"
            />
            <Button 
              onClick={planActivities} 
              disabled={loading || !cityForActivities.trim()}
              variant="outline"
            >
              {loading ? "Planning..." : "Plan Activities"}
            </Button>
          </div>

          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Enter a topic for content creation..."
              value={contentTopic}
              onChange={(e) => setContentTopic(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && createContent()}
              className="flex-1"
            />
            <Button 
              onClick={createContent} 
              disabled={loading || !contentTopic.trim()}
              variant="outline"
            >
              {loading ? "Creating..." : "Create Content"}
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

        {renderWorkflowResult()}
      </div>
    </div>
  );
};

export default Index;
