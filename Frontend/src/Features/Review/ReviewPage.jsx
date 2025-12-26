import React, { useState, useMemo } from 'react';
import { Star } from 'lucide-react';

const INITIAL_REVIEWS = [
  {
    id: 1,
    name: "Sarah Johnson",
    rating: 5,
    title: "Excellent transcription accuracy!",
    comment: "I've been using TranscriptPro for my podcast transcriptions and the accuracy is incredible. The AI assistant feature has saved me hours of editing time. Highly recommended for content creators!",
    date: "over 1 year ago",
    featured: true,
    avatar: "https://i.pravatar.cc/150?u=sarah"
  },
  {
    id: 2,
    name: "Michael Chen",
    rating: 4,
    title: "Great for business meetings",
    comment: "The Pro plan has been perfect for transcribing our weekly team meetings. The custom vocabulary feature really helps with technical terms. Only minor issue is occasional background noise pickup.",
    date: "over 1 year ago",
    featured: false,
    avatar: "https://i.pravatar.cc/150?u=michael"
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    rating: 5,
    title: "Game changer for research",
    comment: "As a researcher, I need accurate transcriptions of interviews. TranscriptPro delivers consistently high-quality results. The export options are comprehensive and the turnaround time is impressive.",
    date: "over 1 year ago",
    featured: true,
    avatar: "https://i.pravatar.cc/150?u=emily"
  }
];

export default function TranscriptProReviews() {
  const [reviews, setReviews] = useState(INITIAL_REVIEWS);
  const [formData, setFormData] = useState({ rating: 0, title: '', comment: '' });
  const [hoverRating, setHoverRating] = useState(0);

  // Dynamic Statistics
  const stats = useMemo(() => {
    const total = reviews.length;
    const avg = total > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / total).toFixed(1) : 0;
    return { avg, total };
  }, [reviews]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.rating === 0) return alert("Please select a rating");

    const newReview = {
      id: Date.now(),
      name: "Current User",
      rating: formData.rating,
      title: formData.title,
      comment: formData.comment,
      date: "Just now",
      featured: false,
      avatar: "https://i.pravatar.cc/150?u=guest"
    };

    setReviews([newReview, ...reviews]);
    setFormData({ rating: 0, title: '', comment: '' });
  };

  return (
    <div className="min-h-screen bg-white text-slate-700 font-sans p-4 md:p-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-purple-500 to-red-500 bg-clip-text text-transparent">
                        Students Reviews
                    </h1>
                    <p className="text-gray-600 text-lg">
                        See what our students are saying about EDUFLOW
                    </p>
        </div>

        {/* Stats Bar */}
        <div className="bg-gray-50/50 border border-gray-200 rounded-2xl p-8 mb-12 flex flex-col md:flex-row justify-between items-center px-16">
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1 mb-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={24} fill={i < Math.floor(stats.avg) ? "#FBBF24" : "none"} className="text-amber-400" />
              ))}
              <span className="text-3xl font-bold ml-2 text-slate-800">{stats.avg}</span>
            </div>
            <p className="text-xs text-slate-500">Average Rating</p>
          </div>
          <div className="h-12 w-px bg-gray-200 hidden md:block"></div>
          <div className="text-center py-4 md:py-0">
            <p className="text-3xl font-bold text-slate-800">{stats.total}</p>
            <p className="text-xs text-slate-500">Total Reviews</p>
          </div>
          <div className="h-12 w-px bg-gray-200 hidden md:block"></div>
          <div className="text-center">
            <div className="bg-gray-100 px-3 py-1 rounded text-[10px] font-bold mb-1">100%</div>
            <p className="text-xs text-slate-500">Positive Reviews</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Form */}
          <div className="lg:col-span-5 bg-gray-50/30 border border-gray-100 rounded-2xl p-8 shadow-sm">
            <h2 className="text-xl font-bold mb-1">Write a Review</h2>
            <p className="text-sm text-slate-500 mb-6">Share your experience with EduFlow to help others make informed decisions.</p>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold mb-2 uppercase tracking-wide">Rating *</label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setFormData({ ...formData, rating: star })}
                    >
                      <Star 
                        size={22} 
                        fill={(hoverRating || formData.rating) >= star ? "#94a3b8" : "none"} 
                        className={(hoverRating || formData.rating) >= star ? "text-slate-400" : "text-slate-300"} 
                      />
                    </button>
                  ))}
                  <span className="text-xs text-slate-400 ml-2">Select rating</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-2 uppercase tracking-wide">Review Title (Optional)</label>
                <input 
                  type="text"
                  placeholder="Summarize your experience..."
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-white border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-2 uppercase tracking-wide">Your Review *</label>
                <textarea 
                  rows="4"
                  placeholder="Tell us about your experience with EduFlow..."
                  value={formData.comment}
                  onChange={(e) => setFormData({...formData, comment: e.target.value})}
                  className="w-full bg-white border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <p className="text-[10px] text-right text-slate-400 mt-1">{formData.comment.length}/1000 characters</p>
              </div>

              <button 
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition-colors shadow-md"
              >
                Submit Review
              </button>
            </form>
          </div>

          {/* Right Column: Reviews List */}
          <div className="lg:col-span-7 space-y-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Recent Reviews</h2>
            {reviews.map((review) => (
              <div key={review.id} className="bg-gray-50/30 border border-gray-100 rounded-2xl p-6 transition-all hover:bg-white hover:shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <img src={review.avatar} alt={review.name} className="w-10 h-10 rounded-full border border-gray-200" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-800">{review.name}</span>
                      {review.featured && (
                        <span className="bg-gray-200 text-slate-600 text-[10px] px-2 py-0.5 rounded font-bold uppercase">Featured</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} fill={i < review.rating ? "#FBBF24" : "none"} className={i < review.rating ? "text-amber-400" : "text-slate-300"} />
                      ))}
                      <span className="text-[11px] text-slate-400 ml-2">{review.date}</span>
                    </div>
                  </div>
                </div>
                <h3 className="font-bold text-slate-800 mb-2">{review.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}