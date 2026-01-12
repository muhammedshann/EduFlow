import React, { useEffect, useState } from "react";
import {
    Star,
    Users,
    MessageSquare,
    Trash2,
    Search,
} from "lucide-react";
import { useDispatch } from "react-redux";
import { AdminStatCard } from "./AdminUserPage";
import { DeleteReviews, FetchReviews } from "../../Redux/ReviewSlice";

function ReviewViewModal({ title, comment, rating, onClose }) {
    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white w-full max-w-md rounded-xl shadow-lg p-6">

                <h2 className="text-lg font-semibold text-gray-800 mb-3">
                    {title || "No Title"}
                </h2>
                <div className="text-yellow-600 font-semibold">
                    {rating || 'no rating'} ★
                </div>

                <div className="text-sm text-gray-600 leading-relaxed max-h-60 overflow-y-auto">
                    {comment || "No comment provided."}
                </div>

                <div className="flex justify-end mt-6">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm font-medium"
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

            const averageRating =
                totalReviews > 0
                    ? (
                        data.reduce((s, r) => s + (r.rating || 0), 0) /
                        totalReviews
                    ).toFixed(1)
                    : 0;


            setStats({
                totalReviews,
                averageRating,
            });
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

        const filtered = reviews.filter(
            (r) =>
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
        <div className="p-6 md:p-10 bg-gray-50 min-h-screen">

            {/* HEADER */}
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-1 flex items-center">
                    <Star size={32} className="mr-3 text-purple-600" />
                    Review Management
                </h1>
                <p className="text-gray-500">
                    Manage and moderate user reviews across the platform.
                </p>
            </header>

            {/* STATS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 mb-10">

                <AdminStatCard
                    title="Total Reviews"
                    value={stats.totalReviews}
                    change="All submitted reviews"
                    icon={MessageSquare}
                    iconBg="bg-purple-100"
                    iconColor="text-purple-600"
                />

                <AdminStatCard
                    title="Average Rating"
                    value={`${stats.averageRating} ★`}
                    change="Across all reviews"
                    icon={Star}
                    iconBg="bg-yellow-100"
                    iconColor="text-yellow-600"
                />

                {/* <AdminStatCard
                    title="Users Reviewed"
                    value={stats.totalUsers}
                    change="Unique users"
                    icon={Users}
                    iconBg="bg-green-100"
                    iconColor="text-green-600"
                /> */}
            </div>

            {/* TABLE */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">

                {/* SEARCH */}
                <div className="flex justify-between items-center mb-6 flex-wrap">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 sm:mb-0">
                        User Reviews
                    </h2>

                    <div className="relative w-full sm:w-80">
                        <Search
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <input
                            type="text"
                            placeholder="Search by title or user..."
                            value={searchTerm}
                            onChange={handleSearch}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                        />
                    </div>
                </div>

                {/* HEADER */}
                <div className="grid grid-cols-9 text-sm font-semibold text-gray-500 border-b py-3 px-4">
                    <div className="col-span-2">User</div>
                    <div>Rating</div>
                    <div className="col-span-2">Title</div>
                    <div className="col-span-2">Comment</div>
                    <div>Date</div>
                    <div className="text-right">Actions</div>
                </div>

                {/* ROWS */}
                <div className="divide-y">
                    {!loading && filteredReviews.length > 0 ? (
                        filteredReviews.map((review) => (
                            <div
                                key={review.id}
                                className="grid grid-cols-9 items-center p-4 hover:bg-gray-50"
                            >
                                <div className="col-span-2 font-medium truncate">
                                    {review.username}
                                </div>

                                <div className="text-yellow-600 font-semibold">
                                    {review.rating} ★
                                </div>

                                <div className="col-span-2 truncate text-gray-700">
                                    {review.title}
                                </div>

                                <div className="col-span-2 truncate text-gray-700">
                                    {review.comment}
                                </div>

                                <div className="text-sm text-gray-500">
                                    {new Date(review.created_at).toLocaleDateString()}
                                </div>

                                <div className="flex justify-end gap-3">
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

                                    <Trash2
                                        size={18}
                                        onClick={() => handleDelete(review.id)}
                                        className="text-gray-400 hover:text-red-600 cursor-pointer"
                                    />
                                </div>

                            </div>
                        ))
                    ) : (
                        !loading && (
                            <p className="text-center text-gray-500 py-10">
                                No reviews found.
                            </p>
                        )
                    )}
                </div>
            </div>
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
