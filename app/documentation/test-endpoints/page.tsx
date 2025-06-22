"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Play,
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  Copy,
  Download,
  Upload,
  RefreshCw,
  Code,
} from "lucide-react";
import { toast } from "sonner";

// Custom hooks
import { useAuthTokens } from "./hooks/useAuthTokens";
import { useApiSpecs } from "./hooks/useApiSpecs";
import { useTestExecution } from "./hooks/useTestExecution";

// Components
import { AuthTokenManagement } from "./components/AuthTokenManagement";
import { ApiSpecSelector } from "./components/ApiSpecSelector";
import { EndpointSelector } from "./components/EndpointSelector";

// Utils
import {
  generateTestsFromEndpoints,
  generateSampleTests,
} from "./utils/testUtils";

// Types
import type { TestCase, TestResult } from "./types";

export default function ApiAutoTestPage() {
  // Custom hooks
  const authTokens = useAuthTokens();
  const apiSpecs = useApiSpecs();
  const testExecution = useTestExecution();

  // Local state
  const [apiBaseUrl, setApiBaseUrl] = useState("https://api.example.com");
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [testCasesJson, setTestCasesJson] = useState("");

  // Load API specs on mount
  useEffect(() => {
    apiSpecs.loadApiSpecs();
  }, []);

  // Auto-set base URL from spec servers
  useEffect(() => {
    if (apiSpecs.apiSpecData?.servers?.length > 0) {
      setApiBaseUrl(apiSpecs.apiSpecData.servers[0].url);
    }
  }, [apiSpecs.apiSpecData]);

  // Parse test cases from JSON
  const handleParseTestCases = () => {
    try {
      const parsed = JSON.parse(testCasesJson);
      const cases = Array.isArray(parsed) ? parsed : [parsed];
      setTestCases(cases);
      toast.success(`Parsed ${cases.length} test case(s)`);
    } catch {
      toast.error("Invalid JSON format");
    }
  };

  // Generate test cases from selected endpoints
  const handleGenerateTestsFromEndpoints = () => {
    if (apiSpecs.selectedEndpoints.size === 0) {
      toast.error("Please select at least one endpoint");
      return;
    }

    const generatedTests = generateTestsFromEndpoints(
      apiSpecs.endpointGroups,
      apiSpecs.selectedEndpoints,
    );

    setTestCases(generatedTests);
    setTestCasesJson(JSON.stringify(generatedTests, null, 2));
    toast.success(
      `Generated ${generatedTests.length} test cases from selected endpoints`,
    );
  };

  // Load sample tests
  const handleLoadSampleTests = () => {
    const sampleTests = generateSampleTests();
    setTestCases(sampleTests);
    setTestCasesJson(JSON.stringify(sampleTests, null, 2));
    toast.success("Sample test cases loaded");
  };

  // Run all tests
  const handleRunAllTests = () => {
    testExecution.runAllTests(
      testCases,
      apiBaseUrl,
      authTokens.getSelectedToken(),
    );
  };

  // Run single test
  const handleRunSingleTest = (testCase: TestCase, index: number) => {
    testExecution.runSingleTest(
      testCase,
      index,
      apiBaseUrl,
      authTokens.getSelectedToken(),
    );
  };

  // Utility functions for result display
  const getStatusColor = (result: TestResult) => {
    if (result.error) return "text-red-600 bg-red-50";
    return result.ok ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50";
  };

  const getStatusIcon = (result: TestResult) => {
    if (result.error) return <XCircle className="h-4 w-4" />;
    return result.ok ? (
      <CheckCircle className="h-4 w-4" />
    ) : (
      <XCircle className="h-4 w-4" />
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="flex flex-col">
        <div className="flex-1 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-blue-600 font-medium">
                        Auth Tokens
                      </p>
                      <p className="text-2xl font-bold text-blue-700">
                        {authTokens.authTokens.length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-purple-200 bg-purple-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Play className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="text-sm text-purple-600 font-medium">
                        Test Cases
                      </p>
                      <p className="text-2xl font-bold text-purple-700">
                        {testCases.length}
                      </p>
                      {apiSpecs.selectedEndpoints.size > 0 && (
                        <p className="text-xs text-purple-500">
                          {apiSpecs.selectedEndpoints.size} endpoints selected
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm text-green-600 font-medium">
                        Passed
                      </p>
                      <p className="text-2xl font-bold text-green-700">
                        {testExecution.results.filter((r) => r.ok).length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-orange-200 bg-orange-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="text-sm text-orange-600 font-medium">
                        Avg Duration
                      </p>
                      <p className="text-2xl font-bold text-orange-700">
                        {testExecution.results.length > 0
                          ? `${Math.round(testExecution.results.reduce((sum, r) => sum + r.duration, 0) / testExecution.results.length)}ms`
                          : "0ms"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Configuration Panel */}
              <div className="lg:col-span-1 space-y-6">
                {/* Authorization Token Management */}
                <AuthTokenManagement
                  authTokens={authTokens.authTokens}
                  selectedTokenId={authTokens.selectedTokenId}
                  onSelectToken={authTokens.setSelectedTokenId}
                  onAddToken={authTokens.addToken}
                  onDeleteToken={authTokens.deleteToken}
                  getSelectedToken={authTokens.getSelectedToken}
                />

                {/* API Specification Selection */}
                <ApiSpecSelector
                  apiSpecs={apiSpecs.apiSpecs}
                  selectedSpecId={apiSpecs.selectedSpecId}
                  onSelectSpec={apiSpecs.setSelectedSpecId}
                  apiSpecData={apiSpecs.apiSpecData}
                  endpointGroups={apiSpecs.endpointGroups}
                  loadingSpec={apiSpecs.loadingSpec}
                />

                {/* Endpoint Selection */}
                <EndpointSelector
                  endpointGroups={apiSpecs.endpointGroups}
                  selectedEndpoints={apiSpecs.selectedEndpoints}
                  expandedGroups={apiSpecs.expandedGroups}
                  onToggleEndpoint={apiSpecs.toggleEndpointSelection}
                  onToggleGroup={apiSpecs.toggleGroupExpansion}
                  onSelectAll={apiSpecs.selectAllEndpoints}
                  onDeselectAll={apiSpecs.deselectAllEndpoints}
                />

                {/* API Configuration */}
                <Card>
                  <CardHeader className="pb-0">
                    <CardTitle className="text-lg">API Configuration</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="base-url">Base URL</Label>
                      <Input
                        id="base-url"
                        value={apiBaseUrl}
                        onChange={(e) => setApiBaseUrl(e.target.value)}
                        placeholder="https://api.example.com"
                        className="mt-2"
                      />
                    </div>

                    {authTokens.getSelectedToken() && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded">
                        <div className="flex items-center gap-2 text-green-700">
                          <Shield className="h-4 w-4" />
                          <span className="text-sm font-medium">
                            Active Token
                          </span>
                        </div>
                        <p className="text-xs text-green-600 mt-1">
                          {authTokens.getSelectedToken()?.name} (
                          {authTokens.getSelectedToken()?.type})
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardHeader className="pb-3 h-auto flex-grow-0">
                    <CardTitle className="text-lg">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {apiSpecs.selectedEndpoints.size > 0 && (
                      <Button
                        onClick={handleGenerateTestsFromEndpoints}
                        className="w-full justify-start bg-orange-600 hover:bg-orange-700"
                        size="sm"
                      >
                        <Code className="h-4 w-4 mr-2" />
                        Generate Tests ({apiSpecs.selectedEndpoints.size})
                      </Button>
                    )}

                    <Button
                      onClick={handleLoadSampleTests}
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Load Sample Tests
                    </Button>

                    {testExecution.results.length > 0 && (
                      <>
                        <Button
                          onClick={testExecution.copyResults}
                          variant="outline"
                          size="sm"
                          className="w-full justify-start"
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Results
                        </Button>
                        <Button
                          onClick={testExecution.exportResults}
                          variant="outline"
                          size="sm"
                          className="w-full justify-start"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Export Results
                        </Button>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Main Testing Panel */}
              <div className="lg:col-span-2 space-y-6">
                {/* Test Cases Configuration */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl">Test Cases</CardTitle>
                      <div className="flex gap-2">
                        <Button
                          onClick={handleParseTestCases}
                          size="sm"
                          variant="outline"
                          disabled={!testCasesJson.trim()}
                        >
                          Parse JSON
                        </Button>
                        <Button
                          onClick={handleRunAllTests}
                          disabled={
                            testExecution.loading || testCases.length === 0
                          }
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {testExecution.loading ? (
                            <>
                              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                              Running...
                            </>
                          ) : (
                            <>
                              <Play className="h-4 w-4 mr-2" />
                              Run All Tests
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="editor" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="editor">JSON Editor</TabsTrigger>
                        <TabsTrigger value="preview">
                          Preview ({testCases.length})
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="editor" className="space-y-4">
                        <div>
                          <Label>Test Cases JSON</Label>
                          <Textarea
                            value={testCasesJson}
                            onChange={(e) => setTestCasesJson(e.target.value)}
                            placeholder={`[
  {
    "name": "Get User Profile",
    "description": "Fetch user profile information",
    "method": "GET",
    "endpoint": "/api/user/profile",
    "expectedStatus": 200
  }
]`}
                            rows={15}
                            className="font-mono text-sm"
                          />
                        </div>
                      </TabsContent>

                      <TabsContent value="preview" className="space-y-4">
                        {testCases.length === 0 ? (
                          <div className="text-center py-12 text-gray-500">
                            <Play className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p>No test cases parsed</p>
                            <p className="text-sm">
                              Add JSON test cases and click "Parse JSON"
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {testCases.map((testCase, index) => (
                              <div
                                key={index}
                                className="border rounded p-4 bg-white"
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {testCase.method}
                                    </Badge>
                                    <h4 className="font-medium">
                                      {testCase.name}
                                    </h4>
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      handleRunSingleTest(testCase, index)
                                    }
                                    disabled={testExecution.loading}
                                    className="h-7"
                                  >
                                    {testExecution.runningTestIndex ===
                                    index ? (
                                      <RefreshCw className="h-3 w-3 animate-spin" />
                                    ) : (
                                      <Play className="h-3 w-3" />
                                    )}
                                  </Button>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">
                                  {testCase.description}
                                </p>
                                <div className="text-xs text-gray-500">
                                  <code>
                                    {testCase.method} {testCase.endpoint}
                                  </code>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>

                {/* Test Results */}
                {testExecution.results.length > 0 && (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xl">Test Results</CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className="text-green-600 border-green-200"
                          >
                            {testExecution.results.filter((r) => r.ok).length}{" "}
                            Passed
                          </Badge>
                          <Badge
                            variant="outline"
                            className="text-red-600 border-red-200"
                          >
                            {testExecution.results.filter((r) => !r.ok).length}{" "}
                            Failed
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {testExecution.results.map((result, index) => (
                          <div
                            key={index}
                            className={`border rounded p-4 ${getStatusColor(result)} border-current`}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                {getStatusIcon(result)}
                                <h4 className="font-medium">
                                  {result.testCase.name}
                                </h4>
                                <Badge variant="outline" className="text-xs">
                                  {result.testCase.method}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <span className="font-mono">
                                  {result.status}{" "}
                                  {result.error
                                    ? "ERROR"
                                    : result.ok
                                      ? "PASS"
                                      : "FAIL"}
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  {result.duration}ms
                                </Badge>
                              </div>
                            </div>

                            {result.error && (
                              <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded">
                                <p className="text-sm text-red-700 font-medium">
                                  Error:
                                </p>
                                <p className="text-sm text-red-600">
                                  {result.error}
                                </p>
                              </div>
                            )}

                            <details className="text-sm">
                              <summary className="cursor-pointer font-medium mb-2">
                                Response Details
                              </summary>
                              <pre className="bg-gray-50 p-3 rounded text-xs overflow-x-auto border">
                                {typeof result.response === "string"
                                  ? result.response
                                  : JSON.stringify(result.response, null, 2)}
                              </pre>
                            </details>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
