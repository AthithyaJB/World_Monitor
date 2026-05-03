"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Globe,
  Rss,
  BarChart3,
  ShoppingBag,
  Sparkles,
  Activity,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: Globe },
  { href: "/dashboard/feed", label: "Live Feed", icon: Rss },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/products", label: "Products", icon: ShoppingBag },
  { href: "/dashboard/command", label: "AI Command", icon: Sparkles },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-full w-64 flex-col border-r border-border bg-card">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-border px-6">
        <Activity className="h-6 w-6 text-accent" />
        <div>
          <h1 className="text-sm font-bold tracking-tight text-foreground">
            BEAUTY MONITOR
          </h1>
          <p className="text-[10px] uppercase tracking-widest text-muted">
            Global Intelligence
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                isActive
                  ? "bg-accent/10 text-accent-light"
                  : "text-muted hover:bg-card-hover hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
              {item.label === "Live Feed" && (
                <span className="ml-auto h-2 w-2 rounded-full bg-success animate-pulse-dot" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Status */}
      <div className="border-t border-border p-4">
        <div className="flex items-center gap-2 text-xs text-muted">
          <span className="h-2 w-2 rounded-full bg-success" />
          <span>All systems operational</span>
        </div>
      </div>
    </aside>
  );
}
