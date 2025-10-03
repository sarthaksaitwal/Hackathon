import { useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  MapPin, Users, BarChart3, Shield, Smartphone, Monitor, Wrench, TrendingUp, Star,
  Facebook, Twitter, Instagram, ArrowRight, CheckCircle, AlertTriangle, Clock, Eye, Target
} from 'lucide-react';

// Animated Counter Hook
function useAnimatedCounter(target, duration = 1200) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = target;
    if (start === end) return;
    let totalMilSecDur = parseInt(duration);
    let incrementTime = totalMilSecDur / end;
    let timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start === end) clearInterval(timer);
    }, incrementTime);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
}

export default function Landing() {
  const navigate = useNavigate();
  const [analyticsVisible, setAnalyticsVisible] = useState(false);
  const analyticsRef = useRef(null);

  // Animate analytics section on scroll
  useEffect(() => {
    const onScroll = () => {
      if (!analyticsRef.current) return;
      const rect = analyticsRef.current.getBoundingClientRect();
      if (rect.top < window.innerHeight - 100) setAnalyticsVisible(true);
    };
    window.addEventListener('scroll', onScroll);
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Animated counters
  const issuesResolved = useAnimatedCounter(analyticsVisible ? 1247 : 0, 1200);
  const avgResponse = analyticsVisible ? "2.3h" : "0h";
  const activeCitizens = useAnimatedCounter(analyticsVisible ? 15892 : 0, 1200);
  const satisfaction = useAnimatedCounter(analyticsVisible ? 98 : 0, 1200);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="bg-slate-900 text-white min-h-screen font-sans">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-800/90 backdrop-blur-md shadow-lg">
        <nav className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="text-2xl font-extrabold text-white cursor-default select-none tracking-tight">CivicTrack</div>
          <ul className="hidden md:flex space-x-8 text-white font-semibold">
            <li className="cursor-pointer hover:text-blue-400 hover:underline transition" onClick={() => scrollToSection('hero')}>Home</li>
            <li className="cursor-pointer hover:text-blue-400 hover:underline transition" onClick={() => scrollToSection('challenge')}>Challenge</li>
            <li className="cursor-pointer hover:text-blue-400 hover:underline transition" onClick={() => scrollToSection('how-it-works')}>How It Works</li>
            <li className="cursor-pointer hover:text-blue-400 hover:underline transition" onClick={() => scrollToSection('features')}>Features</li>
            {/* <li className="cursor-pointer hover:text-blue-400 hover:underline transition" onClick={() => scrollToSection('contact')}>Contact</li> */}
          </ul>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-blue-500/30 transition" onClick={() => navigate('/login')}>Sign In</Button>
        </nav>
      </header>

      {/* Hero Section */}
      <section
        id="hero"
        className="min-h-screen flex flex-col justify-center items-center px-4 pt-32 md:pt-24 relative bg-slate-900"
      >
        <div className="max-w-6xl mx-auto flex flex-col items-center justify-center gap-12 md:gap-20 w-full py-10 md:py-20">
          {/* Centered Hero Content */}
          <div className="flex flex-col items-center text-center space-y-6 md:space-y-8 w-full">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-2 leading-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">CivicTrack</span>
              <br />
              <span className="text-white">Empowering Citizens.<br />Streamlining Cities.</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-slate-200 mb-4 max-w-lg mx-auto">
              Report, track, and resolve civic issues in real-time with a powerful mobile-first solution powered by AI and community engagement.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center">
              <Button size="lg" variant="outline" className="bg-blue-700 hover:bg-green-700 text-white px-12 py-8 rounded-2xl font-semibold shadow transition-all duration-200 flex items-center gap-2" onClick={() => navigate('/login ')}>
                <Monitor className="w-10 h-18" /> Admin Login
              </Button>
            </div>
          </div>
          {/* Removed right side image section */}
        </div>
      </section>

      {/* Spacing */}
      <div className="h-8 md:h-16" />

      {/* Challenge Section */}
      <section id="challenge" className="min-h-screen flex items-center bg-slate-800">
        <div className="container mx-auto px-4 flex flex-col lg:flex-row gap-12 md:gap-20 items-center w-full py-10 md:py-20">
          {/* Left Side: Title, Description, Stats */}
          <div className="flex-1">
            <h2 className="text-5xl font-extrabold mb-6" style={{ color: "#23A6F0" }}>The Challenge</h2>
            <p className="text-xl text-slate-200 mb-8 max-w-xl">
              Municipalities worldwide struggle with inefficient civic issue management. Citizens face frustration with slow response times, lack of transparency, and poor accountability.
            </p>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <span className="w-14 h-14 rounded-full bg-[#4B263A] flex items-center justify-center">
                  <AlertTriangle className="w-7 h-7 text-[#F16D6F]" />
                </span>
                <span className="text-lg text-white font-semibold">Average resolution time: 30+ days</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="w-14 h-14 rounded-full bg-[#4B3F26] flex items-center justify-center">
                  <Clock className="w-7 h-7 text-[#FFD600]" />
                </span>
                <span className="text-lg text-yellow-100 font-semibold">60% of issues go unreported</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="w-14 h-14 rounded-full bg-[#4B3926] flex items-center justify-center">
                  <Star className="w-7 h-7 text-[#FFB86F]" />
                </span>
                <span className="text-lg text-orange-100 font-semibold">Low citizen satisfaction rates</span>
              </div>
            </div>
          </div>
          {/* Right Side: Issue Cards */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-[#353F4B] rounded-xl border-none p-6 flex flex-col justify-center min-h-[140px]">
              <CardHeader className="flex flex-row items-center gap-3 p-0">
                <span className="bg-transparent">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none"><path d="M7 20h10M6 20a1 1 0 0 1-1-1v-2.382a1 1 0 0 1 .553-.894l7-3.618a1 1 0 0 1 .894 0l7 3.618A1 1 0 0 1 22 16.618V19a1 1 0 0 1-1 1H6zm7-8V4a1 1 0 0 0-2 0v8" stroke="#F16D6F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
                <CardTitle className="text-white text-xl font-bold">Road Damage</CardTitle>
              </CardHeader>
              <CardContent className="pl-12 pt-2 text-slate-300 text-base">Potholes and road issues causing traffic delays</CardContent>
            </Card>
            <Card className="bg-[#353F4B] rounded-xl border-none p-6 flex flex-col justify-center min-h-[140px]">
              <CardHeader className="flex flex-row items-center gap-3 p-0">
                <span className="bg-transparent">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none"><rect x="3" y="7" width="18" height="10" rx="2" fill="#3FE0B0"/><rect x="7" y="11" width="10" height="2" rx="1" fill="#fff"/></svg>
                </span>
                <CardTitle className="text-white text-xl font-bold">Waste Management</CardTitle>
              </CardHeader>
              <CardContent className="pl-12 pt-2 text-slate-300 text-base">Overflowing bins and waste collection issues</CardContent>
            </Card>
            <Card className="bg-[#353F4B] rounded-xl border-none p-6 flex flex-col justify-center min-h-[140px]">
              <CardHeader className="flex flex-row items-center gap-3 p-0">
                <span className="bg-transparent">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none"><path d="M12 2v6M12 14v8M7 7l5 5 5-5" stroke="#FFD600" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="12" r="10" stroke="#FFD600" strokeWidth="2"/></svg>
                </span>
                <CardTitle className="text-white text-xl font-bold">Street Lighting</CardTitle>
              </CardHeader>
              <CardContent className="pl-12 pt-2 text-slate-300 text-base">Broken streetlights affecting safety</CardContent>
            </Card>
            <Card className="bg-[#353F4B] rounded-xl border-none p-6 flex flex-col justify-center min-h-[140px]">
              <CardHeader className="flex flex-row items-center gap-3 p-0">
                <span className="bg-transparent">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none"><path d="M4 12c0-4.418 3.582-8 8-8s8 3.582 8 8" stroke="#3FE0B0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M4 12c0 4.418 3.582 8 8 8s8-3.582 8-8" stroke="#3FE0B0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M8 12h8" stroke="#3FE0B0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
                <CardTitle className="text-white text-xl font-bold">Water Issues</CardTitle>
              </CardHeader>
              <CardContent className="pl-12 pt-2 text-slate-300 text-base">Pipe leaks and water quality problems</CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Spacing */}
      <div className="h-8 md:h-16" />

      {/* How It Works Section */}
      <section id="how-it-works" className="min-h-screen flex items-center bg-slate-900">
        <div className="container mx-auto px-4 w-full py-10 md:py-20">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-center mb-12 text-white">How It Works</h2>
          <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-1 items-center">
            {/* 1. Citizen Reports Issue */}
            <div>
              <h3 className="text-2xl font-extrabold text-white mb-3">1. Issue is Reported by Citizen</h3>
              <p className="text-lg text-slate-300 mb-2">Citizens report civic issues like potholes or garbage using the mobile app.</p>
            </div>
            <div>
              <img src="/report_issue.png" alt="Citizen reporting an issue" className="w-[600px] h-[400px] object-cover mx-auto rounded-xl overflow-hidden" />
            </div>
            {/* Arrow */}
            <div className="col-span-2 flex justify-center items-center">
              <ArrowRight className="w-8 h-8 text-blue-400" />
            </div>
            {/* 2. Automated Routing */}
            <div>
              <img src="/assign_worker.png" alt="Issue assigned to worker" className="w-[600px] h-[400px] object-cover mx-auto rounded-xl overflow-hidden" />
            </div>
            <div>
<h3 className="text-2xl font-extrabold text-white mb-3 text-right">2. Issue Assigned to Worker</h3>
<p className="text-lg text-slate-300 mb-2 text-right">System assigns the issue to the right municipal worker or department.</p>
            </div>
            {/* Arrow */}
            <div className="col-span-2 flex justify-center items-center">
              <ArrowRight className="w-8 h-8 text-purple-400" />
            </div>
            {/* 3. Department Coordination */}
            <div>
<h3 className="text-2xl font-extrabold text-white mb-3">3. Complaint is Marked as "In Progress" by Worker</h3>
<p className="text-lg text-slate-300 mb-2">Worker accepts the issue and updates the status.</p>
            </div>
            <div>
              <img src="/inprogress.png" alt="Issue marked as in progress" className="w-[600px] h-[400px] object-cover mx-auto rounded-xl overflow-hidden" />
            </div>
            {/* Arrow */}
            <div className="col-span-2 flex justify-center items-center">
              <ArrowRight className="w-8 h-8 text-green-400" />
            </div>
            {/* 4. Issue Resolution */}
            <div>
              <img src="/upload_image.png" alt="Worker uploads image of completed task" className="w-[600px] h-[400px] object-cover mx-auto rounded-xl overflow-hidden" />
            </div>
            <div>
<h3 className="text-2xl font-extrabold text-white mb-3 text-right">4. Worker Uploads Picture of Completed Task</h3>
<p className="text-lg text-slate-300 mb-2 text-right">After resolving the issue, worker uploads a photo as proof.</p>
            </div>
            {/* Arrow */}
            <div className="col-span-2 flex justify-center items-center">
              <ArrowRight className="w-8 h-8 text-blue-400" />
            </div>
            {/* 5. Citizen Feedback */}
            <div>
<h3 className="text-2xl font-extrabold text-white mb-3">5. Issue Resolved</h3>
<p className="text-lg text-slate-300 mb-2">System marks the issue as resolved and notifies the citizen.</p>
            </div>
            <div>
              <img src="/resolved.png" alt="Issue resolved confirmation" className="w-[600px] h-[400px] object-cover mx-auto rounded-xl overflow-hidden" />
            </div>
          </div>
        </div>
      </section>

      {/* Spacing */}
      <div className="h-8 md:h-16" />

      {/* Features Section */}
      <section id="features" className="min-h-screen flex items-center bg-slate-800">
        <div className="container mx-auto px-4 w-full py-10 md:py-20">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-center mb-2 text-blue-400">Powerful Features</h2>
          <p className="text-center text-slate-300 mb-10 text-base sm:text-lg">
            Everything you need to transform civic issue management in your city
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Real-Time Reporting */}
            <Card className="bg-[#232B36] rounded-2xl border border-[#4A5568] p-6 flex flex-col min-h-[270px] shadow-md">
              <CardHeader className="flex flex-row items-center gap-3 p-0 mb-2">
                <span className="bg-[#2ED8A7] rounded-lg p-2 flex items-center justify-center">
                  {/* Camera Icon */}
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none"><rect x="3" y="7" width="18" height="14" rx="3" fill="#2ED8A7"/><circle cx="12" cy="14" r="4" fill="#fff"/></svg>
                </span>
                <CardTitle className="text-white text-xl font-bold">Real-Time Reporting</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-300 text-base mb-4">
                Capture high-quality images, record voice notes, and automatically tag precise GPS locations with one-tap reporting.
              </CardContent>
              <ul className="text-gray-300 text-sm space-y-1 pl-2">
                <li>✔ HD Photo Capture</li>
                <li>✔ Voice Note Recording</li>
                <li>✔ Automatic GPS Tagging</li>
              </ul>
            </Card>
            {/* AI-Powered Routing */}
            <Card className="bg-[#232B36] rounded-2xl border border-[#4A5568] p-6 flex flex-col min-h-[270px] shadow-md">
              <CardHeader className="flex flex-row items-center gap-3 p-0 mb-2">
                <span className="bg-[#B96AFF] rounded-lg p-2 flex items-center justify-center">
                  {/* AI Icon */}
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none"><ellipse cx="16" cy="8" rx="4" ry="4" fill="#B96AFF"/><ellipse cx="8" cy="16" rx="4" ry="4" fill="#fff"/></svg>
                </span>
                <CardTitle className="text-white text-xl font-bold">AI-Powered Routing</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-300 text-base mb-4">
                Machine learning algorithms automatically categorize issues and route them to the right department with 98.5% accuracy.
              </CardContent>
              <div className="flex flex-col gap-1 text-xs mt-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Processing Speed</span>
                  <span className="text-purple-300">&lt; 3s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Accuracy Rate</span>
                  <span className="text-purple-300">98.5%</span>
                </div>
              </div>
            </Card>
            {/* Live Issue Tracking */}
            <Card className="bg-[#232B36] rounded-2xl border border-[#4A5568] p-6 flex flex-col min-h-[270px] shadow-md">
              <CardHeader className="flex flex-row items-center gap-3 p-0 mb-2">
                <span className="bg-[#23E06B] rounded-lg p-2 flex items-center justify-center">
                  {/* Tracking Icon */}
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none"><path d="M12 2v20M2 12h20" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="12" r="8" fill="#23E06B"/></svg>
                </span>
                <CardTitle className="text-white text-xl font-bold">Live Issue Tracking</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-300 text-base mb-4">
                Citizens and supervisors can track issue progress in real-time with detailed timeline and status updates.
              </CardContent>
              <div className="space-y-1 text-sm mt-2">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-yellow-400 inline-block" />
                  <span className="text-slate-200">Reported</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-400 inline-block" />
                  <span className="text-slate-200">Assigned</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-green-400 inline-block" />
                  <span className="text-slate-200">In Progress</span>
                </div>
              </div>
            </Card>
            {/* Advanced Analytics */}
            <Card className="bg-[#232B36] rounded-2xl border border-[#4A5568] p-6 flex flex-col min-h-[270px] shadow-md">
              <CardHeader className="flex flex-row items-center gap-3 p-0 mb-2">
                <span className="bg-[#FFB86F] rounded-lg p-2 flex items-center justify-center">
                  {/* Analytics Icon */}
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none"><rect x="4" y="12" width="4" height="8" fill="#FFB86F"/><rect x="10" y="8" width="4" height="12" fill="#fff"/><rect x="16" y="4" width="4" height="16" fill="#FFB86F"/></svg>
                </span>
                <CardTitle className="text-white text-xl font-bold">Advanced Analytics</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-300 text-base mb-4">
                Comprehensive dashboard with insights on issue trends, response times, department performance, and citizen satisfaction.
              </CardContent>
              <div className="flex gap-4 text-xs mt-2">
                <div>
                  <span className="bg-slate-700 text-yellow-300 px-2 py-1 rounded-full">4.2h</span>
                  <span className="text-slate-400 ml-1">Avg Response</span>
                </div>
                <div>
                  <span className="bg-slate-700 text-orange-300 px-2 py-1 rounded-full">89%</span>
                  <span className="text-slate-400 ml-1">Resolution Rate</span>
                </div>
              </div>
            </Card>
            {/* Role-Based Access */}
            <Card className="bg-[#232B36] rounded-2xl border border-[#4A5568] p-6 flex flex-col min-h-[270px] shadow-md">
              <CardHeader className="flex flex-row items-center gap-3 p-0 mb-2">
                <span className="bg-[#B96AFF] rounded-lg p-2 flex items-center justify-center">
                  {/* Role Icon */}
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none"><circle cx="8" cy="12" r="4" fill="#fff"/><circle cx="16" cy="12" r="4" fill="#B96AFF"/></svg>
                </span>
                <CardTitle className="text-white text-xl font-bold">Role-Based Access</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-300 text-base mb-4">
                Separate optimized interfaces for citizens, field workers, and supervisors with appropriate permissions and features.
              </CardContent>
              <ul className="text-gray-300 text-sm space-y-1 pl-2 mt-2">
                <li>• Citizen Mobile App</li>
                <li>• Field Worker App</li>
                <li>• Supervisor Dashboard</li>
              </ul>
            </Card>
            {/* Grievance System */}
            <Card className="bg-[#232B36] rounded-2xl border border-[#4A5568] p-6 flex flex-col min-h-[270px] shadow-md">
              <CardHeader className="flex flex-row items-center gap-3 p-0 mb-2">
                <span className="bg-[#FF6F91] rounded-lg p-2 flex items-center justify-center">
                  {/* Grievance Icon */}
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none"><rect x="6" y="6" width="12" height="12" rx="6" fill="#FF6F91"/><rect x="10" y="10" width="4" height="4" rx="2" fill="#fff"/></svg>
                </span>
                <CardTitle className="text-white text-xl font-bold">Grievance System</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-300 text-base mb-4">
                Citizens can raise complaints about resolution quality or delays, ensuring accountability and continuous improvement.
              </CardContent>
              <div className="flex gap-4 text-xs mt-2">
                <span className="bg-slate-700 text-slate-200 px-2 py-1 rounded-full">Escalation Available</span>
                <span className="bg-slate-700 text-slate-300 px-2 py-1 rounded-full">24/7 Support</span>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Spacing */}
      <div className="h-8 md:h-16" />

      {/* App Showcase Section */}
      <section id="app-showcase" className="min-h-screen flex items-center bg-slate-900">
        <div className="container mx-auto px-4 w-full py-10 md:py-20">
          <h2 className="text-4xl font-extrabold text-center mb-2" style={{ color: "#23A6F0" }}>App Showcase</h2>
          <p className="text-center text-slate-300 mb-10 text-base">
            Experience the intuitive design across all platforms – mobile apps for citizens and workers, web dashboard for supervisors
          </p>
          {/* Citizen Mobile App */}
          <h3 className="text-lg font-bold text-center mb-4 text-white">Citizen Mobile App</h3>
          <div className="flex flex-wrap justify-center gap-6 mb-12">
            {["/app1.png", "/app2.png", "/app3.png", "/app4.png", "/app5.png"].map((src, idx) => (
              <div
                key={idx}
                className="w-60 h-90 rounded-xl shadow-lg bg-white flex items-center justify-center overflow-hidden"
              >
                <img
                  src={src}
                  alt={`App Screenshot ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
          {/* Supervisor Web Dashboard */}
          <h3 className="text-lg font-bold text-center mb-4 text-white">Supervisor Web Dashboard</h3>
          <div className="flex justify-center mb-12 relative">
            <div className="w-full max-w-4xl rounded-2xl shadow-2xl border-4 border-slate-700 bg-white overflow-hidden flex items-center justify-center">
              <img
                src="/webdashboard.png"
                alt="Dashboard Screenshot"
                className="w-full h-auto max-h-[600px] object-cover"
              />
            </div>
          </div>
          {/* Field Worker Mobile App */}
          <h3 className="text-lg font-bold text-center mb-4 text-white">Field Worker Mobile App</h3>
          <div className="flex flex-wrap justify-center gap-6">
            {["/workerapp1.png", "/workerapp2.png", "/workerapp3.png"].map((src, idx) => (
              <div
                key={idx}
                className="w-60 h-90 rounded-xl shadow-lg bg-white flex items-center justify-center overflow-hidden"
              >
                <img
                  src={src}
                  alt={`Field App Screenshot ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Spacing */}
      <div className="h-8 md:h-16" />

      {/* Analytics Section */}
      <section id="analytics" className="min-h-screen flex items-center bg-slate-800">
        <div className="container mx-auto px-4 w-full py-10 md:py-20">
          <h2 className="text-5xl font-extrabold text-center mb-2" style={{ color: "#23A6F0" }}>Real-Time Analytics</h2>
          <p className="text-center text-slate-300 mb-10 text-lg">
            Make data-driven decisions with comprehensive insights and performance metrics
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* City Performance Overview */}
            <div className="bg-[#232B36] rounded-2xl border border-[#4A5568] p-8 shadow-md flex-1">
              <h3 className="text-white text-xl font-bold mb-6">City Performance Overview</h3>
              <div className="space-y-4">
                <div className="bg-[#2A3550] rounded-lg px-6 py-4 flex items-center justify-between">
                  <div>
                    <div className="text-blue-400 text-2xl font-bold">1,247</div>
                    <div className="text-slate-300 text-sm">Issues Reported This Month</div>
                  </div>
                  <div className="text-green-400 text-sm font-semibold">↑ 12%</div>
                </div>
                <div className="bg-[#23403A] rounded-lg px-6 py-4 flex items-center justify-between">
                  <div>
                    <div className="text-green-400 text-2xl font-bold">1,089</div>
                    <div className="text-slate-300 text-sm">Issues Resolved</div>
                  </div>
                  <div className="text-green-400 text-sm font-semibold">↑ 18%</div>
                </div>
                <div className="bg-[#4B3926] rounded-lg px-6 py-4 flex items-center justify-between">
                  <div>
                    <div className="text-yellow-300 text-2xl font-bold">4.2 hrs</div>
                    <div className="text-slate-300 text-sm">Average Response Time</div>
                  </div>
                  <div className="text-red-400 text-sm font-semibold">↓ 23%</div>
                </div>
              </div>
            </div>
            {/* Issue Categories */}
            <div className="bg-[#232B36] rounded-2xl border border-[#4A5568] p-8 shadow-md flex-1">
              <h3 className="text-white text-xl font-bold mb-6">Issue Categories</h3>
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-blue-400" />
                    <span className="text-white font-semibold">Road Infrastructure</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 rounded-full bg-blue-400/30">
                      <div className="h-2 rounded-full bg-blue-400" style={{ width: '35%' }}></div>
                    </div>
                    <span className="text-blue-400 font-bold text-sm">35%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Monitor className="w-5 h-5 text-green-400" />
                    <span className="text-white font-semibold">Waste Management</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 rounded-full bg-green-400/30">
                      <div className="h-2 rounded-full bg-green-400" style={{ width: '28%' }}></div>
                    </div>
                    <span className="text-green-400 font-bold text-sm">28%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-400" />
                    <span className="text-white font-semibold">Street Lighting</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 rounded-full bg-yellow-400/30">
                      <div className="h-2 rounded-full bg-yellow-400" style={{ width: '22%' }}></div>
                    </div>
                    <span className="text-yellow-400 font-bold text-sm">22%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wrench className="w-5 h-5 text-cyan-300" />
                    <span className="text-white font-semibold">Water & Drainage</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 rounded-full bg-cyan-300/30">
                      <div className="h-2 rounded-full bg-cyan-300" style={{ width: '15%' }}></div>
                    </div>
                    <span className="text-cyan-300 font-bold text-sm">15%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Department Performance */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#232B36] rounded-2xl border border-[#4A5568] p-8 shadow-md flex flex-col items-center">
              <span className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 via-green-400 to-purple-400 flex items-center justify-center mb-4">
                {/* Public Works Icon */}
                <Wrench className="w-8 h-8 text-white" />
              </span>
              <h4 className="text-white text-lg font-bold mb-2">Public Works</h4>
              <div className="text-green-400 text-3xl font-bold mb-1">92%</div>
              <div className="text-slate-400 text-sm mb-1">Resolution Rate</div>
              <div className="text-blue-400 text-xs">3.8 hrs avg response</div>
            </div>
            <div className="bg-[#232B36] rounded-2xl border border-[#4A5568] p-8 shadow-md flex flex-col items-center">
              <span className="w-14 h-14 rounded-full bg-gradient-to-br from-green-400 via-blue-400 to-purple-400 flex items-center justify-center mb-4">
                {/* Sanitation Icon */}
                <Monitor className="w-8 h-8 text-white" />
              </span>
              <h4 className="text-white text-lg font-bold mb-2">Sanitation</h4>
              <div className="text-green-400 text-3xl font-bold mb-1">88%</div>
              <div className="text-slate-400 text-sm mb-1">Resolution Rate</div>
              <div className="text-blue-400 text-xs">5.2 hrs avg response</div>
            </div>
            <div className="bg-[#232B36] rounded-2xl border border-[#4A5568] p-8 shadow-md flex flex-col items-center">
              <span className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-400 via-orange-400 to-pink-400 flex items-center justify-center mb-4">
                {/* Utilities Icon */}
                <Star className="w-8 h-8 text-white" />
              </span>
              <h4 className="text-white text-lg font-bold mb-2">Utilities</h4>
              <div className="text-green-400 text-3xl font-bold mb-1">95%</div>
              <div className="text-slate-400 text-sm mb-1">Resolution Rate</div>
              <div className="text-blue-400 text-xs">2.1 hrs avg response</div>
            </div>
          </div>
        </div>
      </section>

      {/* Spacing */}
      <div className="h-8 md:h-16" />

      {/* Testimonials Section */}
      <section className="min-h-screen flex items-center bg-slate-900">
        <div className="container mx-auto px-4 w-full py-10 md:py-20">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-10">What Our Users Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: "Sarah Johnson", role: "City Manager, Springfield", quote: "CivicTrack has transformed how we handle city issues. Response times are down, and citizen satisfaction is up!" },
              { name: "Mike Chen", role: "Resident, Metro City", quote: "As a citizen, I love being able to track my reported issues in real-time. It's empowering!" },
              { name: "Dr. Emily Rodriguez", role: "Urban Planner, Techville", quote: "The analytics dashboard gives us insights we never had before. Game-changer for urban management." },
            ].map((t, i) => (
              <Card key={i} className="bg-slate-800 border-slate-700 rounded-xl shadow hover:shadow-blue-500/30 transition">
                <CardContent className="pt-6">
                  <div className="flex mb-4">
                    <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center mr-3">
                      <Users className="w-6 h-6 text-slate-500" />
                    </div>
                    {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 text-yellow-400 fill-current animate-fade-in" />)}
                  </div>
                  <p className="text-slate-300 mb-4">"{t.quote}"</p>
                  <p className="font-semibold">{t.name}</p>
                  <p className="text-slate-400 text-sm">{t.role}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Spacing */}
      <div className="h-8 md:h-16" />

      {/* Vision Section */}
      <section id="vision" className="min-h-screen flex items-center bg-slate-800">
        <div className="container mx-auto px-4 text-center w-full py-10 md:py-20">
          <h2 className="text-5xl font-extrabold mb-6" style={{ color: "#23A6F0" }}>Our Vision</h2>
          <p className="text-2xl text-white mb-10 max-w-3xl mx-auto">
            Our mission is to create connected, responsive cities where every citizen's voice matters and every issue gets resolved quickly. Powered by AI, real-time analytics, and scalable infrastructure, CivicTrack drives transparency, accountability, and progress.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 justify-center">
            {/* Citizen-Centric */}
            <div className="bg-[#353F4B] rounded-xl border border-slate-400 p-8 flex flex-col items-center justify-center shadow-md">
              <span className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 via-green-400 to-purple-400 flex items-center justify-center mb-4">
                {/* Users Icon */}
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="12" fill="url(#grad1)" />
                  <g>
                    <circle cx="12" cy="10" r="3" fill="#fff"/>
                    <path d="M6 18c0-2 4-3 6-3s6 1 6 3v1H6v-1z" fill="#fff"/>
                  </g>
                  <defs>
                    <radialGradient id="grad1" cx="0.5" cy="0.5" r="0.5">
                      <stop offset="0%" stopColor="#23A6F0"/>
                      <stop offset="100%" stopColor="#2ED8A7"/>
                    </radialGradient>
                  </defs>
                </svg>
              </span>
              <h3 className="text-xl font-bold text-white mb-2">Citizen-Centric</h3>
              <p className="text-slate-300 text-base">Every feature designed with citizen experience in mind</p>
            </div>
            {/* Data-Driven */}
            <div className="bg-[#353F4B] rounded-xl border border-slate-400 p-8 flex flex-col items-center justify-center shadow-md">
              <span className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 via-blue-400 to-purple-400 flex items-center justify-center mb-4">
                {/* Chart/Check Icon */}
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="12" fill="url(#grad2)" />
                  <path d="M8 13l3 3 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              <h3 className="text-xl font-bold text-white mb-2">Data-Driven</h3>
              <p className="text-slate-300 text-base">Actionable insights for smarter city management</p>
            </div>
            {/* Future-Ready */}
            <div className="bg-[#353F4B] rounded-xl border border-slate-400 p-8 flex flex-col items-center justify-center shadow-md">
              <span className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400 flex items-center justify-center mb-4">
                {/* Rocket Icon */}
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="12" fill="url(#grad3)" />
                  <path d="M12 17v-4m0 0l2-2m-2 2l-2-2m2 2V7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              <h3 className="text-xl font-bold text-white mb-2">Future-Ready</h3>
              <p className="text-slate-300 text-base">Built for the cities of tomorrow, today</p>
            </div>
          </div>
        </div>
      </section>

      {/* Spacing */}
      <div className="h-8 md:h-16" />

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">CivicTrack</h3>
              <p className="text-slate-400">Empowering citizens, streamlining cities.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Navigation</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition">Home</a></li>
                <li><a href="#" className="hover:text-white transition">Features</a></li>
                <li><a href="#" className="hover:text-white transition">About</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition">API</a></li>
                <li><a href="#" className="hover:text-white transition">Status</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <div className="flex space-x-4">
                <Facebook className="w-6 h-6 text-slate-400 hover:text-blue-400 cursor-pointer transition" />
                <Twitter className="w-6 h-6 text-slate-400 hover:text-blue-400 cursor-pointer transition" />
                <Instagram className="w-6 h-6 text-slate-400 hover:text-purple-400 cursor-pointer transition" />
              </div>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-400">
            <p>&copy; 2024 CivicTrack. All rights reserved.</p>
          </div>
        </div>
      </footer>
      {/* Animations */}
      <style>{`
        .animate-fade-in { animation: fadeIn 1s ease; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-bounce { animation: bounce 1.2s infinite; }
        @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        .animate-pulse { animation: pulse 1.5s infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
        .animate-spin-slow { animation: spin 2.5s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .animate-shake { animation: shake 0.8s infinite; }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-4px); } 75% { transform: translateX(4px); } }
      `}</style>
    </div>
  );
}