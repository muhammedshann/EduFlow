import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import {
    DollarSign, CreditCard, TrendingUp, Users, Filter,
    RefreshCw, MoreHorizontal, Plus, X, Settings, Edit3, Trash2,
    Search, ArrowUpRight, ArrowDownLeft
} from 'lucide-react';
import { AdminStatCard } from './AdminUserPage';
import { 
    AdminCreateBundles, AdminCreatePricing, AdminDeleteBundles, 
    AdminFetchBundles, AdminFetchPricing, AdminFetchSubscriptionStats, AdminUpdateBundles 
} from '../../Redux/AdminRedux/AdminSubscriptionSlice';
import api from '../../api/axios';
import { DeleteConfirmModal } from '../../Components/ConfirmDelete';

/**
 * MODAL COMPONENTS
 */
const SystemRateModal = ({ isOpen, onClose, onSave, currentRate }) => {
    const [rate, setRate] = useState(currentRate);
    useEffect(() => { setRate(currentRate); }, [currentRate]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-2xl shadow-2xl p-6 animate-in zoom-in duration-200 transition-colors">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                    <Settings size={20} className="text-purple-600 dark:text-purple-400" /> System Credit Rate
                </h3>
                <label className="block text-xs font-bold text-gray-400 dark:text-slate-500 uppercase mb-2">Rate Per Credit (INR)</label>
                <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400 dark:text-slate-500">₹</span>
                    <input
                        type="number"
                        className="w-full pl-8 pr-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 outline-none font-bold text-lg text-gray-900 dark:text-white transition-colors"
                        value={rate}
                        onChange={(e) => setRate(e.target.value)}
                        step="0.01"
                    />
                </div>
                <div className="flex gap-3 mt-6">
                    <button onClick={onClose} className="flex-1 py-2.5 text-sm font-bold text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-colors">Cancel</button>
                    <button onClick={() => onSave(rate)} className="flex-1 py-2.5 text-sm font-bold bg-purple-600 hover:bg-purple-700 dark:bg-purple-600 dark:hover:bg-purple-500 text-white rounded-xl shadow-lg shadow-purple-100 dark:shadow-none active:scale-95 transition-all">Update Rate</button>
                </div>
            </div>
        </div>
    );
};

const BundleModal = ({ isOpen, onClose, onSave, initialData }) => {
    const [formData, setFormData] = useState({ name: '', credits: '', price: '', description: '', active: true });

    useEffect(() => {
        if (initialData) setFormData({ ...initialData, description: initialData.description || '' });
        else setFormData({ name: '', credits: '', price: '', description: '', active: true });
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-200 transition-colors">
                <div className="p-6 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center bg-gray-50/50 dark:bg-slate-700/20">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">{initialData ? 'Edit Credit Bundle' : 'Create New Bundle'}</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full text-gray-500 dark:text-slate-400 transition-colors"><X size={20} /></button>
                </div>

                <form className="p-6 space-y-4" onSubmit={(e) => { e.preventDefault(); onSave(formData); }}>
                    <div>
                        <label className="block text-xs font-bold text-gray-400 dark:text-slate-500 uppercase mb-1">Bundle Name</label>
                        <input
                            type="text" 
                            className="w-full p-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl outline-none font-semibold focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 text-gray-900 dark:text-white transition-colors"
                            value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required placeholder="e.g. Pro Pack"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 dark:text-slate-500 uppercase mb-1">Credits</label>
                            <input
                                type="number" 
                                className="w-full p-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 text-gray-900 dark:text-white transition-colors"
                                value={formData.credits} onChange={(e) => setFormData({ ...formData, credits: e.target.value })} required placeholder="500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 dark:text-slate-500 uppercase mb-1">Price (INR)</label>
                            <input
                                type="number" 
                                className="w-full p-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 text-gray-900 dark:text-white transition-colors"
                                value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} step="0.01" required placeholder="999.00"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-400 dark:text-slate-500 uppercase mb-1">Description</label>
                        <textarea
                            className="w-full p-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl outline-none h-24 focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 text-gray-900 dark:text-white transition-colors"
                            value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Describe what users get..."
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox" checked={formData.active}
                            onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                            className="w-4 h-4 accent-purple-600 rounded"
                        />
                        <label className="text-sm font-bold text-gray-600 dark:text-slate-300">Active (Visible to users)</label>
                    </div>
                </form>

                <div className="p-6 bg-gray-50 dark:bg-slate-700/20 border-t border-gray-100 dark:border-slate-700 flex gap-3 transition-colors">
                    <button onClick={onClose} className="flex-1 py-3 font-bold text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-all">Cancel</button>
                    <button onClick={() => onSave(formData)} className="flex-1 py-3 bg-purple-600 text-white rounded-xl font-bold shadow-lg shadow-purple-200 dark:shadow-none active:scale-95 hover:bg-purple-700 transition-all">
                        {initialData ? 'Update Bundle' : 'Create Bundle'}
                    </button>
                </div>
            </div>
        </div>
    );
};

