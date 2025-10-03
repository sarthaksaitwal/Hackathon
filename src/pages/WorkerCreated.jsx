import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

export default function WorkerCreated() {
  const location = useLocation();
  const navigate = useNavigate();
  const worker = location.state?.worker;

  if (!worker) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center">No worker data found.</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto mt-12">
        <Card className="bg-gray-50 min-h-[400px]">
          <CardHeader className="text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <CardTitle className="text-2xl text-blue-700">Worker Created Successfully</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-8 flex flex-col justify-center text-center text-lg">
            <div>
              <span className="font-semibold">Name:</span> {worker.name}
            </div>
            <div>
              <span className="font-semibold">Worker ID:</span> {worker.workerId}
            </div>
            <div>
              <span className="font-semibold">Phone:</span> {worker.phone}
            </div>
            <div>
              <span className="font-semibold">Department:</span> {worker.department}
            </div>
            <div>
              <span className="font-semibold">Pincode:</span> {worker.pincode}
            </div>
          </CardContent>
        </Card>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-6">
          <Button onClick={() => navigate("/assign-worker")}>
            Go to Workers List
          </Button>
          <Button onClick={() => navigate("/create-profile")}>
            Create Another Worker
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}