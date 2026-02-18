import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Zap } from 'lucide-react';
import { AdminFetchPricing } from '../../Redux/AdminRedux/AdminSubscriptionSlice';
import { useNavigate } from 'react-router-dom';
import Pricing from '../../Components/Pricing';

export default function SubscriptionPlans() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [viewMode, setViewMode] = useState('bundles');
    const [CreditRate, setCreditRate] = useState(0);
    const [customAmount, setCustomAmount] = useState('');

    // Cinematic Constants
    const SOFT_BG = "bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/20";
    const GLASS_CARD = "bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-slate-800 shadow-xl";
    const INPUT_BG = "bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-700";

    useEffect(() => {
        const loadData = async () => {
            try {
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
        if (amount <= 0) return alert("Please enter a valid credit amount");

        const selectedPackage = {
            name: "Custom Credit Pack",
            credits: amount,
            price: (amount * CreditRate).toFixed(2),
            isCustom: true 
        };

        navigate('/checkout', { state: { bundle: selectedPackage } });
    };

    return (
        <div className={`w-full min-h-screen ${SOFT_BG} px-4 transition-colors duration-300 pb-32`}>
            {/* Header Section with Toggles */}
            <header className="text-center mb-8 pt-8">
                <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-2 tracking-tight">Choose Your Credit Pack</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Buy credits once — use them anytime.</p>

                <div className="mt-8 inline-flex p-1.5 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md rounded-2xl border border-white/20 dark:border-slate-800 shadow-sm">
                    <button
                        onClick={() => setViewMode('bundles')}
                        className={`px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                            viewMode === 'bundles' 
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                            : 'text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400'
                        }`}
                    >
                        Bundles
                    </button>
                    <button
                        onClick={() => setViewMode('custom')}
                        className={`px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                            viewMode === 'custom' 
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                            : 'text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400'
                        }`}
                    >
                        Custom Amount
                    </button>
                </div>
            </header>

            <main>
                {viewMode === 'bundles' ? (
                    <div> 
                        <Pricing />
                    </div>
                ) : (
                    /* --- Custom Credit View (Glassmorphism Applied) --- */
                    <div className={`max-w-lg mx-auto ${GLASS_CARD} p-10 rounded-[2.5rem] text-center animate-in fade-in zoom-in duration-300 mt-4 mb-20`}>
                        <div className="w-16 h-16 bg-purple-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-6">
                            <Zap size={32} className="text-purple-600 dark:text-purple-400" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-1 tracking-tight">Buy Exact Credits</h3>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-8">Rate: <span className="text-purple-600 dark:text-purple-400">₹{CreditRate} / credit</span></p>

                        <div className="space-y-6">
                            <div className="relative">
                                <label className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-black text-[10px] uppercase tracking-widest">
                                    Amount
                                </label>
                                <input
                                    type="number"
                                    value={customAmount}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setCustomAmount(val === "" ? "" : Math.max(0, parseInt(val)));
                                    }}
                                    className={`w-full pl-24 pr-6 py-5 ${INPUT_BG} rounded-2xl text-xl font-black text-slate-800 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all`}
                                    placeholder="0"
                                />
                            </div>

                            <div className={`p-6 bg-purple-50/50 dark:bg-purple-900/10 rounded-2xl border border-purple-100 dark:border-purple-500/20 flex justify-between items-center`}>
                                <span className="text-slate-500 dark:text-slate-300 text-xs font-bold uppercase tracking-wide">Estimated Cost</span>
                                <span className="text-3xl font-black text-purple-600 dark:text-purple-400">₹{((customAmount || 0) * CreditRate).toFixed(2)}</span>
                            </div>

                            <button onClick={HandleCustomSubmit} className="w-full py-4 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-indigo-500/20 hover:bg-indigo-700 active:scale-95 transition-all">
                                Purchase Credits
                            </button>
                        </div>
                    </div>
                )}

                {/* FAQ Section (Glassmorphism Applied) */}
                <section className="mt-12 max-w-4xl mx-auto">
                    <div className="flex items-center gap-3 justify-center mb-8">
                        <div className="h-px w-12 bg-slate-200 dark:bg-slate-800"></div>
                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Common Questions</h3>
                        <div className="h-px w-12 bg-slate-200 dark:bg-slate-800"></div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            { q: "Can I change my plan?", a: "Yes, purchase additional packs anytime without recurring fees." },
                            { q: "Do credits expire?", a: "No, purchased credits remain in your account forever until used." },
                            { q: "Running out of credits?", a: "We won't stop you mid-task. Your balance goes negative until you top up." }
                        ].map((faq, i) => (
                            <div key={i} className={`${GLASS_CARD} p-6 rounded-3xl hover:shadow-2xl transition-all duration-300`}>
                                <h4 className="font-bold text-slate-800 dark:text-white mb-2 text-sm">{faq.q}</h4>
                                <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed font-medium">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
}