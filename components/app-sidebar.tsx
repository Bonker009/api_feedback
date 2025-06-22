import {
  Calendar,
  Database,
  Home,
  Upload,
  FileText,
  Search,
  Settings,
  TestTube,
  BarChart,
} from "lucide-react";
import Link from "next/link";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

// Menu items.
const items = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
  {
    title: "Upload API Spec",
    url: "/upload",
    icon: Upload,
  },
  {
    title: "Documentation",
    url: "/documentation",
    icon: FileText,
  },
  {
    title: "Test Endpoints",
    url: "/documentation/test-endpoints",
    icon: TestTube,
  },
  {
    title: "Database Schema",
    url: "/database-schema",
    icon: Database,
  },
  {
    title: "Analytics",
    url: "#",
    icon: BarChart,
  },
  {
    title: "Search",
    url: "#",
    icon: Search,
  },
  {
    title: "Settings",
    url: "#",
    icon: Settings,
  },
];

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
