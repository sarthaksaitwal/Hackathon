import { create } from 'zustand';
import { realtimeDb } from '../lib/firebase';
import { ref, get, update, onValue, off, set } from 'firebase/database';
import { useWorkersStore } from "@/store/workers";

export const useIssuesStore = create((set, getState) => ({
  issues: [],
  selectedIssue: null,
  loading: false,
  error: null,

  // Real-time listener for all issues from Realtime Database
  fetchIssues: () => {
    set({ loading: true, error: null });
    const complaintsRef = ref(realtimeDb, 'complaints');

    // Remove any previous listener
    if (getState()._unsubscribeIssues) {
      getState()._unsubscribeIssues();
    }

    const onValueCallback = (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const issues = Object.entries(data).map(([id, issue]) => {
          let coordinates = [0, 0];
          if (issue.gps) {
            const parts = issue.gps.split(',').map(part => parseFloat(part.trim()));
            if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
              coordinates = parts;
            }
          }
          return {
            id,
            ...issue,
            dateReported: issue.dateTime ? new Date(issue.dateTime) : null,
            deadline: issue.deadline ? new Date(issue.deadline) : null,
            photos: issue.photos ? Object.values(issue.photos) : [],
            audio: issue.audio ? Object.values(issue.audio) : [],
            location: issue.location || 'N/A',
            coordinates
          };
        });
        set({ issues, loading: false });
      } else {
        set({ issues: [], loading: false });
      }
    };

    onValue(complaintsRef, onValueCallback);

    // Store unsubscribe function in state for cleanup
    set({
      _unsubscribeIssues: () => off(complaintsRef, 'value', onValueCallback)
    });
  },
  // Internal: store unsubscribe function for real-time listener
  _unsubscribeIssues: null,

  setSelectedIssue: (issue) => set({ selectedIssue: issue }),

  getIssuesByStatus: (status) => getState().issues.filter(issue => issue.status === status),

  updateIssueStatus: async (id, status) => {
    try {
      const issueRef = ref(realtimeDb, `complaints/${id}`);
      await update(issueRef, { status });

      // Get the updated issue to find the assigned worker
      const issueSnapshot = await get(issueRef);
      const issue = issueSnapshot.exists() ? issueSnapshot.val() : null;

      // If the issue is resolved/completed, update the worker's resolvedIssuesId
      if (
        issue &&
        issue.assignedTo &&
        ["resolved", "completed"].includes(status.toLowerCase())
      ) {
        const workerRef = ref(realtimeDb, `workers/${issue.assignedTo}`);
        const workerSnapshot = await get(workerRef);
        const workerData = workerSnapshot.exists() ? workerSnapshot.val() : {};

        // Prepare resolvedIssuesId array
        let resolvedIssuesId = Array.isArray(workerData.resolvedIssuesId)
          ? [...workerData.resolvedIssuesId]
          : [];
        if (!resolvedIssuesId.includes(id)) {
          resolvedIssuesId.push(id);
        }

        await update(workerRef, {
          resolvedIssuesId,
        });
      }

      // Update local state
      set((state) => ({
        issues: state.issues.map((issue) =>
          issue.id === id ? { ...issue, status } : issue
        ),
      }));
    } catch (error) {
      set({ error: error.message });
    }
  },

  // Add new complaint
  addComplaint: async (complaintData) => {
    // This would typically be handled by a form submission
    // For now, just refetch after adding
    await getState().fetchIssues();
  },

  // Assign worker to issue
  assignWorker: async (issueId, worker) => {
    try {
      const workerKey = worker.workerId || worker.id;
      const issueRef = ref(realtimeDb, `complaints/${issueId}`);

      // Fetch current issue data
      const issueSnapshot = await get(issueRef);
      const issueData = issueSnapshot.exists() ? issueSnapshot.val() : {};

      // Prevent assigning the same worker to the same issue again
      const currentAssignee =
        typeof issueData.assignedTo === "object"
          ? issueData.assignedTo.id
          : issueData.assignedTo;
      if (currentAssignee && currentAssignee === workerKey) {
        throw new Error("This worker is already assigned to this issue.");
      }

      // Count active assigned issues for this worker
      const allIssuesSnapshot = await get(ref(realtimeDb, "complaints"));
      let assignedCount = 0;
      if (allIssuesSnapshot.exists()) {
        const allIssues = allIssuesSnapshot.val();
        assignedCount = Object.values(allIssues).filter(
          (issue) =>
            (typeof issue.assignedTo === "object"
              ? issue.assignedTo.id
              : issue.assignedTo) === workerKey &&
            !["resolved", "completed"].includes((issue.status || "").toLowerCase())
        ).length;
      }
      if (assignedCount >= 10) {
        throw new Error("This worker is occupied and cannot be assigned more issues until some are resolved.");
      }

      // Remove this issue from the previous worker's assignedIssueIds (if any)
      if (currentAssignee && currentAssignee !== workerKey) {
        const prevWorkerRef = ref(realtimeDb, `workers/${currentAssignee}`);
        const prevWorkerSnapshot = await get(prevWorkerRef);
        if (prevWorkerSnapshot.exists()) {
          const prevWorkerData = prevWorkerSnapshot.val();
          let prevAssignedIssueIds = Array.isArray(prevWorkerData.assignedIssueIds)
            ? [...prevWorkerData.assignedIssueIds]
            : [];
          prevAssignedIssueIds = prevAssignedIssueIds.filter(id => id !== issueId);
          await update(prevWorkerRef, { assignedIssueIds: prevAssignedIssueIds });
        }
      }

      // Add this issue to the new worker's assignedIssueIds
      const newWorkerRef = ref(realtimeDb, `workers/${workerKey}`);
      const newWorkerSnapshot = await get(newWorkerRef);
      let newAssignedIssueIds = [];
      if (newWorkerSnapshot.exists()) {
        const newWorkerData = newWorkerSnapshot.val();
        newAssignedIssueIds = Array.isArray(newWorkerData.assignedIssueIds)
          ? [...newWorkerData.assignedIssueIds]
          : [];
        if (!newAssignedIssueIds.includes(issueId)) {
          newAssignedIssueIds.push(issueId);
        }
      } else {
        newAssignedIssueIds = [issueId];
      }
      await update(newWorkerRef, { assignedIssueIds: newAssignedIssueIds });

      // Update the issue: assign to new worker and set assignedDate
      await update(issueRef, {
        assignedTo: workerKey,
        assignedDate: new Date().toISOString(),
        status: 'Assigned'
      });

      // Update local state if needed
      set(state => ({
        issues: state.issues.map(issue =>
          issue.id === issueId
            ? { ...issue, assignedTo: workerKey, assignedDate: new Date().toISOString(), status: 'Assigned' }
            : issue
        )
      }));
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },


  // When creating a new worker
  createWorker: async (workerId, workerData) => {
    try {
      const newWorker = {
        ...workerData,
        assignedIssueIds: [], // Only this
      };
      await set(ref(realtimeDb, `workers/${workerId}`), newWorker);
    } catch (error) {
      set({ error: error.message });
    }
  },

  // Fetch workers with real-time listener
  fetchWorkers: () => {
    return new Promise((resolve, reject) => {
      const workersRef = ref(realtimeDb, 'workers');
      // Remove any previous listener
      if (getState()._unsubscribeWorkers) {
        getState()._unsubscribeWorkers();
      }

      onValue(
        workersRef,
        (snapshot) => {
          const data = snapshot.val();
          if (data) {
            // Convert object to array
            const workersArray = Object.keys(data).map((key) => ({
              id: key,
              ...data[key],
            }));
            set({ workers: workersArray, error: null });
            resolve(workersArray);
          } else {
            set({ workers: [], error: null });
            resolve([]);
          }
        },
        (error) => {
          set({ error: error.message });
          reject(error);
        }
      );

      // Store unsubscribe function in state for cleanup
      set({
        _unsubscribeWorkers: () => off(workersRef, 'value')
      });
    });
  },
}));

// Run this once in your admin panel or Node script

async function addAssignedIssueIdToAllWorkers() {
  const workersRef = ref(realtimeDb, "workers");
  const snapshot = await get(workersRef);
  if (snapshot.exists()) {
    const workers = snapshot.val();
    for (const workerId in workers) {
      if (!workers[workerId].assignedIssueId) {
        await update(ref(realtimeDb, `workers/${workerId}`), { assignedIssueId: "" });
      }
    }
  }
}
addAssignedIssueIdToAllWorkers();

