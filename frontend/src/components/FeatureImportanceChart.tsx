import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ArrowUpDown, HelpCircle } from 'lucide-react';
import { FeatureImportance } from '../types';

interface FeatureImportanceChartProps {
  items: FeatureImportance[];
}

export const FeatureImportanceChart: React.FC<FeatureImportanceChartProps> = ({ items }) => {
  const [ascending, setAscending] = useState(false);

  const sortedData = [...items].sort((a, b) => 
    ascending ? a.importance - b.importance : b.importance - a.importance
  );

  return (
    <div className="rounded-3xl bg-white dark:bg-deep/40 border border-line p-6 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h3 className="font-serif font-semibold text-lg text-deep flex items-center gap-2">
            Influential Predictive Factors
            <span className="text-xs font-sans font-normal text-soft">
              (Random Forest Ensemble)
            </span>
          </h3>
          <p className="text-xs text-mid">
            Gini impurity reduction across 300 decision trees
          </p>
        </div>

        <button
          type="button"
          onClick={() => setAscending(!ascending)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-sky border border-line text-mid hover:text-deep transition-colors self-start sm:self-auto cursor-pointer"
        >
          <ArrowUpDown className="w-3.5 h-3.5" />
          <span>{ascending ? 'Ascending' : 'Descending'}</span>
        </button>
      </div>

      {/* Accessible summary for screen readers */}
      <div className="sr-only">
        Top predictive parameters: {sortedData.slice(0, 3).map(d => `${d.label} (${d.percentage.toFixed(1)}%)`).join(', ')}.
      </div>

      {/* Horizontal Bar Chart */}
      <div className="h-80 w-full" aria-hidden="true">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={sortedData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
          >
            <XAxis
              type="number"
              domain={[0, 'dataMax + 0.05']}
              tickFormatter={(val) => `${(val * 100).toFixed(0)}%`}
              stroke="var(--soft)"
              fontSize={11}
            />
            <YAxis
              type="category"
              dataKey="label"
              stroke="var(--soft)"
              fontSize={11}
              width={110}
              tickLine={false}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload as FeatureImportance;
                  return (
                    <div className="p-3 bg-white dark:bg-deep text-deep rounded-xl shadow-xl text-xs space-y-1 border border-line max-w-xs">
                      <div className="font-serif font-semibold text-sea flex justify-between">
                        <span>{data.label}</span>
                        <span>#{data.rank}</span>
                      </div>
                      <div className="text-mid text-[11px]">
                        Relative Weight: <strong className="text-deep font-semibold">{data.percentage.toFixed(2)}%</strong>
                      </div>
                      <p className="text-soft text-[10px] italic border-t border-line pt-1">
                        {data.description}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="importance" radius={[0, 6, 6, 0]}>
              {sortedData.map((_entry, index) => {
                const color = index === 0 
                  ? 'var(--sea)' 
                  : index === 1 
                  ? '#2aa6b5' 
                  : index < 5 
                  ? '#549ca8' 
                  : 'var(--soft)';
                return <Cell key={`cell-${index}`} fill={color} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Scientific Disclaimer */}
      <div className="mt-4 pt-4 border-t border-line flex items-start gap-2 text-[11px] text-soft leading-relaxed">
        <HelpCircle className="w-4 h-4 text-soft shrink-0 mt-0.5" />
        <span>
          <strong>Methodology Note:</strong> Feature importance indicates which variables contributed most to tree splits within the Random Forest model. It represents mathematical correlation within the dataset and does not establish independent ecological causation.
        </span>
      </div>
    </div>
  );
};
