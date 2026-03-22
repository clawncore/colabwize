import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getFromAndTo(page: number, itemPerPage: number) {
  let from = page * itemPerPage;
  let to = from + itemPerPage - 1;

  return { from, to };
}

export function formatChatDate(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  
  // Reset times to compare dates only
  const dDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const dNow = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const diffTime = dNow.getTime() - dDate.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "TODAY";
  if (diffDays === 1) return "YESTERDAY";
  if (diffDays < 7) {
    return date.toLocaleDateString("en-US", { weekday: "long" }).toUpperCase();
  }
  
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).toUpperCase();
}
