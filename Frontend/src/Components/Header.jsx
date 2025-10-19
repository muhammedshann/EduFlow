import { useEffect, useState } from "react";
import { Bot, Menu, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { Logout } from "../Redux/AuthSlice";
import { useNavigate } from "react-router-dom";
import { useUser } from "../Context/UserContext";

function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const {user , logout} = useUser();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  return (
    <header className="relative z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200/50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
            <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
              <Bot className="w-3 h-3 text-purple-600" />
            </div>
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            EduFlow
          </span>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-gray-600 hover:text-purple-600">Features</a>
          <a href="#resources" className="text-gray-600 hover:text-purple-600">Resources</a>
          <a href="#pricing" className="text-gray-600 hover:text-purple-600">Pricing</a>
          <a href="#about" className="text-gray-600 hover:text-purple-600">About</a>
        </nav>

        {/* Desktop Buttons */}
        {user ?(
          <div className="hidden md:flex items-center gap-4">
            <button className="bg-gradient-to-r from-purple-600 via-blue-600 to-purple-700 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transform hover:-translate-y-0.5 transition-all" onClick={() => logout()}>
              Logout
            </button>
          </div>
        ):(
          <div className="hidden md:flex items-center gap-4">
            <button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transform hover:-translate-y-0.5 transition-all" onClick={() => navigate('/login/')}>
              Get Started
            </button>
          </div>
        )}
        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 text-gray-600 hover:text-purple-600"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="absolute top-full left-0 w-full bg-white border-t shadow-md flex flex-col items-center py-6 space-y-4 md:hidden">
          <a href="#features" className="text-gray-700">Features</a>
          <a href="#resources" className="text-gray-700">Resources</a>
          <a href="#pricing" className="text-gray-700">Pricing</a>
          <a href="#about" className="text-gray-700">About</a>
          <button className="text-gray-700">Sign In</button>
          <button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-lg" onClick={() => dispatch(Logout())}>
            Get Started
          </button>
        </div>
      )}
    </header>
  );
}

export default Header;
