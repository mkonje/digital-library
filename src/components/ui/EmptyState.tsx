// src/components/ui/EmptyState.tsx
import React from 'react';
import { BookOpen } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = <BookOpen className="w-10 h-10 text-charcoal-400" />,
  title,
  description,
  actionText,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-warm-100 dark:bg-charcoal-800/80 flex items-center justify-center mb-4 text-terracotta-600 dark:text-terracotta-400">
        {icon}
      </div>
      <h3 className="font-editorial text-lg font-semibold text-charcoal-900 dark:text-white mb-1">
        {title}
      </h3>
      <p className="text-sm text-charcoal-500 dark:text-charcoal-400 max-w-sm mb-6">
        {description}
      </p>
      {actionText && onAction && (
        <Button variant="outline" size="sm" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
};
