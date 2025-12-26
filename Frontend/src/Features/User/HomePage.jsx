import React, { useState, useEffect } from 'react';
import {
  ChevronDown, FileText, Bot, Target, Upload, FileSearch, Sparkles, ArrowRight, PlayCircle, Users, Mic, Timer, BarChart2
} from 'lucide-react';
import Footer from '../../Components/Footer'
import Pricing from '../../Components/Pricing'
import Header from '../../Components/Header'
import HomePageIMG from '../../assets/media/HomePageIMG.jpg'
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const [activeFeature, setActiveFeature] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const navigate = useNavigate();

  const features = [
    {
      id: "live-voice-transcription",
      title: "Live Voice Transcription",
      description:
        "Real-time transcription during lectures and meetings, capturing every word with high accuracy.",
      icon: Mic,
    },
    {
      id: "file-transcription",
      title: "File Transcription",
      description:
        "Upload audio, video, PDFs, YouTube links, or notes to convert them into editable text.",
      icon: FileText,
    },
    {
      id: "chatbot-qna",
      title: "Chatbot Q&A",
      description:
        "Ask intelligent questions about uploaded or transcribed content using our AI-powered chatbot.",
      icon: Bot,
    },
    {
      id: "pomodoro",
      title: "Pomodoro Timer",
      description:
        "Stay focused with customizable Pomodoro sessions and timely break reminders.",
      icon: Timer,
    },
    {
      id: "habit-tracker",
      title: "Habit Tracker",
      description:
        "Track daily completed tasks and visualize your progress with weekly, monthly, and yearly insights.",
      icon: Target,
    },
    {
      id: "community-groups",
      title: "Community Groups",
      description:
        "Share notes, collaborate, and chat with fellow students in dedicated community groups.",
      icon: Users,
    },
    {
      id: "analytics-dashboard",
      title: "Analytics Dashboard",
      description:
        "Monitor study habits: hours studied, topics mastered, Pomodoro sessions, and habit completion rates.",
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

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50">
      <Header />

      {/* ✅ Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* Left */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                AI-Powered Transcription
              </div>

              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Study Smarter with
                <br />
                <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  EduFlow
                </span>
              </h1>

              <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
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

                <button className="group border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg hover:border-purple-300 hover:text-purple-600 transition-all flex items-center justify-center gap-2">
                  <PlayCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  Watch Demo
                </button>
              </div>
            </div>

            {/* Right */}
            <div className="relative">
              <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl h-96 overflow-hidden shadow-2xl">
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
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          {/* Section Heading */}
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything you need for{" "}
              <span className="text-purple-600">smarter</span>
              <br />
              <span className="text-blue-600">studying</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our AI-powered tools help you transcribe, summarize, stay focused,
              and collaborate—everything in one place.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              const isActive = activeFeature === index;

              return (
                <div
                  key={feature.id}
                  onMouseEnter={() => setActiveFeature(index)}
                  className={`group relative p-8 rounded-2xl border transition-all duration-300 cursor-pointer ${isActive
                    ? "bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200 shadow-xl scale-105"
                    : "bg-gray-50 hover:bg-gray-100 border-gray-200 hover:shadow-md"
                    }`}
                >
                  {/* Icon */}
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center mb-6">
                    <Icon className="w-7 h-7 text-white" />
                  </div>

                  {/* Title + Description */}
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-sm">
                    {feature.description}
                  </p>

                  {/* Active Pulse Effect */}
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
      <section className="py-20 bg-gradient-to-br from-gray-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              See it in <span className="text-purple-600">action</span>
            </h2>
            <p className="text-xl text-gray-600">Upload → AI Transcribes → Get Summary</p>
          </div>

          <div className="relative">
            {/* Process Steps */}
            <div className="grid md:grid-cols-3 gap-8">
              {processSteps.map((step, index) => {
                const Icon = step.icon;

                return (
                  <div key={index} className="relative text-center group">
                    <div className="relative">
                      <div className={`w-20 h-20 mx-auto rounded-full bg-white shadow-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className={`w-10 h-10 ${step.color}`} />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                      <p className="text-gray-600">{step.description}</p>
                    </div>

                    {/* Connecting Line */}
                    {index < processSteps.length - 1 && (
                      <div className="hidden md:block absolute top-10 left-1/2 w-full h-0.5 bg-gradient-to-r from-purple-300 to-blue-300 transform translate-x-10"></div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Loved by <span className="text-purple-600">thousands</span> of students
            </h2>
            <p className="text-xl text-gray-600">See what professionals are saying about EchoNote</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {[
              {
                name: "Sarah Chen",
                role: "Product Manager at TechFlow",
                rating: 5,
                quote: "This app helped me stay on track with my studies. I improved 1.5 times speed boost!",
                avatar: "S",
                color: "bg-blue-500"
              },
              {
                name: "Marcus Rodriguez",
                role: "UI Engineering at DataCorp",
                rating: 5,
                quote: "The transcription quality is phenomenal. Even with technical discussions and multiple speakers, EchoNote captures everything with perfect accuracy.",
                avatar: "M",
                color: "bg-purple-500"
              },
              {
                name: "Emily Watson",
                role: "Marketing Lead at StartupXYZ",
                rating: 5,
                quote: "Timeshare love it, best feature improved my consistency.",
                avatar: "E",
                color: "bg-green-500"
              }
            ].map((testimonial, index) => (
              <div
                key={index}
                onClick={() => navigate('/review/')}
                className="group bg-gray-50 p-8 rounded-2xl hover:shadow-xl hover:scale-105 transform transition-all duration-300 cursor-pointer"
              >
                <div className="flex text-yellow-400 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <div key={i} className="w-5 h-5 text-yellow-400 animate-pulse" style={{ animationDelay: `${i * 100}ms` }}>
                      ⭐
                    </div>
                  ))}
                </div>
                <blockquote className="text-gray-700 mb-6 italic leading-relaxed">
                  "{testimonial.quote}"
                </blockquote>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 ${testimonial.color} rounded-full flex items-center justify-center text-white font-bold text-lg group-hover:scale-110 transition-transform`}>
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA within testimonials */}
          <div className="text-center bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Ready to transform your studies?</h3>
            <p className="text-xl text-gray-600 mb-8">Join thousands of professionals who trust EchoNote with their most important conversations</p>
            <div className="flex items-center justify-center gap-2 text-purple-600 font-semibold mb-6">
              <div className="flex -space-x-1">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className={`w-8 h-8 ${i <= 3 ? 'bg-purple-500' : i === 4 ? 'bg-blue-500' : 'bg-green-500'} rounded-full border-2 border-white animate-bounce`} style={{ animationDelay: `${i * 200}ms` }}></div>
                ))}
              </div>
              <span className="ml-3">10,000+ happy users</span>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <Pricing />

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