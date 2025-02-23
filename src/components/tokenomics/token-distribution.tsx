"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Card } from '@/components/ui/card';

const TOKENOMICS_DATA = [
  { name: 'Open Supply', value: 10, description: 'Available for public trading and liquidity' },
  { name: 'Airdrop', value: 60, description: 'Distributed to $WORM token holders' },
  { name: 'Developer Fund', value: 20, description: '6-month cliff, then linear vesting per block' },
  { name: 'Project Fund', value: 10, description: 'Server costs and LLM infrastructure' },
];

const COLORS = ['#39ff14', '#00ff00', '#00cc00', '#009900'];

// Custom tooltip component
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-matrix-dark/95 border border-matrix-green/30 px-4 py-2 rounded-lg shadow-lg">
        <p className="text-matrix-light-green font-mono">
          {data.name}: {data.value}%
        </p>
      </div>
    );
  }
  return null;
};

export function TokenDistribution() {
  return (
    <Card className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-2xl font-code mb-4">Tokenomics</h2>
        <p className="text-lg text-matrix-light-green/90">
          Total Supply: 1,000,000,000 $NEMA
        </p>
      </div>

      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={TOKENOMICS_DATA}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={150}
              fill="#00ff00"
              dataKey="value"
              label={({ name, value }) => `${name} ${value}%`}
            >
              {TOKENOMICS_DATA.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  style={{
                    filter: 'drop-shadow(0 0 8px rgba(0, 255, 0, 0.3))',
                    strokeWidth: 2,
                  }}
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
            className="p-4 bg-matrix-black/30 rounded-lg border border-matrix-green/20"
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: COLORS[index] }}
              />
              <h3 className="font-medium text-matrix-light-green">{item.name}</h3>
            </div>
            <p className="text-lg font-bold text-matrix-green">{item.value}%</p>
            <p className="text-sm text-matrix-green/80">{item.description}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
