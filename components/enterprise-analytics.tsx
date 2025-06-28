'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  Activity,
  DollarSign,
  Users,
  Server,
  Shield,
  Globe,
  Clock,
  Target,
  Award,
  Crown,
  Zap,
  Rocket,
  Brain,
  Eye,
  Gauge,
  Network,
  HardDrive,
  Cpu,
  MemoryStick,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Calendar,
  Filter,
  Download,
  Share2,
  Settings,
} from 'lucide-react';

interface AnalyticsData {
  revenue: {
    current: number;
    previous: number;
    growth: number;
    mrr: number;
    arr: number;
    projections: number[];
  };
  users: {
    total: number;
    active: number;
    new: number;
    churn: number;
    growth: number;
  };
  performance: {
    uptime: number;
    responseTime: number;
    throughput: number;
    errors: number;
  };
  security: {
    score: number;
    threats: number;
    incidents: number;
    compliance: number;
  };
  infrastructure: {
    nodes: number;
    utilization: number;
    capacity: number;
    efficiency: number;
  };
}

export default function EnterpriseAnalytics() {
  const [data, setData] = useState<AnalyticsData>({
    revenue: {
      current: 0,
      previous: 0,
      growth: 0,
      mrr: 0,
      arr: 0,
      projections: [],
    },
    users: { total: 0, active: 0, new: 0, churn: 0, growth: 0 },
    performance: { uptime: 0, responseTime: 0, throughput: 0, errors: 0 },
    security: { score: 0, threats: 0, incidents: 0, compliance: 0 },
    infrastructure: { nodes: 0, utilization: 0, capacity: 0, efficiency: 0 },
  });
  const [timeRange, setTimeRange] = useState('30d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setData({
        revenue: {
          current: 125847.5,
          previous: 111234.0,
          growth: 13.1,
          mrr: 125847.5,
          arr: 1510170.0,
          projections: [130000, 135000, 140000, 145000, 150000],
        },
        users: {
          total: 892,
          active: 856,
          new: 47,
          churn: 1.8,
          growth: 5.6,
        },
        performance: {
          uptime: 99.99,
          responseTime: 12.3,
          throughput: 2.4,
          errors: 0.01,
        },
        security: {
          score: 98.5,
          threats: 23,
          incidents: 1,
          compliance: 99.97,
        },
        infrastructure: {
          nodes: 24,
          utilization: 78.5,
          capacity: 85.2,
          efficiency: 92.1,
        },
      });
      setLoading(false);
    };

    loadAnalytics();
  }, [timeRange]);

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? (
      <TrendingUp className='h-4 w-4' />
    ) : (
      <TrendingDown className='h-4 w-4' />
    );
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <RefreshCw className='h-8 w-8 animate-spin' />
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold flex items-center gap-2'>
            <BarChart3 className='h-6 w-6' />
            Enterprise Analytics
          </h2>
          <p className='text-muted-foreground'>
            Real-time business intelligence and performance metrics
          </p>
        </div>
        <div className='flex items-center space-x-2'>
          <Button variant='outline' size='sm'>
            <Filter className='h-4 w-4 mr-2' />
            Filter
          </Button>
          <Button variant='outline' size='sm'>
            <Download className='h-4 w-4 mr-2' />
            Export
          </Button>
          <Button variant='outline' size='sm'>
            <Share2 className='h-4 w-4 mr-2' />
            Share
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        <Card className='border-l-4 border-l-green-500'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Revenue Growth
            </CardTitle>
            <DollarSign className='h-4 w-4 text-green-600' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              ${data.revenue.current.toLocaleString()}
            </div>
            <div
              className={`flex items-center text-xs ${getGrowthColor(data.revenue.growth)}`}
            >
              {getGrowthIcon(data.revenue.growth)}
              <span className='ml-1'>
                +{data.revenue.growth}% vs last month
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className='border-l-4 border-l-blue-500'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>User Growth</CardTitle>
            <Users className='h-4 w-4 text-blue-600' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{data.users.total}</div>
            <div
              className={`flex items-center text-xs ${getGrowthColor(data.users.growth)}`}
            >
              {getGrowthIcon(data.users.growth)}
              <span className='ml-1'>+{data.users.growth}% this month</span>
            </div>
          </CardContent>
        </Card>

        <Card className='border-l-4 border-l-purple-500'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>System Uptime</CardTitle>
            <Target className='h-4 w-4 text-purple-600' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{data.performance.uptime}%</div>
            <div className='text-xs text-muted-foreground'>
              SLA compliance: {data.security.compliance}%
            </div>
          </CardContent>
        </Card>

        <Card className='border-l-4 border-l-orange-500'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Security Score
            </CardTitle>
            <Shield className='h-4 w-4 text-orange-600' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{data.security.score}/100</div>
            <Progress value={data.security.score} className='mt-2 h-2' />
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue='overview' className='space-y-4'>
        <TabsList className='grid w-full grid-cols-5'>
          <TabsTrigger value='overview'>Overview</TabsTrigger>
          <TabsTrigger value='revenue'>Revenue</TabsTrigger>
          <TabsTrigger value='performance'>Performance</TabsTrigger>
          <TabsTrigger value='security'>Security</TabsTrigger>
          <TabsTrigger value='infrastructure'>Infrastructure</TabsTrigger>
        </TabsList>

        <TabsContent value='overview' className='space-y-4'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <Activity className='h-5 w-5 mr-2' />
                  Business Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <p className='text-sm text-muted-foreground'>MRR</p>
                    <p className='text-2xl font-bold'>
                      ${data.revenue.mrr.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className='text-sm text-muted-foreground'>ARR</p>
                    <p className='text-2xl font-bold'>
                      ${(data.revenue.arr / 1000000).toFixed(1)}M
                    </p>
                  </div>
                  <div>
                    <p className='text-sm text-muted-foreground'>
                      Active Users
                    </p>
                    <p className='text-2xl font-bold'>{data.users.active}</p>
                  </div>
                  <div>
                    <p className='text-sm text-muted-foreground'>Churn Rate</p>
                    <p className='text-2xl font-bold'>{data.users.churn}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <Gauge className='h-5 w-5 mr-2' />
                  System Performance
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div>
                  <div className='flex justify-between text-sm mb-2'>
                    <span>Response Time</span>
                    <span>{data.performance.responseTime}ms</span>
                  </div>
                  <Progress
                    value={100 - data.performance.responseTime / 20}
                    className='h-2'
                  />
                </div>
                <div>
                  <div className='flex justify-between text-sm mb-2'>
                    <span>Throughput</span>
                    <span>{data.performance.throughput} Gbps</span>
                  </div>
                  <Progress
                    value={(data.performance.throughput / 5) * 100}
                    className='h-2'
                  />
                </div>
                <div>
                  <div className='flex justify-between text-sm mb-2'>
                    <span>Error Rate</span>
                    <span>{data.performance.errors}%</span>
                  </div>
                  <Progress
                    value={100 - data.performance.errors}
                    className='h-2'
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value='revenue' className='space-y-4'>
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <DollarSign className='h-5 w-5 mr-2' />
                  Revenue Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <div className='text-center'>
                    <div className='text-3xl font-bold'>
                      ${data.revenue.current.toLocaleString()}
                    </div>
                    <p className='text-sm text-muted-foreground'>
                      Current Month
                    </p>
                  </div>
                  <div className='space-y-2'>
                    <div className='flex justify-between text-sm'>
                      <span>Previous Month</span>
                      <span>${data.revenue.previous.toLocaleString()}</span>
                    </div>
                    <div className='flex justify-between text-sm'>
                      <span>Growth</span>
                      <span className={getGrowthColor(data.revenue.growth)}>
                        +{data.revenue.growth}%
                      </span>
                    </div>
                    <div className='flex justify-between text-sm'>
                      <span>Projected Next Month</span>
                      <span>
                        ${data.revenue.projections[0].toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <TrendingUp className='h-5 w-5 mr-2' />
                  Growth Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <div className='space-y-2'>
                    <div className='flex justify-between text-sm'>
                      <span>Monthly Growth</span>
                      <span className={getGrowthColor(data.revenue.growth)}>
                        +{data.revenue.growth}%
                      </span>
                    </div>
                    <div className='flex justify-between text-sm'>
                      <span>Quarterly Growth</span>
                      <span className='text-green-600'>+18.5%</span>
                    </div>
                    <div className='flex justify-between text-sm'>
                      <span>Annual Growth</span>
                      <span className='text-green-600'>+45.2%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <Target className='h-5 w-5 mr-2' />
                  Revenue Goals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <div>
                    <div className='flex justify-between text-sm mb-2'>
                      <span>Monthly Target</span>
                      <span>
                        ${(data.revenue.current * 1.1).toLocaleString()}
                      </span>
                    </div>
                    <Progress
                      value={
                        (data.revenue.current / (data.revenue.current * 1.1)) *
                        100
                      }
                      className='h-2'
                    />
                  </div>
                  <div>
                    <div className='flex justify-between text-sm mb-2'>
                      <span>Quarterly Target</span>
                      <span>
                        ${(data.revenue.current * 3.3).toLocaleString()}
                      </span>
                    </div>
                    <Progress value={85} className='h-2' />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value='performance' className='space-y-4'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <Server className='h-5 w-5 mr-2' />
                  Infrastructure Performance
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div>
                  <div className='flex justify-between text-sm mb-2'>
                    <span>Node Utilization</span>
                    <span>{data.infrastructure.utilization}%</span>
                  </div>
                  <Progress
                    value={data.infrastructure.utilization}
                    className='h-2'
                  />
                </div>
                <div>
                  <div className='flex justify-between text-sm mb-2'>
                    <span>Capacity Usage</span>
                    <span>{data.infrastructure.capacity}%</span>
                  </div>
                  <Progress
                    value={data.infrastructure.capacity}
                    className='h-2'
                  />
                </div>
                <div>
                  <div className='flex justify-between text-sm mb-2'>
                    <span>Efficiency</span>
                    <span>{data.infrastructure.efficiency}%</span>
                  </div>
                  <Progress
                    value={data.infrastructure.efficiency}
                    className='h-2'
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <Network className='h-5 w-5 mr-2' />
                  Network Performance
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid grid-cols-2 gap-4'>
                  <div className='text-center'>
                    <div className='text-2xl font-bold'>
                      {data.performance.responseTime}ms
                    </div>
                    <p className='text-sm text-muted-foreground'>
                      Response Time
                    </p>
                  </div>
                  <div className='text-center'>
                    <div className='text-2xl font-bold'>
                      {data.performance.throughput}
                    </div>
                    <p className='text-sm text-muted-foreground'>
                      Throughput (Gbps)
                    </p>
                  </div>
                  <div className='text-center'>
                    <div className='text-2xl font-bold'>
                      {data.performance.errors}%
                    </div>
                    <p className='text-sm text-muted-foreground'>Error Rate</p>
                  </div>
                  <div className='text-center'>
                    <div className='text-2xl font-bold'>
                      {data.performance.uptime}%
                    </div>
                    <p className='text-sm text-muted-foreground'>Uptime</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value='security' className='space-y-4'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <Shield className='h-5 w-5 mr-2' />
                  Security Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <div className='grid grid-cols-2 gap-4'>
                    <div className='text-center'>
                      <div className='text-2xl font-bold'>
                        {data.security.score}
                      </div>
                      <p className='text-sm text-muted-foreground'>
                        Security Score
                      </p>
                    </div>
                    <div className='text-center'>
                      <div className='text-2xl font-bold'>
                        {data.security.threats}
                      </div>
                      <p className='text-sm text-muted-foreground'>
                        Active Threats
                      </p>
                    </div>
                    <div className='text-center'>
                      <div className='text-2xl font-bold'>
                        {data.security.incidents}
                      </div>
                      <p className='text-sm text-muted-foreground'>Incidents</p>
                    </div>
                    <div className='text-center'>
                      <div className='text-2xl font-bold'>
                        {data.security.compliance}%
                      </div>
                      <p className='text-sm text-muted-foreground'>
                        Compliance
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <Target className='h-5 w-5 mr-2' />
                  Security Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div>
                  <div className='flex justify-between text-sm mb-2'>
                    <span>Overall Security</span>
                    <span>{data.security.score}/100</span>
                  </div>
                  <Progress value={data.security.score} className='h-2' />
                </div>
                <div>
                  <div className='flex justify-between text-sm mb-2'>
                    <span>Compliance Score</span>
                    <span>{data.security.compliance}%</span>
                  </div>
                  <Progress value={data.security.compliance} className='h-2' />
                </div>
                <div>
                  <div className='flex justify-between text-sm mb-2'>
                    <span>Threat Detection</span>
                    <span>98.5%</span>
                  </div>
                  <Progress value={98.5} className='h-2' />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value='infrastructure' className='space-y-4'>
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <Server className='h-5 w-5 mr-2' />
                  Infrastructure Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <div className='grid grid-cols-2 gap-4'>
                    <div className='text-center'>
                      <div className='text-2xl font-bold'>
                        {data.infrastructure.nodes}
                      </div>
                      <p className='text-sm text-muted-foreground'>
                        Active Nodes
                      </p>
                    </div>
                    <div className='text-center'>
                      <div className='text-2xl font-bold'>
                        {data.infrastructure.utilization}%
                      </div>
                      <p className='text-sm text-muted-foreground'>
                        Utilization
                      </p>
                    </div>
                  </div>
                  <div className='space-y-2'>
                    <div className='flex justify-between text-sm'>
                      <span>Total Capacity</span>
                      <span>2.4 PB</span>
                    </div>
                    <div className='flex justify-between text-sm'>
                      <span>Available Capacity</span>
                      <span>1.8 PB</span>
                    </div>
                    <div className='flex justify-between text-sm'>
                      <span>Efficiency</span>
                      <span>{data.infrastructure.efficiency}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <Cpu className='h-5 w-5 mr-2' />
                  Resource Usage
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div>
                  <div className='flex justify-between text-sm mb-2'>
                    <span>CPU Usage</span>
                    <span>23.4%</span>
                  </div>
                  <Progress value={23.4} className='h-2' />
                </div>
                <div>
                  <div className='flex justify-between text-sm mb-2'>
                    <span>Memory Usage</span>
                    <span>45.2%</span>
                  </div>
                  <Progress value={45.2} className='h-2' />
                </div>
                <div>
                  <div className='flex justify-between text-sm mb-2'>
                    <span>Storage Usage</span>
                    <span>67.8%</span>
                  </div>
                  <Progress value={67.8} className='h-2' />
                </div>
                <div>
                  <div className='flex justify-between text-sm mb-2'>
                    <span>Network Usage</span>
                    <span>34.1%</span>
                  </div>
                  <Progress value={34.1} className='h-2' />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <HardDrive className='h-5 w-5 mr-2' />
                  Storage Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <div className='space-y-2'>
                    <div className='flex justify-between text-sm'>
                      <span>SSD Storage</span>
                      <span>85%</span>
                    </div>
                    <Progress value={85} className='h-2' />
                  </div>
                  <div className='space-y-2'>
                    <div className='flex justify-between text-sm'>
                      <span>HDD Storage</span>
                      <span>60%</span>
                    </div>
                    <Progress value={60} className='h-2' />
                  </div>
                  <div className='space-y-2'>
                    <div className='flex justify-between text-sm'>
                      <span>Backup Storage</span>
                      <span>45%</span>
                    </div>
                    <Progress value={45} className='h-2' />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