/**
 * MAIN PAGE COMPONENT
 */
export default function SubscriptionManagement() {
    const dispatch = useDispatch();
    const [isBundleModalOpen, setIsBundleModalOpen] = useState(false);
    const [isRateModalOpen, setIsRateModalOpen] = useState(false);
    const [editingBundle, setEditingBundle] = useState(null);
    const [deleteBundle, setDeleteBundle] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [systemRate, setSystemRate] = useState(0);
    const [bundles, setBundles] = useState([]);

    // HISTORY STATES
    const [history, setHistory] = useState([]);
    const [stats, setStats] = useState([]);
    const [historyType, setHistoryType] = useState('purchases'); // 'purchases' or 'usage'
    const [isHistoryLoading, setIsHistoryLoading] = useState(false);

    const fetchData = async () => {
        try {
            const pricing = await dispatch(AdminFetchPricing()).unwrap();
            setSystemRate(pricing.rate_per_credit);
            
            const Subscriptionstats = await dispatch(AdminFetchSubscriptionStats()).unwrap();
            setStats(Subscriptionstats.stats)

            const bundlesData = await dispatch(AdminFetchBundles()).unwrap();
            setBundles(bundlesData);
            
            fetchHistory();
        } catch (err) {
            console.error("Failed to load subscription data", err);
        }
    };

    const fetchHistory = async () => {
        setIsHistoryLoading(true);
        try {
            const endpoint = historyType === 'purchases' ? 'admin/credit-purchases/' : 'admin/credit-usage/';
            const response = await api.get(endpoint);
            setHistory(response.data);
        } catch (err) {
            console.error("Failed to fetch history", err);
        } finally {
            setIsHistoryLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        fetchHistory();
    }, [historyType]);

    const handleUpdateRate = async (newRate) => {
        try {
            await dispatch(AdminCreatePricing(newRate)).unwrap();
            setSystemRate(newRate);
            setIsRateModalOpen(false);
        } catch (err) {
            alert("Failed to update system rate");
        }
    };

    const handleSaveBundle = async (formData) => {
        try {
            if (editingBundle) {
                await dispatch(AdminUpdateBundles({ id: editingBundle.id, ...formData }));
            } else {
                await dispatch(AdminCreateBundles(formData)).unwrap();
            }
            fetchData();
            setIsBundleModalOpen(false);
        } catch (err) {
            alert("Error saving bundle");
        }
    };

    const handleConfirmDelete = async () => {
        try {
            await dispatch(AdminDeleteBundles(deleteBundle.id)).unwrap();
            fetchData();
            setIsDeleteModalOpen(false);
        } catch (err) {
            alert("Error deleting bundle");
        }
    };

    return (
        <div className="p-4 sm:p-6 md:p-10 bg-[#F9FAFE] dark:bg-slate-900 min-h-screen transition-colors duration-300">
            <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-[#A855F7] dark:text-[#C084FC] mb-1">Subscription Management</h1>
                    <p className="text-gray-500 dark:text-slate-400 font-medium italic">Manage global pricing and credit bundles</p>
                </div>

                <div className="bg-white dark:bg-slate-800 border border-purple-100 dark:border-slate-700 p-4 rounded-2xl shadow-sm flex items-center gap-4 w-full md:w-auto transition-colors">
                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-purple-600 dark:text-purple-400 shadow-inner dark:shadow-none">
                        <DollarSign size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">Base Rate</p>
                        <p className="text-xl font-black text-gray-800 dark:text-white">₹{systemRate}<span className="text-xs text-gray-400 dark:text-slate-500 font-normal"> / credit</span></p>
                    </div>
                    <button onClick={() => setIsRateModalOpen(true)} className="ml-auto p-2.5 bg-purple-50 dark:bg-slate-700 text-purple-600 dark:text-purple-400 rounded-xl hover:bg-purple-600 hover:text-white dark:hover:bg-purple-600 dark:hover:text-white transition-all">
                        <Settings size={20} />
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <AdminStatCard title="Total Revenue" value={stats.total_revenue} icon={DollarSign} iconBg="bg-green-50 dark:bg-green-900/20" iconColor="text-green-600 dark:text-green-400" />
                <AdminStatCard title="Active Bundles" value={bundles.length} icon={CreditCard} iconBg="bg-purple-50 dark:bg-purple-900/20" iconColor="text-purple-600 dark:text-purple-400" />
                <AdminStatCard title="Total Credits" value={stats.credits_bought} icon={TrendingUp} iconBg="bg-indigo-50 dark:bg-indigo-900/20" iconColor="text-indigo-600 dark:text-indigo-400" />
                <AdminStatCard title="Used Credits" value={stats.credits_used} icon={Users} iconBg="bg-gray-100 dark:bg-slate-700/50" iconColor="text-gray-500 dark:text-slate-400" />
            </div>

            {/* BUNDLES SECTION */}
            <section className="mb-12">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white">Pricing Management</h2>
                    <button onClick={() => { setEditingBundle(null); setIsBundleModalOpen(true); }} className="flex items-center gap-2 px-5 py-2.5 bg-[#6366F1] hover:bg-[#4F46E5] text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-100 dark:shadow-none transition-all">
                        <Plus size={18} /> Create Plan
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {bundles.length > 0 ? bundles.map((bundle) => (
                        <div key={bundle.id} className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm flex flex-col hover:shadow-md dark:hover:shadow-slate-700/30 transition-all">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${bundle.active ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-slate-400'}`}>
                                    {bundle.active ? 'Active' : 'inactive'}
                                </div>
                                <span className="text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 px-2 py-1 rounded-lg">{bundle.credits} Credits</span>
                            </div>

                            <h3 className="text-lg font-bold text-gray-800 dark:text-white capitalize">{bundle.name}</h3>

                            <div className="mt-1 flex items-baseline gap-1">
                                <span className="text-2xl font-black text-gray-900 dark:text-white">₹{bundle.price}</span>
                                <span className="text-xs text-gray-400 dark:text-slate-500 font-medium">/one-time</span>
                            </div>

                            <p className="text-sm text-gray-400 dark:text-slate-500 mt-3 flex-1 italic">{bundle.description}</p>

                            <div className="mt-6 flex gap-2">
                                <button
                                    onClick={() => { setEditingBundle(bundle); setIsBundleModalOpen(true); }}
                                    className="flex-1 py-3 bg-gray-50 dark:bg-slate-700 text-gray-600 dark:text-slate-300 rounded-xl text-sm font-bold hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors"
                                >
                                    Edit Plan
                                </button>
                                <button
                                    onClick={() => {setDeleteBundle(bundle); setIsDeleteModalOpen(true);}}
                                    className="p-3 bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 rounded-xl hover:bg-red-500 hover:text-white dark:hover:bg-red-600 dark:hover:text-white transition-all group"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    )) : (
                        <div className="col-span-3 py-10 text-center text-gray-400 dark:text-slate-500 font-medium italic bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-gray-200 dark:border-slate-700">No bundles found. Create one to get started.</div>
                    )}
                </div>
            </section>

            {/* HISTORY SECTION */}
            
            <section className="bg-white dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden transition-colors duration-300">
                <div className="p-6 border-b border-gray-50 dark:border-slate-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-lg font-bold text-gray-800 dark:text-white">Transaction History</h2>
                        <p className="text-xs text-gray-400 dark:text-slate-500 font-medium">Monitor credit purchases and system usage</p>
                    </div>

                    <div className="flex bg-gray-100 dark:bg-slate-700 p-1 rounded-xl">
                        <button 
                            onClick={() => setHistoryType('purchases')}
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${historyType === 'purchases' ? 'bg-white dark:bg-slate-600 text-purple-600 dark:text-purple-300 shadow-sm' : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200'}`}
                        >
                            Purchases
                        </button>
                        <button 
                            onClick={() => setHistoryType('usage')}
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${historyType === 'usage' ? 'bg-white dark:bg-slate-600 text-purple-600 dark:text-purple-300 shadow-sm' : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200'}`}
                        >
                            Usage
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 dark:bg-slate-700/50 text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">
                            <tr>
                                <th className="px-6 py-4 text-center w-12">Type</th>
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">{historyType === 'purchases' ? 'Bundle / Details' : 'Purpose'}</th>
                                <th className="px-6 py-4">Amount / Units</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-slate-700">
                            {isHistoryLoading ? (
                                <tr><td colSpan="6" className="py-20 text-center text-gray-400 dark:text-slate-500 animate-pulse font-medium">Loading transaction logs...</td></tr>
                            ) : history.length > 0 ? history.map((item, idx) => (
                                <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-slate-700/30 transition-colors">
                                    <td className="px-6 py-4">
                                        {historyType === 'purchases' ? (
                                            <div className="w-8 h-8 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 flex items-center justify-center">
                                                <ArrowDownLeft size={16} />
                                            </div>
                                        ) : (
                                            <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center justify-center">
                                                <ArrowUpRight size={16} />
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-gray-800 dark:text-slate-200">{item.user_email || 'System User'}</span>
                                            <span className="text-[10px] text-gray-400 dark:text-slate-500 font-medium">ID: {item.user}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-semibold text-gray-700 dark:text-slate-300">
                                            {historyType === 'purchases' ? (item.bundle_name || `${item.credits_purchased} Credits`) : (item.purpose || 'Transcription')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-sm font-black ${historyType === 'purchases' ? 'text-gray-900 dark:text-white' : 'text-red-500 dark:text-red-400'}`}>
                                            {historyType === 'purchases' ? `₹${item.total_amount}` : `-${item.credits_used} `}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-slate-400 font-medium">
                                        {new Date(item.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase 
                                            ${(item.status === 'success' || !item.status) 
                                                ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' 
                                                : item.status === 'pending' 
                                                ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' 
                                                : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'}`}>
                                            {item.status || 'Success'}
                                        </span>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan="6" className="py-20 text-center text-gray-400 dark:text-slate-500 font-medium italic">No activity found for this category.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="p-4 bg-gray-50/50 dark:bg-slate-700/20 border-t border-gray-50 dark:border-slate-700 flex justify-center transition-colors">
                    <button onClick={fetchHistory} className="text-xs font-bold text-purple-600 dark:text-purple-400 flex items-center gap-2 hover:scale-105 transition-transform">
                        <RefreshCw size={14} /> Refresh Logs
                    </button>
                </div>
            </section>

            <SystemRateModal isOpen={isRateModalOpen} onClose={() => setIsRateModalOpen(false)} currentRate={systemRate} onSave={handleUpdateRate} />
            <BundleModal isOpen={isBundleModalOpen} onClose={() => setIsBundleModalOpen(false)} onSave={handleSaveBundle} initialData={editingBundle} />
            <DeleteConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Delete Bundle?"
                message={`Are you sure you want to delete "${deleteBundle?.name}"? All users will lose access to this purchase option.`}
            />
        </div>
    );
}