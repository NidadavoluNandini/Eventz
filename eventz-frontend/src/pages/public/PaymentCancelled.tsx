import { useParams, useNavigate } from "react-router-dom";
import PublicLayout from "../../layouts/PublicLayout";

export default function PaymentCancelled() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <PublicLayout>
      <style>
        {`
          @keyframes fade-in {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
            20%, 40%, 60%, 80% { transform: translateX(5px); }
          }
          @keyframes pulse-ring {
            0% { transform: scale(1); opacity: 0.5; }
            100% { transform: scale(1.5); opacity: 0; }
          }
          .animate-fade-in {
            animation: fade-in 0.4s ease-out;
          }
          .animate-shake {
            animation: shake 0.5s ease-in-out;
          }
          .pulse-ring {
            animation: pulse-ring 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
          }
        `}
      </style>

      <div className="min-h-[100dvh]
 flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50 px-4 py-8 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 overflow-hidden opacity-5">
          <div className="absolute top-20 left-10 w-40 h-40 border-4 border-red-500 rounded-full"></div>
          <div className="absolute bottom-20 right-10 w-60 h-60 border-4 border-orange-500 rounded-full"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 border-4 border-red-400 rounded-full"></div>
        </div>

        <div className="w-full max-w-md relative z-10">
          {/* Cancelled Card */}
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden animate-fade-in">
            {/* Icon Section */}
            <div className="bg-gradient-to-br from-red-500 to-orange-600 p-8 text-center relative">
              {/* Decorative circles */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>

              <div className="relative z-10">
                {/* Animated Icon */}
                <div className="relative inline-block mb-4">
                  <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto shadow-lg animate-shake">
                    <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  {/* Pulse rings */}
                  <div className="absolute inset-0 w-24 h-24 bg-red-500 rounded-full pulse-ring"></div>
                  <div className="absolute inset-0 w-24 h-24 bg-red-500 rounded-full pulse-ring" style={{ animationDelay: '1s' }}></div>
                </div>

                <h1 className="text-3xl font-extrabold text-white mb-2">Payment Cancelled</h1>
                <p className="text-red-100 text-sm">
                  Your transaction was not completed
                </p>
              </div>
            </div>

            {/* Content Section */}
            <div className="p-8 space-y-6">
              {/* Info Message */}
              <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-5">
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="font-semibold text-orange-900 mb-1">What happened?</p>
                    <p className="text-sm text-orange-700 leading-relaxed">
                      You closed the payment window or cancelled the transaction. Don't worry, no amount was deducted from your account.
                    </p>
                  </div>
                </div>
              </div>

              {/* Next Steps */}
              <div className="bg-gray-50 rounded-2xl p-5 border-2 border-gray-200">
                <p className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  What's next?
                </p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Your registration is still saved</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>You can retry payment anytime</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>No charges were applied</span>
                  </li>
                </ul>
              </div>

              {/* Retry Button */}
              <button
                onClick={() => navigate(`/payment/${id}`)}
                className="w-full bg-gradient-to-r from-red-600 to-orange-600 text-white py-4 rounded-xl font-bold text-lg hover:from-red-700 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Retry Payment</span>
              </button>

              {/* Secondary Actions */}
              <div className="flex items-center justify-center gap-4 pt-4 border-t">
                <button
                  onClick={() => navigate("/")}
                  className="text-gray-600 hover:text-gray-900 font-semibold text-sm hover:underline flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Back to Home
                </button>
                <span className="text-gray-300">•</span>
                <button
                  onClick={() => navigate("/events")}
                  className="text-gray-600 hover:text-gray-900 font-semibold text-sm hover:underline"
                >
                  Browse Events
                </button>
              </div>

              {/* Help Text */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <div>
                    <p className="text-sm font-semibold text-blue-900 mb-1">Need Help?</p>
                    <p className="text-xs text-blue-700 leading-relaxed">
                      If you're facing issues with payment, contact our support team at support@eventz.com
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Having trouble? Try a different payment method or contact support
            </p>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
