import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useWorkersStore } from '@/store/workers';
import { useIssuesStore } from '@/store/issues';
import { Loader2, BadgeCheck, FileText, User, Phone, Briefcase, MapPin, Hash } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

export default function WorkerDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { workers, fetchWorkers } = useWorkersStore();
  const { issues, fetchIssues } = useIssuesStore();
  const [worker, setWorker] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadWorker = async () => {
      try {
        if (workers.length === 0) {
          await fetchWorkers();
        }
        if (issues.length === 0) {
          await fetchIssues();
        }
        const foundWorker = workers.find(w => w.id === id);
        setWorker(foundWorker || null);
        setIsLoading(false);
      } catch (error) {
        setWorker(null);
        setIsLoading(false);
      }
    };
    loadWorker();
    // eslint-disable-next-line
  }, [id, workers.length, issues.length, fetchWorkers, fetchIssues]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-full min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </DashboardLayout>
    );
  }

  if (!worker) {
    return (
      <DashboardLayout>
        <div className="p-6 text-center text-gray-600">
          Worker not found.
          <Button className="mt-4" onClick={() => navigate(-1)}>
            Go Back
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  // Always use the database value for assignedIssueIds
  const assignedIssueIds = Array.isArray(worker.assignedIssueIds) ? worker.assignedIssueIds : [];

  // Compute assigned and resolved issues from the issues array
  const assignedIssues = issues.filter(
    (issue) =>
      (typeof issue.assignedTo === "object"
        ? issue.assignedTo.id
        : issue.assignedTo) === worker.id &&
      !["resolved", "completed"].includes((issue.status || "").toLowerCase())
  );

  const resolvedIssues = issues.filter(
    (issue) =>
      (typeof issue.assignedTo === "object"
        ? issue.assignedTo.id
        : issue.assignedTo) === worker.id &&
      ["resolved", "completed"].includes((issue.status || "").toLowerCase())
  );

  const assignedCount = assignedIssues.length;
  const isOccupied = assignedCount >= 10;
  const isAvailable = assignedCount < 10;

  // --- Section: Assigned Issues ---
  const assignedSection = assignedIssues.length > 0 ? (
    <ul className="space-y-4">
      {assignedIssues.map((issue) => (
        <li key={issue.id} className="p-4 bg-white border border-gray-300 rounded-lg">
          <div className="font-semibold text-blue-800 mb-1 flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Assigned to Issue:
            <span className="ml-2">{issue.title || issue.id}</span>
            <Badge variant="secondary" className={`ml-2 ${
              issue.status === 'Pending' ? 'bg-[rgb(236,236,187)] text-black' :
              issue.status === 'Assigned' ? 'bg-[rgb(213,180,180)] text-black' :
              issue.status === 'In Progress' ? 'bg-[rgb(193,216,195)] text-black' :
              issue.status === 'Resolved' ? 'bg-[rgb(202,232,189)] text-black' :
              issue.status === 'Review & Approve' ? 'bg-[rgb(241,166,97)] text-black' :
              'bg-gray-200 text-gray-900'
            }`}>{issue.status}</Badge>
          </div>
          <div className="text-sm text-gray-700">
            This worker is currently assigned to the above issue.
          </div>
          <Button
            className="mt-3 ml-3"
            variant="outline"
            onClick={() => navigate(`/issues/${issue.id}`)}
          >
            View Issue Details
          </Button>
        </li>
      ))}
    </ul>
  ) : (
    <div className="text-blue-700 font-semibold">
      This worker is not currently assigned to any issue.
    </div>
  );

  // --- Section: Resolved Issues ---
  const resolvedSection = (
    <div>
      {resolvedIssues.length === 0 ? (
        <div className="text-gray-500">No resolved issues yet.</div>
      ) : (
        <ul className="space-y-4">
          {resolvedIssues.map((issue) => (
            <li key={issue.id} className="p-4 bg-gray-50 rounded-lg">
          <div className="font-semibold text-green-800 mb-1 flex items-center gap-2">
            <FileText className="h-4 w-4" />
            {issue.title || issue.id}
            <Badge variant="secondary" className={`ml-2 ${
              issue.status === 'Pending' ? 'bg-[rgb(236,236,187)] text-black' :
              issue.status === 'Assigned' ? 'bg-[rgb(213,180,180)] text-black' :
              issue.status === 'In Progress' ? 'bg-[rgb(193,216,195)] text-black' :
              issue.status === 'Resolved' ? 'bg-[rgb(202,232,189)] text-black' :
              issue.status === 'Review & Approve' ? 'bg-[rgb(241,166,97)] text-black' :
              'bg-gray-200 text-gray-900'
            }`}>{issue.status}</Badge>
          </div>
              {/* <div className="text-sm text-gray-700">
                This issue was resolved by this worker.
              </div> */}
              <Button
                className="mt-3 ml-3"
                variant="outline"
                onClick={() => navigate(`/issues/${issue.id}`)}
              >
                View Issue Details
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  // --- Section: Header ---
  const headerSection = (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-blue-700 flex items-center gap-2">
          <BadgeCheck className="h-7 w-7" />
          {worker.name || 'Unnamed Worker'}
        </h2>
        <div className="text-sm text-muted-foreground mt-1 font-bold gap-2">
          Worker ID: <span className="font-mono text-base sm:text-lg">{worker.id}</span>
        </div>
      </div>
      <span
        className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${
          isOccupied
            ? "bg-[rgb(236,236,187)] text-black border border-yellow-300"
            : "bg-[rgb(202,232,189)] text-black border border-green-300"
        }`}
      >
        {isOccupied ? "Occupied" : "Available"}
      </span>
    </div>
  );

  // --- Section: Details ---
  const detailsSection = (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="flex items-center gap-2 text-gray-700">
        <Briefcase className="h-5 w-5 text-blue-700" />
        <span className="font-medium">Department:</span>
        <span>{worker.department || 'N/A'}</span>
      </div>
      <div className="flex items-center gap-2 text-gray-700">
        <Phone className="h-5 w-5 text-blue-700" />
        <span className="font-medium">Phone:</span>
        <span>{worker.phone || 'N/A'}</span>
      </div>
      <div className="flex items-center gap-2 text-gray-700">
        <MapPin className="h-5 w-5 text-blue-700" />
        <span className="font-medium">Location:</span>
        <span>{worker.location || 'N/A'}</span>
      </div>
      <div className="flex items-center gap-2 text-gray-700">
        <Hash className="h-5 w-5 text-blue-700" />
        <span className="font-medium">Pincode:</span>
        <span>{worker.pincode || 'N/A'}</span>
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-8 md:p-12 max-w-4xl mx-auto space-y-8 bg-gray-50">
        {/* Header */}
        {headerSection}

        {/* Details Section */}
        <Card className="rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-[#f6f6f6]">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-blue-700 flex items-center gap-2">
              <User className="h-6 w-6 text-blue-700" />
              Worker Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">{detailsSection}</CardContent>
        </Card>

        {/* Assigned Issues Section */}
        <Card className="rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-[#f6f6f6]">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-blue-700 flex items-center gap-2">
              <FileText className="h-6 w-6 text-blue-700" />
              Assigned Issues
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">{assignedSection}</CardContent>
        </Card>

        {/* Resolved Issues Section */}
        <Card className="rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-[#f6f6f6]">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-green-700 flex items-center gap-2">
              <FileText className="h-6 w-6 text-green-700" />
              Resolved Issues
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">{resolvedSection}</CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
