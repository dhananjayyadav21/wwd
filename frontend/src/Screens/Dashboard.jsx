import React, { useEffect, useState, useMemo } from "react";
import axiosWrapper from "../utils/AxiosWrapper";
import {
    PieChart, Pie, Cell, Tooltip, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, LineChart, Line
} from "recharts";
import { Loader2, TrendingUp, BookOpen, Users, BarChart2 } from "lucide-react";

// Modern, Professional Color Palette
const COLORS = ["#10B981", "#3B82F6", "#F59E0B", "#EF4444", "#8B5CF6", "#14B8A6"];

// Updated Tailwind Classes for a professional look
const CARD_CLASS = "bg-white p-6 shadow-md rounded-xl border border-gray-100 transition-all duration-300 hover:shadow-3xl";
const CHART_TITLE = "text-lg sm:text-2xl font-medium text-gray-900 tracking-tight flex items-center gap-2";
const INPUT_CLASS = "bg-white border border-gray-300 text-gray-700 rounded-lg py-2 px-4 focus:ring-blue-500 focus:border-blue-500 text-sm shadow-sm transition duration-150 ease-in-out cursor-pointer appearance-none";
const HEADER_ICON_CLASS = "w-6 h-6 text-blue-600";
const SUBTITLE_CLASS = "text-md text-gray-500 m-4";


const EmptyMessage = ({ text }) => (
    <div className="flex flex-col items-center justify-center h-64 text-gray-400">
        <BarChart2 className="w-10 h-10 mb-2" />
        <p className="font-medium text-gray-500">{text}</p>
    </div>
);

// Custom Tooltip for Recharts
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length)
        return (
            <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-xl text-sm font-medium text-gray-800 backdrop-blur-sm bg-opacity-95">
                <p className="font-bold mb-1 text-base">{label || payload[0].name}</p>
                {payload.map((entry, index) => (
                    <p key={index} className="flex justify-between" style={{ color: entry.color }}>
                        <span className="mr-3">{`${entry.name}:`}</span>
                        <span className="font-semibold">{entry.value}</span>
                    </p>
                ))}
            </div>
        );
    return null;
};

