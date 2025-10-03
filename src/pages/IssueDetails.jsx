import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useIssuesStore } from "@/store/issues";
import { useToast } from "@/components/ui/use-toast";
import {
  MapPin,
  Calendar,
  Clock,
  User,
  Tag,
  Layers,
  UserCheck,
  Map as MapIcon,
  List,
  Folder,
  LocateFixed,
  Volume2,
  CheckCircle,
  Hourglass,
  UserCircle2,
  Wrench,
  BadgeCheck,
  Image as ImageIcon, // <-- Add this import for the image icon
} from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { ref, onValue, off, update, get } from "firebase/database";
import { realtimeDb } from "@/lib/firebase";

const ISSUE_TYPE_MAP = {
  RDG: "Road Damage",
  DRN: "Drainage & Sewage",
  WTR: "Water",
  GBG: "Garbage",
  SLT: "StreetLight",
};

export default function IssueDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { issues, fetchIssues, updateIssueStatus } = useIssuesStore();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [openPhoto, setOpenPhoto] = useState(null);
  const [realtimeIssue, setRealtimeIssue] = useState(null);
  const [showVoiceNote, setShowVoiceNote] = useState(false); // <-- move here
  const [showCompletionVoiceNote, setShowCompletionVoiceNote] = useState(false);

  // --- Realtime Issue State ---
  useEffect(() => {
    if (!id) return;
    const issueRef = ref(realtimeDb, `complaints/${id}`);
    const handleValue = (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        // Convert date fields to Date objects if present
        if (data.dateTime) data.dateReported = new Date(data.dateTime);
        if (data.deadline) data.deadline = new Date(data.deadline);
        setRealtimeIssue({ ...data, id });
        setIsLoading(false);
      } else {
        setRealtimeIssue(null);
        setIsLoading(false);
      }
    };
    onValue(issueRef, handleValue);
    return () => off(issueRef, "value", handleValue);
  }, [id]);

  // Use the real-time issue if available, else fallback to store
  const issue = realtimeIssue || issues.find((i) => i.id === id);

  // Helper to get issue type from token
  const getIssueTypeFromToken = (id) => {
    if (!id) return "Unknown";
    const prefix = id.split("-")[0];
    return ISSUE_TYPE_MAP[prefix] || "Unknown";
  };

  // Badge variants
  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case "new":
        return "default";
      case "pending":
        return "secondary";
      case "completed":
        return "outline";
      case "reverted":
        return "destructive";
      case "manual":
        return "outline";
      case "Assigned":
        return "outline";
      default:
        return "secondary";
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-full">
          <p className="text-gray-600">Loading issue details...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !issue) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-full">
          <p className="text-gray-600">{error || "Issue not found."}</p>
        </div>
      </DashboardLayout>
    );
  }

  // --- Section: Header ---
  const headerSection = (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-blue-700 flex items-center gap-2">
          {issue.title || getIssueTypeFromToken(issue.id) || "Untitled Issue"}
        </h2>
        <div className="text-sm text-muted-foreground mt-1 font-bold gap-2">
          Ref: <span className="font-mono text-base sm:text-lg">{issue.id}</span>
        </div>
      </div>
      <Badge
        variant={getStatusBadgeVariant(issue.status)}
        className="text-base px-4 py-1 rounded-full capitalize"
      >
        {issue.status}
      </Badge>
    </div>
  );

  // --- Section: Media (Photos & Audio) ---
  const mediaSection = (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Photos */}
      {issue.photos && issue.photos.length > 0 && (
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2 font-bold text-blue-700">
            <ImageIcon className="h-5 w-5 text-blue-600 " />
            Photos
          </div>
          <div className="flex gap-3 flex-wrap">
            {issue.photos.map((photoUrl, index) => (
              <div key={index} className="relative flex flex-col items-center">
                <img
                  src={photoUrl}
                  alt={`Photo ${index + 1}`}
                  className="w-44 h-44 object-cover rounded-lg border border-gray-200 cursor-pointer transition-transform duration-200 hover:scale-105 hover:shadow-lg"
                  onClick={() => setOpenPhoto(photoUrl)}
                  title="Click to view"
                />
                {/* Timestamp overlay on photo */}
                <span
                  className="absolute bottom-1 left-1 right-1 px-2 py-0.5 text-xs text-white bg-black/60 rounded-b-lg text-center"
                  style={{
                    fontSize: "0.75rem",
                    lineHeight: "1rem",
                    borderBottomLeftRadius: "0.5rem",
                    borderBottomRightRadius: "0.5rem",
                  }}
                >
                  {issue.photoTimestamps && issue.photoTimestamps[index]
                    ? new Date(issue.photoTimestamps[index]).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : issue.dateReported instanceof Date
                    ? issue.dateReported.toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : ""}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Audio Evidence (multiple audio files, if any) */}
      {issue.audio && issue.audio.length > 0 && (
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2 font-semibold">
            <Volume2 className="h-5 w-5 text-blue-600" />
            Audio Evidence
          </div>
          <div className="flex flex-col gap-2">
            {issue.audio.map((audioUrl, index) => (
              <audio key={index} controls className="w-full rounded-lg border border-gray-200">
                <source src={audioUrl} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            ))}
          </div>
        </div>
      )}
      {/* Voice Note REMOVED from this section */}
    </div>
  );

  // --- Section: Details ---
  const detailsSection = (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-gray-700">
          <MapPin className="h-5 w-5 text-blue-700" />
          <span className="font-medium">Location:</span>
          <span>
            {(issue.location || "N/A")
              .replace(/^([A-Z0-9\+]{6,},\s*)+/i, "")
              .split(",")
              .slice(-5)
              .map((s) => s.trim())
              .join(", ")}
          </span>
        </div>
        {(Array.isArray(issue.coordinates) && issue.coordinates.length === 2) ||
        (typeof issue.gps === "string" && issue.gps.split(",").length === 2) ? (
          <Button
            size="sm"
            variant="outline"
            className="px-3 py-1 text-xs whitespace-nowrap flex items-center gap-1 z-10"
            onClick={() => setShowMap(true)}
          >
            <MapIcon className="h-4 w-4" />
            View on Map
          </Button>
        ) : null}
      </div>
      {/* Rest of the details in a grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex items-center gap-2 text-gray-700">
          <Calendar className="h-5 w-5 text-blue-700" />
          <span className="font-medium">Reported:</span>
          <span>
            {issue.dateReported instanceof Date
              ? issue.dateReported.toLocaleString("en-IN", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "N/A"}
          </span>
        </div>
        <div className="flex items-center gap-2 text-gray-700">
          <Clock className="h-5 w-5 text-blue-700" />
          <span className="font-medium">Deadline:</span>
          <span>
            {issue.deadline instanceof Date
              ? issue.deadline.toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "2-digit",
                })
              : "N/A"}
          </span>
        </div>
        <div className="flex items-center gap-2 text-gray-700">
          <LocateFixed className="h-5 w-5 text-blue-700" />
          <span className="font-medium">GPS:</span>
          <span>
            {issue.gps ||
              (issue.coordinates && Array.isArray(issue.coordinates)
                ? `${issue.coordinates[0]}, ${issue.coordinates[1]}`
                : "N/A")}
          </span>
        </div>
        <div className="flex items-center gap-2 text-gray-700">
          <Layers className="h-5 w-5 text-blue-700" />
          <span className="font-medium">Subcategory:</span>
          <span>{issue.subcategory || "N/A"}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-700">
          <Folder className="h-5 w-5 text-blue-700" />
          <span className="font-medium">Category:</span>
          <span>{issue.category || getIssueTypeFromToken(issue.id)}</span>
        </div>
        {issue.assignedTo && (
          <div className="flex items-center gap-2 text-gray-700">
            <UserCheck className="h-5 w-5 text-blue-700" />
            <span className="font-medium">Assigned to:</span>
            <span>
              {typeof issue.assignedTo === "object"
                ? issue.assignedTo.name
                : issue.assignedTo}
            </span>
          </div>
        )}
      </div>
    </div>
  );

  // --- Section: Citizen Submission (Photos, Description, Voice Note) ---
  const citizenSubmissionsSection = (
    <div>
      {/* Photos */}
      {issue.photos && issue.photos.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2 font-bold text-black">
            <ImageIcon className="h-5 w-5 text-black" />
            Photos
          </div>
          <div className="flex gap-3 flex-wrap">
            {issue.photos.map((photoUrl, index) => (
              <div key={index} className="relative flex flex-col items-center">
                <img
                  src={photoUrl}
                  alt={`Photo ${index + 1}`}
                  className="w-36 h-36 object-cover rounded-xl border border-gray-200 cursor-pointer transition-transform duration-200 hover:scale-105 hover:shadow-lg"
                  onClick={() => setOpenPhoto(photoUrl)}
                  title="Click to view"
                />
                {/* Timestamp overlay on photo */}
                <span
                  className="absolute bottom-1 left-1 right-1 px-2 py-0.5 text-xs text-white bg-black/60 rounded-b-xl text-center"
                  style={{
                    fontSize: "0.75rem",
                    lineHeight: "1rem",
                    borderBottomLeftRadius: "0.75rem",
                    borderBottomRightRadius: "0.75rem",
                  }}
                >
                  {issue.photoTimestamps && issue.photoTimestamps[index]
                    ? new Date(issue.photoTimestamps[index]).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : issue.dateReported instanceof Date
                    ? issue.dateReported.toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : ""}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Description */}
      <div className="mb-2 font-semibold text-lg text-gray-800">Description</div>
      <div className="bg-gray-100 rounded-xl px-4 py-3 mb-4 text-base font-semibold text-gray-900">
        {issue.description || <span className="text-gray-500">No description provided</span>}
      </div>

      {/* Play Voice Note Button (old style) */}
      {issue.voiceNote && (
        <div>
          <Button
            size="sm"
            variant="outline"
            className="mb-2"
            onClick={() => setShowVoiceNote((v) => !v)}
          >
            <Volume2 className="h-4 w-4 mr-1" />
            {showVoiceNote ? "Hide Voice Note" : "Play Voice Note"}
          </Button>
          {showVoiceNote && (
            <audio controls className="w-full rounded-lg border border-gray-200 mt-2">
              <source src={issue.voiceNote} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
          )}
        </div>
      )}
    </div>
  );

  // --- Section: Worker Completion (Photos, Description, Voice Note) ---
  const workerCompletionSection =
    issue.status?.toLowerCase() === "resolved" &&
    (Array.isArray(issue.completionPhotos) && issue.completionPhotos.length > 0 ||
      !!issue.completionNotes ||
      !!issue.completionVoiceNote) ? (
      <Card className="shadow-card border-2 border-gray-300 rounded-2xl bg-[#f6f6f6]">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-bold text-blue-700 flex items-center gap-2">
            <UserCheck className="h-6 w-6 text-blue-700" />
            Worker Completion
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-2 pb-6 px-6">
          {/* Photos */}
          {Array.isArray(issue.completionPhotos) && issue.completionPhotos.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2 font-bold text-black">
                <ImageIcon className="h-5 w-5 text-black" />
                Photos
              </div>
              <div className="flex gap-3 flex-wrap">
                {issue.completionPhotos.map((photoUrl, index) => (
                  <div
                    key={index}
                    className="relative flex flex-col items-center"
                  >
                    <img
                      src={photoUrl}
                      alt={`Completion Photo ${index + 1}`}
                      className="w-36 h-36 object-cover rounded-xl border border-gray-200 cursor-pointer transition-transform duration-200 hover:scale-105 hover:shadow-lg"
                      title="Worker Uploaded Photo"
                      onClick={() => setOpenPhoto(photoUrl)}
                    />
                    {/* Timestamp below the photo */}
                    <span
                      className="absolute bottom-1 left-1 right-1 px-2 py-0.5 text-xs text-white bg-black/60 rounded-b-xl text-center"
                      style={{
                        fontSize: "0.75rem",
                        lineHeight: "1rem",
                        borderBottomLeftRadius: "0.75rem",
                        borderBottomRightRadius: "0.75rem",
                      }}
                    >
                      {Array.isArray(issue.completionTimestamps) && issue.completionTimestamps[index]
                        ? new Date(issue.completionTimestamps[index]).toLocaleString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : issue.completionTimestamp
                        ? new Date(issue.completionTimestamp).toLocaleString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : ""}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {issue.completionNotes && (
            <>
              <div className="mb-2 font-semibold text-lg text-gray-800">Description</div>
              <div className="bg-gray-100 rounded-xl px-4 py-3 mb-4 text-base font-semibold text-gray-900">
                {issue.completionNotes}
              </div>
            </>
          )}

          {/* Play Voice Note Button */}
          {issue.completionVoiceNote && (
            <div>
              <Button
                size="sm"
                variant="outline"
                className="mb-2"
                onClick={() => setShowCompletionVoiceNote((v) => !v)}
              >
                <Volume2 className="h-4 w-4 mr-1" />
                {showCompletionVoiceNote ? "Hide Voice Note" : "Play Voice Note"}
              </Button>
              {showCompletionVoiceNote && (
                <audio controls className="w-full rounded-lg border border-gray-200 mt-2">
                  <source src={issue.completionVoiceNote} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    ) : null;

  // --- Section: Horizontal Timeline ---
  const status = (issue.status || "").toLowerCase();

  const timelineSteps = [
    {
      icon: <CheckCircle className="h-7 w-7 text-green-600" />,
      title: "Complaint Submitted",
      subtitle:
        issue.dateReported instanceof Date
          ? issue.dateReported.toLocaleString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "N/A",
      desc: "",
      color: "text-green-700",
      active: true,
    },
    {
      icon: <Hourglass className="h-7 w-7 text-yellow-500" />,
      title: "Pending Review",
      subtitle: status === "pending" ? "In Progress" : "",
      desc: "Waiting for worker assignment",
      color: "text-yellow-700",
      active: ["pending", "assigned", "in progress", "resolved", "completed"].includes(status),
    },
    {
      icon: <UserCircle2 className="h-7 w-7 text-purple-600" />,
      title: "Assigned",
      subtitle:
        issue.assignedDate
          ? new Date(issue.assignedDate).toLocaleString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "Current Stage",
      desc: "Your complaint has been assigned to a municipal worker",
      color: "text-purple-700",
      active: ["assigned", "in progress", "resolved", "completed"].includes(status),
    },
    {
      icon: <Wrench className="h-7 w-7 text-blue-500" />,
      title: "In Progress",
      subtitle: ["in progress", "resolved", "completed"].includes(status) ? "Work Started" : "Not Yet",
      desc: "Work has started on your complaint.",
      color: "text-blue-700",
      active: ["in progress", "resolved", "completed"].includes(status),
    },
    {
      icon: <BadgeCheck className="h-7 w-7 text-gray-400" />,
      title: "Resolved",
      subtitle: ["resolved", "completed"].includes(status) ? "Completed" : "Not Yet",
      desc: "The issue has been resolved.",
      color: "text-gray-500",
      active: ["resolved", "completed"].includes(status),
    },
  ];

  const lastActiveIndex = Math.max(
    ...timelineSteps.map((step, idx) => (step.active ? idx : -1))
  );
  const assignedStepIndex = timelineSteps.findIndex((step) => step.title === "Assigned");

  const timelineSection = (
    <div>
      {/* <div className="font-semibold mb-4 text-lg">Status Timeline</div> */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-8 sm:gap-0 relative">
        {timelineSteps.map((step, idx, arr) => (
          <React.Fragment key={`timeline-step-${idx}`}>
            <div className="flex flex-col items-center flex-1 min-w-[120px] relative z-10">
              {/* Icon with highlight for current step */}
              <div className="mb-2">
                <div
                  className={`flex items-center justify-center rounded-full border-4
                  ${
                    idx === lastActiveIndex
                      ? "border-blue-500 bg-white shadow-lg"
                      : idx < lastActiveIndex
                      ? "border-blue-300 bg-blue-50"
                      : "border-gray-200 bg-gray-100 opacity-60"
                  }`}
                  style={{ width: 48, height: 48 }}
                >
                  {step.icon}
                </div>
              </div>
              {/* Title */}
              <div
                className={`font-semibold text-center text-sm sm:text-base ${
                  idx === lastActiveIndex
                    ? step.color
                    : idx < lastActiveIndex
                    ? "text-blue-500"
                    : "text-gray-400"
                }`}
              >
                {step.title}
              </div>
              {/* Subtitle */}
              <div
                className={`text-xs text-gray-500 text-center ${
                  idx > lastActiveIndex ? "opacity-60" : ""
                }`}
              >
                {step.subtitle}
              </div>
              {/* Description */}
              <div
                className={`text-xs text-gray-600 text-center mt-1 ${
                  idx > lastActiveIndex ? "opacity-60" : ""
                }`}
              >
                {step.desc}
              </div>
            </div>
            {/* Connector line */}
            {idx !== arr.length - 1 && (
              <div
                key={`timeline-connector-${idx}`}
                className="hidden sm:flex flex-1 h-2 relative z-0"
              >
                <div
                  className={`absolute top-1/2 left-0 right-0 h-1 rounded-full ${
                    idx < lastActiveIndex ? "bg-blue-400" : "bg-gray-200"
                  }`}
                  style={{ transform: "translateY(-50%)" }}
                />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );

  // --- Section: Actions ---
  // Show "Assign to Worker" if not assigned or timeline is before "Assigned"
  // Show "Reassign to Worker" if timeline is at "Assigned" or ahead

  const currentStepIndex = timelineSteps.findIndex((step) => step.active);
  const lastActiveStepIndex = Math.max(
    ...timelineSteps.map((step, idx) => (step.active ? idx : -1))
  );

  const isResolved = (issue.status || "").toLowerCase() === "resolved" || (issue.status || "").toLowerCase() === "completed";

  const actionsSection = !isResolved && (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-4 mt-8">
      {lastActiveIndex >= assignedStepIndex ? (
        <Button
          variant="primary"
          className="flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-base bg-blue-600 text-white shadow-lg hover:bg-blue-700 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 transition-all duration-200"
          onClick={() => {
            const normalize = (str) => (str || "").toLowerCase().replace(/\s+/g, "");
            navigate("/assign-worker", {
              state: {
                issueId: issue.id,
                department: normalize(issue.category),
              },
            });
          }}
        >
          <UserCheck className="h-5 w-5" />
          Reassign to Worker
        </Button>
      ) : (
        <Button
          variant="primary"
          className="flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-base bg-blue-600 text-white shadow-lg hover:bg-blue-700 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 transition-all duration-200"
          onClick={() => {
            const normalize = (str) => (str || "").toLowerCase().replace(/\s+/g, "");
            navigate("/assign-worker", {
              state: {
                issueId: issue.id,
                department: normalize(issue.category),
              },
            });
          }}
        >
          <CheckCircle className="h-5 w-5" />
          Assign to Worker
        </Button>
      )}
    </div>
  );

  // --- Section: Map Modal ---
  const mapCoordinates = Array.isArray(issue.coordinates) && issue.coordinates.length === 2
    ? issue.coordinates
    : typeof issue.gps === "string" && issue.gps.split(",").length === 2
      ? issue.gps.split(",").map(Number)
      : null;

  const mapModal =
    showMap && mapCoordinates ? (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
        <div className="bg-white rounded-2xl shadow-2xl p-6 relative w-full max-w-2xl">
          <button
            className="absolute top-3 right-3 text-gray-500 hover:text-red-500 text-2xl"
            onClick={() => setShowMap(false)}
            aria-label="Close map"
          >
            ✕
          </button>
          <h3 className="text-xl font-semibold mb-3 text-primary">
            Issue Location
          </h3>
          <div className="h-96 w-full rounded-xl overflow-hidden border border-gray-200">
            <MapContainer
              center={mapCoordinates}
              zoom={16}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={mapCoordinates}>
                <Popup>
                  <div>
                    <strong>{issue.title || "Issue Location"}</strong>
                    <div className="text-xs text-gray-700 mt-1">
                      {issue.location || "No location provided"}
                    </div>
                  </div>
                </Popup>
              </Marker>
            </MapContainer>
          </div>
        </div>
      </div>
    ) : null;

  // --- Section: Photo Modal ---
  const photoModal = openPhoto ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="relative">
        {/* Close button */}
        <button
          className="absolute top-3 right-3 text-white bg-black/70 rounded-full p-2 hover:bg-red-600 hover:text-white transition text-2xl z-10"
          onClick={() => setOpenPhoto(null)}
          aria-label="Close photo"
        >
          &times;
        </button>
        <div className="relative">
          <img
            src={openPhoto}
            alt="Full size"
            className="max-h-[80vh] max-w-[90vw] object-contain rounded-xl shadow-2xl border-4 border-white"
          />
          {/* Timestamp overlay on modal photo */}
          <span
            className="absolute bottom-2 left-2 right-2 px-3 py-1 text-base text-white bg-black/60 rounded-b-xl text-center"
            style={{
              fontSize: "1rem",
              lineHeight: "1.5rem",
              borderBottomLeftRadius: "0.75rem",
              borderBottomRightRadius: "0.75rem",
            }}
          >
            {(() => {
              // Check if openPhoto is a citizen photo
              let idx = issue.photos?.findIndex((url) => url === openPhoto);
              if (idx !== undefined && idx !== -1) {
                if (issue.photoTimestamps && issue.photoTimestamps[idx]) {
                  return new Date(issue.photoTimestamps[idx]).toLocaleString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                } else if (issue.dateReported instanceof Date) {
                  return issue.dateReported.toLocaleString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                }
              }
              // Check if openPhoto is a worker completion photo
              idx = issue.completionPhotos?.findIndex((url) => url === openPhoto);
              if (idx !== undefined && idx !== -1) {
                if (issue.completionTimestamps && issue.completionTimestamps[idx]) {
                  return new Date(issue.completionTimestamps[idx]).toLocaleString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                } else if (issue.completionTimestamp) {
                  // fallback to single completionTimestamp if available
                  return new Date(issue.completionTimestamp).toLocaleString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                }
              }
              return "";
            })()}
          </span>
        </div>
      </div>
    </div>
  ) : null;

  // --- Render ---
  return (
    <DashboardLayout>
      <div className="p-4 sm:p-8 md:p-12 max-w-5xl mx-auto space-y-8 bg-sidebar rounded-xl shadow-none">
        {/* Header */}
        {headerSection}

        {/* Details FIRST */}
        <Card className="shadow-card border-2 border-gray-300 rounded-2xl bg-[#f6f6f6]">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold text-blue-700 flex items-center gap-2">
              <Folder className="h-6 w-6 text-blue-700" />
              Issue Details
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2 pb-6 px-6">{detailsSection}</CardContent>
        </Card>

        {/* Citizen Submissions (Description, Voice Note, Photos) */}
        {(issue.description || (issue.photos && issue.photos.length > 0) || issue.voiceNote) && (
          <Card className="shadow-card border-2 border-gray-300 rounded-2xl bg-[#f6f6f6]">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-bold text-blue-700 flex items-center gap-2">
                <ImageIcon className="h-6 w-6 text-blue-700" />
                Citizen Submission
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-2 pb-6 px-6">
              {citizenSubmissionsSection}
            </CardContent>
          </Card>
        )}

        {/* Worker Completion Section (only if resolved) */}
        {workerCompletionSection}

        {/* Timeline */}
        <Card className="shadow-card border-2 border-gray-300 rounded-2xl bg-[#f6f6f6]">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold text-blue-700 flex items-center gap-2">
              <Wrench className="h-6 w-6 text-blue-700" />
              Status Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2 pb-6 px-6">{timelineSection}</CardContent>
        </Card>

        {/* Actions */}
        {actionsSection}

        {/* Modals */}
        {mapModal}
        {photoModal}
      </div>
    </DashboardLayout>
  );
}
