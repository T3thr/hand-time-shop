'use client'
import React from "react";
import Link from "next/link";
import { 
  Home, Tag, Sparkles, Settings, ChevronRight, Heart
} from "lucide-react";

const defaultSidebarLinks = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/categories", icon: Tag, label: "Categories" },
  { href: "/new-arrivals", icon: Sparkles, label: "New Arrivals" },
  { href: "/account", icon: Settings, label: "Account Settings" },
  { href: "/wishlist", icon: Heart, label: "Wishlist" },
];

export default function SideBar({ 
  sidebarLinks = defaultSidebarLinks, 
  onLinkClick, 
  className = "" 
}) {
  return (
    <div className={`space-y-1 px-3 ${className}`}>
      {sidebarLinks.map(({ href, icon: Icon, label }) => (
        <Link
          key={href}
          href={href}
          className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-container transition-colors group"
          onClick={onLinkClick}
        >
          <Icon className="h-5 w-5 text-text-secondary group-hover:text-primary" />
          <span className="flex-1 text-foreground">{label}</span>
          <ChevronRight className="h-4 w-4 text-text-tertiary group-hover:text-primary" />
        </Link>
      ))}
    </div>
  );
}