// Main Dashboard Component
export default function Dashboard() {
    const token = localStorage.getItem("userToken");
    const axiosConfig = useMemo(() => ({ headers: { Authorization: `Bearer ${token}` } }), [token]);

    // Independent Filters
    const [batch1, setBatch1] = useState("");
    const [batch3, setBatch3] = useState("");
    const [batch4, setBatch4] = useState("");
    const [exam3, setExam3] = useState("");
    const [exam4, setExam4] = useState("");
    const [leaderExam, setLeaderExam] = useState("");
    const [leaderBatch, setLeaderBatch] = useState("");

    // Data
    const [aspiringData, setAspiringData] = useState([]);
    const [examTypeData, setExamTypeData] = useState([]);
    const [avgMarksAspiring, setAvgMarksAspiring] = useState([]);
    const [avgMarksExam, setAvgMarksExam] = useState([]);
    const [marksRangeData, setMarksRangeData] = useState([]);
    const [leaderboard, setLeaderboard] = useState([]);
    const [topField, setTopField] = useState("");
    const [batches, setBatches] = useState([]);
    const [examTypes, setExamTypes] = useState([]);
    const [loading, setLoading] = useState(false);

    // --- Data Fetching Functions (Unchanged Logic) ---

    // Fetch initial dropdown data
    const fetchInitial = async () => {
        setLoading(true);
        try {
            const [batchRes, examRes] = await Promise.all([
                axiosWrapper.get("/branch", axiosConfig),
                axiosWrapper.get("/exam", axiosConfig),
            ]);
            setBatches(batchRes.data.data || []);
            setExamTypes(examRes.data.data || []);
        } catch (err) {
            console.error("Dropdown fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    // 1️⃣ Student Aspiring Distribution
    const fetchAspiringDist = async () => {
        try {
            const url = batch1
                ? `/dashboard/aspiring-distribution?batch=${batch1}`
                : `/dashboard/aspiring-distribution`;
            const res = await axiosWrapper.get(url, axiosConfig);
            setAspiringData(res.data.data || []);
        } catch (err) {
            console.error("Aspiring fetch error:", err);
        }
    };

    // 2️⃣ Exam Type Count
    const fetchExamTypeCount = async () => {
        try {
            const url = `/dashboard/exam-type-count`;
            const res = await axiosWrapper.get(url, axiosConfig);
            setExamTypeData(res.data.data || []);
        } catch (err) {
            console.error("Exam type fetch error:", err);
        }
    };

    // 3️⃣ Average Marks by Field (includes per-aspiring & per-exam)
    const fetchAvgMarks = async () => {
        try {
            const params = new URLSearchParams();
            if (batch3) params.append("batch", batch3);
            if (exam3) params.append("examType", exam3);

            const res = await axiosWrapper.get(`/dashboard/avg-marks-field?${params.toString()}`, axiosConfig);

            const byAspiring = res.data.data?.byAspiring || [];
            const byExam = res.data.data?.byExam || [];

            setAvgMarksAspiring(byAspiring);
            setAvgMarksExam(byExam);
            setTopField(byAspiring?.[0]?.name || byAspiring?.[0]?._id || "N/A");
        } catch (err) {
            console.error("Avg marks fetch error:", err);
        }
    };

    // 4️⃣ Marks Range Distribution
    const fetchMarksRange = async () => {
        try {
            const params = new URLSearchParams();
            if (batch4) params.append("batch", batch4);
            if (exam4) params.append("examType", exam4);

            const res = await axiosWrapper.get(`/dashboard/marks-range?${params.toString()}`, axiosConfig);

            // Create human-readable labels like "0–20", "20–40", "40–60", etc.
            const formatted = res.data.data.map((item, i, arr) => {
                const next = arr[i + 1];
                const lower = item._id;
                const upper = next ? next._id : lower + 20;
                return {
                    range: `${lower}–${upper}`,
                    count: item.count,
                };
            });

            setMarksRangeData(formatted || []);
        } catch (err) {
            console.error("Marks range fetch error:", err);
        }
    };


    // 5️⃣ Leaderboard (Top Performing Field)
    const fetchLeaderboard = async () => {
        try {
            const params = new URLSearchParams();
            if (leaderBatch) params.append("batch", leaderBatch);
            if (leaderExam) params.append("examType", leaderExam);
            const res = await axiosWrapper.get(`/dashboard/top-performing?${params.toString()}`, axiosConfig);
            setLeaderboard(res.data.leaderboard || []);
        } catch (err) {
            console.error("Leaderboard fetch error:", err);
        }
    };

    // --- Effects (Unchanged) ---
    useEffect(() => {
        fetchInitial();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        fetchAspiringDist();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [batch1, axiosConfig]);

    useEffect(() => {
        fetchExamTypeCount();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [axiosConfig]);

    useEffect(() => {
        fetchAvgMarks();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [batch3, exam3, axiosConfig]);

    useEffect(() => {
        fetchMarksRange();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [batch4, exam4, axiosConfig]);

    useEffect(() => {
        fetchLeaderboard();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [leaderExam, leaderBatch, axiosConfig]);


    if (loading)
        return <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
            <Loader2 className="animate-spin w-12 h-12 text-blue-600 mb-4" />
            <p className="text-lg text-gray-600 font-medium">Loading Academic Dashboard...</p>
        </div>;

    return (
        <div className="min-h-screen p-6 sm:p-8">
            {/* Header */}
            <h1 className=" text:xl sm:text-2xl lg:text-4xl sm:font-bold text-gray-900 mb-10 tracking-tighter border-b pb-4 border-gray-200">
                📊 Academic Performance Overview
            </h1>

            {/* Main Grid: 2 columns on large screens, Avg Marks and Marks Range span full width */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

                {/* 1️⃣ Student Aspiring Distribution (Pie Chart) */}
                <div className={CARD_CLASS}>
                    <div className="flex justify-between items-start mb-4">
                        <h2 className={CHART_TITLE}>
                            <Users className={HEADER_ICON_CLASS} />
                            Aspiring Distribution
                        </h2>
                        <select className={INPUT_CLASS} value={batch1} onChange={e => setBatch1(e.target.value)}>
                            <option value="">All Batches</option>
                            {batches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                        </select>
                    </div>
                    <p className={SUBTITLE_CLASS}>Student count by their aspiring field.</p>
                    {aspiringData.length > 0 ? <ResponsiveContainer width="100%" height={400}>
                        <PieChart>
                            <Pie
                                data={aspiringData}
                                dataKey="count"
                                nameKey="_id"
                                cx="50%"
                                cy="50%"
                                outerRadius={120}
                                innerRadius={60}
                                paddingAngle={5}
                                labelLine={false}
                                label={({ _id, percent }) => `${_id}: ${(percent * 100).toFixed(0)}%`}
                            >
                                {aspiringData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend layout="horizontal" align="center" verticalAlign="bottom" />
                        </PieChart>
                    </ResponsiveContainer> : <EmptyMessage text="No aspiring data available for the selected filters." />}
                </div>

                {/* 2️⃣ Exams by Type (Bar Chart) */}
                <div className={CARD_CLASS}>
                    <h2 className={CHART_TITLE}>
                        <BookOpen className={HEADER_ICON_CLASS} />
                        Exams Conducted by Term
                    </h2>
                    <p className={SUBTITLE_CLASS}>Count of exams recorded for each type.</p>
                    {examTypeData.length > 0 ? <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={examTypeData} margin={{ top: 50, right: 20, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                            <XAxis dataKey="_id" tickLine={false} axisLine={{ stroke: '#D1D5DB' }} />
                            <YAxis tickLine={false} axisLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="count" fill={COLORS[4]} radius={[8, 8, 0, 0]} name="Count" />
                        </BarChart>
                    </ResponsiveContainer> : <EmptyMessage text="No exam term data available for the selected filters." />}
                </div>

                {/* 3️⃣ Average Marks by Field (and Exam) - Span 2/3 columns on large screens */}
                <div className={`${CARD_CLASS} xl:col-span-3`}>
                    <div className="flex flex-wrap gap-4 mb-4 justify-between items-center">
                        <h2 className={CHART_TITLE}>
                            <TrendingUp className={HEADER_ICON_CLASS} />
                            Average Performance Metrics
                        </h2>
                        <div className="flex gap-3">
                            <select className={INPUT_CLASS} value={batch3} onChange={e => setBatch3(e.target.value)}>
                                <option value="">Batch Vise</option>
                                {batches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                            </select>
                            <select className={INPUT_CLASS} value={exam3} onChange={e => setExam3(e.target.value)}>
                                <option value="">Exam Vise</option>
                                {examTypes.map(ex => <option key={ex._id} value={ex.name}>{ex.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <p className={SUBTITLE_CLASS}>Detailed average marks across different student aspirations and exam types.</p>


                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
                        {/* By Aspiring Field */}
                        <div className="border border-gray-100 p-4 rounded-lg shadow-inner">
                            <h3 className="text-xl font-bold text-gray-800 m-2 md:m-4 text-center">
                                By Aspiring Field
                            </h3>
                            {avgMarksAspiring.length > 0 ? <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={avgMarksAspiring} layout="vertical" margin={{ left: 10, right: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                                    <XAxis type="number" tickLine={false} axisLine={{ stroke: '#D1D5DB' }} />
                                    <YAxis type="category" dataKey="_id" width={100} tickLine={false} axisLine={false} style={{ fontSize: '12px' }} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="avgMarks" fill={COLORS[1]} barSize={20} radius={[0, 8, 8, 0]} name="Avg Marks" />
                                </BarChart>
                            </ResponsiveContainer> : <EmptyMessage text="No Performance data available for the selected filters." />}
                            <p className="text-center mt-4 text-lg font-bold text-blue-600">
                                🌟 Highest Average Field: {topField}
                            </p>
                        </div>

                        {/* By Exam */}
                        <div className="border border-gray-100 p-4 rounded-lg shadow-inner">
                            <h3 className="text-xl font-bold text-gray-800 m-2 md:m-4 text-center">
                                By Exam Name
                            </h3>
                            {avgMarksExam.length > 0 ? <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={avgMarksExam} layout="vertical" margin={{ left: 10, right: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                                    <XAxis type="number" tickLine={false} axisLine={{ stroke: '#D1D5DB' }} />
                                    <YAxis type="category" dataKey="_id" width={100} tickLine={false} axisLine={false} style={{ fontSize: '12px' }} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="avgMarks" fill={COLORS[4]} barSize={20} radius={[0, 8, 8, 0]} name="Avg Marks" />
                                </BarChart>
                            </ResponsiveContainer> : <EmptyMessage text="No Performance data available for the selected filters." />}
                        </div>
                    </div>
                </div>

                {/* 4️⃣ Marks Range Distribution (Line Chart) - Full width */}
                <div className={`${CARD_CLASS} xl:col-span-3`}>
                    <div className="flex flex-wrap gap-4 justify-between mb-4 items-center">
                        <h2 className={CHART_TITLE}>
                            <BarChart2 className={HEADER_ICON_CLASS} />
                            Marks Range Distribution
                        </h2>
                        <div className="flex gap-3">
                            <select className={INPUT_CLASS} value={batch4} onChange={e => setBatch4(e.target.value)}>
                                <option value="">Batch Vise</option>
                                {batches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                            </select>
                            <select className={INPUT_CLASS} value={exam4} onChange={e => setExam4(e.target.value)}>
                                <option value="">Exam Vise</option>
                                {examTypes.map(ex => <option key={ex._id} value={ex.name}>{ex.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <p className={SUBTITLE_CLASS}>Distribution of students across different marks achieved.</p>

                    {marksRangeData.length > 0 ? <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={marksRangeData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                            <XAxis dataKey="range" tickLine={false} axisLine={{ stroke: '#D1D5DB' }} />
                            <YAxis tickLine={false} axisLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="count"
                                stroke={COLORS[3]}
                                strokeWidth={3}
                                dot={{ r: 5 }}
                                activeDot={{ r: 7 }}
                                name="Students in Range"
                            />

                        </LineChart>
                    </ResponsiveContainer> : <EmptyMessage text="No marks range data available for the selected filters." />}
                </div>

                {/* 5️⃣ Leaderboard (Top Performing by Field) - Full width */}
                <div className={`${CARD_CLASS} xl:col-span-3`}>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className={CHART_TITLE}>
                            🏆 Top Performing Students
                        </h2>
                        <div className="flex gap-3">
                            <select
                                className={INPUT_CLASS}
                                value={leaderBatch}
                                onChange={(e) => setLeaderBatch(e.target.value)}
                            >
                                <option value="">Batch Vise</option>
                                {batches.map((b) => (
                                    <option key={b._id} value={b._id}>{b.name}</option>
                                ))}
                            </select>
                            <select
                                className={INPUT_CLASS}
                                value={leaderExam}
                                onChange={(e) => setLeaderExam(e.target.value)}
                            >
                                <option value="">Exam Vise</option>
                                {examTypes.map((ex) => (
                                    <option key={ex._id} value={ex.name}>{ex.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <p className={SUBTITLE_CLASS}>Leaderboard showing top students grouped by their aspiring field.</p>

                    {leaderboard.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {leaderboard.map((group, index) => (
                                <div key={index} className="border border-blue-100 rounded-lg p-4 bg-blue-50/50 shadow-md">
                                    <h3 className="text-xl text-blue-900 mb-3 border-b pb-2 border-blue-200">
                                        🎯 {group.field}
                                    </h3>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-gray-700">
                                            <thead className="text-xs text-blue-700 uppercase bg-blue-100 rounded-t-lg">
                                                <tr>
                                                    <th className="py-2 px-3 text-left rounded-tl-lg">Rank</th>
                                                    <th className="py-2 px-3 text-left">Student</th>
                                                    <th className="py-2 px-3 text-right">Marks</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {group.topStudents.slice(0, 5).map((student, i) => (
                                                    <tr key={i} className="border-b last:border-b-0 hover:bg-blue-100/50 transition duration-150">
                                                        <td className="py-2 px-3 font-extrabold text-blue-800">
                                                            {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}
                                                        </td>
                                                        <td className="py-2 px-3">{student.name}</td>
                                                        <td className="py-2 px-3 text-right font-semibold text-green-600">
                                                            {student.totalMarks}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <EmptyMessage text="No leaderboard data found for the selected filters." />
                    )}
                </div>
            </div>
        </div>
    );
}