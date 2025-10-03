import { useNavigate, useLocation } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useWorkersStore } from '@/store/workers';
import { useIssuesStore } from '@/store/issues';
import { useToast } from '@/components/ui/use-toast';
import { useEffect, useState } from 'react';
import { Loader2, User, Filter, Phone, MapPin, Briefcase } from 'lucide-react';


const DEPARTMENT_DISPLAY_MAP = {
  garbage: "Garbage",
  streetlight: "Streetlight",
  roaddamage: "Road Damage",
  water: "Water",
  drainage: "Drainage & Sewage"
};

function getDepartmentDisplay(dept) {
  if (!dept) return "";
  return DEPARTMENT_DISPLAY_MAP[dept.toLowerCase()] || dept;
}

export default function AssignWorker() {
  const normalize = str => (str || '').toLowerCase().replace(/\s+/g, '');

  const navigate = useNavigate();
  const location = useLocation();
  const { workers, fetchWorkers } = useWorkersStore();
  const { assignWorker, issues, fetchIssues } = useIssuesStore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');

  // Get issueId and department from navigation state or query params
  const issueId = location.state?.issueId || null;
  const navDepartment = location.state?.department || null;

  // Find the current issue and its department
  const currentIssue = issues.find(issue => issue.id === issueId);
  const currentIssueDepartment = navDepartment || currentIssue?.department || null;

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      await fetchWorkers();
      await fetchIssues();
      setIsLoading(false);
    };
    fetchData();
    // eslint-disable-next-line
  }, []);

  // For department/location dropdowns
  const departmentsRaw = workers.map((w) => w.department).filter(Boolean);
  const departments = Array.from(
    new Set(departmentsRaw.map((dept) => getDepartmentDisplay(dept)))
  );
  const locations = Array.from(new Set(workers.map((w) => w.location).filter(Boolean)));

  // Filtering logic
  let filteredWorkers = workers;

  // If assigning/reassigning for a specific issue, always filter by that issue's department
  if (issueId && currentIssueDepartment) {
    filteredWorkers = filteredWorkers.filter(
      (worker) =>
        normalize(worker.department) === normalize(currentIssueDepartment)
    );
  } else {
    // Only apply department filter from dropdown if not assigning a specific issue
    if (departmentFilter !== "all") {
      filteredWorkers = filteredWorkers.filter(
        (worker) =>
          normalize(worker.department) === normalize(departmentFilter)
      );
    }
  }
  if (availabilityFilter !== "all") {
    filteredWorkers = filteredWorkers.filter((worker) => {
      const assignedIssues = issues.filter(
        (issue) =>
          (typeof issue.assignedTo === "object"
            ? issue.assignedTo.id
            : issue.assignedTo) === worker.id &&
          !["resolved", "completed"].includes((issue.status || "").toLowerCase())
      );
      const assignedCount = assignedIssues.length;
      if (availabilityFilter === "available") return assignedCount < 10;
      if (availabilityFilter === "occupied") return assignedCount >= 10;
      return true;
    });
  }
  if (locationFilter !== "all") {
    filteredWorkers = filteredWorkers.filter(
      (worker) => normalize(worker.location) === normalize(locationFilter)
    );
  }

  // Handler for viewing worker details
  const handleWorkerClick = (worker) => {
    navigate(`/workers/${worker.id}`);
  };

  // Find the current issue and its assignee
  const currentAssigneeId =
    typeof currentIssue?.assignedTo === "object"
      ? currentIssue.assignedTo.id
      : currentIssue?.assignedTo;

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 bg-sidebar">
        <h1 className="text-3xl font-bold text-foreground">Assign Worker</h1>

        {/* Filters */}
        <Card className="rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-[#f6f6f6]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Availability</label>
                <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select availability" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="occupied">Occupied</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Location</label>
                <Select value={locationFilter} onValueChange={setLocationFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {locations.map((loc) => (
                      <SelectItem key={loc} value={loc}>
                        {loc}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Department</label>
                <Select
                  value={departmentFilter}
                  onValueChange={setDepartmentFilter}
                  disabled={!!location.state?.department} // Disable if department is set from navigation
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Workers List */}
        <Card className="shadow-card border border-gray-300 rounded-3xl bg-[#f6f6f6] hover:shadow-2xl transition-shadow duration-300">
          <CardHeader />
          <CardContent>
            <div className="space-y-4">
              {isLoading ? (
                <div className="text-center py-8">Loading...</div>
              ) : filteredWorkers.length === 0 ? (
                <div className="text-muted-foreground text-center">No workers found.</div>
              ) : (
                filteredWorkers.map((worker) => {
                  // Find all assigned issues for this worker
                  const assignedIssues = issues.filter(
                    (issue) =>
                      (typeof issue.assignedTo === "object"
                        ? issue.assignedTo.id
                        : issue.assignedTo) === worker.id &&
                      !["resolved", "completed"].includes((issue.status || "").toLowerCase())
                  );
                  const assignedCount = assignedIssues.length;
                  const isOccupied = assignedCount >= 10;
                  const isAvailable = assignedCount < 10;

                  // Only show assign/reassign button if:
                  // - Issue is unassigned
                  // - OR issue is assigned to a different worker
                  // - AND worker is not occupied
                  const canAssign =
                    issueId &&
                    (!currentAssigneeId || (currentAssigneeId && currentAssigneeId !== worker.id)) &&
                    !isOccupied;

                  // Prevent assigning the same worker to the same issue
                  const alreadyAssignedToThisIssue =
                    currentAssigneeId && currentAssigneeId === worker.id;

                  return (
                    <div
                      key={worker.id}
                      className="flex flex-col sm:flex-row items-center justify-between rounded-2xl p-6 shadow-md hover:shadow-xl hover:bg-gray-200 bg-[#f6f6f6] text-black border border-white/20 cursor-pointer transition-all duration-300"
                      onClick={() => navigate(`/workers/${worker.id}`)}
                      tabIndex={0}
                      role="button"
                      aria-label={`View details for ${worker.name}`}
                    >
                      {/* Left: Worker Info */}
                      <div className="w-full sm:w-auto">
                        <div className="relative flex items-center gap-2 text-lg font-bold text-black">
                          <span>{worker.name}</span>
                          <Badge className={`ml-2 text-xs ${isAvailable ? 'bg-green-300 text-white hover:bg-green-300' : 'bg-red-500 text-white hover:bg-red-500'}`}>
                            {isAvailable ? 'Available' : 'Unavailable'}
                          </Badge>
                        </div>
                        {assignedIssues.length > 0 && (
                          <div className="text-xs text-gray-700 font-semibold mt-1">
                            Assigned to Issues:{" "}
                            {assignedIssues.map((issue, idx) => (
                              <span key={issue.id}>
                                <a
                                  href={`/issues/${issue.id}`}
                                  className="underline text-gray-700"
                                  style={{ marginRight: 4 }}
                                  onClick={e => {
                                    e.stopPropagation();
                                    navigate(`/issues/${issue.id}`);
                                  }}
                                >
                                  {issue.id}
                                </a>
                                {idx < assignedIssues.length - 1 && ", "}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="flex flex-row gap-4 flex-wrap mt-2">
                          <div className="flex items-center gap-2 text-gray-700 text-base font-semibold">
                            <Briefcase className="h-4 w-4" />
                            <span>{worker.department || "N/A"}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-700 text-base font-semibold">
                            <Phone className="h-4 w-4" />
                            <span>{worker.phone || "N/A"}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600 text-sm">
                            <MapPin className="h-4 w-4" />
                            <span>{worker.location || "N/A"}</span>
                          </div>
                        </div>
                      </div>
                      {/* Right: Actions */}
                      <div className="mt-4 sm:mt-0 flex flex-row items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full sm:w-auto"
                          onClick={e => {
                            e.stopPropagation();
                            handleWorkerClick(worker);
                          }}
                        >
                          View Details
                        </Button>
                        {issueId && canAssign && !alreadyAssignedToThisIssue && (
                          <Button
                            size="sm"
                            variant="primary"
                            className="w-full sm:w-auto bg-primary text-primary-foreground font-semibold shadow hover:bg-primary/90 rounded-xl transition-all duration-200"
                            onClick={async (e) => {
                              e.stopPropagation();
                              try {
                                await assignWorker(issueId, worker);
                                toast({
                                  title: currentAssigneeId
                                    ? "Worker Reassigned"
                                    : "Worker Assigned",
                                  description: `${worker.name} has been ${currentAssigneeId ? "reassigned" : "assigned"} to the issue.`,
                                });
                                navigate(`/issues/${issueId}`);
                              } catch (error) {
                                toast({
                                  title: "Error",
                                  description: error.message || "Failed to assign worker to the issue.",
                                  variant: "destructive",
                                });
                              }
                            }}
                          >
                            {currentAssigneeId ? "Reassign to Worker" : "Assign to Issue"}
                          </Button>
                        )}
                        {isOccupied && (
                          <span className="ml-2 text-xs text-red-600 font-semibold">
                            Cannot assign more issues until some are resolved.
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            {filteredWorkers.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No workers match the selected filters.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

// Example navigation (from IssueDetails or elsewhere)
//navigate('/assign-worker', { state: { issueId: issue.id, department: issue.department } });
