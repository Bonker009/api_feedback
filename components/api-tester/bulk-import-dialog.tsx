import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Import } from "lucide-react";
import { BulkImportDialogProps } from "@/app/types/types";

export function BulkImportDialog({
  open,
  setOpen,
  bulkImportText,
  setBulkImportText,
  bulkImportError,
  handleBulkImport,
}: BulkImportDialogProps) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Import className="h-4 w-4 mr-1" />
          Import
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bulk Import Test Cases</DialogTitle>
          <DialogDescription>
            Paste JSON array of test cases to import them in bulk
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="bulk-import">Test Cases JSON</Label>
            <Textarea
              id="bulk-import"
              className="font-mono text-sm h-[400px]"
              placeholder={`[
  {
    "name": "Register - Valid User",
    "description": "Register with valid data",
    "fields": {
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "isRecruiter": true,
      "password": "SecurePass@123",
      "profileImageUrl": "https://example.com/image.jpg"
    }
  },
  {
    "name": "Register - Empty Fields",
    "description": "Test with empty fields",
    "fields": {
      "firstName": "",
      "lastName": "",
      "email": "",
      "isRecruiter": false,
      "password": "",
      "profileImageUrl": ""
    }
  }
]`}
              value={bulkImportText}
              onChange={(e) => setBulkImportText(e.target.value)}
            />
            {bulkImportError && (
              <p className="text-red-500 text-sm">{bulkImportError}</p>
            )}
          </div>

          <div className="bg-amber-50 border border-amber-200 p-2 rounded-md">
            <p className="text-amber-800 text-xs">
              <AlertTriangle className="h-3 w-3 inline mr-1" />
              Test cases will use the current request setup (URL, method,
              headers)
            </p>
            <p className="text-amber-800 text-xs mt-1">
              Add a "fields" object to specify request body fields for each test
              case
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleBulkImport}>Import Test Cases</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
