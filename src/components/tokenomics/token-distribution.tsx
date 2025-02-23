"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, TooltipProps } from 'recharts';

const TOKENOMICS_DATA = [
  { name: 'Open Supply', value: 10, description: 'Available for public trading and liquidity' },
  { name: 'Airdrop', value: 60, description: 'Distributed to $WORM token holders' },
  { name: 'Developer Fund', value: 20, description: '6-month cliff, then linear vesting per block' },
  { name: 'Project Fund', value: 10, description: 'Server costs and LLM infrastructure' },
];

const COLORS = [
  '#B4C5E4', // soft blue
  '#8B9EB7', // muted steel blue
  '#9B8EA9', // dusty lavender
  '#6B5876', // deep purple
];

// Custom tooltip component with proper typing
const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as typeof TOKENOMICS_DATA[0];
    return (
      <div className="bg-nema-dark/95 border border-nema-sand/20 px-4 py-2 rounded-lg shadow-lg backdrop-blur-sm">
        <p className="text-nema-light font-mono">
          {data.name}: {data.value}%
        </p>
      </div>
    );
  }
  return null;
};

export function TokenDistribution() {
  return (
    <>
      <div className="h-[400px] mb-8">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={TOKENOMICS_DATA}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent, x, y }) => (
                <g>
                  <rect
                    x={x - 70}
                    y={y - 25}
                    width={140}
                    height={50}
                    rx={4}
                    fill="rgba(0, 0, 0, 0.75)"
                  />
                  {/* Label text */}
                  <text
                    x={x}
                    y={y}
                    fill="white"
                    textAnchor="middle"
                    dominantBaseline="central"
                  >
                    <tspan x={x} dy="-0.5em" className="font-medium">
                      {name}
                    </tspan>
                    <tspan x={x} dy="1.2em" className="text-sm opacity-80">
                      {(percent * 100).toFixed(0)}%
                    </tspan>
                  </text>
                </g>
              )}
              outerRadius={160}
              dataKey="value"
            >
              {TOKENOMICS_DATA.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  className="stroke-background hover:opacity-80"
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {TOKENOMICS_DATA.map((item, index) => (
          <div
            key={item.name}
            className="p-4 bg-nema-dark/30 rounded-lg border border-nema-sand/20"
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: COLORS[index] }}
              />
              <h3 className="font-medium text-nema-light">{item.name}</h3>
            </div>
            <p className="text-lg font-bold text-nema-sand">{item.value}%</p>
            <p className="text-sm text-nema-light/80">{item.description}</p>
          </div>
        ))}
      </div>
    </>
  );
}
