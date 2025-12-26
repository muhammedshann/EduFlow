// import React, { useEffect, useState } from 'react';
// import {
//     ArrowLeft,
//     Wallet,
//     Calendar,
//     TrendingUp,
//     Filter,
//     ArrowDownLeft,
//     ArrowUpRight,
//     Plus,
//     MoveUpRight,
//     RefreshCw,
//     CreditCard,
//     Landmark,
//     Loader2 // Icon for loading state
// } from 'lucide-react';
// import Sidebar from '../Components/SideBar';
// import { useDispatch, useSelector } from 'react-redux';
// import { fetchWallet } from '../Redux/WalletSlice';

// // Hardcoded initial transaction list
// const initialTransactions = [
//     { id: 5, type: 'incoming', title: 'Refund - Cancelled subscription', date: 'Jan 8, 2024, 05:00 PM', method: 'Wallet Credit', amount: 25.00, status: 'Completed' },
//     { id: 4, type: 'outgoing', title: 'Additional transcription hours', date: 'Jan 10, 2024, 10:15 PM', method: 'Wallet Balance', amount: -15.00, status: 'Completed' },
//     { id: 3, type: 'incoming', title: 'Wallet top-up via Bank Transfer', date: 'Jan 12, 2024, 07:50 PM', method: 'Bank Transfer', amount: 100.00, status: 'Completed' },
//     { id: 2, type: 'outgoing', title: 'Pro Plan Subscription', date: 'Jan 14, 2024, 02:45 PM', method: 'Wallet Balance', amount: -24.99, status: 'Completed' },
//     { id: 1, type: 'incoming', title: 'Wallet top-up via Credit Card', date: 'Jan 15, 2024, 04:00 PM', method: 'Credit Card ****1234', amount: 50.00, status: 'Completed' },
// ];

// const WalletPage = () => {
//     // --- STATE ---
//     const [totalSpent] = useState(0.99)
//     const { balance, history } = useSelector(state => state.wallet);
//     const [transactions, setTransactions] = useState(initialTransactions);
//     const [depositAmount, setDepositAmount] = useState('');
//     const [spendAmount, setSpendAmount] = useState(0);
//     const [paymentMethod, setPaymentMethod] = useState('card');
//     const [isLoading, setIsLoading] = useState(false);
//     const [alert, setAlert] = useState({ show: false, message: '', type: '' });
//     const dispatch = useDispatch();


//     // NEW INTERACTIVE STATE
//     const [showFilterDropdown, setShowFilterDropdown] = useState(false);
//     const [modalContent, setModalContent] = useState(null); // Used for Quick Actions

//     const calculateSpent = () => {
//         return history
//             .filter(tx => tx.transaction_type === "debit")
//             .reduce((sum, tx) => sum + Number(tx.amount), 0);
//     };

//     useEffect(() => {
//         console.log("Calling fetchWallet");
//         dispatch(fetchWallet())
//     }, [])

//     useEffect(() => {
//         if (history && history.length > 0) {
//             const spent = history
//                 .filter(tx => tx.transaction_type === "debit")
//                 .reduce((sum, tx) => sum + Number(tx.amount), 0);

//             setSpendAmount(spent);
//         }
//     }, [history]);

//     // --- HELPERS ---
//     const formatCurrency = (value) => {
//         return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
//     };
//     const getCurrentFormattedDate = () => {
//         return new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false });
//     };
//     const showAlert = (message, type) => {
//         setAlert({ show: true, message, type });
//         setTimeout(() => setAlert({ show: false, message: '', type: '' }), 4000);
//     };

//     // --- DEPOSIT HANDLER (Core Logic) ---
//     const handleDeposit = () => {
//         const amountFloat = parseFloat(depositAmount);
//         const isDepositValid = amountFloat >= 10 && amountFloat <= 1000;

//         if (!isDepositValid) {
//             showAlert('Deposit must be between $10.00 and $1,000.00.', 'error');
//             return;
//         }

//         setIsLoading(true);

//         setTimeout(() => {
//             const newBalance = balance + amountFloat;

//             const newTx = {
//                 id: Date.now(),
//                 type: 'incoming',
//                 title: `Wallet top-up via ${paymentMethod === 'card' ? 'Credit Card' : 'Bank Transfer'}`,
//                 date: getCurrentFormattedDate(),
//                 method: paymentMethod === 'card' ? 'Credit Card ****XXXX' : 'Bank Transfer',
//                 amount: amountFloat,
//                 status: 'Completed'
//             };

