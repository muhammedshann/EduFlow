import React, { useEffect, useState } from 'react';
import {
    FileText,
    Users,
    Zap,
    BarChart3,
    Search,
    Plus,
    Eye,
    Trash2,
    X,
    MoreVertical
} from 'lucide-react';
import { useDispatch } from 'react-redux';
import { AdminStatCard } from './AdminUserPage';
import { AdminFetchNotes } from '../../Redux/AdminRedux/AdminNotesSlice';

const NoteRow = ({ note, onViewNote }) => {

    return (
        <div className="flex items-center justify-between p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors">

            <div className="flex items-center flex-1 min-w-0">

                {/* Main Info Columns */}
                <div className="grid grid-cols-3 w-full gap-4 items-center min-w-0">
                    <div className="flex flex-col min-w-0">
                        <p className="text-xs text-gray-400 font-bold uppercase">User</p>
                        <p className="text-base font-semibold text-gray-800 truncate">{note.user}</p>
                    </div>

                    <div className="flex flex-col min-w-0">
                        <p className="text-xs text-gray-400 font-bold uppercase">Type</p>
                        <p className="text-sm text-gray-600 font-medium">{note.type}</p>
                    </div>

                    <div className="flex flex-col min-w-0">
                        <p className="text-xs text-gray-400 font-bold uppercase">Title</p>
                        <p className="text-sm text-gray-800 font-bold truncate">{note.title || "Untitled"}</p>
                    </div>

                    {/* <div className="flex flex-col min-w-0">
                        <p className="text-xs text-gray-400 font-bold uppercase">Credits</p>
                        <p className="text-sm font-mono font-bold text-purple-600">{note.credits_used}</p>
                    </div> */}
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-4 flex-shrink-0 ml-4">
                <button
                    onClick={() => onViewNote(note)}
                    className="text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-black transition"
                >
                    View Note
                </button>
            </div>
        </div>
    );
};

export default function NotesManagement() {
    const [searchTerm, setSearchTerm] = useState('');
    const [notesData, setNotesData] = useState([]);
    const [filteredNotes, setFilteredNotes] = useState([]);
    const [selectedNote, setSelectedNote] = useState(null);
    const [stats, setStats] = useState({
        totalNotes: 0,
        activeUsers: 0,
        creditsSpent: 0,
        avgLength: 0,
    });

    const dispatch = useDispatch();

    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);
        setFilteredNotes(
            notesData.filter(n =>
                n.username.toLowerCase().includes(term) ||
                n.title.toLowerCase().includes(term)
            )
        );
    };

    const fetchData = async () => {
        const response = await dispatch(AdminFetchNotes()).unwrap();
        console.log(response);

        // response IS the array
        setNotesData(response);
        setFilteredNotes(response);

        setStats({
            totalNotes: response.length,
            activeUsers: new Set(response.map(n => n.user)).size,
            creditsSpent: response.reduce((s, n) => s + n.credits_used, 0),
            avgLength: response.length
                ? (response.reduce((s, n) => s + n.transcript_text.length, 0) / response.length / 1000).toFixed(1)
                : 0,
        });
    };


    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div className="p-6 md:p-10 bg-gray-50 min-h-screen">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-1">Notes Management</h1>
                    <p className="text-gray-500">Monitor all transcriptions and credit consumption</p>
                </div>
            </header>

            {/* Reusing your StatCard design and grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 mb-10">
                <AdminStatCard
                    title="Total Notes"
                    value={stats.totalNotes}
                    // change="+12 today"
                    icon={FileText}
                    iconBg="bg-indigo-50"
                    iconColor="text-indigo-600"
                    valueColor="text-gray-800"
                    changeColor="text-green-600"
                />

                <AdminStatCard
                    title="Active Users"
                    value={stats.activeUsers}
                    // change="+5 today"
                    icon={Users}
                    iconBg="bg-blue-50"
                    iconColor="text-blue-600"
                    valueColor="text-gray-800"
                    changeColor="text-green-600"
                />
{/* 
                <AdminStatCard
                    title="Credits Spent"
                    value={stats.creditsSpent}
                    // change="+140 today"
                    icon={Zap}
                    iconBg="bg-yellow-50"
                    iconColor="text-yellow-600"
                    valueColor="text-gray-800"
                    changeColor="text-red-600"
                />

                <AdminStatCard
                    title="Avg. Length"
                    value={`${stats.avgLength}k`}
                    // change="+0 today"
                    icon={BarChart3}
                    iconBg="bg-purple-50"
                    iconColor="text-purple-600"
                    valueColor="text-gray-800"
                    changeColor="text-gray-500"
                /> */}
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-800">Note Records</h2>

                    <div className="relative">
                        <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search notes..."
                            value={searchTerm}
                            onChange={handleSearch}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 outline-none w-64"
                        />
                    </div>
                </div>

                <div className="divide-y divide-gray-100">
                    {filteredNotes.length > 0 ? (
                        filteredNotes.map(note => (
                            <NoteRow key={note.id} note={note} onViewNote={(n) => setSelectedNote(n)} />
                        ))
                    ) : (
                        <p className="text-center text-gray-500 py-8">No notes found.</p>
                    )}
                </div>
            </div>

            {/* CENTERED MODAL VIEW */}
            {selectedNote && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-800">Transcription Details</h3>
                            <button onClick={() => setSelectedNote(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-8 overflow-y-auto max-h-[70vh]">
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">{selectedNote.title}</h2>
                            <p className="text-sm text-gray-400 mb-6 uppercase tracking-widest font-medium">
                                {new Date(selectedNote.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                            </p>

                            <div className="h-px bg-gray-100 mb-6" />

                            <div className="text-lg leading-relaxed text-gray-800 whitespace-pre-wrap">
                                {selectedNote.transcript_text}
                            </div>
                        </div>

                        <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                            <div className="flex gap-4">
                                <div className="text-center px-4 border-r border-gray-200">
                                    <p className="text-[10px] uppercase font-bold text-gray-400">User</p>
                                    <p className="text-sm font-semibold">{selectedNote.user}</p>
                                </div>
                                <div className="text-center px-4">
                                    <p className="text-[10px] uppercase font-bold text-gray-400">Credit Cost</p>
                                    <p className="text-sm font-bold text-purple-600">{selectedNote.credits_used}</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedNote(null)} className="px-6 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium">Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}