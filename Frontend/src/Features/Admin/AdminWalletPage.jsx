import React, { useEffect, useState } from 'react';
import { Search, ChevronDown, Download, Eye, Settings, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { FetchWallet } from '../../Redux/AdminRedux/AdminWalletSlice';
import { AdminStatCard } from './AdminUserPage';

// --- Utility Components (Card, Badge, Button, Input) ---

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

// --- Mock Data (Updated to reflect Django WalletHistory schema) ---

const mockUsers = [
    {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        status: 'Active',
        currentBalance: 34.50, // Wallet.balance
        // WalletHistory fields: amount, type (transaction_type), purpose
        lastTransaction: { amount: 50.00, type: 'credit', purpose: 'top-up' },
        totalSpent: 874.25,
        profileColor: 'bg-blue-500',
    },
    {
        id: 2,
        name: 'Sarah Wilson',
        email: 'sarah@example.com',
        status: 'Active',
        currentBalance: 45.75,
        lastTransaction: { amount: 15.99, type: 'debit', purpose: 'subscription' },
        totalSpent: 234.50,
        profileColor: 'bg-pink-500',
    },
    {
        id: 3,
        name: 'Mike Johnson',
        email: 'mike@example.com',
        status: 'Low Balance',
        currentBalance: 0.00,
        lastTransaction: { amount: 29.99, type: 'debit', purpose: 'credit-purchase' }, // Updated purpose
        totalSpent: 156.75,
        profileColor: 'bg-red-500',
    },
    {
        id: 4,
        name: 'Emma Davis',
        email: 'emma@example.com',
        status: 'Active',
        currentBalance: 250.00,
        lastTransaction: { amount: 100.00, type: 'credit', purpose: 'top-up' },
        totalSpent: 445.80,
        profileColor: 'bg-green-500',
    },
];

// --- Custom Graphic Components (for Stats Cards) ---

const WalletIcon = ({ className }) => (
    <div className={`p-3 rounded-xl bg-green-50 ${className}`}>
        <DollarSign className="h-6 w-6 text-green-600" />
    </div>
);

const GraphIcon = ({ className, color, percent }) => (
    <div className={`p-3 rounded-xl ${color === 'red' ? 'bg-red-50' : 'bg-blue-50'} ${className}`}>
        {/* Simple SVG for the graph look */}
        <svg className={`h-6 w-6 ${color === 'red' ? 'text-red-600' : 'text-blue-600'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
        </svg>
    </div>
);

// --- Main Components ---

const StatCard = ({ title, value, icon: Icon, iconBg, iconColor, subTitle, trend }) => {
    return (
        <Card className="p-5 flex flex-col justify-between">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <h2 className="text-3xl font-bold text-gray-800 mt-1">{value}</h2>
                </div>

                {/* Custom Icon/Graph */}
                <div className={`flex-shrink-0 p-3 rounded-xl ${iconBg}`}>
                    {title === 'Total Wallet Balance' && <DollarSign className={`h-6 w-6 ${iconColor}`} />}
                    {title === 'Total Spent' && <TrendingUp className={`h-6 w-6 ${iconColor}`} />}
                    {title === 'Low Balance Users' && <TrendingDown className={`h-6 w-6 ${iconColor}`} />}
                </div>
            </div>
        </Card>
    );
};

const WalletUserCard = ({ user }) => {
    const isLowBalance = user.status === 'Low Balance';
    const transactionColor = user.lastTransaction.type === 'credit' ? 'text-green-600' : 'text-red-600';
    const transactionSign = user.lastTransaction.type === 'credit' ? '+' : '–';

    const getInitials = (name) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    };

    // Helper to format purpose for display (e.g., 'top-up' -> 'Wallet Top-up')
    const formatPurpose = (purpose) => {
        return purpose
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    return (
        <Card className="p-4 mb-3">
            <div className="grid grid-cols-12 items-center">
                {/* Col 1: User Info */}
                <div className="col-span-12 sm:col-span-5 flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-base font-semibold ${user.profileColor}`}>
                        {getInitials(user.name)}
                    </div>
                    <div>
                        <div className="text-sm font-semibold text-gray-800">{user.name}</div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                    </div>
                </div>

                {/* Col 2: Status & Balance */}
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

            {/* Separator / Metrics Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-3 pt-3 border-t border-gray-100 text-xs">
                {/* Last Transaction */}
                <div className="col-span-2 sm:col-span-1">
                    <div className="text-gray-500 mb-0.5">Last Transaction</div>
                    {/* Amount uses sign based on transaction type, and amount is already positive in mock */}
                    <div className={`font-semibold ${transactionColor}`}>{transactionSign}${user.lastTransaction.amount.toFixed(2)}</div>
                    {/* Display formatted purpose from WalletHistory schema */}
                    <div className="text-gray-400 mt-0.5">{formatPurpose(user.lastTransaction.purpose)}</div>
                </div>

                {/* Total Spent */}
                <div className="col-span-1 sm:col-span-1">
                    <div className="text-gray-500 mb-0.5">Total Spent</div>
                    <div className="font-semibold text-gray-800">${user.totalSpent.toFixed(2)}</div>
                    <div className="text-gray-400 mt-0.5">All time</div>
                </div>

                {/* Actions */}
                <div className="col-span-2 sm:col-span-2 flex items-center justify-end space-x-2">
                    <Button variant="ghost" className="text-purple-600 hover:bg-purple-50">
                        <Eye className="h-4 w-4" /> View Details
                    </Button>
                    <Button variant="action" className="bg-purple-600 hover:bg-purple-700">
                        <Settings className="h-4 w-4" /> Manage
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
    const dispatch = useDispatch();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await dispatch(FetchWallet()).unwrap();
                console.log("WALLET RESULT:", result);
                setWalletUsers(result);
            } catch (err) {
                console.error("Fetch Wallet Error:", err);
            }
        };

        fetchData();
    }, []);

    const mappedUsers = WalletUsers.map(w => ({
        id: w.user.id,
        name: `${w.user.first_name} ${w.user.last_name}`.trim(),
        email: w.user.email,
        status: w.balance <= 10 ? "Low Balance" : "Active",
        currentBalance: Number(w.balance),
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
                {filteredUsers.length > 0 ? (
                    filteredUsers.map(user => (
                        <WalletUserCard key={user.id} user={user} />
                    ))
                ) : (
                    <div className="text-center p-8 text-gray-500">No users found.</div>
                )}
            </Card>
        </div>
    );
}