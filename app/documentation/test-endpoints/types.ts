export interface AuthToken {
  id: string;
  name: string;
  token: string;
  type: "Bearer" | "API Key" | "Basic";
  description?: string;
  createdAt: Date;
}

export interface TestCase {
  name: string;
  description: string;
  method: string;
  endpoint: string;
  headers?: Record<string, string>;
  body?: any;
  expectedStatus: number;
  expectedResponse?: any;
}

export interface TestResult {
  testCase: TestCase;
  status: number;
  ok: boolean;
  response: any;
  duration: number;
  error?: string;
}

export interface ApiSpec {
  id: string;
  title: string;
  version: string;
  lastModified: string;
}

export interface ApiEndpoint {
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

export interface EndpointGroup {
  tag: string;
  endpoints: ApiEndpoint[];
}

export interface ApiTesterState {
  authTokens: AuthToken[];
  selectedTokenId: string;
  apiBaseUrl: string;
  testCases: TestCase[];
  testCasesJson: string;
  results: TestResult[];
  loading: boolean;
  runningTestIndex: number | null;
  apiSpecs: ApiSpec[];
  selectedSpecId: string;
  apiSpecData: any;
  endpointGroups: EndpointGroup[];
  selectedEndpoints: Set<string>;
  expandedGroups: Set<string>;
  loadingSpec: boolean;
}
