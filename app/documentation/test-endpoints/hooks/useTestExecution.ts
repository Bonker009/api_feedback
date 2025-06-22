import { useState } from "react";
import { toast } from "sonner";
import type { TestCase, TestResult, AuthToken } from "../types";

export function useTestExecution() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [runningTestIndex, setRunningTestIndex] = useState<number | null>(null);

  // Run individual test case
  const runSingleTest = async (
    testCase: TestCase,
    index: number,
    apiBaseUrl: string,
    selectedToken?: AuthToken | null,
  ): Promise<TestResult> => {
    setRunningTestIndex(index);
    const startTime = performance.now();

    try {
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
  const runAllTests = async (
    testCases: TestCase[],
    apiBaseUrl: string,
    selectedToken?: AuthToken | null,
  ) => {
    if (testCases.length === 0) {
      toast.error("No test cases to run");
      return;
    }

    setLoading(true);
    setResults([]);

    const allResults: TestResult[] = [];

    for (let i = 0; i < testCases.length; i++) {
      const result = await runSingleTest(
        testCases[i],
        i,
        apiBaseUrl,
        selectedToken,
      );
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

  return {
    results,
    loading,
    runningTestIndex,
    runSingleTest,
    runAllTests,
    copyResults,
    exportResults,
  };
}
