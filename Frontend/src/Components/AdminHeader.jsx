import { ArrowLeft, Settings, User } from "lucide-react";

const AdminHeader = ({ title }) => {
    return (
        <header className="flex items-center justify-between bg-white dark:bg-slate-900 border-b dark:border-slate-800 px-6 py-4 shadow-sm fixed top-0 w-full z-30 transition-colors duration-300">
            <div className="flex items-center gap-2 text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200 cursor-pointer transition-colors">
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">Back to App</span>
            </div>

            <h1 className="text-lg font-semibold text-gray-800 dark:text-white hidden sm:block">
                {title}
            </h1>

            <div className="flex items-center gap-5 text-gray-600 dark:text-slate-400">
                <Settings className="w-5 h-5 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors" />
                <User className="w-5 h-5 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors" />
            </div>
        </header>
    );
}

export default AdminHeader;