"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { fetchData, listSpecs } from "@/lib/data-service";

import {
  Play,
  Plus,
  Trash2,
  Edit2,
  Key,
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  Copy,
  Download,
  Upload,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  FileText,
  Code,
  Server,
  Globe,
} from "lucide-react";
import { toast } from "sonner";

interface AuthToken {
  id: string;
  name: string;
  token: string;
  type: "Bearer" | "API Key" | "Basic";
  description?: string;
  createdAt: Date;
}

interface TestCase {
  name: string;
  description: string;
  method: string;
  endpoint: string;
  headers?: Record<string, string>;
  body?: any;
  expectedStatus: number;
  expectedResponse?: any;
}

interface TestResult {
  testCase: TestCase;
  status: number;
  ok: boolean;
  response: any;
  duration: number;
  error?: string;
}

interface ApiSpec {
  id: string;
  title: string;
  version: string;
  lastModified: string;
}

interface ApiEndpoint {
  path: string;
  method: string;
  operationId?: string;
  summary?: string;
  description?: string;
  parameters?: any[];
  requestBody?: any;
  responses?: any;
  tags?: string[];
}

interface EndpointGroup {
  tag: string;
  endpoints: ApiEndpoint[];
}

export default function ApiAutoTestPage() {
  // State management
  const [authTokens, setAuthTokens] = useState<AuthToken[]>([]);
  const [selectedTokenId, setSelectedTokenId] = useState<string>("");
  const [apiBaseUrl, setApiBaseUrl] = useState("https://api.example.com");
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [testCasesJson, setTestCasesJson] = useState("");
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [runningTestIndex, setRunningTestIndex] = useState<number | null>(null);

  // API Spec and endpoint selection state
  const [apiSpecs, setApiSpecs] = useState<ApiSpec[]>([]);
  const [selectedSpecId, setSelectedSpecId] = useState<string>("");
  const [apiSpecData, setApiSpecData] = useState<any>(null);
  const [endpointGroups, setEndpointGroups] = useState<EndpointGroup[]>([]);
  const [selectedEndpoints, setSelectedEndpoints] = useState<Set<string>>(
    new Set(),
  );
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [loadingSpec, setLoadingSpec] = useState(false);

  // Dialog states
  const [tokenDialogOpen, setTokenDialogOpen] = useState(false);
  const [editingToken, setEditingToken] = useState<AuthToken | null>(null);

  // Form states for new token
  const [newTokenName, setNewTokenName] = useState("");
  const [newTokenValue, setNewTokenValue] = useState("");
  const [newTokenType, setNewTokenType] = useState<
    "Bearer" | "API Key" | "Basic"
  >("Bearer");
  const [newTokenDescription, setNewTokenDescription] = useState("");

  // Load tokens from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("api-auth-tokens");
    if (stored) {
      try {
        const tokens = JSON.parse(stored);
        setAuthTokens(tokens);
      } catch {
        // Invalid storage, reset
        localStorage.removeItem("api-auth-tokens");
      }
    }

    // Load available API specs
    loadApiSpecs();
  }, []);

  // Load API specs from data service
  const loadApiSpecs = async () => {
    try {
      const specs = await listSpecs();
      setApiSpecs(specs);
    } catch (error) {
      console.error("Failed to load API specs:", error);
      toast.error("Failed to load API specifications");
    }
  };

  // Load selected API spec data
  useEffect(() => {
    if (selectedSpecId) {
      loadSpecData(selectedSpecId);
    } else {
      setApiSpecData(null);
      setEndpointGroups([]);
    }
  }, [selectedSpecId]);

  const loadSpecData = async (specId: string) => {
    setLoadingSpec(true);
    try {
      const specData = await fetchData("spec", specId);
      if (specData) {
        setApiSpecData(specData);
        parseEndpoints(specData);

        // Auto-set base URL from spec servers
        if (specData.servers && specData.servers.length > 0) {
          setApiBaseUrl(specData.servers[0].url);
        }
      }
    } catch (error) {
      console.error("Failed to load spec data:", error);
      toast.error("Failed to load API specification data");
    } finally {
      setLoadingSpec(false);
    }
  };

  // Parse endpoints from OpenAPI spec
  const parseEndpoints = (specData: any) => {
    if (!specData.paths) return;

    const endpoints: ApiEndpoint[] = [];

    Object.entries(specData.paths).forEach(([path, methods]: [string, any]) => {
      Object.entries(methods).forEach(([method, operation]: [string, any]) => {
        endpoints.push({
          path,
          method: method.toUpperCase(),
          operationId: operation.operationId,
          summary: operation.summary,
          description: operation.description,
          parameters: operation.parameters,
          requestBody: operation.requestBody,
          responses: operation.responses,
          tags: operation.tags || ["default"],
        });
      });
    });

    // Group endpoints by tags
    const groups: EndpointGroup[] = [];
    const tagMap = new Map<string, ApiEndpoint[]>();

    endpoints.forEach((endpoint) => {
      endpoint.tags?.forEach((tag) => {
        if (!tagMap.has(tag)) {
          tagMap.set(tag, []);
        }
        tagMap.get(tag)?.push(endpoint);
      });
    });

    tagMap.forEach((endpoints, tag) => {
      groups.push({ tag, endpoints });
    });

    setEndpointGroups(groups);
    // Auto-expand first group
    if (groups.length > 0) {
      setExpandedGroups(new Set([groups[0].tag]));
    }
  };

  // Save tokens to localStorage
  const saveTokens = (tokens: AuthToken[]) => {
    localStorage.setItem("api-auth-tokens", JSON.stringify(tokens));
    setAuthTokens(tokens);
  };

  // Token management functions
  const addToken = () => {
    if (!newTokenName.trim() || !newTokenValue.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    const newToken: AuthToken = {
      id: Date.now().toString(),
      name: newTokenName,
      token: newTokenValue,
      type: newTokenType,
      description: newTokenDescription,
      createdAt: new Date(),
    };

    const updatedTokens = [...authTokens, newToken];
    saveTokens(updatedTokens);

    // Clear form
    setNewTokenName("");
    setNewTokenValue("");
    setNewTokenType("Bearer");
    setNewTokenDescription("");
    setTokenDialogOpen(false);

    toast.success("Token added successfully");
  };

  const deleteToken = (id: string) => {
    const updatedTokens = authTokens.filter((token) => token.id !== id);
    saveTokens(updatedTokens);
    if (selectedTokenId === id) {
      setSelectedTokenId("");
    }
    toast.success("Token deleted successfully");
  };

  const getSelectedToken = (): AuthToken | null => {
    return authTokens.find((token) => token.id === selectedTokenId) || null;
  };

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

  // Endpoint selection functions
  const toggleEndpointSelection = (path: string, method: string) => {
    const endpointKey = `${method}:${path}`;
    const newSelected = new Set(selectedEndpoints);

    if (newSelected.has(endpointKey)) {
      newSelected.delete(endpointKey);
    } else {
      newSelected.add(endpointKey);
    }

    setSelectedEndpoints(newSelected);
  };

  const toggleGroupExpansion = (tag: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(tag)) {
      newExpanded.delete(tag);
    } else {
      newExpanded.add(tag);
    }
    setExpandedGroups(newExpanded);
  };

  const selectAllEndpoints = () => {
    const allEndpoints = new Set<string>();
    endpointGroups.forEach((group) => {
      group.endpoints.forEach((endpoint) => {
        allEndpoints.add(`${endpoint.method}:${endpoint.path}`);
      });
    });
    setSelectedEndpoints(allEndpoints);
  };

  const deselectAllEndpoints = () => {
    setSelectedEndpoints(new Set());
  };

  // Generate test cases from selected endpoints
  const generateTestsFromEndpoints = () => {
    if (selectedEndpoints.size === 0) {
      toast.error("Please select at least one endpoint");
      return;
    }

    const generatedTests: TestCase[] = [];

    endpointGroups.forEach((group) => {
      group.endpoints.forEach((endpoint) => {
        const endpointKey = `${endpoint.method}:${endpoint.path}`;
        if (selectedEndpoints.has(endpointKey)) {
          const testCase: TestCase = {
            name: endpoint.summary || `${endpoint.method} ${endpoint.path}`,
            description:
              endpoint.description ||
              `Test ${endpoint.method} ${endpoint.path}`,
            method: endpoint.method,
            endpoint: endpoint.path,
            expectedStatus: getExpectedStatusFromResponses(endpoint.responses),
          };

          // Add request body for POST/PUT/PATCH methods
          if (
            ["POST", "PUT", "PATCH"].includes(endpoint.method) &&
            endpoint.requestBody
          ) {
            testCase.body = generateSampleRequestBody(endpoint.requestBody);
          }

          generatedTests.push(testCase);
        }
      });
    });

    setTestCases(generatedTests);
    setTestCasesJson(JSON.stringify(generatedTests, null, 2));
    toast.success(
      `Generated ${generatedTests.length} test cases from selected endpoints`,
    );
  };

  // Helper function to get expected status from OpenAPI responses
  const getExpectedStatusFromResponses = (responses: any): number => {
    if (!responses) return 200;

    // Look for success status codes
    const successCodes = ["200", "201", "202", "204"];
    for (const code of successCodes) {
      if (responses[code]) return parseInt(code);
    }

    // Return first status code if no standard success codes found
    const firstCode = Object.keys(responses)[0];
    return firstCode ? parseInt(firstCode) : 200;
  };

  // Helper function to generate sample request body
  const generateSampleRequestBody = (requestBody: any): any => {
    if (!requestBody?.content) return {};

    const jsonContent = requestBody.content["application/json"];
    if (!jsonContent?.schema) return {};

    return generateSampleFromSchema(jsonContent.schema);
  };

  // Generate sample data from OpenAPI schema
  const generateSampleFromSchema = (schema: any): any => {
    if (!schema) return {};

    if (schema.type === "object" && schema.properties) {
      const sample: any = {};
      Object.entries(schema.properties).forEach(
        ([key, prop]: [string, any]) => {
          sample[key] = generateSampleValue(prop);
        },
      );
      return sample;
    }

    return generateSampleValue(schema);
  };

  const generateSampleValue = (schema: any): any => {
    switch (schema.type) {
      case "string":
        return schema.example || schema.enum?.[0] || "string";
      case "number":
      case "integer":
        return schema.example || 123;
      case "boolean":
        return schema.example || true;
      case "array":
        return [generateSampleValue(schema.items || {})];
      case "object":
        return generateSampleFromSchema(schema);
      default:
        return schema.example || "value";
    }
  };

  // Generate sample test cases
  const generateSampleTests = () => {
    const sampleTests = [
      {
        name: "Get User Profile",
        description: "Fetch user profile information",
        method: "GET",
        endpoint: "/api/user/profile",
        expectedStatus: 200,
      },
      {
        name: "Create New User",
        description: "Create a new user account",
        method: "POST",
        endpoint: "/api/users",
        body: {
          name: "John Doe",
          email: "john@example.com",
        },
        expectedStatus: 201,
      },
      {
        name: "Update User",
        description: "Update existing user information",
        method: "PUT",
        endpoint: "/api/users/123",
        body: {
          name: "John Smith",
        },
        expectedStatus: 200,
      },
    ];

    setTestCases(sampleTests);
    setTestCasesJson(JSON.stringify(sampleTests, null, 2));
    toast.success("Sample test cases loaded");
  };

  // Run individual test case
  const runSingleTest = async (
    testCase: TestCase,
    index: number,
  ): Promise<TestResult> => {
    setRunningTestIndex(index);
    const startTime = performance.now();

    try {
      const selectedToken = getSelectedToken();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...testCase.headers,
      };

      if (selectedToken) {
        if (selectedToken.type === "Bearer") {
          headers["Authorization"] = `Bearer ${selectedToken.token}`;
        } else if (selectedToken.type === "API Key") {
          headers["X-API-Key"] = selectedToken.token;
        } else if (selectedToken.type === "Basic") {
          headers["Authorization"] = `Basic ${selectedToken.token}`;
        }
      }

      const url = apiBaseUrl + testCase.endpoint;
      const response = await fetch(url, {
        method: testCase.method,
        headers,
        body: testCase.body ? JSON.stringify(testCase.body) : undefined,
      });

      const responseData = await response.json().catch(() => response.text());
      const duration = performance.now() - startTime;

      return {
        testCase,
        status: response.status,
        ok: response.status === testCase.expectedStatus,
        response: responseData,
        duration: Math.round(duration),
      };
    } catch (error) {
      const duration = performance.now() - startTime;
      return {
        testCase,
        status: 0,
        ok: false,
        response: null,
        duration: Math.round(duration),
        error: error instanceof Error ? error.message : "Unknown error",
      };
    } finally {
      setRunningTestIndex(null);
    }
  };

  // Run all test cases
  const runAllTests = async () => {
    if (testCases.length === 0) {
      toast.error("No test cases to run");
      return;
    }

    setLoading(true);
    setResults([]);

    const allResults: TestResult[] = [];

    for (let i = 0; i < testCases.length; i++) {
      const result = await runSingleTest(testCases[i], i);
      allResults.push(result);
      setResults([...allResults]); // Update results incrementally
    }

    setLoading(false);

    const passed = allResults.filter((r) => r.ok).length;
    const total = allResults.length;

    if (passed === total) {
      toast.success(`All ${total} tests passed! 🎉`);
    } else {
      toast.error(`${passed}/${total} tests passed`);
    }
  };

  // Copy test results
  const copyResults = () => {
    const summary = results.map((result) => ({
      test: result.testCase.name,
      status: result.status,
      passed: result.ok,
      duration: `${result.duration}ms`,
      error: result.error,
    }));

    navigator.clipboard.writeText(JSON.stringify(summary, null, 2));
    toast.success("Results copied to clipboard");
  };

  // Export results as JSON
  const exportResults = () => {
    const dataStr = JSON.stringify(results, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `api-test-results-${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

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
                        {authTokens.length}
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
                      {selectedEndpoints.size > 0 && (
                        <p className="text-xs text-purple-500">
                          {selectedEndpoints.size} endpoints selected
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
                        {results.filter((r) => r.ok).length}
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
                        {results.length > 0
                          ? `${Math.round(results.reduce((sum, r) => sum + r.duration, 0) / results.length)}ms`
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
                <Card className="border-2 border-blue-100">
                  <CardHeader className="pb-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Key className="h-5 w-5 text-blue-600" />
                        <CardTitle className="text-lg">Authorization</CardTitle>
                      </div>
                      <Dialog
                        open={tokenDialogOpen}
                        onOpenChange={setTokenDialogOpen}
                      >
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add Token
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>Add Authorization Token</DialogTitle>
                            <DialogDescription>
                              Store your API tokens securely in your browser
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="token-name">Token Name *</Label>
                              <Input
                                id="token-name"
                                value={newTokenName}
                                onChange={(e) =>
                                  setNewTokenName(e.target.value)
                                }
                                placeholder="e.g., Production API Key"
                              />
                            </div>
                            <div>
                              <Label htmlFor="token-type">Type</Label>
                              <Select
                                value={newTokenType}
                                onValueChange={(value: any) =>
                                  setNewTokenType(value)
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Bearer">
                                    Bearer Token
                                  </SelectItem>
                                  <SelectItem value="API Key">
                                    API Key
                                  </SelectItem>
                                  <SelectItem value="Basic">
                                    Basic Auth
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="token-value">Token Value *</Label>
                              <Textarea
                                id="token-value"
                                value={newTokenValue}
                                onChange={(e) =>
                                  setNewTokenValue(e.target.value)
                                }
                                placeholder="Paste your token here..."
                                rows={3}
                              />
                            </div>
                            <div>
                              <Label htmlFor="token-description">
                                Description
                              </Label>
                              <Input
                                id="token-description"
                                value={newTokenDescription}
                                onChange={(e) =>
                                  setNewTokenDescription(e.target.value)
                                }
                                placeholder="Optional description"
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => setTokenDialogOpen(false)}
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={addToken}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              Add Token
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {authTokens.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Key className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No tokens stored</p>
                        <p className="text-xs">
                          Add your first auth token to get started
                        </p>
                      </div>
                    ) : (
                      <>
                        <div>
                          <Label>Select Token</Label>
                          <Select
                            value={selectedTokenId}
                            onValueChange={setSelectedTokenId}
                          >
                            <SelectTrigger className="w-full mt-2">
                              <SelectValue placeholder="Choose an auth token" />
                            </SelectTrigger>
                            <SelectContent>
                              {authTokens.map((token) => (
                                <SelectItem key={token.id} value={token.id}>
                                  <div className="flex items-center gap-2">
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {token.type}
                                    </Badge>
                                    {token.name}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Token List */}
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {authTokens.map((token) => (
                            <div
                              key={token.id}
                              className={`p-2 rounded border ${
                                selectedTokenId === token.id
                                  ? "border-blue-300 bg-blue-50"
                                  : "border-gray-200 bg-white"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {token.type}
                                    </Badge>
                                    <p className="text-sm font-medium truncate">
                                      {token.name}
                                    </p>
                                  </div>
                                  {token.description && (
                                    <p className="text-xs text-gray-500 truncate mt-1">
                                      {token.description}
                                    </p>
                                  )}
                                </div>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => deleteToken(token.id)}
                                  className="text-red-500 hover:text-red-700 h-6 w-6 p-0"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* API Specification Selection */}
                <Card className="border-2 border-purple-100">
                  <CardHeader className="pb-0">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-purple-600" />
                      <CardTitle className="text-lg">
                        API Specification
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-col space-y-4">
                    <div>
                      <Label>Select API Spec</Label>
                      <Select
                        value={selectedSpecId}
                        onValueChange={setSelectedSpecId}
                      >
                        <SelectTrigger className="w-full mt-2">
                          <SelectValue placeholder="Choose an API specification" />
                        </SelectTrigger>
                        <SelectContent>
                          {apiSpecs.map((spec) => (
                            <SelectItem key={spec.id} value={spec.id}>
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                <div>
                                  <div className="font-medium">
                                    {spec.title}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    v{spec.version}
                                  </div>
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {apiSpecData && (
                      <div className="p-3 bg-purple-50 border border-purple-200 rounded">
                        <div className="flex items-center gap-2 text-purple-700">
                          <Server className="h-4 w-4" />
                          <span className="text-sm font-medium">
                            Loaded Spec
                          </span>
                        </div>
                        <p className="text-xs text-purple-600 mt-1">
                          {apiSpecData.info?.title} -{" "}
                          {endpointGroups.reduce(
                            (sum, group) => sum + group.endpoints.length,
                            0,
                          )}{" "}
                          endpoints
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Endpoint Selection */}
                {endpointGroups.length > 0 && (
                  <Card className="border-2 border-orange-100">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Code className="h-5 w-5 text-orange-600" />
                          <CardTitle className="text-lg">
                            Select Endpoints
                          </CardTitle>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={selectAllEndpoints}
                            className="h-7 text-xs"
                          >
                            All
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={deselectAllEndpoints}
                            className="h-7 text-xs"
                          >
                            None
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2 max-h-80 overflow-y-auto">
                      {endpointGroups.map((group) => (
                        <Collapsible
                          key={group.tag}
                          open={expandedGroups.has(group.tag)}
                          onOpenChange={() => toggleGroupExpansion(group.tag)}
                        >
                          <CollapsibleTrigger className="flex items-center justify-between w-full p-2 bg-gray-50 rounded hover:bg-gray-100">
                            <div className="flex items-center gap-2">
                              {expandedGroups.has(group.tag) ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                              <Badge variant="outline" className="text-xs">
                                {group.tag}
                              </Badge>
                              <span className="text-sm font-medium">
                                {group.endpoints.length} endpoints
                              </span>
                            </div>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="mt-2 ml-4 space-y-1">
                            {group.endpoints.map((endpoint) => {
                              const endpointKey = `${endpoint.method}:${endpoint.path}`;
                              const isSelected =
                                selectedEndpoints.has(endpointKey);
                              return (
                                <div
                                  key={endpointKey}
                                  className="flex items-start gap-2 p-2 border rounded hover:bg-gray-50"
                                >
                                  <Checkbox
                                    checked={isSelected}
                                    onCheckedChange={() =>
                                      toggleEndpointSelection(
                                        endpoint.path,
                                        endpoint.method,
                                      )
                                    }
                                    className="mt-1"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <Badge
                                        variant="outline"
                                        className={`text-xs ${
                                          endpoint.method === "GET"
                                            ? "text-blue-600 border-blue-200"
                                            : endpoint.method === "POST"
                                              ? "text-green-600 border-green-200"
                                              : endpoint.method === "PUT"
                                                ? "text-yellow-600 border-yellow-200"
                                                : endpoint.method === "DELETE"
                                                  ? "text-red-600 border-red-200"
                                                  : "text-gray-600 border-gray-200"
                                        }`}
                                      >
                                        {endpoint.method}
                                      </Badge>
                                      <code className="text-xs font-mono text-gray-700">
                                        {endpoint.path}
                                      </code>
                                    </div>
                                    {endpoint.summary && (
                                      <p className="text-xs text-gray-600 truncate">
                                        {endpoint.summary}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </CollapsibleContent>
                        </Collapsible>
                      ))}
                    </CardContent>
                  </Card>
                )}

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

                    {getSelectedToken() && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded">
                        <div className="flex items-center gap-2 text-green-700">
                          <Shield className="h-4 w-4" />
                          <span className="text-sm font-medium">
                            Active Token
                          </span>
                        </div>
                        <p className="text-xs text-green-600 mt-1">
                          {getSelectedToken()?.name} ({getSelectedToken()?.type}
                          )
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
                    {selectedEndpoints.size > 0 && (
                      <Button
                        onClick={generateTestsFromEndpoints}
                        className="w-full justify-start bg-orange-600 hover:bg-orange-700"
                        size="sm"
                      >
                        <Code className="h-4 w-4 mr-2" />
                        Generate Tests ({selectedEndpoints.size})
                      </Button>
                    )}

                    <Button
                      onClick={generateSampleTests}
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Load Sample Tests
                    </Button>

                    {results.length > 0 && (
                      <>
                        <Button
                          onClick={copyResults}
                          variant="outline"
                          size="sm"
                          className="w-full justify-start"
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Results
                        </Button>
                        <Button
                          onClick={exportResults}
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
                          onClick={runAllTests}
                          disabled={loading || testCases.length === 0}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {loading ? (
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
  },
  {
    "name": "Create User",
    "description": "Create a new user",
    "method": "POST",
    "endpoint": "/api/users",
    "body": {
      "name": "John Doe",
      "email": "john@example.com"
    },
    "expectedStatus": 201
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
                                      runSingleTest(testCase, index)
                                    }
                                    disabled={loading}
                                    className="h-7"
                                  >
                                    {runningTestIndex === index ? (
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
                {results.length > 0 && (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xl">Test Results</CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className="text-green-600 border-green-200"
                          >
                            {results.filter((r) => r.ok).length} Passed
                          </Badge>
                          <Badge
                            variant="outline"
                            className="text-red-600 border-red-200"
                          >
                            {results.filter((r) => !r.ok).length} Failed
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {results.map((result, index) => (
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
