import PublicLayout from "../layouts/PublicLayout";

export default function AboutUs() {
  return (
    <PublicLayout>
      <div className="bg-slate-50 min-h-screen">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white py-20">
          <div className="max-w-7xl mx-auto px-6">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">About Eventz</h1>
            <p className="text-xl text-indigo-100 max-w-3xl">
              Your trusted platform for discovering, creating, and managing unforgettable events
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-16">
          {/* Mission Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-slate-900">Our Mission</h2>
            </div>
            <p className="text-lg text-slate-700 leading-relaxed">
              At Eventz, we're on a mission to connect people through meaningful experiences. Whether you're hosting a workshop, conference, concert, or community gathering, we provide the tools and platform to make your event successful. We believe that great events have the power to inspire, educate, and bring communities together.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <FeatureCard
              icon={
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              }
              title="Easy Discovery"
              description="Find events that match your interests with our powerful search and filtering tools."
            />
            <FeatureCard
              icon={
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
              }
              title="Seamless Registration"
              description="Quick and secure event registration with instant confirmation and e-tickets."
            />
            <FeatureCard
              icon={
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              }
              title="Organizer Tools"
              description="Comprehensive dashboard for event management, analytics, and attendee tracking."
            />
          </div>

          {/* Stats Section */}
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-2xl p-12 text-white mb-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <p className="text-5xl font-bold mb-2">10,000+</p>
                <p className="text-indigo-200 text-lg">Events Hosted</p>
              </div>
              <div>
                <p className="text-5xl font-bold mb-2">50,000+</p>
                <p className="text-indigo-200 text-lg">Happy Attendees</p>
              </div>
              <div>
                <p className="text-5xl font-bold mb-2">500+</p>
                <p className="text-indigo-200 text-lg">Active Organizers</p>
              </div>
            </div>
          </div>

          {/* Values Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ValueCard
                title="Innovation"
                description="We continuously improve our platform with cutting-edge features to enhance your event experience."
              />
              <ValueCard
                title="Community"
                description="We foster connections and build communities through shared experiences and meaningful events."
              />
              <ValueCard
                title="Reliability"
                description="Our platform is built on trust, security, and dependability you can count on."
              />
              <ValueCard
                title="Support"
                description="Dedicated customer support team ready to help you every step of the way."
              />
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
      <div className="w-14 h-14 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-600 leading-relaxed">{description}</p>
    </div>
  );
}

function ValueCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0">
        <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
          <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>
      <div>
        <h4 className="text-lg font-bold text-slate-900 mb-2">{title}</h4>
        <p className="text-slate-600">{description}</p>
      </div>
    </div>
  );
}
