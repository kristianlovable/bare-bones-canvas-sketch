

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

  // Generic function to execute workflow with watch streaming
  const executeWorkflowWithWatch = async (workflowId: string, inputData: any, successMessage: string) => {
    setLoading(true);
    setResponse({ message: "Starting workflow...", status: "starting" });
    
    try {
      // Create a new run
      const createRunResponse = await fetch(
        `https://nqspuwzqrwamccpqwwvj.supabase.co/functions/v1/api/workflows/${workflowId}/create-run`,
        { method: "POST" }
      );
      
      if (!createRunResponse.ok) {
        throw new Error(`HTTP error! status: ${createRunResponse.status}`);
      }
      
      const runData = await createRunResponse.json();
      const runId = runData.runId;

      // Start the workflow (don't await the full completion)
      fetch(
        `https://nqspuwzqrwamccpqwwvj.supabase.co/functions/v1/api/workflows/${workflowId}/start?runId=${runId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ inputData }),
        }
      );

      // Start watching the workflow progress
      const watchUrl = `https://nqspuwzqrwamccpqwwvj.supabase.co/functions/v1/api/workflows/${workflowId}/watch?runId=${runId}`;
      
      const watchResponse = await fetch(watchUrl);
      if (!watchResponse.ok) {
        throw new Error(`Watch request failed: ${watchResponse.status}`);
      }

      const reader = watchResponse.body?.getReader();
      if (!reader) {
        throw new Error("No response body available for streaming");
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        
        // Process complete chunks (separated by record separator)
        const chunks = buffer.split('\x1E');
        buffer = chunks.pop() || ''; // Keep incomplete chunk in buffer
        
        for (const chunk of chunks) {
          if (chunk.trim()) {
            try {
              const data = JSON.parse(chunk);
              console.log("Received workflow update:", data);
              
              if (data.payload?.workflowState) {
                const workflowState = data.payload.workflowState;
                
                if (workflowState.status === 'success' && workflowState.result) {
                  setResponse({ result: workflowState.result, status: 'success' });
                  toast({
                    title: "Success!",
                    description: successMessage,
                  });
                } else if (workflowState.status === 'failed') {
                  setResponse({ error: workflowState.error, status: 'failed' });
                  toast({
                    title: "Error",
                    description: "Workflow execution failed",
                    variant: "destructive",
                  });
                } else {
                  // Still running
                  setResponse({ 
                    message: "Workflow is running...", 
                    status: workflowState.status,
                    steps: workflowState.steps 
                  });
                }
              }
            } catch (parseError) {
              console.error("Error parsing chunk:", parseError, "Chunk:", chunk);
            }
          }
        }
      }
      
    } catch (error) {
      console.error("Error executing workflow:", error);
      setResponse({ error: error.message, status: 'error' });
      toast({
        title: "Error",
        description: "Failed to execute workflow",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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

    await executeWorkflowWithWatch(
      "definition", 
      { word: word.trim() }, 
      `Got definition for "${word}"`
    );
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

    await executeWorkflowWithWatch(
      "issue-triage", 
      { userMessage: userMessage.trim() }, 
      "Issue triage completed and Slack notification sent"
    );
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

    await executeWorkflowWithWatch(
      "joke", 
      { word: jokeWord.trim() }, 
      `Generated joke for "${jokeWord}"`
    );
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

    await executeWorkflowWithWatch(
      "activity-planning", 
      { city: cityForActivities.trim() }, 
      `Generated activity plan for ${cityForActivities}`
    );
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

    await executeWorkflowWithWatch(
      "rap-song", 
      { theme: rapTheme.trim() }, 
      `Generated rap song about "${rapTheme}"`
    );
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

    await executeWorkflowWithWatch(
      "content-creation", 
      { topic: contentTopic.trim() }, 
      `Created content about "${contentTopic}"`
    );
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

    await executeWorkflowWithWatch(
      "word-length", 
      { word: wordLengthInput.trim() }, 
      `Analyzed word "${wordLengthInput}"`
    );
  };

  const renderWorkflowResult = () => {
    if (!response) return null;

    // Prioritize word length analysis result
    if (response.result && typeof response.result === 'object' && response.result.category) {
      return (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📏 Word Length Analysis
              {response.result.category === 'long' ? '📏🔥' : '📏✨'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="text-2xl font-bold text-gray-800">
                    "{response.result.word}"
                  </div>
                  <div className="text-sm text-gray-500">Input word</div>
                </div>
                <div className="text-right">
                  <div className={`text-3xl font-bold ${response.result.category === 'long' ? 'text-blue-600' : 'text-green-600'}`}>
                    {response.result.category.toUpperCase()}
                  </div>
                  <div className="text-sm text-gray-500">
                    {response.result.length} characters
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                <div className="font-medium text-blue-800 mb-1">Analysis Result:</div>
                <div className="text-blue-700">
                  {response.result.message}
                </div>
              </div>

              <div className="text-xs text-gray-400 p-2 bg-gray-100 rounded">
                Classification: Words with 5 characters or less are considered "short", 
                while words with more than 5 characters are considered "long"
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

    // Show workflow status while running
    if (response.status === 'starting' || response.status === 'running' || response.message?.includes("running")) {
      return (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>⚙️ Processing...</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              <div className="animate-pulse text-gray-500">
                {response.message || "Workflow is running, please wait for results..."}
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    // Show error state
    if (response.error || response.status === 'failed') {
      return (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>❌ Error</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-red-600 p-4 bg-red-50 rounded border border-red-200">
              {response.error || "Workflow execution failed"}
            </div>
          </CardContent>
        </Card>
      );
    }

    // Default fallback - show raw JSON but minimize technical details
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

