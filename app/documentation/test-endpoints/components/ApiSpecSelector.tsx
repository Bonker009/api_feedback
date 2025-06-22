import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText, Server } from "lucide-react";
import type { ApiSpec, EndpointGroup } from "../types";

interface ApiSpecSelectorProps {
  apiSpecs: ApiSpec[];
  selectedSpecId: string;
  onSelectSpec: (specId: string) => void;
  apiSpecData: any;
  endpointGroups: EndpointGroup[];
  loadingSpec: boolean;
}

export function ApiSpecSelector({
  apiSpecs,
  selectedSpecId,
  onSelectSpec,
  apiSpecData,
  endpointGroups,
  loadingSpec,
}: ApiSpecSelectorProps) {
  return (
    <Card className="border-2 border-purple-100">
      <CardHeader className="pb-0">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-purple-600" />
          <CardTitle className="text-lg">API Specification</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col space-y-4">
        <div>
          <Label>Select API Spec</Label>
          <Select value={selectedSpecId} onValueChange={onSelectSpec}>
            <SelectTrigger className="w-full mt-2">
              <SelectValue placeholder="Choose an API specification" />
            </SelectTrigger>
            <SelectContent>
              {apiSpecs.map((spec) => (
                <SelectItem key={spec.id} value={spec.id}>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <div>
                      <div className="font-medium">{spec.title}</div>
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

        {loadingSpec && (
          <div className="p-3 bg-purple-50 border border-purple-200 rounded">
            <div className="text-sm text-purple-600">
              Loading specification...
            </div>
          </div>
        )}

        {apiSpecData && !loadingSpec && (
          <div className="p-3 bg-purple-50 border border-purple-200 rounded">
            <div className="flex items-center gap-2 text-purple-700">
              <Server className="h-4 w-4" />
              <span className="text-sm font-medium">Loaded Spec</span>
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
  );
}
