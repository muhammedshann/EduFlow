import { Users, CheckCircle, Zap, Target } from 'lucide-react';

const Pricing = () => {
    return (
        <section id="pricing" className="py-20 bg-gradient-to-br from-gray-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Plan</h2>
            <p className="text-xl text-gray-600 mb-8">Select the perfect plan for your team's needs</p>
            
            {/* Billing Toggle */}
            {/* <div className="inline-flex items-center bg-white rounded-full p-1 shadow-lg">
              <button className="px-6 py-2 rounded-full bg-gray-100 text-gray-600 font-medium transition-all">
                Monthly
              </button>
              <button className="px-6 py-2 rounded-full bg-purple-600 text-white font-medium transition-all">
                Yearly
              </button>
              <button className="px-6 py-2 rounded-full text-gray-600 font-medium transition-all">
                Enterprise
              </button>
            </div> */}
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Basic Plan */}
            <div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gray-400 to-gray-600"></div>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Users className="w-8 h-8 text-gray-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Basic</h3>
                <p className="text-gray-600">Perfect for personal use or trying out EchoNote</p>
              </div>
              
              <div className="text-center mb-8">
                <div className="text-4xl font-bold text-gray-900">$9.99</div>
                <div className="text-gray-500">/month</div>
              </div>
              
              <ul className="space-y-4 mb-8">
                {[
                  "Up to 10 hours of transcription per month",
                  "Basic accuracy",
                  "Export transcripts",
                  "Email support",
                  "Basic integrations"
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <button className="w-full border-2 border-gray-300 text-gray-700 py-3 rounded-xl font-semibold hover:border-purple-300 hover:text-purple-600 transition-all group-hover:scale-105">
                Select Basic
              </button>
            </div>

            {/* Pro Plan - Featured */}
            <div className="group bg-white rounded-2xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-300 relative overflow-hidden scale-105 border-2 border-purple-200">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-600 to-blue-600"></div>
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </div>
              </div>
              
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Zap className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Pro</h3>
                <p className="text-gray-600">Ideal for professionals and growing teams</p>
              </div>
              
              <div className="text-center mb-8">
                <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  $24.99
                </div>
                <div className="text-gray-500">/month</div>
              </div>
              
              <ul className="space-y-4 mb-8">
                {[
                  "Up to 50 hours of transcription per month",
                  "Advanced AI accuracy",
                  "Priority support",
                  "Advanced export formats",
                  "Team collaboration",
                  "Speaker identification",
                  "Custom vocabulary"
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-purple-500 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transform hover:-translate-y-1 transition-all group-hover:scale-105">
                Select Pro
              </button>
            </div>

            {/* Premium Plan */}
            <div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 to-orange-500"></div>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Target className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Premium</h3>
                <p className="text-gray-600">For large teams and enterprise needs</p>
              </div>
              
              <div className="text-center mb-8">
                <div className="text-4xl font-bold text-gray-900">$49.99</div>
                <div className="text-gray-500">/month</div>
              </div>
              
              <ul className="space-y-4 mb-8">
                {[
                  "Unlimited transcription",
                  "Real-time processing",
                  "24/7 dedicated support",
                  "Advanced integrations",
                  "Custom branding",
                  "Advanced speaker identification",
                  "Priority processing & training",
                  "API access"
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-orange-500 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <button className="w-full border-2 border-orange-300 text-orange-600 py-3 rounded-xl font-semibold hover:bg-orange-50 transition-all group-hover:scale-105">
                Select Premium
              </button>
            </div>
          </div>
        </div>
      </section>
    )
}
export default Pricing;