import React, { useEffect, useMemo, useState } from "react";
import { Star, Sparkles } from "lucide-react";
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

  // Cinematic Theme Constants
  const GRADIENT_BG = "bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/20";
  const GLASS_CARD = "bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-slate-800 shadow-xl";
  const INPUT_BG = "bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-700";

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
    // FIXED: Cinematic Gradient Background
    <div className={`min-h-screen ${GRADIENT_BG} text-slate-700 dark:text-slate-300 font-sans p-4 md:p-12 transition-colors duration-300 pb-32`}>
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10 pt-6">
          <h1 className="text-4xl font-black text-slate-800 dark:text-white tracking-tighter flex items-center justify-center gap-3">
            Student Reviews <Sparkles className="text-amber-400 fill-amber-400" />
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg font-medium mt-2">
            See what our community is saying about EduFlow
          </p>
        </div>

        {/* Stats Bar - Glassmorphism Applied */}
        <div className={`${GLASS_CARD} rounded-[2.5rem] p-8 mb-12 flex flex-col md:flex-row justify-between items-center px-16`}>
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2 mb-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={28}
                  fill={i < Math.floor(stats.avg) ? "#FBBF24" : "none"}
                  className="text-amber-400"
                />
              ))}
              <span className="text-4xl font-black ml-3 text-slate-800 dark:text-white tracking-tight">
                {stats.avg}
              </span>
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Average Rating</p>
          </div>

          <div className="h-12 w-px bg-slate-200 dark:bg-slate-700 hidden md:block" />

          <div className="text-center py-6 md:py-0">
            <p className="text-4xl font-black text-slate-800 dark:text-white">
              {stats.total}
            </p>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Total Reviews</p>
          </div>

          <div className="h-12 w-px bg-slate-200 dark:bg-slate-700 hidden md:block" />

          <div className="text-center">
            <div className="bg-emerald-100 dark:bg-emerald-500/10 px-4 py-1.5 rounded-lg text-emerald-600 dark:text-emerald-400 text-xs font-black uppercase tracking-wider mb-2">
              100% Recommended
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Positive Feedback</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Column: Form - Glassmorphism Applied */}
          <div className={`lg:col-span-5 ${GLASS_CARD} rounded-[2rem] p-8`}>
            <h2 className="text-xl font-black text-slate-800 dark:text-white mb-2 tracking-tight">Write a Review</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 font-medium leading-relaxed">
              Share your experience with EduFlow to help others make informed decisions.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-3 text-slate-400">
                  Rating *
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() =>
                        setFormData({ ...formData, rating: star })
                      }
                      className="transition-transform hover:scale-110 active:scale-95"
                    >
                      <Star
                        size={28}
                        fill={(hoverRating || formData.rating) >= star ? "#94a3b8" : "none"}
                        className={(hoverRating || formData.rating) >= star ? "text-slate-400" : "text-slate-200 dark:text-slate-700"}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-slate-400 ml-3 uppercase tracking-wider">
                    {formData.rating ? `${formData.rating} Stars` : 'Select'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-2 text-slate-400">
                  Review Title
                </label>
                <input
                  type="text"
                  placeholder="Summarize your experience..."
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className={`w-full ${INPUT_BG} rounded-xl p-3.5 text-sm font-medium dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-2 text-slate-400">
                  Your Review *
                </label>
                <textarea
                  rows="4"
                  placeholder="Tell us about your experience with EduFlow..."
                  value={formData.comment}
                  onChange={(e) =>
                    setFormData({ ...formData, comment: e.target.value })
                  }
                  className={`w-full ${INPUT_BG} rounded-xl p-3.5 text-sm font-medium dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none`}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold uppercase tracking-widest text-xs py-4 rounded-xl shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
              >
                Submit Review
              </button>
            </form>
          </div>

          {/* Right Column: Reviews List */}
          <div className="lg:col-span-7 space-y-6">
            <h2 className="text-xl font-black text-slate-800 dark:text-white mb-6 tracking-tight px-2">
              Recent Feedback
            </h2>

            {loading ? (
              <div className="text-center py-10">
                  <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading reviews...</p>
              </div>
            ) : (
              reviews.map((review) => (
                <div
                  key={review.id}
                  className={`${GLASS_CARD} rounded-2xl p-6 transition-all hover:scale-[1.01] hover:shadow-2xl`}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <img
                      src={review.avatar}
                      alt={review.name}
                      className="w-12 h-12 rounded-xl object-cover border-2 border-white/20 dark:border-slate-700"
                    />
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-slate-800 dark:text-white">
                          {review.name}
                        </span>
                        {review.featured && (
                          <span className="bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] px-2 py-0.5 rounded font-black uppercase tracking-wider">
                            Featured
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={12}
                            fill={i < review.rating ? "#FBBF24" : "none"}
                            className={i < review.rating ? "text-amber-400" : "text-slate-200 dark:text-slate-700"}
                          />
                        ))}
                        <span className="text-[10px] font-bold text-slate-400 ml-2 uppercase tracking-wide">
                          {review.date}
                        </span>
                      </div>
                    </div>
                  </div>

                  <h3 className="font-bold text-slate-800 dark:text-white mb-2 text-lg">
                    {review.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
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