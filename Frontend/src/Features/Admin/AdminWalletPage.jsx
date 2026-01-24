import React, { useEffect, useState } from 'react';
import { Search, ChevronDown, Clock, Eye, Hash, TrendingUp, TrendingDown, DollarSign, X, ArrowDownLeft, ArrowUpRight, Calendar, CreditCard, Activity } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { AdminFetchWallet } from '../../Redux/AdminRedux/AdminWalletSlice';
import { AdminStatCard } from './AdminUserPage';

// --- Utility Components (Card, Badge, Button, Input, Modal) ---

const TransactionModal = ({ isOpen, onClose, history, formatCurrency }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px] animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl shadow-slate-200/50 flex flex-col max-h-[85vh] overflow-hidden border border-slate-100">
        
        {/* Minimal Header */}
        <div className="px-8 pt-8 pb-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Activity</h2>
            <p className="text-[13px] text-slate-400 font-medium mt-0.5">Wallet movement and history</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-full transition-all text-slate-400 hover:text-slate-900"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* Minimal List Body */}
        <div className="flex-1 overflow-y-auto px-8 py-4 scrollbar-hide">
          {history && history.length > 0 ? (
            <div className="space-y-1">
              {history.map((tx) => {
                const isIncoming = tx.transaction_type === "credit";
                return (
                  <div 
                    key={tx.id} 
                    className="group flex items-center justify-between py-4 border-b border-slate-50 last:border-0"
                  >
                    <div className="flex items-center gap-4">
                      {/* Subdued Icon Design */}
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-colors ${
                        isIncoming ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                      }`}>
                        {isIncoming ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                      </div>
                      
                      <div className="space-y-0.5">
                        <p className="text-[15px] font-semibold text-slate-800 capitalize leading-tight">
                            {tx.purpose.replace('-', ' ')}
                        </p>
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                            <Clock size={12} className="opacity-70" />
                            {new Date(tx.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </span>
                          <span className="flex items-center gap-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                            <Hash size={12} className="opacity-70" />
                            {tx.id}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right space-y-1">
                      <p className={`text-lg font-bold tabular-nums tracking-tight ${
                        isIncoming ? 'text-emerald-600' : 'text-slate-900'
                      }`}>
                        {isIncoming ? '+' : '-'}{formatCurrency(tx.amount)}
                      </p>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-widest border ${
                        tx.status === 'success' 
                          ? 'bg-white text-emerald-500 border-emerald-100' 
                          : 'bg-white text-slate-400 border-slate-100'
                      }`}>
                        {tx.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
                <Hash size={24} className="text-slate-200" />
              </div>
              <p className="text-slate-400 text-sm font-medium tracking-wide">Empty transaction log</p>
            </div>
          )}
        </div>

        {/* Floating Style Footer */}
        <div className="p-8 bg-gradient-to-t from-white via-white to-transparent">
          <button 
            onClick={onClose}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm shadow-xl shadow-slate-200 hover:bg-slate-800 hover:shadow-none transition-all active:scale-[0.98]"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};

const Card = ({ children, className = '' }) => (
    <div className={`rounded-xl bg-white shadow-sm border border-gray-100 ${className}`}>
        {children}
    </div>
);

const Button = ({ children, className = '', icon: Icon, variant = 'default', ...props }) => {
    const baseStyle = "flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-150";
    let variantStyle = '';

    switch (variant) {
        case 'default':
            variantStyle = 'bg-purple-600 text-white hover:bg-purple-700 shadow-md';
            break;
        case 'outline':
            variantStyle = 'border border-gray-300 text-gray-700 hover:bg-gray-100';
            break;
        case 'ghost':
            variantStyle = 'text-gray-600 hover:bg-gray-100';
            break;
        case 'action':
            variantStyle = 'bg-purple-600 text-white hover:bg-purple-700';
            break;
        default:
            variantStyle = 'bg-gray-200 text-gray-700 hover:bg-gray-300';
    }

    return (
        <button className={`${baseStyle} ${variantStyle} ${className}`} {...props}>
            {Icon && <Icon className="h-4 w-4" />}
            {children}
        </button>
    );
};

const Input = ({ className = '', ...props }) => (
    <input
        className={`w-full p-2.5 border border-gray-300 rounded-lg text-sm placeholder-gray-500 focus:ring-purple-500 focus:border-purple-500 transition ${className}`}
        {...props}
    />
);

const Badge = ({ children, className = '' }) => (
    <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-xs font-medium ${className}`}>
        {children}
    </span>
);


const WalletUserCard = ({ user, onViewHistory }) => {
    const isLowBalance = user.status === 'Low Balance';
    const transactionColor = user.lastTransaction.type === 'credit' ? 'text-green-600' : 'text-red-600';
    const transactionSign = user.lastTransaction.type === 'credit' ? '+' : '–';
    

    const getInitials = (name) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    };

    const formatPurpose = (purpose) => {
        return purpose
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    return (
        <Card className="p-4 mb-3">
            <div className="grid grid-cols-12 items-center">
                <div className="col-span-12 sm:col-span-5 flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-base font-semibold ${user.profileColor}`}>
                        {getInitials(user.name)}
                    </div>
                    <div>
                        <div className="text-sm font-semibold text-gray-800">{user.name}</div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                    </div>
                </div>

                <div className="col-span-12 sm:col-span-7 flex justify-end items-center space-x-4">
                    <Badge className={isLowBalance ? "bg-red-100 text-red-800" : "bg-purple-100 text-purple-800"}>
                        {user.status}
                    </Badge>
                    <div className="text-right">
                        <div className="text-xs text-gray-500">Current Balance</div>
                        <div className="text-sm font-bold text-gray-800">${user.currentBalance.toFixed(2)}</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-3 pt-3 border-t border-gray-100 text-xs">
                <div className="col-span-2 sm:col-span-1">
                    <div className="text-gray-500 mb-0.5">Last Transaction</div>
                    <div className={`font-semibold ${transactionColor}`}>{transactionSign}${user.lastTransaction.amount.toFixed(2)}</div>
                    <div className="text-gray-400 mt-0.5">{formatPurpose(user.lastTransaction.purpose)}</div>
                </div>

                <div className="col-span-1 sm:col-span-1">
                    <div className="text-gray-500 mb-0.5">Total Spent</div>
                    <div className="font-semibold text-gray-800">${user.totalSpent.toFixed(2)}</div>
                    <div className="text-gray-400 mt-0.5">All time</div>
                </div>

                <div className="col-span-2 sm:col-span-2 flex items-center justify-end space-x-2">
                    <Button onClick={() => onViewHistory(user.rawHistory)} variant="ghost" className="text-purple-600 hover:bg-purple-50">
                        <Eye className="h-4 w-4" /> View all transactions
                    </Button>
                </div>
            </div>
        </Card>
    );
};

export default function WalletManagement() {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All Status');
    const [WalletUsers, setWalletUsers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedHistory, setSelectedHistory] = useState([]);
    
    const dispatch = useDispatch();

    const formatCurrency = (amount) => {
        return Number(amount).toFixed(2);
    };

    const handleOpenModal = (history) => {
        setSelectedHistory(history);
        setIsModalOpen(true);
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await dispatch(AdminFetchWallet()).unwrap();
                setWalletUsers(result);
            } catch (err) {
                console.error("Fetch Wallet Error:", err);
            }
        };

        fetchData();
    }, [dispatch]);

    const mappedUsers = WalletUsers.map(w => ({
        id: w.user.id,
        name: `${w.user.first_name} ${w.user.last_name}`.trim(),
        email: w.user.email,
        status: w.balance <= 10 ? "Low Balance" : "Active",
        currentBalance: Number(w.balance),
        rawHistory: w.history, // Keep the history here to pass to modal
        lastTransaction: w.history.length > 0 ? {
            amount: Number(w.history[0].amount),
            type: w.history[0].transaction_type,
            purpose: w.history[0].purpose
        } : {
            amount: 0,
            type: "credit",
            purpose: "No Transactions"
        },
        totalSpent: w.history
            .filter(t => t.transaction_type === "debit")
            .reduce((sum, t) => sum + Number(t.amount), 0),

        profileColor: "bg-purple-500"
    }));


    const filteredUsers = mappedUsers.filter(user => {
        const matchSearch =
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());

        const matchStatus =
            statusFilter === "All Status" || user.status === statusFilter;

        return matchSearch && matchStatus;
    });

    return (
        <div className="min-h-screen bg-gray-50 p-6 sm:p-8 font-sans">

            {/* Header */}
            <header className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Wallet Management</h1>
                <p className="text-sm text-gray-500">Monitor and manage user wallets.</p>
            </header>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <AdminStatCard
                    title="Total Wallet Balance"
                    value={`$${mappedUsers.reduce((s, u) => s + u.currentBalance, 0).toFixed(2)}`}
                    change="+ Overall balance"
                    icon={DollarSign}
                    iconBg="bg-green-50"
                    iconColor="text-green-600"
                    valueColor="text-gray-900"
                    changeColor="text-green-600"
                />


                <AdminStatCard
                    title="Total Spent"
                    value={`$${mappedUsers.reduce((s, u) => s + u.totalSpent, 0).toFixed(2)}`}
                    change="Total expenditure"
                    icon={TrendingUp}
                    iconBg="bg-blue-50"
                    iconColor="text-blue-600"
                    valueColor="text-gray-900"
                    changeColor="text-blue-600"
                />

                <AdminStatCard
                    title="Low Balance Users"
                    value={mappedUsers.filter(u => u.status === "Low Balance").length}
                    change="Requires attention"
                    icon={TrendingDown}
                    iconBg="bg-red-50"
                    iconColor="text-red-600"
                    valueColor="text-gray-900"
                    changeColor="text-red-600"
                />

            </div>

            {/* Search & Filters */}
            <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">User Wallets</h2>

                <div className="flex flex-col sm:flex-row gap-4 mb-6">

                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search users..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="relative sm:w-40 w-full">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="appearance-none w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm text-gray-700 pr-8"
                        >
                            <option value="All Status">All Status</option>
                            <option value="Active">Active</option>
                            <option value="Low Balance">Low Balance</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                </div>

                {/* Render Wallet Users */}
                <div className="space-y-4">
                    {filteredUsers.length > 0 ? (
                        filteredUsers.map(user => (
                            <WalletUserCard 
                                key={user.id} 
                                user={user} 
                                onViewHistory={handleOpenModal} 
                            />
                        ))
                    ) : (
                        <div className="text-center p-8 text-gray-500">No users found.</div>
                    )}
                </div>
            </Card>

            <TransactionModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                history={selectedHistory} 
                formatCurrency={formatCurrency}
            />
        </div>
    );
}