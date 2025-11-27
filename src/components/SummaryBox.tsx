'use client';

import { Lightbulb } from 'lucide-react';

interface SummaryBoxProps {
  summary: string;
  keyPoints: string[];
}

export function SummaryBox({ summary, keyPoints }: SummaryBoxProps) {
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 dark:border-amber-900 dark:bg-amber-950">
      <div className="flex gap-4">
        <Lightbulb className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-semibold text-amber-900 dark:text-amber-200 mb-2">
            AI Summary
          </h3>
          <p className="text-sm text-amber-800 dark:text-amber-300 mb-4">
            {summary}
          </p>

          {keyPoints.length > 0 && (
            <div>
              <h4 className="font-semibold text-amber-900 dark:text-amber-200 mb-2 text-sm">
                Key Points
              </h4>
              <ul className="space-y-1">
                {keyPoints.map((point, i) => (
                  <li
                    key={i}
                    className="text-sm text-amber-800 dark:text-amber-300 flex gap-2"
                  >
                    <span className="flex-shrink-0">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
