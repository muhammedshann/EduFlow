import React, { useEffect, useState } from "react";
import {
    Star,
    Users,
    MessageSquare,
    Trash2,
    Search,
    X,
    Eye
} from "lucide-react";
import { useDispatch } from "react-redux";
import { AdminStatCard } from "./AdminUserPage";
import { DeleteReviews, FetchReviews } from "../../Redux/ReviewSlice";

function ReviewViewModal({ title, comment, rating, onClose }) {
    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-xl shadow-2xl p-6 border border-gray-100 dark:border-slate-700 transition-colors duration-300 mx-4">
                
                <div className="flex justify-between items-start mb-4">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white">
                        {title || "No Title"}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-200">
                        <X size={20} />
                    </button>
                </div>

                <div className="text-yellow-500 font-bold text-lg mb-4 flex items-center gap-2">
                    {rating || '0'} <Star size={18} fill="currentColor" />
                </div>

                <div className="p-4 bg-gray-50 dark:bg-slate-900 rounded-lg border border-gray-100 dark:border-slate-700 max-h-60 overflow-y-auto">
                    <p className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                        {comment || "No comment provided."}
                    </p>
                </div>

                <div className="flex justify-end mt-6">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-white hover:bg-gray-200 dark:hover:bg-slate-600 text-sm font-medium transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function AdminReviewManagement() {
    const dispatch = useDispatch();

    const [reviews, setReviews] = useState([]);
    const [filteredReviews, setFilteredReviews] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [openReview, setOpenReview] = useState(null);

    const [stats, setStats] = useState({
        totalReviews: 0,
        averageRating: 0,
    });

    const loadReviews = async () => {
        try {
            setLoading(true);
            const response = await dispatch(FetchReviews()).unwrap();
            const data = Array.isArray(response) ? response : [];

            setReviews(data);
            setFilteredReviews(data);

            const totalReviews = data.length;
            const averageRating = totalReviews > 0
                ? (data.reduce((s, r) => s + (r.rating || 0), 0) / totalReviews).toFixed(1)
                : 0;

            setStats({ totalReviews, averageRating });
        } catch (err) {
            console.error("Failed to fetch reviews", err);
            setReviews([]);
            setFilteredReviews([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadReviews();
    }, []);

    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);
        const filtered = reviews.filter((r) =>
            (r.title || "").toLowerCase().includes(term) ||
            (r.username || "").toLowerCase().includes(term)
        );
        setFilteredReviews(filtered);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this review?")) return;
        try {
            await dispatch(DeleteReviews(id)).unwrap();
            setReviews((prev) => prev.filter((r) => r.id !== id));
            setFilteredReviews((prev) => prev.filter((r) => r.id !== id));
        } catch (err) {
            console.error("Delete failed", err);
        }
    };

    return (
        <div className="p-4 sm:p-6 md:p-10 bg-gray-50 dark:bg-slate-900 min-h-screen transition-colors duration-300">

            {/* HEADER */}
            <header className="mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-1 flex items-center">
                    <Star size={28} className="mr-3 text-purple-600 dark:text-purple-400" />
                    Review Management
                </h1>
                <p className="text-sm sm:text-base text-gray-500 dark:text-slate-400">
                    Manage and moderate user reviews across the platform.
                </p>
            </header>

            {/* STATS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-10">
                <AdminStatCard
                    title="Total Reviews"
                    value={stats.totalReviews}
                    change="All submitted reviews"
                    icon={MessageSquare}
                    iconBg="bg-purple-100 dark:bg-purple-900/20"
                    iconColor="text-purple-600 dark:text-purple-400"
                    valueColor="text-gray-800 dark:text-white"
                    changeColor="text-gray-500 dark:text-slate-400"
                />

                <AdminStatCard
                    title="Average Rating"
                    value={`${stats.averageRating} ★`}
                    change="Across all reviews"
                    icon={Star}
                    iconBg="bg-yellow-100 dark:bg-yellow-900/20"
                    iconColor="text-yellow-600 dark:text-yellow-400"
                    valueColor="text-gray-800 dark:text-white"
                    changeColor="text-gray-500 dark:text-slate-400"
                />
            </div>

            {/* TABLE CARD */}
            <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 transition-colors duration-300">

                {/* SEARCH */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                        User Reviews
                    </h2>

                    <div className="relative w-full sm:w-80">
                        <Search
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500"
                        />
                        <input
                            type="text"
                            placeholder="Search by title or user..."
                            value={searchTerm}
                            onChange={handleSearch}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-white rounded-lg focus:ring-purple-500 dark:focus:border-purple-400 outline-none transition-colors"
                        />
                    </div>
                </div>

                {/* DESKTOP HEADER (Hidden on Mobile) */}
                <div className="hidden sm:grid grid-cols-9 text-sm font-semibold text-gray-500 dark:text-slate-400 border-b border-gray-200 dark:border-slate-700 py-3 px-4">
                    <div className="col-span-2">User</div>
                    <div>Rating</div>
                    <div className="col-span-2">Title</div>
                    <div className="col-span-2">Comment</div>
                    <div>Date</div>
                    <div className="text-right">Actions</div>
                </div>

                {/* ROWS */}
                <div className="divide-y divide-gray-100 dark:divide-slate-700">
                    {!loading && filteredReviews.length > 0 ? (
                        filteredReviews.map((review) => (
                            <div
                                key={review.id}
                                className="flex flex-col sm:grid sm:grid-cols-9 items-start sm:items-center p-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors gap-3 sm:gap-0"
                            >
                                {/* User */}
                                <div className="col-span-2 w-full sm:w-auto flex justify-between sm:block">
                                    <span className="sm:hidden text-xs font-bold text-gray-500 dark:text-slate-500 uppercase">User</span>
                                    <span className="font-medium truncate text-gray-800 dark:text-slate-200">{review.username}</span>
                                </div>

                                {/* Rating */}
                                <div className="w-full sm:w-auto flex justify-between sm:block">
                                    <span className="sm:hidden text-xs font-bold text-gray-500 dark:text-slate-500 uppercase">Rating</span>
                                    <div className="text-yellow-600 dark:text-yellow-400 font-semibold flex items-center gap-1">
                                        {review.rating} <Star size={12} fill="currentColor"/>
                                    </div>
                                </div>

                                {/* Title */}
                                <div className="col-span-2 w-full sm:w-auto flex justify-between sm:block min-w-0">
                                    <span className="sm:hidden text-xs font-bold text-gray-500 dark:text-slate-500 uppercase shrink-0 mr-4">Title</span>
                                    <span className="truncate text-gray-700 dark:text-slate-300 block">{review.title}</span>
                                </div>

                                {/* Comment */}
                                <div className="col-span-2 w-full sm:w-auto flex justify-between sm:block min-w-0">
                                    <span className="sm:hidden text-xs font-bold text-gray-500 dark:text-slate-500 uppercase shrink-0 mr-4">Comment</span>
                                    <span className="truncate text-gray-500 dark:text-slate-400 block italic">"{review.comment}"</span>
                                </div>

                                {/* Date */}
                                <div className="w-full sm:w-auto flex justify-between sm:block">
                                    <span className="sm:hidden text-xs font-bold text-gray-500 dark:text-slate-500 uppercase">Date</span>
                                    <span className="text-sm text-gray-500 dark:text-slate-400">{new Date(review.created_at).toLocaleDateString()}</span>
                                </div>

                                {/* Actions */}
                                <div className="flex justify-end gap-3 w-full sm:w-auto mt-2 sm:mt-0">
                                    <button
                                        onClick={() =>
                                            setOpenReview({
                                                title: review.title,
                                                comment: review.comment,
                                                rating: review.rating,
                                            })
                                        }
                                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                                    >
                                        <button
                                        onClick={() =>
                                            setOpenReview({
                                                title: review.title,
                                                comment: review.comment,
                                                rating: review.rating,
                                            })
                                        }
                                        className="text-sm text-blue-600 hover:underline"
                                    >
                                        View
                                    </button>
                                    </button>

                                    <button 
                                        onClick={() => handleDelete(review.id)}
                                        className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors flex items-center gap-1"
                                    >
                                        <Trash2 size={18} /> <span className="sm:hidden text-sm">Delete</span>
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        !loading && (
                            <p className="text-center text-gray-500 dark:text-slate-500 py-10">
                                No reviews found.
                            </p>
                        )
                    )}
                </div>
            </div>

            {/* MODAL OVERLAY */}
            {openReview && (
                <ReviewViewModal
                    title={openReview.title}
                    comment={openReview.comment}
                    rating={openReview.rating}
                    onClose={() => setOpenReview(null)}
                />
            )}
        </div>
    );
}