import { useState } from 'react';
import { get, set, ref, query, orderByChild, equalTo } from "firebase/database";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { realtimeDb } from "@/lib/firebase";
import { useNavigate } from "react-router-dom";
import WorkerCreated from "@/pages/WorkerCreated";

const CATEGORY_CODES = {
  garbage: 'GBG',
  streetlight: 'SLT',
  roaddamage: 'RDG',
  water: 'WTR',
  drainage: 'DRN',
};

const DEPARTMENT_DISPLAY_MAP = {
  garbage: "Garbage",
  streetlight: "Streetlight",
  roaddamage: "Road Damage",
  water: "Water",
  drainage: "Drainage & Sewerage"
};

export default function CreateProfile() {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    department: '',
    pincode: '',
    password: '12345678', // still set in state for backend, but not shown in UI
  });
  const [workerId, setWorkerId] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      // Only allow numbers and max 10 digits
      if (!/^[0-9]{0,10}$/.test(value)) return;
    }
    if (name === 'pincode') {
      // Only allow numbers and max 6 digits
      if (!/^[0-9]{0,6}$/.test(value)) return;
    }
    setForm({ ...form, [name]: value });
  };

  // Generate worker ID by counting workers in Realtime Database
  const generateWorkerId = async (department, pincode) => {
    const workersRef = ref(realtimeDb, 'workers');
    const q = query(
      workersRef,
      orderByChild('department_pincode'),
      equalTo(`${department}_${pincode}`)
    );
    const snap = await get(q);
    const count = snap.exists() ? Object.keys(snap.val()).length : 0;
    const code = CATEGORY_CODES[department] || (department ? department.substring(0,3).toUpperCase() : 'GEN');
    const num = String(count + 1).padStart(3, '0');
    return `${code}-${pincode}-${num}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!/^[0-9]{10}$/.test(form.phone)) {
      setError('Phone number must be exactly 10 digits.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      // Fetch all workers (no index needed)
      const workersRef = ref(realtimeDb, 'workers');
      const allWorkersSnap = await get(workersRef);
      let duplicate = false;
      if (allWorkersSnap.exists()) {
        const allWorkers = Object.values(allWorkersSnap.val());
        // Check for duplicate phone
        duplicate = allWorkers.some(w => w.phone === form.phone);
        // Optionally, check for duplicate by name + department + pincode
        // duplicate = duplicate || allWorkers.some(
        //   w => w.name === form.name && w.department === form.department && w.pincode === form.pincode
        // );
      }
      if (duplicate) {
        setError('A worker with this phone number already exists.');
        setLoading(false);
        return;
      }

      const id = await generateWorkerId(form.department, form.pincode);
      setWorkerId(id);

      const workerData = {
        ...form,
        workerId: id,
        department_pincode: `${DEPARTMENT_DISPLAY_MAP[form.department] || form.department}_${form.pincode}`,
        department: DEPARTMENT_DISPLAY_MAP[form.department] || form.department, // <-- Use display name
        assignedIssueIds: [], 
      };

      await set(ref(realtimeDb, `workers/${id}`), workerData);

      setLoading(false);
      setShowSuccess(true);

      // Redirect to WorkerCreated page with worker info
      navigate("/worker-created", { state: { worker: workerData } });
    } catch (err) {
      setError('Failed to create worker.');
      setLoading(false);
      if (err && err.message) {
        console.error('Create worker error:', err.message);
      } else {
        console.error('Create worker error:', err);
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto mt-8 p-4 sm:p-8 bg-[#f6f6f6] rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-0">
        <h2 className="text-3xl font-bold mb-2 text-center text-primary">Create Worker Profile</h2>
        <p className="text-center text-muted-foreground mb-6">Fill out the form below to add a new worker. Each section is labeled for clarity.</p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-1 text-foreground">Personal Details</label>
            <div className="flex flex-col gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">Name</label>
                <Input id="name" name="name" value={form.name} onChange={handleChange} required className="w-full bg-[#f6f6f6]" />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-1">Phone No</label>
                <Input id="phone" name="phone" value={form.phone} onChange={handleChange} required type="tel" className="w-full bg-[#f6f6f6]" />
              </div>
            </div>
          </div>
          <div>
            <div className="flex flex-col gap-4">
              <div>
                <label htmlFor="department" className="block text-sm font-medium text-foreground mb-1">Department</label>
                <select
                  id="department"
                  name="department"
                  value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                  required
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-primary bg-[#f6f6f6]"
                >
                  <option value="">Select Department</option>
                  <option value="garbage">Garbage</option>
                  <option value="streetlight">Streetlight</option>
                  <option value="roaddamage">Road Damage</option>
                  <option value="water">Water</option>
                  <option value="drainage">Drainage & Sewerage</option>
                </select>
                <p className="text-xs text-muted-foreground mt-1">Select the department the worker will be assigned to.</p>
              </div>
              <div>
                <label htmlFor="pincode" className="block text-sm font-medium text-foreground mb-1">Pincode</label>
                <Input id="pincode" name="pincode" value={form.pincode} onChange={handleChange} required className="w-full bg-[#f6f6f6]" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1 text-foreground">Worker ID & Password</label>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">(Auto-generated after submission)</span>
              {workerId && (
                <>
                  <span className="text-green-600 font-mono text-sm">Worker ID: {workerId}</span>
                  <span className="text-blue-600 font-mono text-sm">Password: 12345678</span>
                </>
              )}
            </div>
          </div>
          {showSuccess && workerId && (
            <div className="mt-4 p-4 rounded bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-center">
              Worker created successfully!<br />
              <span className="block mt-2 font-mono">Worker ID: <span className="text-green-700 dark:text-green-300">{workerId}</span></span>
              <span className="block font-mono">Password: <span className="text-blue-700 dark:text-blue-300">12345678</span></span>
            </div>
          )}
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <Button type="submit" disabled={loading} className="mx-auto block">
            {loading ? "Creating..." : "Create Worker"}
          </Button>
        </form>
      </div>
    </DashboardLayout>
  );
}
