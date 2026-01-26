import React, { useState, useEffect } from 'react';
import {
  ChevronDown, FileText, Bot, Target, Upload, FileSearch, Sparkles, ArrowRight, PlayCircle, Users, Mic, Timer, BarChart2
} from 'lucide-react';
import Footer from '../../Components/Footer'
import Pricing from '../../Components/Pricing'
import Header from '../../Components/Header'
import HomePageIMG from '../../assets/media/HomePageIMG.jpg'
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { FetchReviews } from '../../Redux/ReviewSlice';
import { useTheme } from '../../Context/ThemeContext'; // Ensure this path is correct

const HomePage = () => {
  const { isDarkMode } = useTheme(); 
  const [activeFeature, setActiveFeature] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [testimonials, setReviews] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const features = [
    {
      id: "live-voice-transcription",
      title: "Live Voice Transcription",
      description: "Real-time transcription during lectures and meetings, capturing every word with high accuracy.",
      icon: Mic,
    },
    {
      id: "file-transcription",
      title: "File Transcription",
      description: "Upload audio, video, PDFs, YouTube links, or notes to convert them into editable text.",
      icon: FileText,
    },
    {
      id: "chatbot-qna",
      title: "Chatbot Q&A",
      description: "Ask intelligent questions about uploaded or transcribed content using our AI-powered chatbot.",
      icon: Bot,
    },
    {
      id: "pomodoro",
      title: "Pomodoro Timer",
      description: "Stay focused with customizable Pomodoro sessions and timely break reminders.",
      icon: Timer,
    },
    {
      id: "habit-tracker",
      title: "Habit Tracker",
      description: "Track daily completed tasks and visualize your progress with weekly, monthly, and yearly insights.",
      icon: Target,
    },
    {
      id: "community-groups",
      title: "Community Groups",
      description: "Share notes, collaborate, and chat with fellow students in dedicated community groups.",
      icon: Users,
    },
    {
      id: "analytics-dashboard",
      title: "Analytics Dashboard",
      description: "Monitor study habits: hours studied, topics mastered, Pomodoro sessions, and habit completion rates.",
      icon: BarChart2,
    },
  ];

  const processSteps = [
    {
      icon: Upload,
      title: 'Upload Meeting',
      description: 'Drop your voice/audio/video file',
      color: 'text-blue-500'
    },
    {
      icon: Bot,
      title: 'AI Processing',
      description: 'Our AI transcribes and analyzes content',
      color: 'text-purple-500'
    },
    {
      icon: FileSearch,
      title: 'Get Summary',
      description: 'Receive insights, action points and key points',
      color: 'text-green-500'
    }
  ];

  const fetch = async () => {
    try {
      const response = await dispatch(FetchReviews()).unwrap();
      setReviews(response)
    } catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    fetch()
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 dark:from-slate-950 dark:to-slate-900 transition-colors duration-300">
      <Header />

      {/* ✅ Hero Section */}
      <section className="relative py-30 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* Left */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-4 py-2 rounded-full text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                AI-Powered Transcription
              </div>

              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
                Study Smarter with
                <br />
                <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  EduFlow
                </span>
              </h1>

              <p className="text-xl text-gray-600 dark:text-slate-400 leading-relaxed max-w-lg">
                Transcribe, organize, and analyze your learning materials. EduFlow brings all your productivity tools into one seamless experience.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => {
                    if (!isProcessing) navigate("/dashboard/");
                  }}
                  disabled={isProcessing}
                  className="group bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-xl transform hover:-translate-y-1 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <span>Get Started</span>
                      <ChevronDown className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>

                <button className="group border-2 border-gray-300 dark:border-slate-700 text-gray-700 dark:text-slate-300 px-8 py-4 rounded-xl font-semibold text-lg hover:border-purple-300 dark:hover:border-purple-500 hover:text-purple-600 dark:hover:text-purple-400 transition-all flex items-center justify-center gap-2">
                  <PlayCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  Watch Demo
                </button>
              </div>
            </div>

            {/* Right */}
            <div className="relative">
              <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl h-96 overflow-hidden shadow-2xl border border-gray-200 dark:border-slate-700">
                <img src={HomePageIMG} alt="Hero Visual" className="w-full h-full object-cover" />
                <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  Live Processing
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white dark:bg-slate-950 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Everything you need for{" "}
              <span className="text-purple-600 dark:text-purple-400">smarter</span>
              <br />
              <span className="text-blue-600 dark:text-blue-400">studying</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-slate-400 max-w-3xl mx-auto">
              Our AI-powered tools help you transcribe, summarize, stay focused,
              and collaborate—everything in one place.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              const isActive = activeFeature === index;

              return (
                <div
                  key={feature.id}
                  onMouseEnter={() => setActiveFeature(index)}
                  className={`group relative p-8 rounded-2xl border transition-all duration-300 cursor-pointer ${isActive
                    ? "bg-gradient-to-br from-purple-50 to-blue-50 dark:from-slate-800 dark:to-slate-800 border-purple-200 dark:border-purple-500/50 shadow-xl scale-105"
                    : "bg-gray-50 dark:bg-slate-900 hover:bg-gray-100 dark:hover:bg-slate-800 border-gray-200 dark:border-slate-800 hover:shadow-md"
                    }`}
                >
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center mb-6">
                    <Icon className="w-7 h-7 text-white" />
                  </div>

                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-slate-400 leading-relaxed text-sm">
                    {feature.description}
                  </p>

                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-blue-600/5 rounded-2xl animate-pulse"></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>;

      {/* Process Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-purple-50 dark:from-slate-950 dark:to-slate-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              See it in <span className="text-purple-600 dark:text-purple-400">action</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-slate-400">Upload → AI Transcribes → Get Summary</p>
          </div>

          <div className="relative">
            <div className="grid md:grid-cols-3 gap-8">
              {processSteps.map((step, index) => {
                const Icon = step.icon;

                return (
                  <div key={index} className="relative text-center group">
                    <div className="relative">
                      <div className={`w-20 h-20 mx-auto rounded-full bg-white dark:bg-slate-800 shadow-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className={`w-10 h-10 ${step.color}`} />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{step.title}</h3>
                      <p className="text-gray-600 dark:text-slate-400">{step.description}</p>
                    </div>

                    {index < processSteps.length - 1 && (
                      <div className="hidden md:block absolute top-10 left-1/2 w-full h-0.5 bg-gradient-to-r from-purple-300 to-blue-300 dark:from-slate-700 dark:to-slate-700 transform translate-x-10"></div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white dark:bg-slate-950 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Loved by <span className="text-purple-600 dark:text-purple-400">thousands</span> of students
            </h2>
            <p className="text-xl text-gray-600 dark:text-slate-400">See what professionals are saying about EchoNote</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {testimonials && testimonials.length > 0 ? (
              testimonials.slice(0, 3).map((testimonial, index) => (
                <div
                  key={testimonial.id || index}
                  onClick={() => navigate('/review/')}
                  className="group bg-gray-50 dark:bg-slate-800 p-8 rounded-2xl hover:shadow-xl hover:scale-105 transform transition-all duration-300 cursor-pointer border border-transparent dark:border-slate-700"
                >
                  <div className="flex text-yellow-400 mb-4">
                    {[...Array(Number(testimonial.rating) || 5)].map((_, i) => (
                      <div
                        key={i}
                        className="w-5 h-5 text-yellow-400 animate-pulse"
                        style={{ animationDelay: `${i * 100}ms` }}
                      >
                        ⭐
                      </div>
                    ))}
                  </div>

                  <h3 className="font-bold text-gray-900 dark:text-white mb-2 capitalize">
                    {testimonial.title}
                  </h3>

                  <blockquote className="text-gray-700 dark:text-slate-300 mb-6 italic leading-relaxed">
                    "{testimonial.comment}"
                  </blockquote>

                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg group-hover:scale-110 transition-transform`}>
                      {testimonial.username ? testimonial.username[0].toUpperCase() : 'U'}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {testimonial.username || "Verified Student"}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-slate-500">
                        {testimonial.created_at ? new Date(testimonial.created_at).toLocaleDateString() : 'Recent'}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center py-20 text-gray-400 dark:text-slate-500">
                No reviews available yet.
              </div>
            )}
          </div>

          <div className="text-center bg-gradient-to-br from-purple-50 to-blue-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-12 shadow-lg dark:shadow-none">
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Ready to transform your studies?</h3>
            <p className="text-xl text-gray-600 dark:text-slate-400 mb-8">Join thousands of professionals who trust EchoNote with their most important conversations</p>
            <div className="flex items-center justify-center gap-2 text-purple-600 dark:text-purple-400 font-semibold mb-6">
              <div className="flex -space-x-1">
                {[1, 2, 3, 4, 5].map(i => (
                  <div
                    key={i}
                    className={`w-8 h-8 ${i <= 3 ? 'bg-purple-500' : i === 4 ? 'bg-blue-500' : 'bg-green-500'} rounded-full border-2 border-white dark:border-slate-800 animate-bounce`}
                    style={{ animationDelay: `${i * 200}ms` }}
                  ></div>
                ))}
              </div>
              <span className="ml-3">10,000+ happy users</span>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section with Heading */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-purple-50 dark:from-slate-950 dark:to-slate-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Choose Your Plan</h2>
            <p className="text-xl text-gray-600 dark:text-slate-400">Select the perfect credits bundle for your needs</p>
          </div>
          <Pricing />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-purple-600 to-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Ready to transform your study experience?
          </h2>
          <p className="text-xl mb-8 text-purple-100">
            Join thousands of students who are already studying smarter with AI
          </p>
          <button className="bg-white text-purple-600 px-12 py-4 rounded-xl font-bold text-xl hover:bg-gray-100 transform hover:-translate-y-1 transition-all duration-300 inline-flex items-center gap-2 shadow-2xl">
            Get Started Free
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default HomePage;