//             setAvailableBalance(newBalance);
//             setTransactions([newTx, ...history]);
//             setDepositAmount('');

//             showAlert(`Successfully deposited ${formatCurrency(amountFloat)}!`, 'success');
//             setIsLoading(false);
//         }, 1200);
//     };

//     // Dynamic button state
//     const amountFloat = parseFloat(depositAmount);
//     const isDepositValid = !isNaN(amountFloat) && amountFloat >= 10 && amountFloat <= 1000;

//     // --- QUICK ACTIONS HANDLER ---
//     const handleQuickAction = (action) => {
//         let title = '';
//         let message = '';
//         if (action === 'add') {
//             title = 'Add Funds';
//             message = 'You are being redirected to the deposit form...';
//         } else if (action === 'withdraw') {
//             title = 'Withdraw Funds';
//             message = 'Simulating secure bank transfer process...';
//         } else if (action === 'auto') {
//             title = 'Auto-Reload Setup';
//             message = 'Launching recurring payment configuration...';
//         }
//         setModalContent({ title, message });
//     };

//     // --- MODAL COMPONENT ---
//     const Modal = ({ title, message, onClose }) => (
//         <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
//             <div className="bg-white p-6 rounded-xl shadow-2xl max-w-sm w-full text-center">
//                 <h3 className="text-xl font-bold mb-3 text-purple-700">{title}</h3>
//                 <p className="text-gray-600 mb-6">{message}</p>
//                 <button
//                     onClick={onClose}
//                     className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors"
//                 >
//                     Close
//                 </button>
//             </div>
//         </div>
//     );

//     return (
//         <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans text-gray-900">

//             {/* --- MODAL RENDER --- */}
//             {modalContent && (
//                 <Modal
//                     title={modalContent.title}
//                     message={modalContent.message}
//                     onClose={() => setModalContent(null)}
//                 />
//             )}

//             {/* --- ALERT MESSAGES --- */}
//             <div
//                 className={`fixed top-4 right-4 max-w-sm p-4 rounded-lg shadow-lg z-50 transition-all duration-500 ${alert.show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[-20px] pointer-events-none'
//                     } ${alert.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}
//             >
//                 <p className="text-sm font-medium">{alert.message}</p>
//             </div>

//             <div className="max-w-7xl mx-auto space-y-6">

//                 {/* --- HEADER --- */}
//                 <div className="mb-8 flex items-center gap-4">
//                     {/* <Sidebar /> */}
//                     <h1 className="text-2xl font-bold text-gray-900">My Wallet</h1>
//                 </div>

//                 {/* --- TOP STATS CARDS (Dynamic) --- */}
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                     <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col justify-between h-32">
//                         <div className="flex justify-between items-start">
//                             <span className="text-sm font-medium text-gray-600">Available Balance</span>
//                             <Wallet className="w-5 h-5 text-gray-400" />
//                         </div>
//                         <div>
//                             <div className="text-3xl font-bold text-purple-700">{formatCurrency(balance)}</div>
//                             <div className="text-xs text-gray-500 mt-1">Ready to use</div>
//                         </div>
//                     </div>
//                     {/* Remaining cards omitted for brevity, they remain static */}
//                     <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col justify-between h-32">
//                         <div className="flex justify-between items-start">
//                             <span className="text-sm font-medium text-gray-600">Pending</span>
//                             <Calendar className="w-5 h-5 text-gray-400" />
//                         </div>
//                         <div>
//                             <div className="text-3xl font-bold text-gray-900">$0.00</div>
//                             <div className="text-xs text-gray-500 mt-1">Processing transactions</div>
//                         </div>
//                     </div>
//                     <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col justify-between h-32">
//                         <div className="flex justify-between items-start">
//                             <span className="text-sm font-medium text-gray-600">Total Spent</span>
//                             <TrendingUp className="w-5 h-5 text-gray-400" />
//                         </div>
//                         <div>
//                             <div className="text-3xl font-bold text-gray-900">{formatCurrency(spendAmount)}</div>
//                             <div className="text-xs text-gray-500 mt-1">This month</div>
//                         </div>
//                     </div>
//                 </div>

