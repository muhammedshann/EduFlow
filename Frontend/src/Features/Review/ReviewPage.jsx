import React, { useEffect, useMemo, useState } from "react";
import { Star } from "lucide-react";
import { useDispatch } from "react-redux";
import { FetchReviews, UploadReview } from "../../Redux/ReviewSlice";

export default function TranscriptProReviews() {
  const dispatch = useDispatch();

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    rating: 0,
    title: "",
    comment: "",
  });

  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const res = await dispatch(FetchReviews()).unwrap();

        const mapped = res.map((r) => ({
          id: r.id,
          name: r.username,
          rating: r.rating,
          title: r.title,
          comment: r.comment,
          date: new Date(r.created_at).toLocaleDateString(),
          featured: false,
          avatar: r.profile_pic || "https://i.pravatar.cc/150?u=guest",
        }));

        setReviews(mapped);
      } catch (err) {
        console.error("Failed to load reviews", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [dispatch]);

  const stats = useMemo(() => {
    const total = reviews.length;
    const avg =
      total > 0
        ? (
          reviews.reduce((acc, r) => acc + r.rating, 0) / total
        ).toFixed(1)
        : 0;

    return { avg, total };
  }, [reviews]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.rating || !formData.comment.trim()) return;

    try {
      const newReview = await dispatch(
        UploadReview({
          rating: formData.rating,
          title: formData.title,
          comment: formData.comment,
        })
      ).unwrap();

      const mapped = {
        id: newReview.id,
        name: newReview.username,
        rating: newReview.rating,
        title: newReview.title,
        comment: newReview.comment,
        date: "Just now",
        featured: false,
        avatar: newReview.profile_pic || "https://i.pravatar.cc/150?u=guest",
      };

      setReviews((prev) => [mapped, ...prev]);
      setFormData({ rating: 0, title: "", comment: "" });
    } catch (err) {
      console.error("Review submit failed", err);
    }
  };

  return (
    /* FIXED: Applied Cinematic Background Gradient and small bottom padding (pb-20) */
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/20 text-slate-700 dark:text-slate-300 font-sans p-4 md:p-12 pb-20 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-purple-500 to-red-500 bg-clip-text text-transparent">
            Students Reviews
          </h1>
          <p className="text-gray-600 dark:text-slate-400 text-lg">
            See what our students are saying about EDUFLOW
          </p>
        </div>

        {/* Stats Bar */}
        <div className="bg-gray-50/50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-800 rounded-2xl p-8 mb-12 flex flex-col md:flex-row justify-between items-center px-16">
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1 mb-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={24}
                  fill={i < Math.floor(stats.avg) ? "#FBBF24" : "none"}
                  className="text-amber-400"
                />
              ))}
              <span className="text-3xl font-bold ml-2 text-slate-800 dark:text-slate-100">
                {stats.avg}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Average Rating</p>
          </div>

          <div className="h-12 w-px bg-gray-200 dark:bg-slate-800 hidden md:block" />

          <div className="text-center py-4 md:py-0">
            <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">
              {stats.total}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Total Reviews</p>
          </div>

          <div className="h-12 w-px bg-gray-200 dark:bg-slate-800 hidden md:block" />

          <div className="text-center">
            <div className="bg-gray-100 dark:bg-slate-800 px-3 py-1 rounded text-[10px] font-bold mb-1 dark:text-slate-200">
              100%
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Positive Reviews</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Column: Form */}
          <div className="lg:col-span-5 bg-gray-50/30 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-800 rounded-2xl p-8 shadow-sm">
            <h2 className="text-xl font-bold mb-1 dark:text-slate-100">Write a Review</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              Share your experience with EduFlow to help others make informed decisions.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold mb-2 uppercase tracking-wide dark:text-slate-300">
                  Rating *
                </label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() =>
                        setFormData({ ...formData, rating: star })
                      }
                    >
                      <Star
                        size={22}
                        fill={(hoverRating || formData.rating) >= star ? "#94a3b8" : "none"}
                        className={(hoverRating || formData.rating) >= star ? "text-slate-400" : "text-slate-300 dark:text-slate-600"}
                      />
                    </button>
                  ))}
                  <span className="text-xs text-slate-400 dark:text-slate-500 ml-2">
                    Select rating
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-2 uppercase tracking-wide dark:text-slate-300">
                  Review Title
                </label>
                <input
                  type="text"
                  placeholder="Summarize your experience..."
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-3 text-sm dark:text-white outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-2 uppercase tracking-wide dark:text-slate-300">
                  Your Review *
                </label>
                <textarea
                  rows="4"
                  placeholder="Tell us about your experience with EduFlow..."
                  value={formData.comment}
                  onChange={(e) =>
                    setFormData({ ...formData, comment: e.target.value })
                  }
                  className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-3 text-sm dark:text-white outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg shadow-md transition-colors"
              >
                Submit Review
              </button>
            </form>
          </div>

          {/* Right Column: Reviews List */}
          <div className="lg:col-span-7 space-y-6">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">
              Recent Reviews
            </h2>

            {loading ? (
              <p className="text-center text-gray-500 dark:text-slate-400">Loading reviews…</p>
            ) : (
              reviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-gray-50/30 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-800 rounded-2xl p-6 transition-all hover:bg-white dark:hover:bg-slate-900 hover:shadow-sm"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <img
                      src={review.avatar}
                      alt={review.name}
                      className="w-10 h-10 rounded-full border border-gray-200 dark:border-slate-700"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-800 dark:text-slate-100">
                          {review.name}
                        </span>
                        {review.featured && (
                          <span className="bg-gray-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] px-2 py-0.5 rounded font-bold uppercase">
                            Featured
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            fill={i < review.rating ? "#FBBF24" : "none"}
                            className={i < review.rating ? "text-amber-400" : "text-slate-300 dark:text-slate-600"}
                          />
                        ))}
                        <span className="text-[11px] text-slate-400 dark:text-slate-500 ml-2">
                          {review.date}
                        </span>
                      </div>
                    </div>
                  </div>

                  <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-2">
                    {review.title}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    {review.comment}
                  </p>
                </div>
              ))
            )}
          </div>

        </div>
      </div>
    </div>
  );
}