import React, { useEffect, useState } from 'react';
import { Crown, Star, Zap, Check } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { AdminFetchBundles } from '../Redux/AdminRedux/AdminSubscriptionSlice';
import { useNavigate } from 'react-router-dom';

const Pricing = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [bundles, setBundles] = useState([]);

  // Fetch bundles on mount
  const fetchBundles = async () => {
    try {
      const response = await dispatch(AdminFetchBundles()).unwrap();
      setBundles(response);
    } catch (err) {
      console.error("Failed to fetch bundles:", err);
    }
  };

  useEffect(() => {
    fetchBundles();
  }, []);

  // Handle Redirection to Checkout
  const handlePurchase = (bundle) => {
    navigate('/checkout', { state: { bundle: bundle } });
  };

  return (
    <section id="pricing" className="py-20 bg-gradient-to-br from-gray-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Plan</h2>
          <p className="text-xl text-gray-600 mb-8">Select the perfect credits bundle for your needs</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch pb-8 max-w-5xl mx-auto">
          {bundles.map((bundle) => {
            // Business Logic for Icons and Styling
            const isPro = bundle.id === 7;
            const isPremium = bundle.id === 8;
            const Icon = isPremium ? Crown : isPro ? Star : Zap;

            return (
              <div
                key={bundle.id}
                className={`group relative p-6 rounded-[24px] border-2 transition-all duration-300 flex flex-col h-full bg-white 
                hover:border-purple-600 hover:shadow-2xl hover:-translate-y-2 hover:z-20
                ${isPro ? 'border-purple-600 shadow-xl z-10' : 'border-gray-100'}`}
              >
                {/* Popular Badge */}
                {isPro && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-md z-30">
                    Most Popular
                  </div>
                )}

                <div className="flex flex-col items-center text-center">
                  {/* Dynamic Icon Container */}
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
                  <li className="flex items-start gap-2.5 text-gray-500 text-[11px] font-semibold leading-tight">
                    <div className="w-4 h-4 rounded-full bg-purple-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="text-purple-600" size={10} />
                    </div>
                    Priority Support
                  </li>
                </ul>

                <button
                  onClick={() => handlePurchase(bundle)}
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
      </div>
    </section>
  );
};

export default Pricing;