//                 {/* --- MIDDLE SECTION --- */}
//                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

//                     {/* LEFT COLUMN: ADD FUNDS FORM (Enhanced Interaction) */}
//                     <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 h-fit">
//                         <h2 className="text-lg font-bold text-gray-900">Add Funds</h2>
//                         <p className="text-sm text-gray-500 mb-6">Top up your wallet balance</p>

//                         <div className="space-y-4">
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
//                                 <div className="relative">
//                                     <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
//                                     <input
//                                         type="number"
//                                         placeholder="0.00"
//                                         value={depositAmount}
//                                         onChange={(e) => setDepositAmount(e.target.value)}
//                                         className="w-full pl-7 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
//                                         min="10"
//                                     />
//                                 </div>
//                                 <p className={`text-xs mt-1 ${amountFloat > 0 && amountFloat < 10 ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
//                                     Minimum $10, Maximum $1,000
//                                 </p>
//                             </div>

//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
//                                 {/* ... Radio buttons (interaction via state is already working) ... */}
//                                 <div className="space-y-2">
//                                     <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${paymentMethod === 'card' ? 'bg-purple-50 border-purple-200' : 'border-gray-200 hover:bg-gray-50'}`}>
//                                         <input
//                                             type="radio"
//                                             name="payment"
//                                             checked={paymentMethod === 'card'}
//                                             onChange={() => setPaymentMethod('card')}
//                                             className="w-4 h-4 text-purple-600 focus:ring-purple-500"
//                                         />
//                                         <CreditCard className="w-4 h-4 text-gray-600" />
//                                         <span className="text-sm font-medium text-gray-700">Credit/Debit Card</span>
//                                     </label>

//                                     <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${paymentMethod === 'bank' ? 'bg-purple-50 border-purple-200' : 'border-gray-200 hover:bg-gray-50'}`}>
//                                         <input
//                                             type="radio"
//                                             name="payment"
//                                             checked={paymentMethod === 'bank'}
//                                             onChange={() => setPaymentMethod('bank')}
//                                             className="w-4 h-4 text-purple-600 focus:ring-purple-500"
//                                         />
//                                         <Landmark className="w-4 h-4 text-gray-600" />
//                                         <span className="text-sm font-medium text-gray-700">Bank Transfer</span>
//                                     </label>
//                                 </div>
//                             </div>

//                             <div className="pt-2 grid grid-cols-3 gap-3">
//                                 <button
//                                     onClick={handleDeposit}
//                                     disabled={isLoading || !isDepositValid}
//                                     className="col-span-2 bg-purple-600 hover:bg-purple-700 active:scale-[0.98] text-white font-medium py-2.5 rounded-lg transition-all shadow-sm disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
//                                 >
//                                     {isLoading ? (
//                                         <Loader2 className="w-5 h-5 animate-spin" />
//                                     ) : (
//                                         'Add Funds'
//                                     )}
//                                 </button>
//                                 <button
//                                     onClick={() => setDepositAmount('')}
//                                     className="col-span-1 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-2.5 rounded-lg transition-colors"
//                                     disabled={isLoading}
//                                 >
//                                     Cancel
//                                 </button>
//                             </div>
//                         </div>
//                     </div>

//                     {/* RIGHT COLUMN: TRANSACTION HISTORY (Filter Interaction) */}
//                     <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col relative">
//                         <div className="p-6 border-b border-gray-100 flex justify-between items-center">
//                             <div>
//                                 <h2 className="text-lg font-bold text-gray-900">Transaction History</h2>
//                                 <p className="text-sm text-gray-500">Your recent wallet activity</p>
//                             </div>
//                             <button
//                                 onClick={() => setShowFilterDropdown(!showFilterDropdown)}
//                                 className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors active:scale-95"
//                             >
//                                 <Filter className="w-4 h-4" />
//                                 Filter
//                             </button>

//                             {/* Filter Dropdown Placeholder */}
//                             {showFilterDropdown && (
//                                 <div className="absolute right-6 top-20 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-10 p-2 animate-in fade-in slide-in-from-top-1">
//                                     <div className="text-xs p-1.5 text-gray-700 hover:bg-gray-50 rounded-md cursor-pointer">Show Deposits</div>
//                                     <div className="text-xs p-1.5 text-gray-700 hover:bg-gray-50 rounded-md cursor-pointer">Show Withdrawals</div>
//                                     <div className="text-xs p-1.5 text-gray-700 hover:bg-gray-50 rounded-md cursor-pointer">Clear Filters</div>
//                                 </div>
//                             )}
//                         </div>

