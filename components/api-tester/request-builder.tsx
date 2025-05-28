"use client";

import type React from "react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  Form,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Send, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { UseFormReturn } from "react-hook-form";

export interface RequestBuilderProps {
  method: string;
  apiData: any;
  path: string;
  requestSample?: any;
  form: UseFormReturn<any>;
  loading: boolean;
  requestBody: string;
  requestHeaders: Record<string, string>;
  activeAuthOption: string | null;
  setRequestBody: React.Dispatch<React.SetStateAction<string>>;
  setRequestHeaders: React.Dispatch<
    React.SetStateAction<Record<string, string>>
  >;
  executeRequest: () => Promise<void>;
}

export function RequestBuilder({
  method,
  apiData,
  path,
  requestSample,
  form,
  loading,
  requestBody,
  requestHeaders,
  activeAuthOption,
  setRequestBody,
  setRequestHeaders,
  executeRequest,
}: RequestBuilderProps) {
  // Add internal handlers for headers
  const handleAddHeader = () => {
    setRequestHeaders((prev) => ({
      ...prev,
      "": "",
    }));
  };

  const handleRemoveHeader = (key: string) => {
    setRequestHeaders((prev) => {
      const newHeaders = { ...prev };
      delete newHeaders[key];
      return newHeaders;
    });
  };

  const handleHeaderChange = (
    oldKey: string,
    newKey: string,
    newValue: string
  ) => {
    setRequestHeaders((prev) => {
      // Create a new headers object
      const newHeaders: Record<string, string> = {};

      // Copy all headers except the one being changed
      Object.entries(prev).forEach(([k, v]) => {
        if (k !== oldKey) {
          newHeaders[k] = v;
        }
      });

      // Add the changed/new header
      if (newKey.trim()) {
        newHeaders[newKey] = newValue;
      }

      return newHeaders;
    });
  };

  useEffect(() => {
    console.log("Form values set:", {
      url: path,
      method: method,
      headers: requestHeaders,
      body: requestBody,
    });
  }, [path, method, requestHeaders, requestBody]);

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Send className="h-4 w-4 mr-2" />
          Request Builder
        </CardTitle>
        <CardDescription>Configure and send your API request</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Wrap the form in a Form component */}
        <Form {...form}>
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge
                  className={cn(
                    "px-2 py-1 text-xs font-bold",
                    method === "GET"
                      ? "bg-blue-100 text-blue-800"
                      : method === "POST"
                      ? "bg-green-100 text-green-800"
                      : method === "PUT"
                      ? "bg-yellow-100 text-yellow-800"
                      : method === "DELETE"
                      ? "bg-red-100 text-red-800"
                      : "bg-gray-100 text-gray-800"
                  )}
                >
                  {method.toUpperCase()}
                </Badge>
                <FormField
                  control={form.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input placeholder="API URL" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Tabs defaultValue="params">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="params">Parameters</TabsTrigger>
                  <TabsTrigger value="headers">Headers</TabsTrigger>
                  <TabsTrigger value="body">Body</TabsTrigger>
                </TabsList>

                <TabsContent value="params">
                  <div className="p-4 text-center text-sm text-gray-500">
                    Path parameters are included in the URL
                  </div>
                </TabsContent>

                <TabsContent value="headers">
                  <div className="space-y-2">
                    {Object.entries(requestHeaders).map(
                      ([key, value], index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Input
                            placeholder="Header name"
                            value={key}
                            onChange={(e) =>
                              handleHeaderChange(key, e.target.value, value)
                            }
                            className="flex-1"
                          />
                          <Input
                            placeholder="Value"
                            value={value}
                            onChange={(e) =>
                              handleHeaderChange(key, key, e.target.value)
                            }
                            className="flex-1"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveHeader(key)}
                            className="px-2"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      )
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAddHeader}
                      className="mt-2"
                    >
                      Add Header
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="body">
                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="body"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Textarea
                              placeholder="Request body (JSON)"
                              className="font-mono text-sm h-[200px]"
                              value={requestBody}
                              onChange={(e) => {
                                setRequestBody(e.target.value);
                                field.onChange(e);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {requestSample && (
                      <div className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setRequestBody(
                              JSON.stringify(requestSample, null, 2)
                            );
                            form.setValue(
                              "body",
                              JSON.stringify(requestSample, null, 2)
                            );
                          }}
                          type="button"
                        >
                          Reset to sample
                        </Button>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div>
          {activeAuthOption && (
            <Badge
              variant="outline"
              className="bg-blue-50 text-blue-800 border-blue-200"
            >
              Auth: {activeAuthOption}
            </Badge>
          )}
        </div>
        <Button
          onClick={executeRequest}
          disabled={loading}
          className="flex items-center bg-red-400 hover:bg-red-500"
          type="button"
        >
          {loading ? (
            <>Loading...</>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Send Request
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
