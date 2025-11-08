import React, { useEffect, useState, useMemo } from "react";
import axiosWrapper from "../utils/AxiosWrapper";
import {
    PieChart,
    LineChart,
    Line,
    Pie,
    Cell,
    Tooltip,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
} from "recharts";
import { Loader2 } from "lucide-react";

// --- Styling Constants ---
const COLORS = ["#4ADE80", "#2563EB", "#FACC15", "#FB7185", "#A78BFA", "#0891B2"];
const CHART_TITLE_CLASS = "text-xl font-bold mb-3 text-gray-800 tracking-tight";
const CARD_CLASS = "bg-white p-5 shadow-xl rounded-2xl transition-all hover:shadow-2xl";
const INPUT_CLASS = "bg-gray-50 border-2 border-gray-200 text-gray-700 rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out cursor-pointer text-sm";

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-md text-sm font-medium text-gray-800">
                <p className="font-bold mb-1">{label || payload[0].name}</p>
                {payload.map((entry, index) => (
                    <p key={`item-${index}`} style={{ color: entry.color }}>
                        {`${entry.name}: ${entry.value}`}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

export default function Dashboard() {
    const [stats, setStats] = useState(null);
    const [branches, setBranches] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [filters, setFilters] = useState({ branch: "", subjectId: "", examType: "" });
    const [loading, setLoading] = useState(true);

    const userToken = localStorage.getItem("userToken");
    const axiosConfig = useMemo(() => ({
        headers: { Authorization: `Bearer ${userToken}` },
    }), [userToken]);

    const fetchInitialData = async () => {
        try {
            const [branchRes, subjectRes] = await Promise.all([
                axiosWrapper.get("/branch", axiosConfig),
                axiosWrapper.get("/subject", axiosConfig),
            ]);
            setBranches(branchRes.data.data || []);
            setSubjects(subjectRes.data.data || []);
        } catch (err) {
            console.error("Error fetching initial data:", err);
        }
    };

    const fetchStats = async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams(filters).toString();
            const res = await axiosWrapper.get(`/dashboard/stats?${query}`, axiosConfig);
            setStats(res.data.data);
        } catch (err) {
            console.error("Error fetching dashboard stats:", err);
            setStats(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        fetchStats();
    }, [filters]);

    if (loading && !stats)
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
                <Loader2 className="animate-spin w-10 h-10 text-blue-600 mb-3" />
                <p className="text-xl font-medium text-gray-600">Loading dashboard data...</p>
            </div>
        );

    const studentAspiringData = stats?.studentAspiringStats.map(s => ({
        name: s._id || 'Unspecified',
        value: s.count,
    })) || [];

    const avgMarksData = stats?.avgMarksByAspiring.map(a => ({
        name: a._id || 'Unspecified',
        "Average Marks": parseFloat(a.avgMarks.toFixed(2)),
    })) || [];

    const examTypeData = stats?.examTypeStats.map(e => ({
        name: e._id ? e._id.toUpperCase() : 'N/A',
        Count: e.count,
    })) || [];

    const marksRangeData = stats?.marksRange.map((r) => ({
        range: r._id === "100+" ? "100+" : `${r._id}-${parseInt(r._id) + 20}`,
        Students: r.count,
    })) || [];

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 font-sans text-gray-800">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-8 tracking-tighter">
                📊 Academic Performance Dashboard
            </h1>

            {/* Filters Section */}
            <div className={`flex flex-wrap gap-3 p-4 ${CARD_CLASS} mb-8`}>
                <h2 className="text-lg font-semibold text-gray-700 w-full mb-2">Filter Data</h2>

                <select className={INPUT_CLASS} value={filters.branch} onChange={(e) => setFilters({ ...filters, branch: e.target.value })}>
                    <option value="">All Branches</option>
                    {branches.map((b) => (
                        <option key={b._id} value={b._id}> {b.name} </option>
                    ))}
                </select>

                <select className={INPUT_CLASS} value={filters.subjectId} onChange={(e) => setFilters({ ...filters, subjectId: e.target.value })}>
                    <option value="">All Subjects</option>
                    {subjects.map((s) => (
                        <option key={s._id} value={s._id}> {s.name} </option>
                    ))}
                </select>

                <select className={INPUT_CLASS} value={filters.examType} onChange={(e) => setFilters({ ...filters, examType: e.target.value })}>
                    <option value="">All Exam Types</option>
                    <option value="mid">Mid-Term</option>
                    <option value="end">End-Term</option>
                </select>
            </div>

            {/* Dashboard Grid - Adjusted Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                {/* Top Metric Card (Now taking 2 columns on small/medium, 1 on large) */}
                <div className={`${CARD_CLASS} text-center col-span-1 md:col-span-2 lg:col-span-1 flex flex-col justify-center items-center bg-blue-50 border-blue-200 border-l-4`}>
                    <p className="text-lg font-semibold text-gray-600 mb-1">Top Performing Aspiring Field 🏆</p>
                    <p className="text-4xl font-extrabold text-blue-600 truncate">{stats?.topAspiring || "N/A"}</p>
                </div>

                {/* Students by Aspiring Field (Pie Chart) - **Now takes 2 columns on large screens!** */}
                <div className={`${CARD_CLASS} col-span-1 md:col-span-2 lg:col-span-2 flex flex-col items-center`}>
                    <h2 className={CHART_TITLE_CLASS}>Students by Field</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={studentAspiringData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={90}
                                innerRadius={40}
                                fill="#8884d8"
                                labelLine={false}
                                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                paddingAngle={2}
                                cornerRadius={5}
                            >
                                {studentAspiringData.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend layout="horizontal" align="center" verticalAlign="bottom" iconType="circle" wrapperStyle={{ paddingTop: '10px' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Exams by Type (Slim Bar Chart) - Now takes 1 column on large screens */}
                <div className={`${CARD_CLASS} col-span-1 md:col-span-2 lg:col-span-1`}>
                    <h2 className={CHART_TITLE_CLASS}>Exams by Type Count</h2>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={examTypeData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" vertical={false} />
                            <XAxis dataKey="name" stroke="#555" tick={{ fontSize: 10 }} />
                            <YAxis stroke="#555" tick={{ fontSize: 10 }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="Count" fill={COLORS[4]} barSize={20} radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Average Marks by Aspiring Field (HORIZONTAL BAR CHART) - Best for ranking/comparing many categories */}
                <div className={`${CARD_CLASS} col-span-1 md:col-span-2 lg:col-span-2`}>
                    <h2 className={CHART_TITLE_CLASS}>Avg Marks by Field</h2>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={avgMarksData} layout="vertical" margin={{ top: 10, right: 20, left: 20, bottom: 10 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" horizontal={false} /> {/* Vertical bars need horizontal grid lines */}
                            <XAxis type="number" stroke="#555" tick={{ fontSize: 11 }} />
                            <YAxis dataKey="name" type="category" stroke="#555" tick={{ fontSize: 10 }} width={70} /> {/* Category names on Y-axis */}
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Bar dataKey="Average Marks" fill={COLORS[1]} barSize={15} radius={[0, 4, 4, 0]} /> {/* Horizontal bars use left/right radius */}
                        </BarChart>
                    </ResponsiveContainer>
                </div>


                {/* Marks Range Distribution (LINE CHART) - Best for showing distribution/trend over continuous range */}
                <div className={`${CARD_CLASS} col-span-1 md:col-span-2 lg:col-span-2`}>
                    <h2 className={CHART_TITLE_CLASS}>Marks Range Distribution (Trend)</h2>
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={marksRangeData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                            <XAxis dataKey="range" stroke="#555" tick={{ fontSize: 11 }} />
                            <YAxis stroke="#555" label={{ value: 'Students Count', angle: -90, position: 'insideLeft', fill: '#555', fontSize: 12 }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Line type="monotone" dataKey="Students" stroke={COLORS[3]} strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 8 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

            </div>

            {!stats && (
                <div className="text-center mt-10 p-5 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 rounded">
                    <p className="font-semibold">No data available for the selected filters.</p>
                    <p className="text-sm">Try adjusting the Branch, Subject, or Exam Type selections.</p>
                </div>
            )}
        </div>
    );
}