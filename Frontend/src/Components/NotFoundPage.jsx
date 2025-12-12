import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

// 1. Import the specific icons you need from lucide-react
import {
  ArrowLeft,
  FileText,
  BookOpen,
  MessageSquare,
  ArrowRight
} from 'lucide-react';

// 2. Data for the repeating grid.
// We now use the Lucide components directly.
const helpLinks = [
  {
    // We pass the className here
    icon: <FileText className="w-6 h-6" />,
    title: "Documentation",
    description: "Dive in to learn all about our product.",
    linkText: "Start learning",
    href: "#"
  },
  {
    icon: <BookOpen className="w-6 h-6" />,
    title: "Our blog",
    description: "Read the latest posts on our blog.",
    linkText: "View lastest posts",
    href: "#"
  },
  {
    icon: <MessageSquare className="w-6 h-6" />,
    title: "Chat to us",
    description: "Can’t find what you’re looking for?",
    linkText: "Chat to our team",
    href: "#"
  }
];

// 3. The Corrected & Refactored Component
function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <section className="bg-white dark:bg-gray-900 ">
      <div className="container flex items-center justify-center min-h-screen px-6 py-12 mx-auto">
        <div className="w-full ">
          <div className="flex flex-col items-center max-w-lg mx-auto text-center">
            <p className="text-lg font-medium text-blue-500 dark:text-blue-400">404 error</p>
            <h1 className="mt-3 text-2xl font-semibold text-gray-800 dark:text-white md:text-3xl">We lost this page</h1>
            <p className="mt-4 text-gray-500 dark:text-gray-400">We searched high and low, but couldn’t find what you’re looking for. Let’s find a better place for you to go.</p>

            <div className="flex items-center w-full mt-6 gap-x-3 shrink-0 sm:w-auto">

              <button
                onClick={() => navigate(-1)}
                className="flex items-center justify-center w-1/2 px-5 py-2 text-sm text-gray-700 transition-colors duration-200 bg-white border rounded-lg dark:text-gray-200 gap-x-2 sm:w-auto dark:hover:bg-gray-800 dark:bg-gray-900 hover:bg-gray-100 dark:border-gray-700">

                {/* 4. Replaced with Lucide icon */}
                <ArrowLeft className="w-5 h-5 rtl:rotate-180" />
                <span>Go back</span>
              </button>

              <Link
                to="/"
                className="w-1/2 px-5 py-2 text-sm tracking-wide text-white transition-colors duration-200 bg-blue-500 rounded-lg shrink-0 sm:w-auto hover:bg-blue-600 dark:hover:bg-blue-500 dark:bg-blue-600">
                Take me home
              </Link>
            </div>
          </div>

          <div className="grid w-full max-w-6xl grid-cols-1 gap-8 mx-auto mt-8 sm:grid-cols-2 lg:grid-cols-3">
            {helpLinks.map((link) => (
              <div key={link.title} className="p-6 rounded-lg bg-blue-50 dark:bg-gray-800">
                <span className="text-gray-500 dark:text-gray-400">
                  {/* Icon is rendered from the array */}
                  {link.icon}
                </span>

                <h3 className="mt-6 font-medium text-gray-700 dark:text-gray-200">{link.title}</h3>
                <p className="mt-2 text-gray-500 dark:text-gray-400">{link.description}</p>

                <a href={link.href} className="inline-flex items-center mt-4 text-sm text-blue-500 gap-x-2 dark:text-blue-400 hover:underline">
                  <span>{link.linkText}</span>

                  {/* 5. Replaced with Lucide icon */}
                  <ArrowRight className="w-5 h-5 rtl:rotate-180" />
                </a>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}

export default NotFoundPage;