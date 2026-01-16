import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { ChevronLeft, Zap, Star, Crown, Check } from 'lucide-react';
import { AdminFetchBundles, AdminFetchPricing } from '../../Redux/AdminRedux/AdminSubscriptionSlice';
import { useNavigate } from 'react-router-dom';

const MOCK_BUNDLES = [
    { id: 'm1', name: 'Starter Pack', credits: 100, price: '9.99', description: 'Perfect for individuals getting started', features: ['100 Credits', 'Basic AI accuracy', 'Standard support', 'Export to text format', 'Basic editing tools'], icon: Zap, color: 'text-purple-500', bg: 'bg-purple-50' },
    { id: 'm2', name: 'Pro Pack', credits: 300, price: '24.99', description: 'Ideal for professionals and small teams', features: ['300 Credits', 'Enhanced AI accuracy', 'Priority support', 'Export to multiple formats', 'Advanced editing tools', 'Speaker identification', 'Custom vocabulary'], icon: Star, color: 'text-white', bg: 'bg-purple-600', popular: true },
    { id: 'm3', name: 'Premium Pack', credits: 700, price: '49.99', description: 'For large teams and enterprises', features: ['700 Credits', 'Highest AI accuracy', '24/7 dedicated support', 'All export formats', 'Full editing suite', 'Advanced speaker identification', 'Custom vocabulary & training', 'API access'], icon: Crown, color: 'text-purple-600', bg: 'bg-purple-100' }
];

