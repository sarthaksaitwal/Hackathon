import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useIssuesStore } from '@/store/issues';
import { Loader2 } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import {
  FileX,
  RotateCcw,
  Settings,
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  Trash2,
  Droplet,
  Wrench,
  Waves, // If this fails, use Settings or another fallback
  MapPin,
  Calendar,
  TrendingUp,
  UserCheck,
  Construction,
  ScanSearch
} from 'lucide-react';

const getBadgeClass = (status) => {
  switch (status?.toLowerCase()) {
    case 'assigned':
      return 'bg-blue-500 text-white';
    case 'resolved':
      return 'bg-green-500 text-white';
    case 'in progress':
      return 'bg-orange-500 text-white';
    case 'review & approve':
      return 'bg-gray-500 text-white';
    default:
      return '';
  }
};

const getCategoryIcon = (type) => {
  switch (type) {
    case 'Garbage':
      return { icon: Trash2, color: 'text-green-500' };
    case 'Drainage & Sewage':
      return { icon: Waves, color: 'text-amber-700' }; // changed to Waves icon
    case 'Road Damage':
      return { icon: Construction, color: 'text-orange-500' }; // changed to Construction icon
    case 'StreetLight':
      return { icon: Lightbulb, color: 'text-yellow-500' };
    case 'Water':
      return { icon: Droplet, color: 'text-blue-500' };
    default:
      return { icon: FileX, color: 'text-gray-500' };
  }
};

const statusConfig = {
  Pending: {
    title: 'Pending',
    icon: RotateCcw,
    color: 'bg-gray-100 backdrop-blur-md',
    textColor: 'text-gray-500'
  },
  Assigned: {
    title: 'Assigned',
    icon: UserCheck,
    color: 'bg-gray-100 backdrop-blur-md',
    textColor: 'text-blue-500'
  },
  "In Progress": {
    title: 'In Progress',
    icon: Wrench,
    color: 'bg-gray-100 backdrop-blur-md',
    textColor: 'text-orange-500'
  },
  Resolved: {
    title: 'Resolved',
    icon: CheckCircle,
    color: 'bg-gray-100 backdrop-blur-md',
    textColor: 'text-green-500'
  },
  "Review & Approve": {
    title: 'Review & Approve',
    icon: ScanSearch,
    color: 'bg-gray-100 backdrop-blur-md',
    textColor: 'text-indigo-500'
  }
};

const ISSUE_TYPE_MAP = {
  RDG: "Road Damage",
  DRN: "Drainage & Sewage",
  WTR: "Water",
  GBG: "Garbage",
  SLT: "StreetLight",
};

// Map categories to icons (use available icons only)
const CATEGORY_ICON = {
  "Road Damage": Settings,         // No Road icon, use Settings as fallback
  "Drainage & Sewage": RotateCcw,  // Or use Settings/Waves if available
  "Water": Droplet,
  "Garbage": Trash2,
  "StreetLight": Lightbulb,
};

const ISSUE_TYPE_ICON = {
  "Road Damage": FileX,
  "Drainage & Sewage": RotateCcw,
  "Water": Settings,
  "Garbage": AlertTriangle,
  "StreetLight": CheckCircle,
  "Unknown": FileX
};

const getIssueTypeFromToken = (id) => {
  if (!id) return "Unknown";
  const prefix = id.split("-")[0];
  return ISSUE_TYPE_MAP[prefix] || "Unknown";
};

const getIssueIcon = (type) => {
  return ISSUE_TYPE_ICON[type] || FileX;
};

