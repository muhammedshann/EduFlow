import React, { useEffect, useState } from 'react';
import { ChevronLeft, Lock, CheckCircle2, AlertCircle, PartyPopper, Wallet, CreditCard } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RzpCreateOrder, RzpVerifyOrder, WalletPayment } from '../../Redux/SubscriptionSlice'; // Added WalletPayment
import confetti from 'canvas-confetti';
import { useUser } from '../../Context/UserContext';
import { SentNotification } from '../../Redux/AdminRedux/AdminNotificationSlice';

export default function CheckoutPage() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const location = useLocation();
    const bundle = location.state?.bundle;
    console.log('bundle',bundle);
    

    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);
    const [isSuccess, setIsSuccess] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('online'); // 'online' or 'wallet'
    const { balance } = useSelector(state => state.wallet);

    const { user } = useUser();

    useEffect(() => {
        if (!bundle) navigate('/subscription-plans');
    }, [bundle, navigate]);

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

    const handleSuccessFlow = async () => {
        const notificationData = {
            title: 'Credits purchased',
            notification_type: 'system',
            message: `Successfully added ${bundle.credits} credits.`,
            username: user.username
        };
        await dispatch(SentNotification({ data: notificationData, target_type: 'personal' }));
        setIsSuccess(true);
        triggerFireworks();
        setTimeout(() => navigate('/settings/'), 3000);
    };

    const loadRazorpay = () => {
        return new Promise((resolve) => {
            if (window.Razorpay) { resolve(true); return; }
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handlePurchase = async (e) => {
        e.preventDefault();
        setErrorMsg(null);
        setLoading(true);
        console.log(balance,'-------',bundle.price);
        

        // --- WALLET PAYMENT LOGIC ---
        if (paymentMethod === 'wallet') {
            const numericBalance = parseFloat(balance);
            const numericPrice = parseFloat(bundle.price);

            if (numericBalance < numericPrice) {
                setErrorMsg("Insufficient wallet balance.");
                setLoading(false);
                return;
            }

            try {
                const res = await dispatch(WalletPayment({ 
                    amount: bundle.price,
                    credits: bundle.credits,
                    bundle_id: bundle.id || null 
                }));

                if (WalletPayment.fulfilled.match(res)) {
                    await handleSuccessFlow();
                } else {
                    setErrorMsg(res.payload || "Wallet transaction failed.");
                    setLoading(false);
                }
            } catch (err) {
                setErrorMsg("Wallet payment error.");
                setLoading(false);
            }
            return;
        }

        // --- ONLINE (RAZORPAY) LOGIC ---
        const isScriptLoaded = await loadRazorpay();
        if (!isScriptLoaded) {
            setErrorMsg("Razorpay SDK failed to load.");
            setLoading(false);
            return;
        }

        try {
            const createRes = await dispatch(RzpCreateOrder({
                amount: bundle.price,
                credits: bundle.credits,
                bundle_id: bundle.id || null 
            }));

            if (RzpCreateOrder.rejected.match(createRes)) {
                setErrorMsg(createRes.payload || "Failed to create order");
                setLoading(false);
                return;
            }

            const { order_id, amount } = createRes.payload;

            const options = {
                key: import.meta.env.VITE_RZP_KEY_ID,
                amount: amount,
                currency: "INR",
                name: "EduFlow",
                description: `Adding ${bundle.credits} credits`,
                order_id: order_id,
                handler: async function (rzpResponse) {
                    const verifyRes = await dispatch(RzpVerifyOrder({
                        razorpay_order_id: rzpResponse.razorpay_order_id,
                        razorpay_payment_id: rzpResponse.razorpay_payment_id,
                        razorpay_signature: rzpResponse.razorpay_signature
                    }));

                    if (RzpVerifyOrder.fulfilled.match(verifyRes) && verifyRes.payload.status === "Success") {
                        await handleSuccessFlow();
                    } else {
                        setErrorMsg("Verification failed.");
                        setLoading(false);
                    }
                },
                prefill: { email: user.email },
                theme: { color: "#9333ea" },
                modal: { ondismiss: () => setLoading(false) }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', (resp) => {
                setErrorMsg(resp.error.description);
                setLoading(false);
            });
            rzp.open();
        } catch (error) {
            setErrorMsg("Something went wrong.");
            setLoading(false);
        }
    };

    if (!bundle) return null;
    const displayPrice = parseFloat(bundle.price);

    return (
        <div className="min-h-screen bg-gray-50/50 py-12 px-4 flex items-center justify-center">
            <div className="max-w-md w-full transition-all duration-500">
                {!isSuccess && (
                    <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-gray-400 hover:text-purple-600 font-bold text-xs mb-8 transition-colors group">
                        <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
                        Back to Plans
                    </button>
                )}

                <div className={`bg-white rounded-[40px] border border-gray-100 shadow-2xl overflow-hidden transition-all duration-500 ${isSuccess ? 'scale-105 border-green-100' : ''}`}>
                    {isSuccess ? (
                        <div className="p-10 text-center animate-in zoom-in-95 duration-500">
                            {/* ... (Existing Success UI) */}
                            <div className="mb-6 flex justify-center">
                                <div className="relative w-24 h-24 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-100">
                                    <CheckCircle2 className="text-white" size={48} />
                                </div>
                            </div>
                            <h2 className="text-3xl font-black text-gray-900 mb-2">Payment Received!</h2>
                            <p className="text-gray-500 font-bold text-sm mb-8">Successfully added <span className="text-purple-600">{bundle.credits.toLocaleString()} credits</span>.</p>
                            <div className="space-y-4">
                                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-purple-600 animate-progress origin-left" />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="p-8 border-b border-gray-50 text-center bg-gray-50/30">
                                <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Finalizing Order</h2>
                                <h3 className="font-black text-gray-900 text-3xl mb-1">{bundle.name}</h3>
                                <p className="text-purple-600 font-black text-xs mt-2 uppercase">{bundle.credits.toLocaleString()} Credits</p>
                            </div>

                            <div className="p-8 space-y-6">
                                {errorMsg && (
                                    <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex items-center gap-3 text-red-600">
                                        <AlertCircle size={18} />
                                        <span className="text-xs font-bold">{typeof errorMsg === 'object' ? errorMsg.message : errorMsg}</span>
                                    </div>
                                )}

                                {/* PAYMENT METHOD TOGGLE */}
                                <div className="space-y-3">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Select Payment Method</p>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button 
                                            onClick={() => setPaymentMethod('online')}
                                            className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${paymentMethod === 'online' ? 'border-purple-600 bg-purple-50 text-purple-600' : 'border-gray-100 text-gray-400 hover:border-gray-200'}`}
                                        >
                                            <CreditCard size={20} />
                                            <span className="text-[10px] font-black uppercase">Online</span>
                                        </button>
                                        <button 
                                            onClick={() => setPaymentMethod('wallet')}
                                            className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${paymentMethod === 'wallet' ? 'border-purple-600 bg-purple-50 text-purple-600' : 'border-gray-100 text-gray-400 hover:border-gray-200'}`}
                                        >
                                            <Wallet size={20} />
                                            <span className="text-[10px] font-black uppercase tracking-tighter">Wallet (₹{balance})</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-4 text-gray-600 font-bold text-sm">
                                        <CheckCircle2 className="text-green-500" size={18} />
                                        {paymentMethod === 'wallet' ? 'Instant Wallet Debit' : 'Instant Activation'}
                                    </div>
                                    <div className="flex items-center gap-4 text-gray-600 font-bold text-sm">
                                        <CheckCircle2 className="text-green-500" size={18} />
                                        Secure Transaction
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 pt-0">
                                <div className="flex justify-between items-end mb-8 pt-4 border-t border-dashed border-gray-200">
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase">Amount Due</p>
                                        <p className="text-4xl font-black text-gray-900">₹{displayPrice.toFixed(0)}</p>
                                    </div>
                                </div>
                                
                                <button 
                                    onClick={handlePurchase}
                                    disabled={loading}
                                    className="w-full py-5 bg-purple-600 text-white rounded-2xl text-lg font-black shadow-xl shadow-purple-100 hover:bg-purple-700 active:scale-[0.97] transition-all flex items-center justify-center gap-3 disabled:bg-gray-300"
                                >
                                    {loading ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            <span>Processing...</span>
                                        </div>
                                    ) : (
                                        <>
                                            <span>{paymentMethod === 'wallet' ? 'Confirm Wallet Pay' : 'Pay Securely'}</span>
                                            <Lock size={20} />
                                        </>
                                    )}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
            <style>{`
                @keyframes progress { 0% { transform: scaleX(0); } 100% { transform: scaleX(1); } }
                .animate-progress { animation: progress 4s linear forwards; }
            `}</style>
        </div>
    );
}