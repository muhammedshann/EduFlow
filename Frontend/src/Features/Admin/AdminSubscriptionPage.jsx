import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import {
    DollarSign, CreditCard, TrendingUp, Users, Filter,
    RefreshCw, MoreHorizontal, Plus, X, Settings, Edit3, Trash2
} from 'lucide-react';
import { AdminStatCard } from './AdminUserPage';
import { AdminCreateBundles, AdminCreatePricing, AdminDeleteBundles, AdminFetchBundles, AdminFetchPricing, AdminUpdateBundles } from '../../Redux/AdminRedux/AdminSubscriptionSlice';
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
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6 animate-in zoom-in duration-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Settings size={20} className="text-purple-600" /> System Credit Rate
                </h3>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Rate Per Credit (INR)</label>
                <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">₹</span>
                    <input
                        type="number"
                        className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none font-bold text-lg"
                        value={rate}
                        onChange={(e) => setRate(e.target.value)}
                        step="0.01"
                    />
                </div>
                <div className="flex gap-3 mt-6">
                    <button onClick={onClose} className="flex-1 py-2.5 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-xl">Cancel</button>
                    <button onClick={() => onSave(rate)} className="flex-1 py-2.5 text-sm font-bold bg-purple-600 text-white rounded-xl shadow-lg shadow-purple-100 active:scale-95">Update Rate</button>
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
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h3 className="text-xl font-bold text-gray-800">{initialData ? 'Edit Credit Bundle' : 'Create New Bundle'}</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full"><X size={20} /></button>
                </div>

                <form className="p-6 space-y-4" onSubmit={(e) => { e.preventDefault(); onSave(formData); }}>
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Bundle Name</label>
                        <input
                            type="text" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none font-semibold focus:ring-2 focus:ring-purple-500"
                            value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required placeholder="e.g. Pro Pack"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Credits</label>
                            <input
                                type="number" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500"
                                value={formData.credits} onChange={(e) => setFormData({ ...formData, credits: e.target.value })} required placeholder="500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Price (INR)</label>
                            <input
                                type="number" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500"
                                value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} step="0.01" required placeholder="999.00"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Description</label>
                        <textarea
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none h-24 focus:ring-2 focus:ring-purple-500"
                            value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Describe what users get..."
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox" checked={formData.active}
                            onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                            className="w-4 h-4 accent-purple-600 rounded"
                        />
                        <label className="text-sm font-bold text-gray-600">Active (Visible to users)</label>
                    </div>
                    {/* Hidden Submit for Enter-key support */}
                    <button type="submit" className="hidden" />
                </form>

                <div className="p-6 bg-gray-50 border-t border-gray-100 flex gap-3">
                    <button onClick={onClose} className="flex-1 py-3 font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-all">Cancel</button>
                    <button onClick={() => onSave(formData)} className="flex-1 py-3 bg-purple-600 text-white rounded-xl font-bold shadow-lg shadow-purple-200 active:scale-95 transition-all">
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
    const [deleteBundle, SetDeleteBundle] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [bundleToDelete, setBundleToDelete] = useState(null);
    const [systemRate, setSystemRate] = useState(0);
    const [bundles, setBundles] = useState([]);

    // FETCHING REAL DATA
    const fetchData = async () => {
        try {
            const pricing = await dispatch(AdminFetchPricing()).unwrap();
            setSystemRate(pricing.rate_per_credit);

            const bundlesData = await dispatch(AdminFetchBundles()).unwrap();
            setBundles(bundlesData);
        } catch (err) {
            console.error("Failed to load subscription data", err);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

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
        <div className="p-6 md:p-10 bg-[#F9FAFE] min-h-screen">
            <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-[#A855F7] mb-1">Subscription Management</h1>
                    <p className="text-gray-500 font-medium italic">Manage global pricing and credit bundles</p>
                </div>

                <div className="bg-white border border-purple-100 p-4 rounded-2xl shadow-sm flex items-center gap-4 w-full md:w-auto">
                    <div className="p-3 bg-purple-50 rounded-xl text-purple-600 shadow-inner">
                        <DollarSign size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Base Rate</p>
                        <p className="text-xl font-black text-gray-800">₹{systemRate}<span className="text-xs text-gray-400 font-normal"> / credit</span></p>
                    </div>
                    <button onClick={() => setIsRateModalOpen(true)} className="ml-auto p-2.5 bg-purple-50 text-purple-600 rounded-xl hover:bg-purple-600 hover:text-white transition-all">
                        <Settings size={20} />
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <AdminStatCard title="Total Revenue" value="₹2,34,456" icon={DollarSign} iconBg="bg-green-50" iconColor="text-green-600" />
                <AdminStatCard title="Active Bundles" value={bundles.length} icon={CreditCard} iconBg="bg-purple-50" iconColor="text-purple-600" />
                <AdminStatCard title="Churn Rate" value="2.3%" icon={TrendingUp} iconBg="bg-indigo-50" iconColor="text-indigo-600" />
                <AdminStatCard title="Free Users" value="1,613" icon={Users} iconBg="bg-gray-100" iconColor="text-gray-500" />
            </div>

            <section>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold text-gray-800">Pricing Management</h2>
                    <button onClick={() => { setEditingBundle(null); setIsBundleModalOpen(true); }} className="flex items-center gap-2 px-5 py-2.5 bg-[#6366F1] text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-[#4F46E5] transition-all">
                        <Plus size={18} /> Create Plan
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {bundles.length > 0 ? bundles.map((bundle) => (
                        <div key={bundle.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${bundle.active ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                                    {bundle.active ? 'Active' : 'inactive'}
                                </div>
                                <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-lg">{bundle.credits} Credits</span>
                            </div>

                            <h3 className="text-lg font-bold text-gray-800 capitalize">{bundle.name}</h3>

                            <div className="mt-1 flex items-baseline gap-1">
                                <span className="text-2xl font-black text-gray-900">₹{bundle.price}</span>
                                <span className="text-xs text-gray-400 font-medium">/one-time</span>
                            </div>

                            <p className="text-sm text-gray-400 mt-3 flex-1 italic">{bundle.description}</p>

                            {/* ACTION BUTTONS GRID */}
                            <div className="mt-6 flex gap-2">
                                <button
                                    onClick={() => { setEditingBundle(bundle); setIsBundleModalOpen(true); }}
                                    className="flex-1 py-3 bg-gray-50 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-100 transition-colors"
                                >
                                    Edit Plan
                                </button>
                                <button
                                    onClick={() => {SetDeleteBundle(bundle),setIsDeleteModalOpen(true)}}
                                    className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all group"
                                    title="Delete Plan"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    )) : (
                        <div className="col-span-3 py-10 text-center text-gray-400 font-medium">No bundles found. Create one to get started.</div>
                    )}
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