/**
 * 工具函数库
 * @module Utils
 */
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * 合并className工具函数
 * @param {...ClassValue[]} inputs - 需要合并的className
 * @returns {string} 合并后的className
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
} 