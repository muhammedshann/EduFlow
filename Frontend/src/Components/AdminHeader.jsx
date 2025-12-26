import { ArrowLeft, Settings, User } from "lucide-react";

const AdminHeader = ({ title }) => {
    return (
        <header className="flex items-center justify-between bg-white border-b px-6 py-4 shadow-sm fixed top-0 w-full z-30">
            <div className="flex items-center gap-2 text-gray-600 cursor-pointer">
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">Back to App</span>
            </div>

            <h1 className="text-lg font-semibold text-gray-800 hidden sm:block">{title}</h1>

            <div className="flex items-center gap-5 text-gray-600">
                <Settings className="w-5 h-5 cursor-pointer hover:text-indigo-600 transition" />
                <User className="w-5 h-5 cursor-pointer hover:text-indigo-600 transition" />
            </div>
        </header>
    );
}

export default AdminHeader;