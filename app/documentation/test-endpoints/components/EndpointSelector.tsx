import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Code, ChevronDown, ChevronRight } from "lucide-react";
import type { EndpointGroup } from "../types";

interface EndpointSelectorProps {
  endpointGroups: EndpointGroup[];
  selectedEndpoints: Set<string>;
  expandedGroups: Set<string>;
  onToggleEndpoint: (path: string, method: string) => void;
  onToggleGroup: (tag: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
}

export function EndpointSelector({
  endpointGroups,
  selectedEndpoints,
  expandedGroups,
  onToggleEndpoint,
  onToggleGroup,
  onSelectAll,
  onDeselectAll,
}: EndpointSelectorProps) {
  if (endpointGroups.length === 0) {
    return null;
  }

  const getMethodColor = (method: string) => {
    switch (method) {
      case "GET":
        return "text-blue-600 border-blue-200";
      case "POST":
        return "text-green-600 border-green-200";
      case "PUT":
        return "text-yellow-600 border-yellow-200";
      case "DELETE":
        return "text-red-600 border-red-200";
      default:
        return "text-gray-600 border-gray-200";
    }
  };

  return (
    <Card className="border-2 border-orange-100">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code className="h-5 w-5 text-orange-600" />
            <CardTitle className="text-lg">Select Endpoints</CardTitle>
          </div>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="outline"
              onClick={onSelectAll}
              className="h-7 text-xs"
            >
              All
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onDeselectAll}
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
            onOpenChange={() => onToggleGroup(group.tag)}
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
                const isSelected = selectedEndpoints.has(endpointKey);
                return (
                  <div
                    key={endpointKey}
                    className="flex items-start gap-2 p-2 border rounded hover:bg-gray-50"
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() =>
                        onToggleEndpoint(endpoint.path, endpoint.method)
                      }
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge
                          variant="outline"
                          className={`text-xs ${getMethodColor(endpoint.method)}`}
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
  );
}