export default function SubscriptionPlans() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [viewMode, setViewMode] = useState('bundles');
    const [bundles, setBundles] = useState([]);
    const [CreditRate, setCreditRate] = useState(0);
    const [customAmount, setCustomAmount] = useState('');

    useEffect(() => {
        const loadData = async () => {
            try {
                const pricing = await dispatch(AdminFetchPricing()).unwrap();
                setCreditRate(pricing.rate_per_credit);
                const data = await dispatch(AdminFetchBundles()).unwrap();
                setBundles(data.length > 0 ? data : MOCK_BUNDLES);
            } catch (err) {
                setBundles(MOCK_BUNDLES);
            }
        };
        loadData();
    }, [dispatch]);

    const HandleSubmit = (data) => {
        let selectedPackage;

        // Check if it's a Custom Credit purchase (has customAmount property)
        if (viewMode !== 'bundles') {
            const amount = Number(data.customAmount) || 0;

            // Don't proceed if amount is 0
            if (amount <= 0) return alert("Please enter a valid credit amount");

            selectedPackage = {
                name: "Custom Credit Pack",
                credits: amount,
                price: (amount * CreditRate).toFixed(2),
                isCustom: true // Useful for backend tracking
            };
        } else {
            // It's a standard bundle from the API
            selectedPackage = data;
        }

        // Pass the normalized package to the checkout page
        navigate('/checkout', { state: { bundle: selectedPackage } });
    };

    return (
        <div className="w-full max-w-6xl mx-auto px-4">
            {/* Header Section */}
            <header className="text-center mb-8">
                <h2 className="text-2xl font-black text-gray-900 mb-1">Choose Your Credit Pack</h2>
                <p className="text-gray-500 text-sm font-medium">Buy credits once — use them anytime.</p>

                <div className="mt-6 inline-flex p-1 bg-gray-200/60 rounded-xl border border-gray-200">
                    <button
                        onClick={() => setViewMode('bundles')}
                        className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${viewMode === 'bundles' ? 'bg-white shadow-md text-gray-800' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        Credit Bundles
                    </button>
                    <button
                        onClick={() => setViewMode('custom')}
                        className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${viewMode === 'custom' ? 'bg-white shadow-md text-gray-800' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        Custom Credit
                    </button>
                </div>
            </header>

            <main>
                {viewMode === 'bundles' ? (
                    /* Decreased size grid */
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch pb-8 max-w-5xl mx-auto">
                        {bundles.map((bundle) => {
                            const isPro = bundle.id === 7; // Keep for the badge only
                            const isPremium = bundle.id === 8;
                            const Icon = isPremium ? Crown : isPro ? Star : Zap;

                            return (
                                <div
                                    key={bundle.id}
                                    className={`group relative p-6 rounded-[24px] border-2 transition-all duration-300 flex flex-col h-full bg-white 
                    hover:border-purple-600 hover:shadow-2xl hover:-translate-y-2 hover:z-20
                    ${isPro ? 'border-purple-600 shadow-xl z-10' : 'border-gray-100'}`}
                                >
                                    {/* Keep the badge for the middle card by default */}
                                    {isPro && (
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-md">
                                            Most Popular
                                        </div>
                                    )}

                                    <div className="flex flex-col items-center text-center">
                                        {/* Icon container becomes purple on group hover */}
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors duration-300
                        ${isPro ? 'bg-purple-600 text-white' : 'bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white'}`}>
                                            <Icon size={24} />
                                        </div>

                                        <h3 className="text-lg font-bold text-gray-800 mb-1 capitalize">
                                            {bundle.name}
                                        </h3>

                                        <p className="text-gray-400 text-[11px] font-medium mb-3 h-10 leading-tight overflow-hidden">
                                            {bundle.description}
                                        </p>

                                        <div className="flex items-baseline gap-1 mb-6">
                                            <span className="text-3xl font-black text-gray-900 group-hover:text-purple-600 transition-colors">
                                                ₹{parseInt(bundle.price)}
                                            </span>
                                            <span className="text-gray-400 text-[10px] font-bold">/one-time</span>
                                        </div>
                                    </div>

                                    <ul className="space-y-2.5 mb-8 flex-1">
                                        <li className="flex items-start gap-2.5 text-gray-700 text-[11px] font-bold leading-tight">
                                            <div className="w-4 h-4 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <Check className="text-purple-600" size={10} />
                                            </div>
                                            {bundle.credits} Total Credits
                                        </li>
                                        <li className="flex items-start gap-2.5 text-gray-500 text-[11px] font-semibold leading-tight">
                                            <div className="w-4 h-4 rounded-full bg-purple-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <Check className="text-purple-600" size={10} />
                                            </div>
                                            Full Feature Access
                                        </li>
                                    </ul>

                                    {/* Button transforms to purple on card hover */}
                                    <button
                                        onClick={() => HandleSubmit(bundle)}
                                        className={`w-full py-3 rounded-xl text-xs font-black transition-all active:scale-95 duration-300
                        ${isPro
                                                ? 'bg-purple-600 text-white shadow-lg shadow-purple-200 hover:bg-purple-700'
                                                : 'bg-white border border-gray-200 text-gray-800 group-hover:bg-purple-600 group-hover:text-white group-hover:border-purple-600 group-hover:shadow-lg group-hover:shadow-purple-200'}`}
                                    >
                                        Buy {bundle.credits} Credits
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    /* Decreased size Custom Credit View */
                    <div className="max-w-lg mx-auto bg-white p-8 rounded-[32px] border border-gray-100 shadow-xl text-center animate-in fade-in zoom-in duration-300">
                        <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
                            <Zap size={28} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-1">Buy Exact Credits</h3>
                        <p className="text-gray-400 text-xs mb-6 italic">Rate: <span className="text-purple-600 font-bold">₹{CreditRate} per credit</span></p>

                        <div className="space-y-4">
                            <div className="relative">
                                <label className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-[10px] uppercase tracking-widest">
                                    Amount
                                </label>
                                <input
                                    type="number"
                                    value={customAmount}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        // Allow empty string so user can backspace everything
                                        setCustomAmount(val === "" ? "" : Math.max(0, parseInt(val)));
                                    }}
                                    className="w-full pl-24 pr-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-lg font-black text-gray-800 focus:ring-4 focus:ring-purple-100 outline-none transition-all"
                                    placeholder="0"
                                />
                            </div>

                            <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100 flex justify-between items-center">
                                <span className="text-gray-600 text-xs font-bold">Estimated Cost</span>
                                <span className="text-2xl font-black text-purple-700">₹{((customAmount || 0) * CreditRate).toFixed(2)}</span>
                            </div>

                            <button onClick={() => HandleSubmit({ customAmount })} className="w-full py-4 bg-purple-600 text-white rounded-2xl text-sm font-black shadow-xl shadow-purple-100 hover:bg-purple-700 active:scale-95 transition-all">
                                Purchase Credits
                            </button>
                        </div>
                    </div>
                )}

                {/* FAQ Section */}
                <section className="mt-16 max-w-3xl mx-auto pb-8">
                    <h3 className="text-lg font-bold text-gray-900 text-center mb-8">Frequently Asked Questions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {[
                            { q: "Can I change my plan anytime?", a: "Yes, you can purchase additional packs as needed without recurring fees." },
                            { q: "Do these credits expire?", a: "No, credits purchased remain in your account until used." },
                            { q: "What happens if I run out?", a: "It will not be sudden pause. You can continue but credit will be got negative. You need to topup to continue." }
                        ].map((faq, i) => (
                            <div key={i} className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                                <h4 className="font-bold text-gray-800 mb-1 text-xs">{faq.q}</h4>
                                <p className="text-gray-500 text-[10px] leading-relaxed">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
}