export default function Dashboard() {
  const { issues, fetchIssues, loading } = useIssuesStore();
  const navigate = useNavigate();
  const [markerSize, setMarkerSize] = useState({ width: 20, height: 26 });

  const getIssuesByStatus = (status) =>
    issues.filter(issue => (issue.status || '').toLowerCase() === status.toLowerCase());

  // Fetch issues on mount
  useEffect(() => {
    fetchIssues();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only on mount, always subscribe

  // Responsive marker sizing
  useEffect(() => {
    const updateMarkerSize = () => {
      const width = window.innerWidth;
      if (width < 640) { // Mobile
        setMarkerSize({ width: 14, height: 18 });
      } else if (width < 1024) { // Tablet
        setMarkerSize({ width: 16, height: 20 });
      } else { // Desktop
        setMarkerSize({ width: 20, height: 26 });
      }
    };

    updateMarkerSize();
    window.addEventListener('resize', updateMarkerSize);
    return () => window.removeEventListener('resize', updateMarkerSize);
  }, []);

  const handleCategoryClick = (status) => {
    navigate('/issues', { state: { filterStatus: status } });
  };

  // Sort issues by dateReported descending (newest first)
  const sortedIssues = [...issues]
    .filter(issue => issue.dateReported instanceof Date)
    .sort((a, b) => b.dateReported - a.dateReported);

  // Get the latest 5 or 6 issues
  const recentIssues = sortedIssues.slice(0, 6);

  const allIssues = issues;
  const totalIssues = allIssues.length;
  const completedIssues = getIssuesByStatus('completed').length;
  const completionRate = totalIssues > 0 ? Math.round((completedIssues / totalIssues) * 100) : 0;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <span className="ml-4 text-muted-foreground">Loading issues...</span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-8 bg-sidebar min-h-screen">
-        {/* Glassmorphism background overlay */}
-        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-sm rounded-3xl -z-10"></div>
      
        {/* Header */}
        <div className="flex flex-col items-start items-center justify-center gap-4 mb-4">
          <h3 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">Overview of Civic Issues and System Status</h3>
        </div>

        {/* Top Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map */}
          <div className="lg:col-span-2">
            <Card className="h-full shadow-lg border border-white/20 rounded-3xl bg-[#f6f6f6] backdrop-blur-md hover:shadow-2xl hover:bg-white/15 transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-indigo-700 text-lg sm:text-xl font-semibold">
                  <MapPin className="h-6 w-6" />
                  Issue Locations Map
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 border-t border-gray-300 rounded-b-3xl overflow-hidden" style={{ height: '500px' }}>
                <div className="h-full w-full overflow-hidden rounded-b-3xl relative">
                  <MapContainer
                    center={[22.5937, 78.9629]} // Center of India
                    zoom={5} // Suitable zoom for India
                    scrollWheelZoom={true}
                    className="h-full w-full rounded-b-3xl"
                    style={{ position: "relative", zIndex: 1 }}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {allIssues.filter(issue => Array.isArray(issue.coordinates) && issue.coordinates.length === 2 && issue.coordinates[0] !== 0 && issue.coordinates[1] !== 0 && !isNaN(issue.coordinates[0]) && !isNaN(issue.coordinates[1])).map((issue) => (
                      <Marker
                        key={issue.id}
                        position={issue.coordinates}
                        eventHandlers={{
                          click: () => navigate(`/issues/${issue.id}`),
                        }}
                      >
                        <Popup>
                          <div className="p-2">
                            <strong className="block text-sm font-semibold">{issue.title}</strong>
                            <span className="block text-xs text-indigo-700">{issue.location}</span>
                            <span className="block text-xs mt-1">
                              Status: <Badge className={`text-xs ${getBadgeClass(issue.status)}`}>{issue.status}</Badge>
                            </span>
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                  </MapContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Status Cards */}
          <div className="space-y-4">
            {Object.keys(statusConfig).map((status) => {
              const config = statusConfig[status];
              const count = issues.filter(issue => (issue.status || '').toLowerCase() === status.toLowerCase()).length;
              const IconComponent = config.icon;

              return (
                <Card
                  key={status}
                  className={`cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-white/30 rounded-3xl bg-[#f6f6f6]`}
                  onClick={() => handleCategoryClick(status)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-xl bg-white bg-opacity-80`}>
                          <IconComponent className={`h-6 w-6 ${config.textColor}`} />
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-gray-900">
                            {config.title}
                          </p>
                          <p className="text-sm text-gray-700">
                            Click to view all
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-extrabold text-gray-900">{count}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Bottom Section - Recent Issues */}
        <div className="w-full">
          {/* Recent Issues List */}
          <Card className="shadow-lg border border-white/20 rounded-3xl bg-[#f6f6f6] backdrop-blur-md hover:shadow-2xl hover:bg-white/15 transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-indigo-700 text-lg font-semibold">
                <Calendar className="h-6 w-6" />
                Recent Issues
              </CardTitle>
              <CardDescription>
                Latest reported issues requiring attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentIssues.length === 0 ? (
                  <div className="text-indigo-400 text-center">No recent issues.</div>
                ) : (
                  recentIssues.map((issue) => (
                    <div
                      key={issue.id}
                      className="relative flex justify-between items-start p-6 rounded-2xl cursor-pointer transition-all duration-300 shadow-md hover:shadow-xl hover:bg-gray-200 bg-gray-100 backdrop-blur-md text-black"
                      onClick={() => navigate(`/issues/${issue.id}`)}
                    >
                      <div className="flex flex-col gap-2 flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          {(() => {
                            const { icon: Icon, color } = getCategoryIcon(getIssueTypeFromToken(issue.id));
                            return <Icon className={`h-5 w-5 ${color}`} />;
                          })()}
                          <span className="font-extrabold text-lg truncate">
                            {issue.title || issue.name || getIssueTypeFromToken(issue.id) || "Untitled Issue"}
                          </span>
                          <Badge className={`ml-auto mr-2 text-xs ${getBadgeClass(issue.status)}`}>
                            {issue.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-gray-700 text-sm">
                          <MapPin className="h-5 w-5" />
                          <span>{issue.location || "N/A"}</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-700 text-sm">
                          <Calendar className="h-5 w-5" />
                          <span>
                            {issue.dateReported instanceof Date
                              ? issue.dateReported.toLocaleDateString("en-IN", {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "2-digit",
                                })
                              : "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

