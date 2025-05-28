import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Copy,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TestReportProps } from "@/app/types/types";

export function TestReport({
  testResults,
  activeResult,
  testCases,
  setActiveResult,
  getStatusBadgeColor,
  copyToClipboard,
}: TestReportProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <AlertTriangle className="h-4 w-4 mr-2" />
          Test Report
        </CardTitle>
        <CardDescription>Detailed results of your API tests</CardDescription>
      </CardHeader>
      <CardContent>
        {testResults.length > 0 && activeResult ? (
          <div className="space-y-4">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {testResults.map((result) => (
                <Button
                  key={result.id}
                  variant={activeResult === result.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveResult(result.id)}
                  className="flex items-center whitespace-nowrap"
                >
                  <Clock className="h-3 w-3 mr-1" />
                  {new Date(result.timestamp).toLocaleTimeString()}
                  {result.response ? (
                    <Badge
                      className={`ml-2 ${getStatusBadgeColor(
                        result.response.status
                      )}`}
                    >
                      {result.response.status}
                    </Badge>
                  ) : (
                    <Badge className="bg-red-100 text-red-800 ml-2">
                      Error
                    </Badge>
                  )}
                </Button>
              ))}
            </div>

            {testResults.find((r) => r.id === activeResult) && (
              <div className="space-y-4">
                {/* Test Case Information */}
                {(() => {
                  const activeTestResult = testResults.find(
                    (r) => r.id === activeResult
                  )!;
                  const testCase = testCases.find(
                    (tc) => tc.result?.id === activeResult
                  );
                  console.log("Active Test Result", activeTestResult);

                  return (
                    <>
                      {testCase && (
                        <div className="bg-slate-50 border border-slate-200 rounded-md p-4">
                          <div className="flex items-center justify-between">
                            <h3 className="text-base font-medium flex items-center">
                              <Badge
                                className={cn(
                                  "mr-2 px-2 py-1 text-xs",
                                  testCase.request.method === "GET"
                                    ? "bg-blue-100 text-blue-800"
                                    : testCase.request.method === "POST"
                                    ? "bg-green-100 text-green-800"
                                    : testCase.request.method === "PUT"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : testCase.request.method === "DELETE"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-gray-100 text-gray-800"
                                )}
                              >
                                {testCase.request.method}
                              </Badge>
                              {testCase.name}
                            </h3>
                            <Badge
                              className={getStatusBadgeColor(
                                activeTestResult.response?.status || 0
                              )}
                            >
                              {activeTestResult.response?.status || "Error"}
                            </Badge>
                          </div>
                          {testCase.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {testCase.description}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Request Details */}
                      <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="request">
                          <AccordionTrigger className="text-sm font-medium">
                            Request Details
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-3 text-sm">
                              <div>
                                <div className="font-semibold">URL:</div>
                                <div className="bg-slate-100 p-2 rounded mt-1">
                                  {activeTestResult.request.url}
                                </div>
                              </div>

                              <div>
                                <div className="font-semibold">Headers:</div>
                                <div className="bg-slate-100 p-2 rounded mt-1 max-h-32 overflow-y-auto">
                                  {Object.keys(activeTestResult.request.headers)
                                    .length > 0 ? (
                                    <pre className="text-xs whitespace-pre-wrap">
                                      {JSON.stringify(
                                        activeTestResult.request.headers,
                                        null,
                                        2
                                      )}
                                    </pre>
                                  ) : (
                                    <p className="text-xs text-muted-foreground">
                                      No headers
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div>
                                <div className="font-semibold">
                                  Request Body:
                                </div>
                                <div className="bg-slate-100 p-2 rounded mt-1 max-h-48 overflow-y-auto">
                                  {activeTestResult.request.body ? (
                                    <pre className="text-xs whitespace-pre-wrap">
                                      {typeof activeTestResult.request.body ===
                                      "string"
                                        ? activeTestResult.request.body
                                        : JSON.stringify(
                                            activeTestResult.request.body,
                                            null,
                                            2
                                          )}
                                    </pre>
                                  ) : (
                                    <p className="text-xs text-muted-foreground">
                                      No body
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>

                        {/* Response Details */}
                        <AccordionItem value="response">
                          <AccordionTrigger className="text-sm font-medium">
                            Response Details
                            {activeTestResult.response && (
                              <Badge
                                className={`ml-2 ${getStatusBadgeColor(
                                  activeTestResult.response.status
                                )}`}
                              >
                                {activeTestResult.response.status} -{" "}
                                {activeTestResult.response.time}ms
                              </Badge>
                            )}
                          </AccordionTrigger>
                          <AccordionContent>
                            {activeTestResult.response ? (
                              <div className="space-y-3 text-sm">
                                <div>
                                  <div className="font-semibold">Status:</div>
                                  <div className="bg-slate-100 p-2 rounded mt-1">
                                    <Badge
                                      className={getStatusBadgeColor(
                                        activeTestResult.response.status
                                      )}
                                    >
                                      {activeTestResult.response.status}
                                    </Badge>
                                    <span className="ml-2">
                                      {activeTestResult.response.statusText}
                                    </span>
                                  </div>
                                </div>

                                <div>
                                  <div className="font-semibold">
                                    Response Time:
                                  </div>
                                  <div className="bg-slate-100 p-2 rounded mt-1">
                                    {activeTestResult.response.time}ms
                                  </div>
                                </div>

                                <div>
                                  <div className="font-semibold">Headers:</div>
                                  <div className="bg-slate-100 p-2 rounded mt-1 max-h-32 overflow-y-auto">
                                    {Object.keys(
                                      activeTestResult.response.headers
                                    ).length > 0 ? (
                                      <pre className="text-xs whitespace-pre-wrap">
                                        {JSON.stringify(
                                          activeTestResult.response.headers,
                                          null,
                                          2
                                        )}
                                      </pre>
                                    ) : (
                                      <p className="text-xs text-muted-foreground">
                                        No headers
                                      </p>
                                    )}
                                  </div>
                                </div>

                                <div>
                                  <div className="font-semibold">
                                    Response Body:
                                  </div>
                                  <div className="relative">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="absolute top-1 right-1 opacity-50 hover:opacity-100"
                                      onClick={() =>
                                        copyToClipboard(
                                          typeof activeTestResult.response
                                            ?.body === "string"
                                            ? activeTestResult.response.body
                                            : JSON.stringify(
                                                activeTestResult.response?.body,
                                                null,
                                                2
                                              )
                                        )
                                      }
                                    >
                                      <Copy className="h-3 w-3" />
                                    </Button>
                                    <div className="bg-slate-100 p-2 rounded mt-1 max-h-48 overflow-y-auto">
                                      {activeTestResult.response.body ? (
                                        <pre className="text-xs whitespace-pre-wrap">
                                          {typeof activeTestResult.response
                                            .body === "string"
                                            ? activeTestResult.response.body
                                            : JSON.stringify(
                                                activeTestResult.response.body,
                                                null,
                                                2
                                              )}
                                        </pre>
                                      ) : (
                                        <p className="text-xs text-muted-foreground">
                                          No body
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="bg-red-50 p-4 rounded-md">
                                <p className="text-red-800 font-medium">
                                  No response (request failed)
                                </p>
                              </div>
                            )}
                          </AccordionContent>
                        </AccordionItem>

                        {/* Validation Results */}
                        <AccordionItem value="validations">
                          <AccordionTrigger className="text-sm font-medium">
                            Field Validations
                            {activeTestResult.validations.length > 0 && (
                              <Badge
                                className={`ml-2 ${
                                  activeTestResult.validations.some(
                                    (v) => !v.valid
                                  )
                                    ? "bg-red-100 text-red-800"
                                    : "bg-green-100 text-green-800"
                                }`}
                              >
                                {
                                  activeTestResult.validations.filter(
                                    (v) => !v.valid
                                  ).length
                                }{" "}
                                issues
                              </Badge>
                            )}
                          </AccordionTrigger>
                          <AccordionContent>
                            {activeTestResult.validations.length > 0 ? (
                              <div className="space-y-2">
                                {activeTestResult.validations.map(
                                  (validation, idx) => (
                                    <div
                                      key={idx}
                                      className={`p-2 rounded-md flex items-start ${
                                        validation.valid
                                          ? "bg-green-50 text-green-800"
                                          : "bg-red-50 text-red-800"
                                      }`}
                                    >
                                      <div className="mr-2 mt-0.5">
                                        {validation.valid ? (
                                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                                        ) : (
                                          <XCircle className="h-4 w-4 text-red-500" />
                                        )}
                                      </div>
                                      <div>
                                        <div className="font-medium">
                                          {validation.field}
                                        </div>
                                        <div className="text-xs">
                                          {validation.message}
                                        </div>
                                      </div>
                                    </div>
                                  )
                                )}
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground">
                                No validation rules were applied to this request
                              </p>
                            )}
                          </AccordionContent>
                        </AccordionItem>

                        {/* If there was an error */}
                        {activeTestResult.error && (
                          <AccordionItem value="error">
                            <AccordionTrigger className="text-sm font-medium">
                              <span className="text-red-600">
                                Error Details
                              </span>
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="bg-red-50 border border-red-200 rounded-md p-3 text-red-800">
                                <p className="font-medium">Error Message:</p>
                                <p className="mt-1">{activeTestResult.error}</p>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        )}
                      </Accordion>

                      {/* Expected vs Actual (if expected response is defined) */}
                      {testCase?.expectedResponse && (
                        <Accordion type="single" collapsible className="w-full">
                          <AccordionItem value="comparison">
                            <AccordionTrigger className="text-sm font-medium">
                              Expected vs Actual
                              {testCase.expectedResponse.status !==
                                undefined && (
                                <Badge
                                  className={`ml-2 ${
                                    testCase.expectedResponse.status ===
                                    activeTestResult.response?.status
                                      ? "bg-green-100 text-green-800"
                                      : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  Status{" "}
                                  {testCase.expectedResponse.status ===
                                  activeTestResult.response?.status
                                    ? "Match"
                                    : "Mismatch"}
                                </Badge>
                              )}
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-3">
                                {testCase.expectedResponse.status !==
                                  undefined && (
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <div className="font-medium text-sm mb-1">
                                        Expected Status:
                                      </div>
                                      <Badge>
                                        {testCase.expectedResponse.status}
                                      </Badge>
                                    </div>
                                    <div>
                                      <div className="font-medium text-sm mb-1">
                                        Actual Status:
                                      </div>
                                      <Badge
                                        className={getStatusBadgeColor(
                                          activeTestResult.response?.status || 0
                                        )}
                                      >
                                        {activeTestResult.response?.status ||
                                          "N/A"}
                                      </Badge>
                                    </div>
                                  </div>
                                )}

                                {testCase.expectedResponse.body && (
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <div className="font-medium text-sm mb-1">
                                        Expected Body:
                                      </div>
                                      <div className="bg-slate-100 p-2 rounded text-xs max-h-48 overflow-y-auto">
                                        <pre className="whitespace-pre-wrap">
                                          {typeof testCase.expectedResponse
                                            .body === "string"
                                            ? testCase.expectedResponse.body
                                            : JSON.stringify(
                                                testCase.expectedResponse.body,
                                                null,
                                                2
                                              )}
                                        </pre>
                                      </div>
                                    </div>
                                    <div>
                                      <div className="font-medium text-sm mb-1">
                                        Actual Body:
                                      </div>
                                      <div className="bg-slate-100 p-2 rounded text-xs max-h-48 overflow-y-auto">
                                        <pre className="whitespace-pre-wrap">
                                          {activeTestResult.response?.body
                                            ? typeof activeTestResult.response
                                                .body === "string"
                                              ? activeTestResult.response.body
                                              : JSON.stringify(
                                                  activeTestResult.response
                                                    .body,
                                                  null,
                                                  2
                                                )
                                            : "No response body"}
                                        </pre>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      )}
                    </>
                  );
                })()}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-md p-6 text-center">
            <div className="flex flex-col items-center justify-center space-y-3">
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
              <h3 className="text-lg font-medium">No tests run yet</h3>
              <p className="text-muted-foreground">
                Send a request to see test results and validation reports
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
