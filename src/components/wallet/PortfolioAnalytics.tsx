import React, { useState, useEffect } from 'react';
//import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
//import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts/umd/Recharts';
import { TrendingUp, DollarSign, Percent, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ResponsiveContainer, XAxis, YAxis, Tooltip, Area, Line, AreaChart, LineChart } from 'recharts';

interface PortfolioData {
  timestamp: number;
  totalValue: number;
  solValue: number;
  tokenValue: number;
  nftValue: number;
}

interface PerformanceMetric {
  label: string;
  value: string;
  change: number;
  icon: React.ReactNode;
}

export function PortfolioAnalytics() {
  const [timeframe, setTimeframe] = useState<'24h' | '7d' | '30d' | 'all'>('7d');
  const [portfolioData, setPortfolioData] = useState<PortfolioData[]>([]);
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPortfolioData();
  }, [timeframe]);

  const fetchPortfolioData = async () => {
    setIsLoading(true);
    try {
      // Simulated data - in production, fetch from your backend
      const now = Date.now();
      const data: PortfolioData[] = Array.from({ length: 30 }, (_, i) => ({
        timestamp: now - (29 - i) * 24 * 60 * 60 * 1000,
        totalValue: 1000 + Math.random() * 500,
        solValue: 600 + Math.random() * 300,
        tokenValue: 300 + Math.random() * 150,
        nftValue: 100 + Math.random() * 50,
      }));

      setPortfolioData(data);
      calculateMetrics(data);
    } catch (error) {
      console.error('Error fetching portfolio data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateMetrics = (data: PortfolioData[]) => {
    const latest = data[data.length - 1];
    const earliest = data[0];
    const percentChange = ((latest.totalValue - earliest.totalValue) / earliest.totalValue) * 100;

    const newMetrics: PerformanceMetric[] = [
      {
        label: 'Total Value',
        value: `$${latest.totalValue.toFixed(2)}`,
        change: percentChange,
        icon: <DollarSign className="w-5 h-5" />
      },
      {
        label: 'SOL Holdings',
        value: `$${latest.solValue.toFixed(2)}`,
        change: ((latest.solValue - earliest.solValue) / earliest.solValue) * 100,
        icon: <TrendingUp className="w-5 h-5" />
      },
      {
        label: 'Token Value',
        value: `$${latest.tokenValue.toFixed(2)}`,
        change: ((latest.tokenValue - earliest.tokenValue) / earliest.tokenValue) * 100,
        icon: <Percent className="w-5 h-5" />
      },
      {
        label: 'NFT Value',
        value: `$${latest.nftValue.toFixed(2)}`,
        change: ((latest.nftValue - earliest.nftValue) / earliest.nftValue) * 100,
        icon: <Clock className="w-5 h-5" />
      }
    ];

    setMetrics(newMetrics);
  };

  const formatDate = (timestamp: string | number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Portfolio Analytics
          </CardTitle>
          <div className="flex gap-2">
            {['24h', '7d', '30d', 'all'].map((period) => (
              <button
                key={period}
                onClick={() => setTimeframe(period as any)}
                className={`px-3 py-1 rounded-lg text-sm ${
                  timeframe === period
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {metrics.map((metric, index) => (
            <div
              key={index}
              className="p-4 border rounded-lg bg-white hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-full bg-blue-50">
                  {metric.icon}
                </div>
                <span className="text-sm text-gray-600">{metric.label}</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold">{metric.value}</span>
                <span className={`text-sm ${
                  metric.change >= 0 ? 'text-green-500' : 'text-red-500'
                }`}>
                  {metric.change >= 0 ? '+' : ''}{metric.change.toFixed(2)}%
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="h-[400px] mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={portfolioData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis
                dataKey="timestamp"
                tickFormatter={formatDate}
                stroke="#94A3B8"
              />
              <YAxis stroke="#94A3B8" />
              <Tooltip
                contentStyle={{ background: 'white', border: 'none', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                labelFormatter={formatDate}
              />
              <Area
                type="monotone"
                dataKey="totalValue"
                stroke="#3B82F6"
                fill="url(#colorValue)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={portfolioData}>
              <XAxis
                dataKey="timestamp"
                tickFormatter={formatDate}
                stroke="#94A3B8"
              />
              <YAxis stroke="#94A3B8" />
              <Tooltip
                contentStyle={{ background: 'white', border: 'none', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                labelFormatter={formatDate}
              />
              <Line
                type="monotone"
                dataKey="solValue"
                stroke="#3B82F6"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="tokenValue"
                stroke="#10B981"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="nftValue"
                stroke="#6366F1"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}