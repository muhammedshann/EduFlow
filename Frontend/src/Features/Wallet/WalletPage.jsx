// // Full pure React + Tailwind + Lucide version (no shadcn, no TypeScript)
import React, { useEffect, useState } from 'react';
import {
    ArrowLeft,
    Wallet,
    Plus,
    ArrowUpRight,
    ArrowDownLeft,
    CreditCard,
    DollarSign,
    TrendingUp,
    Filter,
    MoveUpRight,
    Loader2
} from "lucide-react"; // Note: Removed unused Calendar
import { useDispatch, useSelector } from 'react-redux';
import { fetchWallet, WalletDeposit, WalletWithdraw } from '../../Redux/WalletSlice';
import { Link } from "react-router-dom";
import Sidebar from '../../Components/SideBar';

export default function WalletPage() {

    // controls popup panel (null | "add" | "withdraw")
    const [activeAction, setActiveAction] = useState(null);

    const [addAmount, setAddAmount] = useState("");
    const [loading, setLoading] = useState(false);

    // Placeholder data from Redux, assuming it has a structure like:
    // { balance: 1250.50, history: [{ id: 1, transaction_type: "credit", purpose: "Deposit", amount: "500.00", created_at: "2025-11-20T10:00:00Z", status: "Completed" }] }
    const { balance, history } = useSelector(state => state.wallet);
    const [spendAmount, setSpendAmount] = useState(0);

    const dispatch = useDispatch();

    const pendingAmount = 0.0; // Kept this for the card, though it's hardcoded

    const formatCurrency = (value) => {
        // Ensure value is treated as a number
        const numValue = Number(value) || 0;
        return numValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    };

    const handleAddFunds = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (activeAction == 'add'){
                const result = await dispatch(WalletDeposit(addAmount)).unwrap();
                await dispatch(fetchWallet())
            } else {
                const result = await dispatch(WalletWithdraw(addAmount)).unwrap();
                await dispatch(fetchWallet())
            }            
            setLoading(false);
        } catch(err) {
            console.log(err);
            setLoading(false);
        }
    };

    useEffect(() => {
        dispatch(fetchWallet());
    }, [dispatch]);

    useEffect(() => {
        if (history && history.length > 0) {
            const spent = history
                .filter(tx => tx.transaction_type === "debit")
                .reduce((sum, tx) => sum + Number(tx.amount), 0);

            setSpendAmount(spent);
        }
    }, [history]);

    // Use a fixed array for summary cards for a cleaner layout implementation
    const summaryCards = [
        {
            title: "Available Balance",
            value: formatCurrency(balance),
            icon: Wallet,
            color: "text-purple-700",
            description: "Ready to use"
        },
        {
            title: "Pending",
            value: formatCurrency(pendingAmount),
            icon: CreditCard, // Using CreditCard instead of Calendar for a more finance-related icon
            color: "text-gray-900",
            description: "Processing transactions"
        },
        {
            title: "Total Spent",
            value: formatCurrency(spendAmount),
            icon: TrendingUp,
            color: "text-gray-900",
            description: "From wallet transactions"
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Minimal Header */}
            <header className="text-center max-w-2xl mx-auto space-y-2">
                <h1 className="text-4xl font-extrabold text-transparent bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text">
                    Wallet
                </h1>
                <p className="text-gray-500 font-medium">
                    Manage your account balance
                </p>
            </header>

            <div className="container mx-auto px-4 py-8 space-y-8">
                <Sidebar />
                {/* Main Content Grid: Summary Cards & Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Summary Cards */}
                    {summaryCards.map((card, index) => (
                        <div key={index} className="bg-white p-6 rounded-xl shadow-md border border-gray-100 flex flex-col justify-between h-36">
                            <div className="flex justify-between items-start">
                                <span className="text-sm font-medium text-gray-600">{card.title}</span>
                                <card.icon className="w-5 h-5 text-gray-400" />
                            </div>
                            <div>
                                <div className={`text-4xl font-extrabold ${card.color}`}>{card.value}</div>
                                <div className="text-xs text-gray-500 mt-1">{card.description}</div>
                            </div>
                        </div>
                    ))}

                    {/* Quick Actions (Positioned where the 3rd card was, if desired, but moving it down for better flow) */}
                    {/* Removed from here to keep the 3-card structure and place actions below as originally intended */}
                </div>


                {/* Transaction/Action Grid: Popup & History */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* LEFT PANEL — Add/Withdraw Funds Popup */}
                    {activeAction && (
                        <div className="lg:col-span-1 h-fit sticky top-4">
                            <div className="bg-white shadow-xl rounded-xl p-6 border border-gray-100">
                                <h2 className="font-bold text-2xl mb-1">
                                    {activeAction === "add" ? "Add Funds" : "Withdraw Funds"}
                                </h2>
                                <p className="text-sm text-gray-500 mb-6">
                                    {activeAction === "add" ? "Top up your wallet securely" : "Withdraw to your linked account"}
                                </p>

                                <form onSubmit={handleAddFunds} className="space-y-6">

                                    <div>
                                        <label htmlFor="amount" className="text-sm font-medium text-gray-700">Amount</label>
                                        <div className="relative mt-1">
                                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                            <input
                                                id="amount"
                                                type="number"
                                                value={addAmount}
                                                min="10"
                                                max="1000"
                                                required
                                                onChange={(e) => setAddAmount(e.target.value)}
                                                className="w-full border border-gray-300 rounded-lg pl-10 p-2.5 focus:ring-purple-500 focus:border-purple-500"
                                                placeholder='Minimum $10'
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">Min $10, Max $1000 per transaction.</p>
                                    </div>

                                    <div className="flex gap-3 pt-2">
                                        <button
                                            type="submit"
                                            disabled={loading || !addAmount || Number(addAmount) < 10}
                                            className="flex-1 flex items-center justify-center bg-purple-600 text-white py-2.5 rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:bg-gray-400"
                                        >
                                            {loading ? (
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                            ) : activeAction === "add" ? "Add Funds" : "Withdraw"}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setActiveAction(null);
                                                setAddAmount("");
                                            }}
                                            className="border border-gray-300 rounded-lg px-4 py-2.5 text-gray-700 hover:bg-gray-100 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>

                                </form>
                            </div>
                        </div>
                    )}

                    {/* RIGHT SIDE — Transaction History */}
                    <div className={activeAction ? "lg:col-span-2" : "lg:col-span-3"}>
                        <div className="bg-white shadow-xl rounded-xl p-6 border border-gray-100">

                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-xl font-bold">Transaction History</h3>
                                    <p className="text-sm text-gray-500">Your recent wallet activity and status updates.</p>
                                </div>
                                <button className="flex items-center px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-100 transition-colors">
                                    <Filter className="w-4 h-4 mr-2" /> Filter
                                </button>
                            </div>

                            <div className="space-y-4 divide-y divide-gray-100">
                                {history && history.length > 0 ? history.map((tx) => {
                                    const isIncoming = tx.transaction_type === "credit";
                                    const IconComponent = isIncoming ? ArrowDownLeft : ArrowUpRight;
                                    const iconBg = isIncoming ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600';
                                    const amountColor = isIncoming ? 'text-green-600' : 'text-red-600';
                                    const sign = isIncoming ? "+" : "-";

                                    return (
                                        <div key={tx.id} className="flex items-center justify-between pt-4 first:pt-0">
                                            <div className="flex items-start gap-4">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${iconBg}`}>
                                                    <IconComponent className="w-5 h-5" />
                                                </div>

                                                <div>
                                                    <h3 className="font-semibold text-gray-900">{tx.purpose}</h3>
                                                    <p className="text-xs text-gray-500 mt-0.5">
                                                        {new Date(tx.created_at).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="text-right flex-shrink-0">
                                                <div className={`font-extrabold ${amountColor}`}>
                                                    {sign}{formatCurrency(Number(tx.amount))}
                                                </div>

                                                <span className="px-2 py-0.5 mt-1 rounded text-[10px] font-medium bg-purple-100 text-purple-700 inline-block">
                                                    {tx.status}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                }) : (
                                    <div className="text-center py-10 text-gray-500">
                                        <p>No transaction history found.</p>
                                    </div>
                                )}
                            </div>

                            {history && history.length > 0 && (
                                <div className="mt-6 text-center">
                                    <button className="border border-gray-300 rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors">
                                        Load More Transactions
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                </div>

                {/* Quick Actions - Correctly aligned two buttons */}
                <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
                        <p className="text-sm text-gray-500">Common wallet operations: easily add or withdraw funds.</p>
                    </div>

                    {/* Aligns buttons perfectly in a row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button
                            onClick={() => setActiveAction('add')}
                            className="flex items-center p-4 rounded-lg border border-gray-100 bg-gray-50/50 hover:bg-purple-50 hover:border-purple-200 hover:shadow transition-all group active:scale-[0.99]"
                        >
                            <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mr-4 group-hover:scale-105 transition-transform">
                                <Plus className="w-5 h-5" />
                            </div>
                            <div className='text-left'>
                                <span className="font-semibold text-gray-900 block">Add Funds</span>
                                <span className="text-xs text-gray-500">Top up your balance instantly</span>
                            </div>
                        </button>

                        <button
                            onClick={() => setActiveAction('withdraw')}
                            className="flex items-center p-4 rounded-lg border border-gray-100 bg-gray-50/50 hover:bg-purple-50 hover:border-purple-200 hover:shadow transition-all group active:scale-[0.99]"
                        >
                            <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mr-4 group-hover:scale-105 transition-transform">
                                <MoveUpRight className="w-5 h-5" />
                            </div>
                            <div className='text-left'>
                                <span className="font-semibold text-gray-900 block">Withdraw</span>
                                <span className="text-xs text-gray-500">Transfer funds to your bank</span>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}