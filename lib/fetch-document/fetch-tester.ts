"use server";
interface FetchTesterResponse<T> {
  data: T | null;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  responseTime: number;
  error?: string;
}

export async function FetchTester<T = any>(
  url: string,
  requestOptions: RequestInit
): Promise<FetchTesterResponse<T>> {
  const startTime = performance.now();

  try {
    const response = await fetch(url, requestOptions);
    const endTime = performance.now();
    const responseTime = Math.round(endTime - startTime);

    const headers: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });

    let data = null;
    const contentType = response.headers.get("content-type");

    if (contentType?.includes("application/json")) {
      data = await response.json();
    } else {
      const textData = await response.text();
      try {
        data = JSON.parse(textData);
      } catch {
        data = textData as unknown as T;
      }
    }

    return {
      data,
      status: response.status,
      statusText: response.statusText,
      headers,
      responseTime,
    };
  } catch (error) {
    console.error("API request failed:", error);

    return {
      data: null,
      status: 0,
      statusText: "Request failed",
      headers: {},
      responseTime: 0,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
