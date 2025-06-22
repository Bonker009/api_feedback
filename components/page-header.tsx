"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";

const pageConfig = {
  "/": {
    title: "KSHRD Center",
    description:
      "Korea Software HRD Center - Empowering Digital Innovation in Cambodia",
  },
  "/upload": {
    title: "Upload OpenAPI Specification",
    description: "Upload or fetch your API specification",
  },
  "/documentation": {
    title: "API Documentation",
    description: "View and manage your API endpoints",
  },
  "/documentation/test-endpoints": {
    title: "API Auto Tester",
    description: "Run automated tests for your API endpoints",
  },
};

export function PageHeader() {
  const pathname = usePathname();
  const [dynamicTitle, setDynamicTitle] = useState<string | null>(null);

  // Handle dynamic documentation routes like /documentation/[id]
  let config = pageConfig[pathname as keyof typeof pageConfig];

  useEffect(() => {
    // Check if we're on a dynamic documentation page
    if (
      pathname.startsWith("/documentation/") &&
      pathname !== "/documentation/test-endpoints" &&
      pathname !== "/documentation"
    ) {
      const specId = pathname.split("/documentation/")[1];

      // Try to fetch the spec title for dynamic routes
      fetch(`/api/data?type=spec&id=${specId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data?.info?.title) {
            setDynamicTitle(data.info.title);
          }
        })
        .catch(() => {
          // Fallback to default if fetch fails
          setDynamicTitle(null);
        });
    } else {
      setDynamicTitle(null);
    }
  }, [pathname]);

  if (
    !config &&
    pathname.startsWith("/documentation/") &&
    pathname !== "/documentation/test-endpoints"
  ) {
    config = {
      title: dynamicTitle || "API Documentation",
      description: "View and manage your API endpoints",
    };
  }

  if (!config) {
    config = {
      title: "KSHRD Center",
      description:
        "Korea Software HRD Center - Empowering Digital Innovation in Cambodia",
    };
  }

  return (
    <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <div>
            <h1 className="text-xl font-bold text-gray-900">{config.title}</h1>
            <p className="text-sm text-gray-600">{config.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
