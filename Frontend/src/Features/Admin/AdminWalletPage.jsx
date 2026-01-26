import React, { useEffect, useState } from 'react';
import { Search, ChevronDown, Clock, Eye, Hash, TrendingUp, TrendingDown, DollarSign, X, ArrowDownLeft, ArrowUpRight, Calendar, CreditCard, Activity } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { AdminFetchWallet } from '../../Redux/AdminRedux/AdminWalletSlice';
import { AdminStatCard } from './AdminUserPage';

// --- Utility Components ---

const TransactionModal = ({ isOpen, onClose, history, formatCurrency }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px] animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-3xl shadow-2xl shadow-slate-200/50 dark:shadow-none flex flex-col max-h-[85vh] overflow-hidden border border-slate-100 dark:border-slate-700 transition-colors duration-300">
        
        {/* Header */}
        <div className="px-6 sm:px-8 pt-8 pb-4 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">Activity</h2>
            <p className="text-[13px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">Wallet movement and history</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2.5 bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-full transition-all text-slate-400 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* List Body */}
        <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-4 scrollbar-hide">
          {history && history.length > 0 ? (
            <div className="space-y-1">
              {history.map((tx) => {
                const isIncoming = tx.transaction_type === "credit";
                return (
                  <div 
                    key={tx.id} 
                    className="group flex items-center justify-between py-4 border-b border-slate-50 dark:border-slate-700 last:border-0"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-colors ${
                        isIncoming 
                            ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' 
                            : 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400'
                      }`}>
                        {isIncoming ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                      </div>
                      
                      <div className="space-y-0.5">
                        <p className="text-[15px] font-semibold text-slate-800 dark:text-slate-200 capitalize leading-tight">
                            {tx.purpose.replace('-', ' ')}
                        </p>
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                            <Clock size={12} className="opacity-70" />
                            {new Date(tx.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </span>
                          <span className="flex items-center gap-1 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                            <Hash size={12} className="opacity-70" />
                            {tx.id}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right space-y-1">
                      <p className={`text-lg font-bold tabular-nums tracking-tight ${
                        isIncoming ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-slate-100'
                      }`}>
                        {isIncoming ? '+' : '-'}{formatCurrency(tx.amount)}
                      </p>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-widest border ${
                        tx.status === 'success' 
                          ? 'bg-white dark:bg-slate-900 text-emerald-500 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/50' 
                          : 'bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 border-slate-100 dark:border-slate-700'
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
              <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-4">
                <Hash size={24} className="text-slate-200 dark:text-slate-600" />
              </div>
              <p className="text-slate-400 dark:text-slate-500 text-sm font-medium tracking-wide">Empty transaction log</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-8 bg-gradient-to-t from-white via-white to-transparent dark:from-slate-800 dark:via-slate-800">
          <button 
            onClick={onClose}
            className="w-full py-4 bg-slate-900 dark:bg-slate-700 text-white rounded-2xl font-bold text-sm shadow-xl shadow-slate-200 dark:shadow-none hover:bg-slate-800 dark:hover:bg-slate-600 transition-all active:scale-[0.98]"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};

const Card = ({ children, className = '' }) => (
    <div className={`rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-gray-100 dark:border-slate-700 transition-colors duration-300 ${className}`}>
        {children}
    </div>
);

const Button = ({ children, className = '', icon: Icon, variant = 'default', ...props }) => {
    // Basic styling; extended logic for variants can be added if needed
    const baseStyle = "flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-150";
    let variantStyle = 'bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-200 hover:bg-gray-300 dark:hover:bg-slate-600'; // Default fallback

    if (variant === 'ghost') {
        variantStyle = 'text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20';
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
        className={`w-full p-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-500 focus:ring-purple-500 focus:border-purple-500 transition-colors ${className}`}
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
    const transactionColor = user.lastTransaction.type === 'credit' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
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
            {/* Flex layout enables stacking on mobile, row on sm+ */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                
                {/* User Info */}
                <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-base font-semibold shrink-0 ${user.profileColor}`}>
                        {getInitials(user.name)}
                    </div>
                    <div className="min-w-0">
                        <div className="text-sm font-semibold text-gray-800 dark:text-white truncate">{user.name}</div>
                        <div className="text-xs text-gray-500 dark:text-slate-400 truncate">{user.email}</div>
                    </div>
                </div>

                {/* Status & Balance */}
                <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto border-t sm:border-0 border-gray-100 dark:border-slate-700 pt-3 sm:pt-0">
                    <Badge className={isLowBalance 
                        ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300" 
                        : "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300"}>
                        {user.status}
                    </Badge>
                    <div className="text-right">
                        <div className="text-xs text-gray-500 dark:text-slate-500">Current Balance</div>
                        <div className="text-sm font-bold text-gray-800 dark:text-white">${user.currentBalance.toFixed(2)}</div>
                    </div>
                </div>
            </div>

            {/* Stats Footer Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 pt-3 border-t border-gray-100 dark:border-slate-700 text-xs">
                <div className="col-span-2 sm:col-span-1">
                    <div className="text-gray-500 dark:text-slate-500 mb-0.5">Last Transaction</div>
                    <div className={`font-semibold ${transactionColor}`}>{transactionSign}${user.lastTransaction.amount.toFixed(2)}</div>
                    <div className="text-gray-400 dark:text-slate-600 mt-0.5 truncate">{formatPurpose(user.lastTransaction.purpose)}</div>
                </div>

                <div className="col-span-2 sm:col-span-1">
                    <div className="text-gray-500 dark:text-slate-500 mb-0.5">Total Spent</div>
                    <div className="font-semibold text-gray-800 dark:text-white">${user.totalSpent.toFixed(2)}</div>
                    <div className="text-gray-400 dark:text-slate-600 mt-0.5">All time</div>
                </div>

                <div className="col-span-2 sm:col-span-2 flex items-center justify-end">
                    <Button onClick={() => onViewHistory(user.rawHistory)} variant="ghost" className="w-full sm:w-auto">
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
        rawHistory: w.history,
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
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 p-4 sm:p-6 md:p-10 font-sans transition-colors duration-300">

            {/* Header */}
            <header className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Wallet Management</h1>
                <p className="text-sm text-gray-500 dark:text-slate-400">Monitor and manage user wallets.</p>
            </header>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8">
                <AdminStatCard
                    title="Total Wallet Balance"
                    value={`$${mappedUsers.reduce((s, u) => s + u.currentBalance, 0).toFixed(2)}`}
                    change="+ Overall balance"
                    icon={DollarSign}
                    iconBg="bg-green-50 dark:bg-green-900/20"
                    iconColor="text-green-600 dark:text-green-400"
                    valueColor="text-gray-900 dark:text-white"
                    changeColor="text-green-600 dark:text-green-400"
                />

                <AdminStatCard
                    title="Total Spent"
                    value={`$${mappedUsers.reduce((s, u) => s + u.totalSpent, 0).toFixed(2)}`}
                    change="Total expenditure"
                    icon={TrendingUp}
                    iconBg="bg-blue-50 dark:bg-blue-900/20"
                    iconColor="text-blue-600 dark:text-blue-400"
                    valueColor="text-gray-900 dark:text-white"
                    changeColor="text-blue-600 dark:text-blue-400"
                />

                <AdminStatCard
                    title="Low Balance Users"
                    value={mappedUsers.filter(u => u.status === "Low Balance").length}
                    change="Requires attention"
                    icon={TrendingDown}
                    iconBg="bg-red-50 dark:bg-red-900/20"
                    iconColor="text-red-600 dark:text-red-400"
                    valueColor="text-gray-900 dark:text-white"
                    changeColor="text-red-600 dark:text-red-400"
                />
            </div>

            {/* Search & Filters */}
            <Card className="p-4 sm:p-6">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">User Wallets</h2>

                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-slate-500" />
                        <Input
                            placeholder="Search users..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="relative w-full sm:w-48">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="appearance-none w-full p-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-sm text-gray-700 dark:text-white pr-8 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                        >
                            <option value="All Status">All Status</option>
                            <option value="Active">Active</option>
                            <option value="Low Balance">Low Balance</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-slate-500 pointer-events-none" />
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
                        <div className="text-center p-8 text-gray-500 dark:text-slate-500 italic">No users found.</div>
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