//                         <div className="p-6 flex-1">
//                             <div className="space-y-6">
//                                 {history.map((tx) => {

//                                     const isIncoming = tx.transaction_type === "credit";

//                                     return (
//                                         <div key={tx.id} className="flex items-start justify-between group">

//                                             {/* ICON + DETAILS */}
//                                             <div className="flex items-start gap-4">
//                                                 <div
//                                                     className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 
//                             ${isIncoming ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}
//                                                 >
//                                                     {isIncoming ? (
//                                                         <ArrowDownLeft className="w-5 h-5" />
//                                                     ) : (
//                                                         <ArrowUpRight className="w-5 h-5" />
//                                                     )}
//                                                 </div>

//                                                 <div>
//                                                     <h3 className="font-medium text-gray-900">
//                                                         {tx.purpose.replace('-', ' ').toUpperCase()}
//                                                     </h3>

//                                                     <p className="text-sm text-gray-500 mt-0.5">
//                                                         {new Date(tx.created_at).toLocaleString()}
//                                                     </p>
//                                                 </div>
//                                             </div>

//                                             {/* AMOUNT + STATUS */}
//                                             <div className="text-right">
//                                                 <div className={`font-bold ${isIncoming ? 'text-green-600' : 'text-red-600'}`}>
//                                                     {isIncoming ? '+' : '-'}{formatCurrency(Number(tx.amount))}
//                                                 </div>

//                                                 <div className="mt-1 inline-block">
//                                                     <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-700 text-white">
//                                                         {tx.status}
//                                                     </span>
//                                                 </div>
//                                             </div>
//                                         </div>
//                                     );
//                                 })}
//                             </div>

//                             <div className="mt-8 text-center">
//                                 <button className="px-6 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
//                                     Load More Transactions
//                                 </button>
//                             </div>
//                         </div>

//                     </div>
//                 </div>

//                 {/* --- BOTTOM SECTION: QUICK ACTIONS (Modal Interaction) --- */}
// <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
//     <div className="mb-6">
//         <h2 className="text-lg font-bold text-gray-900">Quick Actions</h2>
//         <p className="text-sm text-gray-500">Common wallet operations</p>
//     </div>

//     <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
//         <button
//             onClick={() => handleQuickAction('add')}
//             className="flex flex-col items-center justify-center p-6 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-purple-50 hover:border-purple-200 hover:shadow-md transition-all group active:scale-[0.98]"
//         >
//             <div className="w-10 h-10 rounded-full bg-white text-purple-600 border border-gray-200 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
//                 <Plus className="w-5 h-5" />
//             </div>
//             <span className="font-semibold text-gray-900 mb-1">Add Funds</span>
//             <span className="text-xs text-gray-500">Top up your balance</span>
//         </button>

//         <button
//             onClick={() => handleQuickAction('withdraw')}
//             className="flex flex-col items-center justify-center p-6 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-purple-50 hover:border-purple-200 hover:shadow-md transition-all group active:scale-[0.98]"
//         >
//             <div className="w-10 h-10 rounded-full bg-white text-purple-600 border border-gray-200 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
//                 <MoveUpRight className="w-5 h-5" />
//             </div>
//             <span className="font-semibold text-gray-900 mb-1">Withdraw</span>
//             <span className="text-xs text-gray-500">Transfer to bank</span>
//         </button>

//         <button
//             onClick={() => handleQuickAction('auto')}
//             className="flex flex-col items-center justify-center p-6 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-purple-50 hover:border-purple-200 hover:shadow-md transition-all group active:scale-[0.98]"
//         >
//             <div className="w-10 h-10 rounded-full bg-white text-purple-600 border border-gray-200 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
//                 <RefreshCw className="w-5 h-5" />
//             </div>
//             <span className="font-semibold text-gray-900 mb-1">Auto-reload</span>
//             <span className="text-xs text-gray-500">Set up automatic top-ups</span>
//         </button>
//     </div>
// </div>

//             </div>
//         </div>
//     );
// };

// export default WalletPage;


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