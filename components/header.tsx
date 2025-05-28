import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";

type HeaderProps = {
  title: string;
  description?: string;
  showBackButton?: boolean;
  showHomeButton?: boolean;
};

export function Header({
  title,
  description,
  showBackButton = false,
  showHomeButton = true,
}: HeaderProps) {
  return (
    <div className="sticky top-0 z-10 bg-white border-b border-gray-200 py-4 px-6">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          {showBackButton && (
            <Link href="/">
              <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
              </Button>
            </Link>
          )}

          {showHomeButton && (
            <Link href="/">
              <Button variant="outline" size="icon">
                <Home className="h-4 w-4" />
                <span className="sr-only">Home</span>
              </Button>
            </Link>
          )}

          <div>
            <h1 className="text-xl font-bold">{title}</h1>
            {description && (
              <p className="text-sm text-gray-500">{description}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
