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
    X
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
    const [filterType, setFilterType] = useState("all"); // 'all', 'credit', 'debit'
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const dispatch = useDispatch();
    const { balance, history } = useSelector(state => state.wallet);
    const user = useSelector(state => state.auth.user);

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
        { title: "Available Balance", value: formatCurrency(balance), icon: Wallet, color: "text-purple-700 dark:text-purple-400", description: "Ready to use" },
        { title: "Pending", value: formatCurrency(0), icon: CreditCard, color: "text-gray-900 dark:text-white", description: "In process" },
        { title: "Total Spent", value: formatCurrency(spendAmount), icon: TrendingUp, color: "text-gray-900 dark:text-white", description: "From transactions" },
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex transition-colors duration-300">
            <div className="flex-1">
                <header className="text-center py-8">
                    <h1 className="text-4xl font-extrabold text-transparent bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text">Wallet</h1>
                    <p className="text-gray-500 dark:text-slate-400 font-medium">Manage your account balance</p>
                </header>

                <div className="container mx-auto px-4 space-y-8 pb-10">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {summaryCards.map((card, index) => (
                            <div key={index} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-gray-100 dark:border-slate-700 flex flex-col justify-between h-36 transition-colors duration-300">
                                <div className="flex justify-between items-start">
                                    <span className="text-sm font-medium text-gray-600 dark:text-slate-400">{card.title}</span>
                                    <card.icon className="w-5 h-5 text-gray-400 dark:text-slate-500" />
                                </div>
                                <div>
                                    <div className={`text-3xl font-extrabold ${card.color}`}>{card.value}</div>
                                    <div className="text-xs text-gray-500 dark:text-slate-500 mt-1">{card.description}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Add Funds Panel */}
                        {showAddMoney && (
                            <div className="lg:col-span-1 h-fit sticky top-4">
                                <div className="bg-white dark:bg-slate-800 shadow-xl rounded-xl p-6 border border-gray-100 dark:border-slate-700 animate-in fade-in slide-in-from-left-4 transition-colors duration-300">
                                    <div className="flex justify-between items-center mb-1">
                                        <h2 className="font-bold text-2xl text-gray-900 dark:text-white">Add Funds</h2>
                                        <button onClick={() => setShowAddMoney(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-200">
                                            <X size={20} />
                                        </button>
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">Add money via Razorpay securely</p>
                                    <form onSubmit={handleAddFunds} className="space-y-6">
                                        <div>
                                            <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Amount (INR)</label>
                                            <div className="relative mt-1">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                                                <input
                                                    type="number"
                                                    value={addAmount}
                                                    min="10"
                                                    required
                                                    onChange={(e) => setAddAmount(e.target.value)}
                                                    className="w-full border border-gray-300 dark:border-slate-600 rounded-lg pl-8 p-2.5 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-slate-900 text-gray-900 dark:text-white"
                                                    placeholder='100'
                                                />
                                            </div>
                                        </div>
                                        <div className="flex gap-3 pt-2">
                                            <button
                                                type="submit"
                                                disabled={loading || !addAmount || Number(addAmount) < 10}
                                                className="flex-1 flex items-center justify-center bg-purple-600 text-white py-2.5 rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:bg-gray-400 dark:disabled:bg-slate-600"
                                            >
                                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Pay Now"}
                                            </button>
                                            <button 
                                                type="button" 
                                                onClick={() => { setShowAddMoney(false); setAddAmount(""); }} 
                                                className="border border-gray-300 dark:border-slate-600 rounded-lg px-4 py-2.5 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}

                        {/* Transaction History Section */}
                        <div className={showAddMoney ? "lg:col-span-2" : "lg:col-span-3"}>
                            <div className="bg-white dark:bg-slate-800 shadow-xl rounded-xl p-6 border border-gray-100 dark:border-slate-700 transition-colors duration-300">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Transaction History</h3>
                                    
                                    {/* --- FILTER DROPDOWN --- */}
                                    <div className="relative">
                                        <button 
                                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                                            className="flex items-center px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors text-sm font-medium"
                                        >
                                            <Filter className="w-4 h-4 mr-2 text-purple-600 dark:text-purple-400" />
                                            <span className="capitalize">{filterType}</span>
                                            <ChevronDown className={`ml-2 w-4 h-4 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
                                        </button>

                                        {isFilterOpen && (
                                            <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-600 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95">
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
                                                            : 'text-gray-600 dark:text-slate-300'
                                                        }`}
                                                    >
                                                        {type}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-4 divide-y divide-gray-100 dark:divide-slate-700">
                                    {filteredHistory?.length > 0 ? filteredHistory.map((tx) => (
                                        <div key={tx.id} className="flex items-center justify-between pt-4 first:pt-0">
                                            <div className="flex items-start gap-4">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 
                                                    ${tx.transaction_type === 'credit' 
                                                        ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' 
                                                        : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'}`}>
                                                    {tx.transaction_type === 'credit' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-gray-900 dark:text-slate-100 capitalize">{tx.purpose}</h3>
                                                    <p className="text-xs text-gray-500 dark:text-slate-400">{new Date(tx.created_at).toLocaleString()}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className={`font-extrabold ${tx.transaction_type === 'credit' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                                    {tx.transaction_type === 'credit' ? '+' : '-'}{formatCurrency(tx.amount)}
                                                </div>
                                                <span className="px-2 py-0.5 mt-1 rounded text-[10px] font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 inline-block uppercase">{tx.status}</span>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="text-center py-20 text-gray-400 dark:text-slate-500">
                                            No {filterType !== 'all' ? filterType : ''} transactions found.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Action Button */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-gray-100 dark:border-slate-700 p-6 text-center transition-colors duration-300">
                        <button 
                            onClick={() => setShowAddMoney(true)} 
                            className="inline-flex items-center justify-center p-4 rounded-lg border border-gray-100 dark:border-slate-600 bg-gray-50/50 dark:bg-slate-700/50 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:border-purple-200 dark:hover:border-purple-500/30 transition-all group w-full max-w-md"
                        >
                            <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center mr-4">
                                <Plus size={20} />
                            </div>
                            <div className='text-left'>
                                <span className="font-semibold block text-gray-900 dark:text-slate-200">Add Funds</span>
                                <span className="text-xs text-gray-500 dark:text-slate-400">Secure top-up with Razorpay</span>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}