import React from 'react';
import AdminHeader from '../../Components/AdminHeader';
import AdminSidebar from '../../Components/AdminSideBar';
import Sidebar from '../../Components/SideBar';
// Assuming you are using a standard icon library like lucide-react or heroicons
// For this example, I'll use placeholders for icons.
// import { Zap, Upload, MessageSquare, Clock } from 'lucide-react'; 

// *** Component for a single KPI card at the top ***
const KPICard = ({ title, users, sessions, change, icon: Icon }) => (
    <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col justify-between transition duration-300 ease-in-out hover:shadow-xl">
        <div className="flex items-center justify-between mb-3">
            {/* Icon Placeholder */}
            <div className="p-3 bg-indigo-100 rounded-full text-indigo-600">
                {/* Replace this with an actual Icon component */}
                <div className="w-6 h-6">{title[0]}</div>
            </div>
            <span className={`text-sm font-semibold ${change.startsWith('+') ? 'text-green-500 bg-green-100' : 'text-red-500 bg-red-100'} px-3 py-1 rounded-full`}>
                {change}
            </span>
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-1">{title}</h3>
        <p className="text-sm text-gray-500">Users: {users} • Sessions: {sessions}</p>
    </div>
);

// *** Component for the main data card structure ***
const DataCard = ({ title, children, className = '' }) => (
    <div className={`bg-white p-6 rounded-xl shadow-lg ${className}`}>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">{title}</h2>
        {children}
    </div>
);

// *** Progress Bar Component (for Feature Usage) ***
const ProgressBar = ({ title, percentage, change }) => (
    <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium text-gray-700">{title}</span>
            <span className={`text-xs font-semibold ${change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>{change}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
                className="bg-indigo-600 h-2.5 rounded-full"
                style={{ width: `${percentage}%` }}
            ></div>
        </div>
    </div>
);

const AdminDashboardPage = () => {
    // Mock Data (Replace with API calls)
    const kpis = [
        { title: "Live Transcription", users: "1,843", sessions: "5,234", change: "+12%", icon: 'Zap' },
        { title: "File Upload", users: "1,567", sessions: "3,891", change: "+8%", icon: 'Upload' },
        { title: "AI Chat", users: "2,103", sessions: "8,934", change: "+16%", icon: 'MessageSquare' },
        { title: "Pomodoro Timer", users: "1,234", sessions: "6,782", change: "+15%", icon: 'Clock' },
    ];

    const engagementMetrics = [
        { label: "Daily Active Users", value: "1,234", change: "+3.2%" },
        { label: "Weekly Active Users", value: "3,456", change: "+12.1%" },
        { label: "Monthly Active Users", value: "8,234", change: "+8.7%" },
        { label: "Avg Session Duration", value: "24m", change: "+3.2%" },
    ];

    const featureUsage = [
        { title: "Live Transcription", percentage: 70, change: "+12%" },
        { title: "File Upload", percentage: 60, change: "+8%" },
        { title: "AI Chat", percentage: 80, change: "+16%" },
        { title: "Pomodoro Timer", percentage: 65, change: "+15%" },
    ];

    const topGroups = [
        { name: "AI Study Group", members: 234, messages: 1458, engagement: 92 },
        { name: "Math Solutions", members: 189, messages: 892, engagement: 87 },
        { name: "Programming Help", members: 156, messages: 567, engagement: 79 },
        { name: "Exam Prep 2024", members: 312, messages: 2103, engagement: 95 },
    ];

    const bottomKPIs = [
        { title: "User Satisfaction", value: "94.2%", color: "text-blue-500", bg: "bg-blue-100" },
        { title: "Churn Rate", value: "2.3%", color: "text-red-500", bg: "bg-red-100" },
        { title: "Monthly Growth", value: "18.5%", color: "text-green-500", bg: "bg-green-100" },
    ];

    return (
        <div className="flex">
            <AdminSidebar />
            <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
            {/* <AdminHeader /> */}
                {/* 📊 Header Section */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                    <h1 className="text-3xl font-extrabold text-gray-900">Analytics Dashboard</h1>
                    <div className="flex space-x-3 mt-4 md:mt-0">
                        <button className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg shadow-sm hover:bg-gray-100 transition duration-150">
                            Date Range
                        </button>
                        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition duration-150">
                            Export Report
                        </button>
                    </div>
                </header>

                {/* 🔑 Top KPIs Section */}
                <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {kpis.map((kpi, index) => (
                        <KPICard key={index} {...kpi} />
                    ))}
                </section>

                {/* 📈 Main Charts Section */}
                <section className="grid grid-cols-1 lg:grid-cols-7 gap-6 mb-8">

                    {/* User Engagement Card (3/7 width) */}
                    <DataCard title="User Engagement" className="lg:col-span-3">
                        <div className="h-64 flex items-center justify-center bg-gray-50 border border-dashed border-gray-300 rounded-lg mb-6 text-gray-500">
                            {/* Chart Placeholder: Integrate Recharts/Chart.js here */}
                            <p>Line Chart Visualization (Daily/Weekly/Monthly Active Users)</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {engagementMetrics.map((metric, index) => (
                                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                                    <h4 className="text-sm font-medium text-gray-500">{metric.label}</h4>
                                    <p className="text-xl font-bold text-gray-800 mt-1">
                                        {metric.value}{' '}
                                        <span className={`text-sm font-semibold ${metric.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                                            {metric.change}
                                        </span>
                                    </p>
                                </div>
                            ))}
                        </div>
                    </DataCard>

                    {/* Feature Usage Over Time Card (4/7 width) */}
                    <DataCard title="Feature Usage Over Time" className="lg:col-span-4">
                        <div className="h-64 flex items-center justify-center bg-gray-50 border border-dashed border-gray-300 rounded-lg mb-6 text-gray-500">
                            {/* Chart Placeholder: Integrate Bar Chart or Area Chart here */}
                            <p>Feature Usage Trend Chart</p>
                        </div>
                        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                            {featureUsage.map((item, index) => (
                                <ProgressBar key={index} {...item} />
                            ))}
                        </div>
                    </DataCard>
                </section>

                {/* 👥 Top Performing Groups Section */}
                <section className="mb-8">
                    <DataCard title="Top Performing Groups">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {topGroups.map((group, index) => (
                                <div key={index} className="border border-gray-200 p-4 rounded-lg bg-white shadow-sm hover:shadow-md transition duration-150">
                                    <h4 className="text-lg font-semibold text-indigo-700">{group.name}</h4>
                                    <p className="text-sm text-gray-500 my-1">
                                        {group.members} members • {group.messages} messages
                                    </p>
                                    <span className="text-xs font-bold text-green-700 bg-green-100 px-3 py-1 rounded-full">
                                        {group.engagement}% engagement
                                    </span>
                                </div>
                            ))}
                        </div>
                    </DataCard>
                </section>

                {/* 🚀 Bottom KPIs Section */}
                <section>
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Key Performance Indicators</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {bottomKPIs.map((kpi, index) => (
                            <div key={index} className="bg-white p-6 rounded-xl shadow-lg flex items-center space-x-4">
                                <div className={`p-3 rounded-xl ${kpi.bg} ${kpi.color}`}>
                                    {/* Icon Placeholder */}
                                    <div className="w-8 h-8">{kpi.value[0]}</div>
                                </div>
                                <div>
                                    <h3 className="text-3xl font-extrabold text-gray-900">{kpi.value}</h3>
                                    <p className="text-sm text-gray-500">{kpi.title}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default AdminDashboardPage;