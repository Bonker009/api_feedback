import { useState, useEffect } from "react";
import { toast } from "sonner";
import { fetchData, listSpecs } from "@/lib/data-service";
import type { ApiSpec, EndpointGroup, ApiEndpoint } from "../types";

export function useApiSpecs() {
  const [apiSpecs, setApiSpecs] = useState<ApiSpec[]>([]);
  const [selectedSpecId, setSelectedSpecId] = useState<string>("");
  const [apiSpecData, setApiSpecData] = useState<any>(null);
  const [endpointGroups, setEndpointGroups] = useState<EndpointGroup[]>([]);
  const [selectedEndpoints, setSelectedEndpoints] = useState<Set<string>>(
    new Set(),
  );
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [loadingSpec, setLoadingSpec] = useState(false);

  // Load available API specs
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

  return {
    apiSpecs,
    selectedSpecId,
    setSelectedSpecId,
    apiSpecData,
    endpointGroups,
    selectedEndpoints,
    expandedGroups,
    loadingSpec,
    loadApiSpecs,
    toggleEndpointSelection,
    toggleGroupExpansion,
    selectAllEndpoints,
    deselectAllEndpoints,
  };
}
