import React from "react";

// Simple utility to merge class names
function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

// Simple variant class mapping (replaces class-variance-authority)
const badgeStyles = {
  default:
    "border-transparent bg-blue-600 text-white hover:bg-blue-700",
  secondary:
    "border-transparent bg-gray-200 text-gray-800 hover:bg-gray-300",
  destructive:
    "border-transparent bg-red-600 text-white hover:bg-red-700",
  outline:
    "border border-gray-300 text-gray-700",
};

export function Badge({ className = "", variant = "default", ...props }) {
  const variantClass = badgeStyles[variant] || badgeStyles.default;

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
        variantClass,
        className
      )}
      {...props}
    />
  );
}
