import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useWorkersStore } from '@/store/workers';
import { useIssuesStore } from '@/store/issues';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, LineChart, Line, Area, AreaChart } from 'recharts';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  MapPin,
  Moon,
  Sun,
  Activity,
  Target,
  Zap
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { useState, useEffect } from "react";

const CHART_COLORS = {
  blue: '#3b82f6',
  green: '#10b981',
  orange: '#f59e0b',
  red: '#ef4444',
  purple: '#8b5cf6',
  teal: '#14b8a6',
  indigo: '#6366f1',
  pink: '#ec4899'
};

export default function Reports() {
  const { workers } = useWorkersStore();
  const { issues } = useIssuesStore();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPeriod, setSelectedPeriod] = useState("30d");

  // Mock data for sparklines and trends
  const generateSparklineData = (baseValue, variance = 0.2) => {
    return Array.from({ length: 7 }, (_, i) => ({
      value: Math.round(baseValue * (1 + (Math.random() - 0.5) * variance))
    }));
  };

  // Worker occupancy stats with trends
  const workerStats = workers.map(worker => {
    const assignedIssues = issues.filter(
      issue =>
        (typeof issue.assignedTo === "object"
          ? issue.assignedTo.id
          : issue.assignedTo) === worker.id &&
        !["resolved", "completed"].includes((issue.status || "").toLowerCase())
    );
    return {
      ...worker,
      assignedCount: assignedIssues.length,
      isOccupied: assignedIssues.length >= 10,
      isAvailable: assignedIssues.length < 10,
    };
  });

  const availableWorkers = workerStats.filter(w => w.isAvailable).length;
  const occupiedWorkers = workerStats.filter(w => w.isOccupied).length;

  // Department breakdown for mini chart
  const departmentStats = {};
  workerStats.forEach(w => {
    const dept = w.department || "Unknown";
    if (!departmentStats[dept]) departmentStats[dept] = { available: 0, occupied: 0 };
    if (w.isOccupied) departmentStats[dept].occupied += 1;
    else departmentStats[dept].available += 1;
  });

  const departmentChartData = Object.entries(departmentStats).map(([dept, stats]) => ({
    name: dept,
    available: stats.available,
    occupied: stats.occupied
  }));

  // Issues by category
  const categoryData = Object.entries(
    issues.reduce((acc, issue) => {
      acc[issue.category] = (acc[issue.category] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value], index) => ({
    name,
    value,
    color: Object.values(CHART_COLORS)[index % Object.values(CHART_COLORS).length]
  }));

  // Key metrics with sparklines
  const totalIssues = issues.length;
  const resolvedIssues = issues.filter(i => (i.status || '').toLowerCase() === 'resolved').length;
  const resolutionRate = totalIssues ? Math.round((resolvedIssues / totalIssues) * 100) : 0;
  const avgResponseTime = '2.3 days';
  const activeWorkers = workers.length;

  const metricsData = [
    {
      title: "Total Issues",
      value: totalIssues,
      icon: BarChart3,
      color: "blue",
      trend: "+12%",
      trendUp: true,
      sparkline: generateSparklineData(totalIssues, 0.3)
    },
    {
      title: "Resolution Rate",
      value: `${resolutionRate}%`,
      subtitle: `${resolvedIssues} of ${totalIssues} resolved`,
      icon: Target,
      color: "green",
      trend: "+5%",
      trendUp: true,
      sparkline: generateSparklineData(resolutionRate, 0.2)
    },
    {
      title: "Avg Response Time",
      value: avgResponseTime,
      icon: Clock,
      color: "orange",
      trend: "-15%",
      trendUp: false,
      sparkline: generateSparklineData(2.3, 0.4)
    },
    {
      title: "Active Workers",
      value: activeWorkers,
      icon: Users,
      color: "purple",
      trend: "+8%",
      trendUp: true,
      sparkline: generateSparklineData(activeWorkers, 0.25)
    }
  ];

  // Worker occupancy with trends
  const workerOccupancyData = [
    {
      status: "Available",
      count: availableWorkers,
      color: CHART_COLORS.green,
      trend: "+3",
      trendUp: true,
      icon: CheckCircle
    },
    {
      status: "Occupied",
      count: occupiedWorkers,
      color: CHART_COLORS.red,
      trend: "-2",
      trendUp: false,
      icon: AlertTriangle
    }
  ];

  // Filtered issues for heat map
  const now = Date.now();
  const periodMs = selectedPeriod === "7d" ? 7 * 24 * 60 * 60 * 1000
    : selectedPeriod === "30d" ? 30 * 24 * 60 * 60 * 1000
    : selectedPeriod === "year" ? 365 * 24 * 60 * 60 * 1000
    : Infinity;

  const filteredIssues = issues.filter(issue => {
    if (selectedCategory !== "all" && issue.category !== selectedCategory) return false;
    if (issue.dateReported instanceof Date) {
      return now - issue.dateReported.getTime() <= periodMs;
    }
    return true;
  });

  const heatPoints = filteredIssues
    .filter(issue =>
      Array.isArray(issue.coordinates) &&
      issue.coordinates.length === 2 &&
      !isNaN(issue.coordinates[0]) &&
      !isNaN(issue.coordinates[1])
    )
    .map(issue => ({
      lat: issue.coordinates[0],
      lng: issue.coordinates[1],
      count: 1,
      category: issue.category,
    }));

  const allCategories = ["all", ...new Set(issues.map(i => i.category).filter(Boolean))];

  const mapCenter = heatPoints.length
    ? [
        heatPoints.reduce((sum, p) => sum + p.lat, 0) / heatPoints.length,
        heatPoints.reduce((sum, p) => sum + p.lng, 0) / heatPoints.length,
      ]
    : [28.6139, 77.2090];

  function getZoneBreakdown(lat, lng) {
    const zoneIssues = filteredIssues.filter(issue => {
      if (!issue.coordinates) return false;
      const [ilat, ilng] = issue.coordinates;
      return Math.abs(ilat - lat) < 0.005 && Math.abs(ilng - lng) < 0.005;
    });
    const breakdown = {};
    zoneIssues.forEach(issue => {
      breakdown[issue.category] = (breakdown[issue.category] || 0) + 1;
    });
    return breakdown;
  }

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  return (
    <DashboardLayout>
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-sidebar text-gray-900'}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
            <p className={`text-lg mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Real-time insights into civic issue management
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleDarkMode}
            className="rounded-full p-3"
          >
            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6 pt-4">
          {metricsData.map((metric, index) => (
            <Card key={index} className={`rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-0 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-[#f6f6f6]'}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <metric.icon className={`h-6 w-6 text-${metric.color}-500`} />
                  </div>
                  <div className="flex items-center gap-1">
                    {metric.trendUp ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    )}
                    <span className={`text-sm font-medium ${metric.trendUp ? 'text-green-500' : 'text-red-500'}`}>
                      {metric.trend}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {metric.title}
                  </p>
                  <p className="text-3xl font-bold">{metric.value}</p>
                  {metric.subtitle && (
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {metric.subtitle}
                    </p>
                  )}
                </div>

                {/* Mini Sparkline */}
                <div className="mt-4 h-8">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={metric.sparkline}>
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke={`var(--color-${metric.color})`}
                        fill={`var(--color-${metric.color})`}
                        fillOpacity={0.2}
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 pt-0">
          {/* Issue Category Distribution */}
          <Card className={`rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-0 lg:col-span-1 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-[#f6f6f6]'}`}>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                <Activity className="h-5 w-5 text-blue-500" />
                Issue Categories
              </CardTitle>
              <CardDescription className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                Distribution by category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className={`p-3 rounded-lg shadow-lg border ${isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-200'}`}>
                                <p className="font-semibold">{data.name}</p>
                                <p className="text-sm text-gray-600">{data.value} issues</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Legend */}
                <div className="space-y-2">
                  {categoryData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {item.name}
                        </span>
                      </div>
                      <span className="text-sm font-semibold">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Worker Occupancy */}
          <Card className={`rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-0 lg:col-span-1 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-[#f6f6f6]'}`}>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                <Users className="h-5 w-5 text-green-500" />
                Worker Status
              </CardTitle>
              <CardDescription className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                Current availability overview
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {workerOccupancyData.map((item, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-xl transition-all duration-200 hover:scale-105 cursor-pointer ${
                      isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${item.status === 'Available' ? 'bg-green-100' : 'bg-red-100'}`}>
                          <item.icon className={`h-5 w-5 ${item.status === 'Available' ? 'text-green-600' : 'text-red-600'}`} />
                        </div>
                        <div>
                          <p className="font-semibold">{item.status}</p>
                          <p className="text-2xl font-bold">{item.count}</p>
                        </div>
                      </div>
                      <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        item.trendUp ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {item.trendUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {item.trend}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Department Mini Chart */}
                <div className="pt-4 border-t border-gray-200">
                  <h4 className={`text-sm font-semibold mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Department Breakdown
                  </h4>
                  <div className="h-32">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={departmentChartData} layout="horizontal">
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" hide />
                        <Bar dataKey="available" stackId="a" fill={CHART_COLORS.green} radius={[0, 4, 4, 0]} />
                        <Bar dataKey="occupied" stackId="a" fill={CHART_COLORS.red} radius={[4, 0, 0, 4]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Heat Map */}
          <Card className={`rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-0 lg:col-span-1 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-[#f6f6f6]'}`}>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                <MapPin className="h-5 w-5 text-red-500" />
                Issue Hotspots
              </CardTitle>
              <CardDescription className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                Geographic distribution
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex gap-2 mb-4">
                <select
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value)}
                  className={`flex-1 px-3 py-2 text-sm rounded-full border-0 font-medium transition-colors ${
                    isDarkMode
                      ? 'bg-gray-700 text-white border-gray-600 focus:bg-gray-600'
                      : 'bg-gray-100 text-gray-900 focus:bg-gray-200'
                  }`}
                >
                  {allCategories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat === "all" ? "All Categories" : cat}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedPeriod}
                  onChange={e => setSelectedPeriod(e.target.value)}
                  className={`flex-1 px-3 py-2 text-sm rounded-full border-0 font-medium transition-colors ${
                    isDarkMode
                      ? 'bg-gray-700 text-white border-gray-600 focus:bg-gray-600'
                      : 'bg-gray-100 text-gray-900 focus:bg-gray-200'
                  }`}
                >
                  <option value="7d">7 days</option>
                  <option value="30d">30 days</option>
                  <option value="year">This year</option>
                  <option value="all">All time</option>
                </select>
              </div>

              {/* Map */}
              <div className="h-64 rounded-xl overflow-hidden border border-gray-200">
                <MapContainer
                  center={mapCenter}
                  zoom={12}
                  style={{ height: "100%", width: "100%" }}
                  scrollWheelZoom={true}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; OpenStreetMap contributors"
                  />
                  {heatPoints.map((point, idx) => {
                    const zoneIssues = filteredIssues.filter(issue => {
                      if (!issue.coordinates) return false;
                      const [ilat, ilng] = issue.coordinates;
                      return Math.abs(ilat - point.lat) < 0.005 && Math.abs(ilng - point.lng) < 0.005;
                    });
                    const count = zoneIssues.length;
                    let color = CHART_COLORS.green;
                    if (count > 10) color = CHART_COLORS.red;
                    else if (count > 5) color = CHART_COLORS.orange;

                    const icon = L.divIcon({
                      className: "",
                      html: `<div style="background:${color};width:16px;height:16px;border-radius:50%;border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.2);animation:pulse 2s infinite"></div>`,
                      iconSize: [16, 16],
                      iconAnchor: [8, 8],
                    });

                    return (
                      <Marker key={idx} position={[point.lat, point.lng]} icon={icon}>
                        <Popup>
                          <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'}`}>
                            <p className="font-bold text-lg">{count} complaints</p>
                            <div className="mt-2 space-y-1">
                              {Object.entries(getZoneBreakdown(point.lat, point.lng)).map(([cat, val]) => (
                                <div key={cat} className="flex justify-between text-sm">
                                  <span>{cat}:</span>
                                  <span className="font-semibold">{val}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </Popup>
                      </Marker>
                    );
                  })}
                </MapContainer>
              </div>

              {/* Legend */}
              <div className="flex justify-center gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-xs">Low</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                  <span className="text-xs">Medium</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-xs">High</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
