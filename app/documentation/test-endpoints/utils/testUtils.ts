import type { TestCase, EndpointGroup, ApiEndpoint } from "../types";

// Helper function to get expected status from OpenAPI responses
export const getExpectedStatusFromResponses = (responses: any): number => {
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
export const generateSampleRequestBody = (requestBody: any): any => {
  if (!requestBody?.content) return {};

  const jsonContent = requestBody.content["application/json"];
  if (!jsonContent?.schema) return {};

  return generateSampleFromSchema(jsonContent.schema);
};

// Generate sample data from OpenAPI schema
export const generateSampleFromSchema = (schema: any): any => {
  if (!schema) return {};

  if (schema.type === "object" && schema.properties) {
    const sample: any = {};
    Object.entries(schema.properties).forEach(([key, prop]: [string, any]) => {
      sample[key] = generateSampleValue(prop);
    });
    return sample;
  }

  return generateSampleValue(schema);
};

export const generateSampleValue = (schema: any): any => {
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

// Generate test cases from selected endpoints
export const generateTestsFromEndpoints = (
  endpointGroups: EndpointGroup[],
  selectedEndpoints: Set<string>,
): TestCase[] => {
  const generatedTests: TestCase[] = [];

  endpointGroups.forEach((group) => {
    group.endpoints.forEach((endpoint) => {
      const endpointKey = `${endpoint.method}:${endpoint.path}`;
      if (selectedEndpoints.has(endpointKey)) {
        const testCase: TestCase = {
          name: endpoint.summary || `${endpoint.method} ${endpoint.path}`,
          description:
            endpoint.description || `Test ${endpoint.method} ${endpoint.path}`,
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

  return generatedTests;
};

// Generate sample test cases
export const generateSampleTests = (): TestCase[] => {
  return [
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
};
