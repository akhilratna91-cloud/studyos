"use client";

import { motion } from "framer-motion";
import { type ReactNode } from "react";

interface PageHeaderProps {
  tag?: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function PageHeader({ tag, title, subtitle, action }: PageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"
    >
      <div>
        {tag && (
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary-light/70">
            {tag}
          </p>
        )}
        <h1 className="mt-2 font-[family-name:var(--font-heading)] text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-gray-400">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </motion.div>
  );
}
