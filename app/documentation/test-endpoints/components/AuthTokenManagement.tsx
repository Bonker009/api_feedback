import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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
import { Key, Plus, Trash2, Shield } from "lucide-react";
import type { AuthToken } from "../types";

interface AuthTokenManagementProps {
  authTokens: AuthToken[];
  selectedTokenId: string;
  onSelectToken: (tokenId: string) => void;
  onAddToken: (token: Omit<AuthToken, "id" | "createdAt">) => boolean;
  onDeleteToken: (id: string) => void;
  getSelectedToken: () => AuthToken | null;
}

export function AuthTokenManagement({
  authTokens,
  selectedTokenId,
  onSelectToken,
  onAddToken,
  onDeleteToken,
  getSelectedToken,
}: AuthTokenManagementProps) {
  const [tokenDialogOpen, setTokenDialogOpen] = useState(false);
  const [newTokenName, setNewTokenName] = useState("");
  const [newTokenValue, setNewTokenValue] = useState("");
  const [newTokenType, setNewTokenType] = useState<
    "Bearer" | "API Key" | "Basic"
  >("Bearer");
  const [newTokenDescription, setNewTokenDescription] = useState("");

  const handleAddToken = () => {
    const success = onAddToken({
      name: newTokenName,
      token: newTokenValue,
      type: newTokenType,
      description: newTokenDescription,
    });

    if (success) {
      // Clear form
      setNewTokenName("");
      setNewTokenValue("");
      setNewTokenType("Bearer");
      setNewTokenDescription("");
      setTokenDialogOpen(false);
    }
  };

  return (
    <Card className="border-2 border-blue-100">
      <CardHeader className="pb-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg">Authorization</CardTitle>
          </div>
          <Dialog open={tokenDialogOpen} onOpenChange={setTokenDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
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
                    onChange={(e) => setNewTokenName(e.target.value)}
                    placeholder="e.g., Production API Key"
                  />
                </div>
                <div>
                  <Label htmlFor="token-type">Type</Label>
                  <Select
                    value={newTokenType}
                    onValueChange={(value: any) => setNewTokenType(value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Bearer">Bearer Token</SelectItem>
                      <SelectItem value="API Key">API Key</SelectItem>
                      <SelectItem value="Basic">Basic Auth</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="token-value">Token Value *</Label>
                  <Textarea
                    id="token-value"
                    value={newTokenValue}
                    onChange={(e) => setNewTokenValue(e.target.value)}
                    placeholder="Paste your token here..."
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="token-description">Description</Label>
                  <Input
                    id="token-description"
                    value={newTokenDescription}
                    onChange={(e) => setNewTokenDescription(e.target.value)}
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
                  onClick={handleAddToken}
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
            <p className="text-xs">Add your first auth token to get started</p>
          </div>
        ) : (
          <>
            <div>
              <Label>Select Token</Label>
              <Select value={selectedTokenId} onValueChange={onSelectToken}>
                <SelectTrigger className="w-full mt-2">
                  <SelectValue placeholder="Choose an auth token" />
                </SelectTrigger>
                <SelectContent>
                  {authTokens.map((token) => (
                    <SelectItem key={token.id} value={token.id}>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
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
                        <Badge variant="outline" className="text-xs">
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
                      onClick={() => onDeleteToken(token.id)}
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
  );
}
