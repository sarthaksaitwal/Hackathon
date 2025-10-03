import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useIssuesStore } from '@/store/issues';
import 'leaflet/dist/leaflet.css';
import {
  Search,
  Filter,
  Calendar,
  MapPin,
  Clock,
  AlertTriangle,
  List,
  Tag,
  Trash2,
  Droplet,
  Lightbulb,
  RotateCcw,
  Settings,
  Waves,
  Construction
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
      return { icon: Settings, color: 'text-gray-500' };
  }
};

export default function Issues() {
  const location = useLocation();
  const navigate = useNavigate();
  const { issues, fetchIssues } = useIssuesStore();

  const [filteredIssues, setFilteredIssues] = useState(issues);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Get initial filter from navigation state
  useEffect(() => {
    const filterStatus = location.state?.filterStatus;
    if (filterStatus) {
      setStatusFilter(filterStatus);
    }
  }, [location.state]);

  // Fetch issues on component mount
  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  // Apply filters
  useEffect(() => {
    let filtered = issues;

    if (searchTerm) {
      filtered = filtered.filter(issue =>
        (issue.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (issue.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (issue.location || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(
        issue => (issue.status || '').toLowerCase() === statusFilter.toLowerCase()
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(issue => issue.category === categoryFilter);
    }

    setFilteredIssues(filtered);
  }, [issues, searchTerm, statusFilter, categoryFilter]);

  // Sort issues by dateReported descending (newest first)
  const sortedIssues = [...filteredIssues].sort((a, b) => {
    if (!a.dateReported || !b.dateReported) return 0;
    return b.dateReported - a.dateReported;
  });

  const categories = [...new Set(issues.map(issue => issue.category))];

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'new': return 'default';
      case 'pending': return 'secondary';
      case 'completed': return 'outline';
      case 'reverted': return 'destructive';
      case 'manual': return 'outline';
      default: return 'secondary';
    }
  };

  const getPriorityBadgeVariant = (priority) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const formatDeadline = (deadline) => {
    if (!deadline) return 'No deadline';
    const now = new Date();
    const diffTime = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 0) {
      return `${Math.abs(diffDays)} days overdue`;
    } else if (diffDays === 0) {
      return 'Due today';
    } else if (diffDays === 1) {
      return 'Due tomorrow';
    } else {
      return `${diffDays} days remaining`;
    }
  };

  // Helper to get issue type from token
  const ISSUE_TYPE_MAP = {
    RDG: "Road Damage",
    DRN: "Drainage & Sewage",
    WTR: "Water",
    GBG: "Garbage",
    SLT: "StreetLight",
  };

  const getIssueTypeFromToken = (id) => {
    if (!id) return "Unknown";
    const prefix = id.split("-")[0];
    return ISSUE_TYPE_MAP[prefix] || "Unknown";
  };

  const CATEGORY_ICON = {
    "Garbage": Trash2,
    "Water": Droplet,
    "StreetLight": Lightbulb,
    "Drainage & Sewage": RotateCcw,
    "Road Damage": Settings,
  };

  return (
    <DashboardLayout>
      <div className="p-4 space-y-4 bg-sidebar">
        {/* Header */}
        <div className="flex items-center justify-center">
          <div>
            <h3 className="text-3xl font-bold text-foreground">Manage and track all civic issues</h3>
          </div>
        </div>

        {/* Filters */}
        <Card className="shadow-card bg-[#f6f6f6] backdrop-blur-md rounded-3xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-primary" />
              Filters
            </CardTitle>
            <CardDescription>
              Search and filter issues by various criteria
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search issues..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Assigned">Assigned</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Resolved">Resolved</SelectItem>
                  <SelectItem value="Review & Approve">Review & Approve</SelectItem>
                </SelectContent>
              </Select>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setCategoryFilter('all');
                }}
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Issues List */}
        <Card className="shadow-card border border-gray-300 rounded-3xl bg-[#f6f6f6] backdrop-blur-md hover:shadow-2xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-indigo-700 text-lg font-semibold">
              <List className="h-6 w-6" />
              Issues
            </CardTitle>
            <CardDescription>
              All reported civic issues requiring attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredIssues.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No issues found</p>
                  <p>Try adjusting your filters or search terms.</p>
                </div>
              ) : (
                sortedIssues.map((issue) => (
                  <div
                    key={issue.id}
                    className="relative flex justify-between items-start p-6 rounded-2xl cursor-pointer transition-all duration-300 shadow-md hover:shadow-xl hover:bg-gray-200 bg-[#f6f6f6] backdrop-blur-md text-black border border-white/20"
                    onClick={() => navigate(`/issues/${issue.id}`)}
                  >
                    <div className="flex flex-col gap-2 flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        {(() => {
                          const { icon: Icon, color } = getCategoryIcon(getIssueTypeFromToken(issue.id));
                          return <Icon className={`h-5 w-5 ${color}`} />;
                        })()}
                        <span className="font-extrabold text-lg truncate">
                          {issue.title || getIssueTypeFromToken(issue.id) || 'Untitled Issue'}
                        </span>
                        {issue.priority && (
                          <Badge variant={getPriorityBadgeVariant(issue.priority)} className="ml-2">
                            {issue.priority}
                          </Badge>
                        )}
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
                      {issue.deadline && (
                        <div className="flex items-center gap-3 text-gray-700 text-sm">
                          <Clock className="h-5 w-5" />
                          <span>{formatDeadline(issue.deadline)}</span>
                        </div>
                      )}
                      <div className="text-sm text-gray-600">
                        #{issue.id}
                      </div>
                    </div>

                    {issue.audio && issue.audio.length > 0 && (
                      <div className="mt-2">
                        {issue.audio.map((audioUrl, index) => (
                          <audio key={index} controls className="w-full max-w-xs">
                            <source src={audioUrl} type="audio/mpeg" />
                            Your browser does not support the audio element.
                          </audio>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}