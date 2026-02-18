import React, { useEffect, useState, useMemo } from 'react';
import {
    Wallet,
    Plus,
    ArrowUpRight,
    ArrowDownLeft,
    CreditCard,
    TrendingUp,
    Filter,
    Loader2,
    ChevronDown,
    X,
    Sparkles
} from "lucide-react";
import { useDispatch, useSelector } from 'react-redux';
import { fetchWallet } from '../../Redux/WalletSlice';
import api from '../../api/axios';
import confetti from 'canvas-confetti';

const loadRazorpayScript = () => {
    return new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

export default function WalletPage() {
    const [showAddMoney, setShowAddMoney] = useState(false);
    const [addAmount, setAddAmount] = useState("");
    const [loading, setLoading] = useState(false);
    const [spendAmount, setSpendAmount] = useState(0);
    
    // Filter State
    const [filterType, setFilterType] = useState("all"); 
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const dispatch = useDispatch();
    const { balance, history } = useSelector(state => state.wallet);
    const user = useSelector(state => state.auth.user);

    // Cinematic Constants
    const GRADIENT_BG = "bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/20";
    const GLASS_CARD = "bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-slate-800 shadow-xl";
    const INPUT_BG = "bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-700";

    // Filter Logic
    const filteredHistory = useMemo(() => {
        if (!history) return [];
        if (filterType === "all") return history;
        return history.filter(tx => tx.transaction_type === filterType);
    }, [history, filterType]);

    const triggerFireworks = () => {
        const duration = 4 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };
        const randomInRange = (min, max) => Math.random() * (max - min) + min;

        const interval = setInterval(function () {
            const timeLeft = animationEnd - Date.now();
            if (timeLeft <= 0) return clearInterval(interval);
            const particleCount = 50 * (timeLeft / duration);
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);
    };

    const formatCurrency = (value) => {
        const numValue = Number(value) || 0;
        return numValue.toLocaleString('en-IN', { style: 'currency', currency: 'INR' });
    };

    const handleAddFunds = async (e) => {
        e.preventDefault();
        setLoading(true);

        const isLoaded = await loadRazorpayScript();
        if (!isLoaded) {
            alert("Razorpay SDK failed to load.");
            setLoading(false);
            return;
        }

        try {
            const response = await api.post('accounts/wallet/create-order/', { amount: addAmount });
            const order = response.data;

            const options = {
                key: order.key_id,
                amount: order.amount,
                currency: order.currency,
                name: "AI Platform",
                description: `Adding ₹${addAmount} to wallet`,
                order_id: order.order_id,
                handler: async (paymentResponse) => {
                    setLoading(true);
                    try {
                        await api.post('accounts/wallet/verify-payment/', {
                            razorpay_order_id: paymentResponse.razorpay_order_id,
                            razorpay_payment_id: paymentResponse.razorpay_payment_id,
                            razorpay_signature: paymentResponse.razorpay_signature,
                        });
                        
                        dispatch(fetchWallet());
                        triggerFireworks();
                        setShowAddMoney(false);
                        setAddAmount("");
                    } catch (err) {
                        alert("Payment verification failed.");
                    }
                    setLoading(false);
                },
                prefill: { email: user?.email || "", contact: "" },
                theme: { color: "#7c3aed" },
                modal: { ondismiss: () => setLoading(false) }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (err) {
            alert(err.response?.data?.error || "Failed to initiate payment");
            setLoading(false);
        }
    };

    useEffect(() => {
        dispatch(fetchWallet());
    }, [dispatch]);

    useEffect(() => {
        if (history?.length > 0) {
            const spent = history
                .filter(tx => tx.transaction_type === "debit")
                .reduce((sum, tx) => sum + Number(tx.amount), 0);
            setSpendAmount(spent);
        }
    }, [history]);

    const summaryCards = [
        { title: "Available Balance", value: formatCurrency(balance), icon: Wallet, color: "text-purple-600 dark:text-purple-400", bgIcon: "bg-purple-100 dark:bg-purple-900/20", description: "Ready to use" },
        { title: "Pending", value: formatCurrency(0), icon: CreditCard, color: "text-slate-800 dark:text-white", bgIcon: "bg-slate-100 dark:bg-slate-800", description: "In process" },
        { title: "Total Spent", value: formatCurrency(spendAmount), icon: TrendingUp, color: "text-slate-800 dark:text-white", bgIcon: "bg-slate-100 dark:bg-slate-800", description: "From transactions" },
    ];

    return (
        // FIXED: Cinematic Background
        <div className={`min-h-screen ${GRADIENT_BG} flex transition-colors duration-300 pb-32`}>
            <div className="flex-1">
                <header className="text-center py-10">
                    <h1 className="text-4xl font-black text-slate-800 dark:text-white tracking-tighter flex items-center justify-center gap-2">
                        Wallet <Sparkles className="text-purple-500 w-6 h-6" />
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Manage your account balance & transactions</p>
                </header>

                <div className="container mx-auto px-6 space-y-8">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {summaryCards.map((card, index) => (
                            <div key={index} className={`${GLASS_CARD} p-6 rounded-[2rem] flex flex-col justify-between h-40 transition-all duration-300 hover:scale-[1.02]`}>
                                <div className="flex justify-between items-start">
                                    <span className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{card.title}</span>
                                    <div className={`p-2 rounded-xl ${card.bgIcon}`}>
                                        <card.icon className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                                    </div>
                                </div>
                                <div>
                                    <div className={`text-3xl font-black ${card.color}`}>{card.value}</div>
                                    <div className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-1">{card.description}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Add Funds Panel */}
                        {showAddMoney && (
                            <div className="lg:col-span-1 h-fit sticky top-4">
                                <div className={`${GLASS_CARD} rounded-[2.5rem] p-8 animate-in fade-in slide-in-from-left-4 transition-colors duration-300`}>
                                    <div className="flex justify-between items-center mb-1">
                                        <h2 className="font-black text-2xl text-slate-800 dark:text-white tracking-tight">Add Funds</h2>
                                        <button onClick={() => setShowAddMoney(false)} className="text-slate-400 hover:text-rose-500 transition-colors">
                                            <X size={20} />
                                        </button>
                                    </div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 font-medium">Add money via Razorpay securely</p>
                                    <form onSubmit={handleAddFunds} className="space-y-6">
                                        <div>
                                            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 block">Amount (INR)</label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                                                <input
                                                    type="number"
                                                    value={addAmount}
                                                    min="10"
                                                    required
                                                    onChange={(e) => setAddAmount(e.target.value)}
                                                    className={`w-full ${INPUT_BG} rounded-xl pl-8 p-3.5 focus:ring-2 focus:ring-purple-500 outline-none text-slate-900 dark:text-white font-bold transition-all`}
                                                    placeholder='100'
                                                />
                                            </div>
                                        </div>
                                        <div className="flex gap-3 pt-2">
                                            <button 
                                                type="button" 
                                                onClick={() => { setShowAddMoney(false); setAddAmount(""); }} 
                                                className="px-6 py-3 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-bold text-xs uppercase tracking-wider hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={loading || !addAmount || Number(addAmount) < 10}
                                                className="flex-1 flex items-center justify-center bg-purple-600 text-white py-3 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-purple-700 transition-colors shadow-lg shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Pay Now"}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}

                        {/* Transaction History Section */}
                        <div className={showAddMoney ? "lg:col-span-2" : "lg:col-span-3"}>
                            <div className={`${GLASS_CARD} rounded-[2.5rem] p-8 transition-colors duration-300`}>
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Transaction History</h3>
                                    
                                    {/* --- FILTER DROPDOWN --- */}
                                    <div className="relative">
                                        <button 
                                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                                            className={`flex items-center px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white/50 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-xs font-bold uppercase tracking-wider`}
                                        >
                                            <Filter className="w-4 h-4 mr-2 text-purple-600 dark:text-purple-400" />
                                            <span className="capitalize">{filterType}</span>
                                            <ChevronDown className={`ml-2 w-4 h-4 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
                                        </button>

                                        {isFilterOpen && (
                                            <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95">
                                                {['all', 'credit', 'debit'].map((type) => (
                                                    <button
                                                        key={type}
                                                        onClick={() => {
                                                            setFilterType(type);
                                                            setIsFilterOpen(false);
                                                        }}
                                                        className={`w-full text-left px-4 py-3 text-sm hover:bg-purple-50 dark:hover:bg-slate-700 transition-colors capitalize ${
                                                            filterType === type 
                                                            ? 'text-purple-600 dark:text-purple-400 font-bold bg-purple-50 dark:bg-purple-900/20' 
                                                            : 'text-slate-600 dark:text-slate-300'
                                                        }`}
                                                    >
                                                        {type}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2 divide-y divide-slate-100 dark:divide-slate-800">
                                    {filteredHistory?.length > 0 ? filteredHistory.map((tx) => (
                                        <div key={tx.id} className="flex items-center justify-between py-4 first:pt-0 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 rounded-xl px-2 transition-colors">
                                            <div className="flex items-start gap-4">
                                                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 
                                                    ${tx.transaction_type === 'credit' 
                                                        ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                                                        : 'bg-rose-100 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400'}`}>
                                                    {tx.transaction_type === 'credit' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-slate-900 dark:text-slate-100 capitalize text-sm">{tx.purpose}</h3>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{new Date(tx.created_at).toLocaleString()}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className={`font-black text-lg ${tx.transaction_type === 'credit' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                                    {tx.transaction_type === 'credit' ? '+' : '-'}{formatCurrency(tx.amount)}
                                                </div>
                                                <span className={`px-2 py-0.5 mt-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                                                    tx.status === 'success' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' : 'bg-slate-100 text-slate-600'
                                                }`}>{tx.status}</span>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="text-center py-20 text-slate-400 dark:text-slate-500 font-medium">
                                            No {filterType !== 'all' ? filterType : ''} transactions found.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Action Button */}
                    <div className={`${GLASS_CARD} rounded-[2.5rem] p-8 text-center transition-colors duration-300`}>
                        <button 
                            onClick={() => setShowAddMoney(true)} 
                            className="inline-flex items-center justify-center p-5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 hover:bg-purple-50 dark:hover:bg-purple-900/10 hover:border-purple-200 dark:hover:border-purple-500/30 transition-all group w-full max-w-md shadow-sm"
                        >
                            <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center mr-4 transition-transform group-hover:scale-110">
                                <Plus size={24} />
                            </div>
                            <div className='text-left'>
                                <span className="font-bold block text-slate-900 dark:text-slate-200 text-lg">Add Funds</span>
                                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide">Secure top-up with Razorpay</span>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}