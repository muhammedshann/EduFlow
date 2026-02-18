import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Zap } from 'lucide-react';
import { AdminFetchPricing } from '../../Redux/AdminRedux/AdminSubscriptionSlice';
import { useNavigate } from 'react-router-dom';
import Pricing from '../../Components/Pricing'; // Imported Pricing Component

export default function SubscriptionPlans() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [viewMode, setViewMode] = useState('bundles');
    const [CreditRate, setCreditRate] = useState(0);
    const [customAmount, setCustomAmount] = useState('');

    useEffect(() => {
        const loadData = async () => {
            try {
                // Only need pricing rate for the Custom Calculator
                const pricing = await dispatch(AdminFetchPricing()).unwrap();
                setCreditRate(pricing.rate_per_credit);
            } catch (err) {
                console.error("Failed to load pricing:", err);
            }
        };
        loadData();
    }, [dispatch]);

    const HandleCustomSubmit = () => {
        const amount = Number(customAmount) || 0;

        // Don't proceed if amount is 0
        if (amount <= 0) return alert("Please enter a valid credit amount");

        const selectedPackage = {
            name: "Custom Credit Pack",
            credits: amount,
            price: (amount * CreditRate).toFixed(2),
            isCustom: true // Useful for backend tracking
        };

        // Pass the normalized package to the checkout page
        navigate('/checkout', { state: { bundle: selectedPackage } });
    };

    return (
        /* FIXED: Applied Cinematic Background Gradient and increased bottom padding to pb-40 to clear the dock */
        <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/20 mx-auto px-4 pb-40 transition-colors duration-300">
            {/* Header Section with Toggles */}
            <header className="text-center mb-4 pt-8">
                <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-1">Choose Your Credit Pack</h2>
                <p className="text-gray-500 dark:text-slate-400 text-sm font-medium">Buy credits once — use them anytime.</p>

                <div className="mt-6 inline-flex p-1 bg-gray-200/60 dark:bg-slate-800/60 rounded-xl border border-gray-200 dark:border-slate-700">
                    <button
                        onClick={() => setViewMode('bundles')}
                        className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${
                            viewMode === 'bundles' 
                            ? 'bg-white dark:bg-slate-700 shadow-md text-gray-800 dark:text-slate-100' 
                            : 'text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300'
                        }`}
                    >
                        Credit Bundles
                    </button>
                    <button
                        onClick={() => setViewMode('custom')}
                        className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${
                            viewMode === 'custom' 
                            ? 'bg-white dark:bg-slate-700 shadow-md text-gray-800 dark:text-slate-100' 
                            : 'text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300'
                        }`}
                    >
                        Custom Credit
                    </button>
                </div>
            </header>

            <main>
                {viewMode === 'bundles' ? (
                    // --- REPLACED MANUAL GRID WITH PRICING COMPONENT ---
                    // The Pricing component handles fetching bundles and displaying them
                    <div> 
                        {/* Negative margin to offset Pricing component's internal top padding if needed */}
                        <Pricing />
                    </div>
                ) : (
                    /* --- Custom Credit View --- */
                    <div className="max-w-lg mx-auto bg-white dark:bg-slate-800 p-8 rounded-[32px] border border-gray-100 dark:border-slate-700 shadow-xl dark:shadow-slate-900/50 text-center animate-in fade-in zoom-in duration-300 mt-8 mb-20">
                        <div className="w-14 h-14 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner dark:shadow-none">
                            <Zap size={28} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 dark:text-slate-100 mb-1">Buy Exact Credits</h3>
                        <p className="text-gray-400 dark:text-slate-400 text-xs mb-6 italic">Rate: <span className="text-purple-600 dark:text-purple-400 font-bold">₹{CreditRate} per credit</span></p>

                        <div className="space-y-4">
                            <div className="relative">
                                <label className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 font-bold text-[10px] uppercase tracking-widest">
                                    Amount
                                </label>
                                <input
                                    type="number"
                                    value={customAmount}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setCustomAmount(val === "" ? "" : Math.max(0, parseInt(val)));
                                    }}
                                    className="w-full pl-24 pr-5 py-4 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl text-lg font-black text-gray-800 dark:text-white focus:ring-4 focus:ring-purple-100 dark:focus:ring-purple-900/30 outline-none transition-all"
                                    placeholder="0"
                                />
                            </div>

                            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-2xl border border-purple-100 dark:border-purple-900/30 flex justify-between items-center">
                                <span className="text-gray-600 dark:text-slate-300 text-xs font-bold">Estimated Cost</span>
                                <span className="text-2xl font-black text-purple-700 dark:text-purple-400">₹{((customAmount || 0) * CreditRate).toFixed(2)}</span>
                            </div>

                            <button onClick={HandleCustomSubmit} className="w-full py-4 bg-purple-600 text-white rounded-2xl text-sm font-black shadow-xl shadow-purple-100 dark:shadow-none hover:bg-purple-700 active:scale-95 transition-all">
                                Purchase Credits
                            </button>
                        </div>
                    </div>
                )}

                {/* FAQ Section */}
                <section className="mt-8 max-w-3xl mx-auto pb-8">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white text-center mb-8">Frequently Asked Questions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {[
                            { q: "Can I change my plan anytime?", a: "Yes, you can purchase additional packs as needed without recurring fees." },
                            { q: "Do these credits expire?", a: "No, credits purchased remain in your account until used." },
                            { q: "What happens if I run out?", a: "It will not be sudden pause. You can continue but credit will be got negative. You need to topup to continue." }
                        ].map((faq, i) => (
                            <div key={i} className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm">
                                <h4 className="font-bold text-gray-800 dark:text-slate-200 mb-1 text-xs">{faq.q}</h4>
                                <p className="text-gray-500 dark:text-slate-400 text-[10px] leading-relaxed">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
}