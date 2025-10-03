import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuthStore } from '@/store/auth';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Settings,
  Clock,
  CheckCircle,
  Tag
} from 'lucide-react';

export default function Profile() {
  const { user } = useAuthStore();

  if (!user) return null;

  const profileStats = [
    { label: 'Issues Managed', value: '247', icon: CheckCircle, color: 'text-green-500' },
    { label: 'Active Cases', value: '12', icon: Clock, color: 'text-yellow-500' },
    { label: 'Response Time', value: '2.1 hrs', icon: Clock, color: 'text-blue-500' },
    { label: 'Success Rate', value: '94%', icon: CheckCircle, color: 'text-green-500' }
  ];

  const recentActivity = [
    {
      action: 'Resolved pothole issue #1234',
      time: '2 hours ago',
      type: 'resolution'
    },
    {
      action: 'Assigned street light repair to Worker #A101',
      time: '4 hours ago',
      type: 'assignment'
    },
    {
      action: 'Updated status of sidewalk repair #5678',
      time: '1 day ago',
      type: 'update'
    },
    {
      action: 'Created new manual issue for traffic signal',
      time: '2 days ago',
      type: 'creation'
    }
  ];

  const permissionColor = (granted) => granted ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500';

  return (
    <DashboardLayout>
      <div className="p-6 space-y-8 bg-sidebar min-h-screen">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
          <h3 className="text-3xl font-bold text-gray-900 tracking-tight">Profile & Account Settings</h3>
          <Button variant="outline" className="rounded-full px-5 py-2 shadow hover:shadow-md transition">
            <Settings className="h-5 w-5 mr-2" />
            Edit Profile
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <Card className="rounded-2xl shadow-lg hover:shadow-xl transition-all border-0 bg-[#f6f6f6]">
            <CardHeader className="flex flex-col items-center pt-8 pb-4">
              <Avatar className="h-28 w-28 mb-4 shadow-lg">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="text-3xl">{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <CardTitle className="text-2xl font-bold text-gray-900">{user.name}</CardTitle>
              <CardDescription className="text-lg text-blue-600 font-medium">{user.role}</CardDescription>
              <Badge variant="secondary" className="mt-2 px-3 py-1 rounded-full text-base">
                <Shield className="h-4 w-4 mr-1" />
                Administrator
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4 px-8 pb-8">
              <div className="flex items-center gap-3 text-base text-gray-700">
                <Mail className="h-5 w-5 text-blue-400" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center gap-3 text-base text-gray-700">
                <Phone className="h-5 w-5 text-green-400" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center gap-3 text-base text-gray-700">
                <MapPin className="h-5 w-5 text-purple-400" />
                <span>City Hall, Downtown</span>
              </div>
              <div className="flex items-center gap-3 text-base text-gray-700">
                <Calendar className="h-5 w-5 text-yellow-400" />
                <span>Joined March 2023</span>
              </div>
              <div className="flex items-center gap-3 text-base text-gray-700">
                <User className="h-5 w-5 text-gray-400" />
                <span>Department: Public Works</span>
              </div>
              <div className="flex items-center gap-3 text-base text-gray-700">
                <Shield className="h-5 w-5 text-blue-400" />
                <span>Access Level: Administrator</span>
              </div>
              <div className="flex items-center gap-3 text-base text-gray-700">
                <Tag className="h-5 w-5 text-gray-400" />
                <span>Employee ID: EMP-2023-{user.id.padStart(4, '0')}</span>
              </div>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <Card className="rounded-2xl shadow-lg border-0 bg-[#f6f6f6]">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900">Performance Metrics</CardTitle>
              <CardDescription className="text-base text-gray-500">Your recent activity summary</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-2">
              {profileStats.map((stat, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${stat.color} bg-opacity-20`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div className="flex-1">
                    <span className="text-lg font-semibold text-gray-800">{stat.value}</span>
                    <span className="block text-sm text-gray-500">{stat.label}</span>
                  </div>
                  {/* Optional: Add a progress bar for metrics */}
                  {stat.label === 'Success Rate' && (
                    <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-2 bg-green-500 rounded-full" style={{ width: '94%' }} />
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Access Permissions */}
          <Card className="rounded-2xl shadow-lg border-0 bg-[#f6f6f6]">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900">Access Permissions</CardTitle>
              <CardDescription className="text-base text-gray-500">Your current system permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'View All Issues', granted: true },
                  { label: 'Assign Workers', granted: true },
                  { label: 'Update Issue Status', granted: true },
                  { label: 'View Analytics', granted: true },
                  { label: 'Manage Users', granted: true },
                  { label: 'System Configuration', granted: true }
                ].map((perm, idx) => (
                  <div key={idx} className={`flex items-center gap-2 p-3 rounded-xl shadow-sm ${permissionColor(perm.granted)}`}>
                    <Shield className="h-4 w-4" />
                    <span className="font-medium">{perm.label}</span>
                    <Badge variant="outline" className={`ml-auto text-xs ${perm.granted ? 'border-green-500 text-green-700' : 'border-gray-400 text-gray-500'}`}>
                      {perm.granted ? 'Granted' : 'Denied'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity Timeline */}
        <Card className="rounded-2xl shadow-lg border-0 bg-[#f6f6f6] mt-8">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900">Recent Activity</CardTitle>
            <CardDescription className="text-base text-gray-500">Your latest actions and system interactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative pl-6">
              {/* Timeline vertical line */}
              <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gray-200 rounded-full"></div>
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center gap-4 mb-8 relative">
                  {/* Timeline dot & icon */}
                  <div className="absolute left-0 top-2">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center shadow">
                      {activity.type === 'resolution' && <CheckCircle className="h-4 w-4 text-green-600" />}
                      {activity.type === 'assignment' && <User className="h-4 w-4 text-blue-600" />}
                      {activity.type === 'update' && <Settings className="h-4 w-4 text-yellow-600" />}
                      {activity.type === 'creation' && <Calendar className="h-4 w-4 text-purple-600" />}
                    </div>
                  </div>
                  <div className="ml-8">
                    <p className="text-base font-medium text-gray-800">{activity.action}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}