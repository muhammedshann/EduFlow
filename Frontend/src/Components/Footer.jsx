import { Bot } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 py-16 border-t border-gray-200 dark:border-slate-800 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid md:grid-cols-4 gap-8">
                    {/* Brand Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                                <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                                    <Bot className="w-3 h-3 text-purple-600" />
                                </div>
                            </div>
                            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400 bg-clip-text text-transparent">
                                EduFlow
                            </span>
                        </div>
                        <p className="text-sm leading-relaxed">
                            Empowering students with AI-powered tools for better learning outcomes.
                        </p>
                    </div>

                    {/* Links Column 1 */}
                    <div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-lg mb-4">Product</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Features</a></li>
                            <li><a href="#" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Pricing</a></li>
                            <li><a href="#" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">API</a></li>
                            <li><a href="#" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Integrations</a></li>
                        </ul>
                    </div>

                    {/* Links Column 2 */}
                    <div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-lg mb-4">Resources</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Documentation</a></li>
                            <li><a href="#" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Tutorials</a></li>
                            <li><a href="#" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Blog</a></li>
                            <li><a href="#" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Community</a></li>
                        </ul>
                    </div>

                    {/* Links Column 3 */}
                    <div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-lg mb-4">Support</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Help Center</a></li>
                            <li><a href="#" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Contact Us</a></li>
                            <li><a href="#" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Status</a></li>
                            <li><a href="#" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Privacy</a></li>
                        </ul>
                    </div>
                </div>

                {/* Copyright */}
                <div className="border-t border-gray-100 dark:border-slate-800 mt-12 pt-8 text-center text-sm text-slate-500 dark:text-slate-500">
                    <p>&copy; {new Date().getFullYear()} EduFlow. All rights reserved.</p>
                </div>
            </div>
        </footer>
    )
}

export default Footer;