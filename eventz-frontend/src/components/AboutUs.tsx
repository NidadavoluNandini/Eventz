import PublicLayout from "../layouts/PublicLayout";

// Existing components...
function TimelineItem({ date, title, description }) {
  return (
    <div className="flex gap-4 p-4 rounded-2xl border border-slate-200 hover:bg-slate-50 hover:shadow-md transition-all">
      <div className="w-2 h-2 bg-indigo-500 rounded-full mt-3 flex-shrink-0"></div>
      <div>
        <div className="text-xs font-semibold text-indigo-600 uppercase mb-1">{date}</div>
        <h4 className="font-bold text-slate-900 text-sm mb-1">{title}</h4>
        <p className="text-slate-600 text-xs">{description}</p>
      </div>
    </div>
  );
}

function TestimonialCard({ quote, author, role }) {
  return (
    <div className="rounded-2xl p-6 border border-slate-200 bg-slate-50 hover:shadow-md transition-all">
      <p className="text-slate-700 text-sm italic mb-4">"{quote}"</p>
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white font-semibold text-xs">JD</div>
        <div>
          <div className="font-semibold text-slate-900 text-sm">{author}</div>
          <div className="text-xs text-slate-500">{role}</div>
        </div>
      </div>
    </div>
  );
}

function TeamCard({ name, role }) {
  return (
    <div className="group rounded-2xl p-4 border border-slate-200 hover:shadow-lg hover:-translate-y-1 transition-all overflow-hidden bg-white">
      <div className="h-20 bg-gradient-to-r from-slate-200 to-indigo-200 rounded-xl group-hover:scale-105 transition-transform mb-3"></div>
      <h4 className="font-bold text-slate-900 text-sm mb-1">{name}</h4>
      <p className="text-xs text-slate-500 uppercase tracking-wide">{role}</p>
    </div>
  );
}

// NEW COMPONENTS
function FeatureCard({ icon, title, description }) {
  return (
    <div className="group rounded-2xl p-6 border border-slate-200 bg-white hover:shadow-xl hover:-translate-y-2 transition-all h-full">
      <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
        <span className="text-white font-bold text-sm">{icon}</span>
      </div>
      <h4 className="font-bold text-slate-900 text-lg mb-3">{title}</h4>
      <p className="text-slate-600 text-sm">{description}</p>
    </div>
  );
}

function PlatformStats({ stat, label, icon }) {
  return (
    <div className="text-center p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-200/30 group hover:shadow-lg transition-all">
      <div className="text-4xl mb-3 opacity-75">{icon}</div>
      <div className="text-3xl lg:text-4xl font-black text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">{stat}</div>
      <div className="text-xs uppercase font-semibold text-slate-500 tracking-wide">{label}</div>
    </div>
  );
}

function ValueProp({ number, title, description }) {
  return (
    <div className="flex items-start gap-4 p-6 lg:p-8 rounded-3xl bg-gradient-to-r from-slate-50 to-indigo-50 border border-slate-200 hover:shadow-xl transition-all group">
      <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center text-white font-black text-xl flex-shrink-0 group-hover:scale-110 transition-transform">
        {number}
      </div>
      <div>
        <h4 className="font-bold text-xl text-slate-900 mb-2">{title}</h4>
        <p className="text-slate-600 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function PartnerLogo({ name, className = "" }) {
  return (
    <div className={`group p-4 border border-slate-200/50 rounded-xl bg-white hover:shadow-md transition-all cursor-pointer ${className}`}>
      <div className="h-12 flex items-center justify-center">
        {name === "Stripe" && (
          <svg className="w-16 h-10 text-slate-400 group-hover:text-[#635BFF] transition-colors" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24Z" fill="currentColor"/>
            <path fillRule="evenodd" clipRule="evenodd" d="M11.9598 16.9451C11.6216 16.9451 11.3433 16.8722 11.125 16.7359C10.9067 16.5996 10.75 16.4108 10.6562 16.1694L10.5938 15.9788L12.0312 15.9788C12.3906 15.9788 12.6719 16.0195 12.875 16.1016C13.0781 16.1836 13.2344 16.3159 13.3438 16.498C13.4609 16.6801 13.5234 16.9297 13.5312 17.2461C13.5391 17.5625 13.4922 17.8121 13.3906 17.9941C13.2891 18.1714 13.1328 18.3037 12.9219 18.3906C12.7188 18.4727 12.4375 18.5156 12.0781 18.5156C11.5703 18.5156 11.1875 18.3809 10.9297 18.1123C10.6719 17.8438 10.5938 17.4609 10.5938 16.9648V16.7266L11.9598 16.7266V16.9451ZM9.0625 16.7266H10.5938V16.1094C10.5938 15.7422 10.6719 15.4609 10.8281 15.2656C10.9922 15.0703 11.2422 14.9922 11.5781 14.9922C11.8594 14.9922 12.1094 15.0195 12.3281 15.0742C12.5547 15.1348 12.7422 15.2383 12.8906 15.3848L12.8594 15.5039C12.7422 15.4258 12.5859 15.3906 12.3906 15.3906C12.1328 15.3906 11.9141 15.4512 11.7344 15.5723C11.5547 15.6985 11.4844 15.8867 11.4844 16.1406V16.7266H9.0625ZM14.1406 17.8555C14.4062 17.8555 14.6406 17.7969 14.8438 17.6895C15.0547 17.582 15.2109 17.4297 15.3125 17.2324C15.4219 17.0352 15.4688 16.7969 15.4688 16.5195V14.7344H16.7812V13.7344H15.4688V12.5156H14.3125V13.7344H13.125V14.7344H14.3125V16.5156C14.3125 16.6953 14.3594 16.8281 14.4531 16.9141C14.5547 17.0001 14.6719 17.0391 14.8125 17.0391C14.9219 17.0391 15.0391 17.0195 15.1641 16.9805C15.2891 16.9414 15.4141 16.8828 15.5391 16.8047L15.6016 16.8984C15.4609 17.0195 15.3047 17.0859 15.1328 17.0977C14.9688 17.1094 14.8125 17.0859 14.6641 17.0195C14.5156 16.9531 14.3906 16.8555 14.2891 16.7266L14.1406 17.8555Z" fill="white"/>
          </svg>
        )}
        {name === "Twilio" && (
          <svg className="w-14 h-10 text-slate-400 group-hover:text-[#00C1DE] transition-colors" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm-1 18.17h-2v-2h2v2zm3.17 0h-2v-2h2v2zM12 16H8V4h4v12z" fill="currentColor"/>
          </svg>
        )}
        {name === "Google" && (
          <svg className="w-20 h-10 text-slate-400 group-hover:text-[#4285F4] transition-colors" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
        )}
        {name === "Zoom" && (
          <svg className="w-14 h-10 text-slate-400 group-hover:text-[#1769F7] transition-colors" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.99 9.89a5.37 5.37 0 0 1-3.2 1.03 5.47 5.47 0 0 1-2.39-.56 3.35 3.35 0 0 1-1.97 0A5.51 5.51 0 0 1 8.75 11c-.98 0-1.81-.62-2.14-1.47a5.32 5.32 0 0 1 3.18-6.77 5.31 5.31 0 0 1 4.15.25 5.32 5.32 0 0 1 1.67 2.88 5.45 5.45 0 0 1-1.18 3.2 5.32 5.32 0 0 1 2.56 1zM13.92 18H10.08a3 3 0 0 1-2.83-2h7.66a3 3 0 0 1-2.83 2z"/>
            <path d="M21.25 19.09a5.23 5.23 0 0 1-2.6-.7 3.26 3.26 0 0 1-1.96 0 5.25 5.25 0 0 1-3.2-1.03 5.42 5.42 0 0 1 1.18-3.2 5.38 5.38 0 0 1 2.56 0 5.25 5.25 0 0 1 2.6.7 3.26 3.26 0 0 1 1.96 0 5.25 5.25 0 0 1 3.2 1.03 5.42 5.42 0 0 1-1.18 3.2z"/>
          </svg>
        )}
        {name === "Resend" && (
          <svg className="w-16 h-10 text-slate-400 group-hover:text-[#21293C] transition-colors" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 4C2 3.44772 2.44772 3 3 3H21C21.5523 3 22 3.44772 22 4V20C22 20.5523 21.5523 21 21 21H3C2.44772 21 2 20.5523 2 20V4Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
            <path d="M22 7L12 13L2 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
        {!["Stripe", "Twilio", "Google", "Zoom", "Resend"].includes(name) && (
          <span className="text-slate-400 group-hover:text-indigo-600 text-lg font-semibold tracking-wide uppercase">{name}</span>
        )}
      </div>
    </div>
  );
}

function ProcessStep({ step, title, description, icon }) {
  return (
    <div className="group flex flex-col items-center text-center p-6 rounded-2xl border border-slate-200 bg-white hover:shadow-xl hover:-translate-y-2 transition-all">
      <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-3xl flex items-center justify-center mb-4 group-hover:scale-110 transition-all">
        <span className="text-white font-bold text-lg">{icon}</span>
      </div>
      <div className="font-bold text-slate-900 mb-2">{title}</div>
      <p className="text-slate-600 text-sm mb-4">{description}</p>
      <div className="w-20 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full group-hover:w-24 transition-all"></div>
    </div>
  );
}

export default function AboutUs() {
  return (
    <PublicLayout>
      <div className="bg-gradient-to-br from-slate-50 via-white to-indigo-50 min-h-screen py-12 sm:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          
          {/* Hero */}
          <div className="text-center mb-16 sm:mb-20">
            <div className="inline-block bg-indigo-100 px-4 py-1.5 rounded-full mb-6">
              <span className="text-sm font-semibold text-indigo-700 uppercase tracking-wide">Event Platform</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-slate-900 to-indigo-900 bg-clip-text text-transparent mb-4">
              About Eventz
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-8 leading-relaxed">
              Complete solution for event discovery and management
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-sm mx-auto">
              <a href="/" className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-xl text-center hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl">
                Browse Events
              </a>
            </div>
          </div>

          {/* Platform Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20">
            <PlatformStats stat="10K+" label="Events Hosted" icon="★" />
            <PlatformStats stat="50K+" label="Active Users" icon="👥" />
            <PlatformStats stat="98%" label="Success Rate" icon="★" />
            <PlatformStats stat="24/7" label="Support" icon="⚙️" />
          </div>

          <div className="grid lg:grid-cols-3 gap-8 mb-20">
            
            {/* Left */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Mission */}
              <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-lg transition-all">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0 mt-1">01</div>
                  <div>
                    <h2 className="text-3xl font-bold text-slate-900 mb-3">Our Mission</h2>
                    <p className="text-lg text-slate-600">Empowering event organizers and attendees with seamless discovery and management tools.</p>
                  </div>
                </div>
              </div>

              {/* Core Features */}
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-8">What We Offer</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <FeatureCard 
                    icon="🎫" 
                    title="Smart Ticketing" 
                    description="Seamless ticket sales with QR codes, refunds, and real-time analytics" 
                  />
                  <FeatureCard 
                    icon="📱" 
                    title="Mobile-First" 
                    description="Native apps for iOS & Android with push notifications and live updates" 
                  />
                  <FeatureCard 
                    icon="📊" 
                    title="Analytics Dashboard" 
                    description="Real-time attendee insights, revenue tracking, and engagement metrics" 
                  />
                  <FeatureCard 
                    icon="🔒" 
                    title="Secure Payments" 
                    description="PCI compliant with multiple payment gateways and fraud protection" 
                  />
                </div>
              </div>

              {/* Timeline */}
              <div className="space-y-3">
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Our Journey</h3>
                <TimelineItem date="2024" title="Launch" description="Core platform launched" />
                <TimelineItem date="2025" title="Growth" description="Added pro organizer tools" />
                <TimelineItem date="2026" title="Scale" description="Serving 50K+ users globally" />
              </div>

            </div>

            {/* Right */}
            <div className="space-y-6 lg:sticky lg:top-20">
              
              {/* Stats */}
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl p-6 border border-indigo-200/30 shadow-sm">
                <h4 className="font-bold text-slate-900 mb-6 uppercase tracking-wide text-sm">Key Stats</h4>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-black text-indigo-600 mb-1">10K+</div>
                    <div className="text-xs text-slate-600 uppercase tracking-wider">Events</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-black text-purple-600 mb-1">50K+</div>
                    <div className="text-xs text-slate-600 uppercase tracking-wider">Attendees</div>
                  </div>
                </div>
              </div>

              {/* Testimonials */}
              <div>
                <h4 className="font-bold text-slate-900 mb-4 uppercase tracking-wide text-sm">Trusted By</h4>
                <div className="space-y-3">
                  <TestimonialCard quote="Transformed our events" author="Sarah C." role="Event Director" />
                  <TestimonialCard quote="Perfect management tools" author="Mike P." role="CEO" />
                </div>
              </div>

            </div>

          </div>

          {/* Value Propositions */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-slate-900 text-center mb-16">Why Choose Eventz?</h2>
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <ValueProp 
                number="1" 
                title="Simple Setup" 
                description="Create events in minutes with our intuitive drag-and-drop builder. No coding required." 
              />
              <ValueProp 
                number="2" 
                title="Real-Time Insights" 
                description="Monitor attendance, revenue, and engagement with live dashboards that update instantly." 
              />
              <ValueProp 
                number="3" 
                title="Global Reach" 
                description="Connect with attendees worldwide through multi-language support and timezone awareness." 
              />
            </div>
          </div>

          {/* Partners */}
          <div className="mb-20">
            <h3 className="text-2xl font-bold text-slate-900 text-center mb-12">Featured Partners</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 max-w-4xl mx-auto">
              <PartnerLogo name="Stripe" />
              <PartnerLogo name="Twilio" />
              <PartnerLogo name="Google" />
              <PartnerLogo name="Zoom" />
              <PartnerLogo name="Resend" />
            </div>
          </div>

          {/* Process */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-slate-900 text-center mb-16">How It Works</h2>
            <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
              <ProcessStep 
                step={1} 
                icon="1" 
                title="Create Event" 
                description="Set up your event with all details in 5 minutes" 
              />
              <ProcessStep 
                step={2} 
                icon="2" 
                title="Promote" 
                description="Share on social media and email with one click" 
              />
              <ProcessStep 
                step={3} 
                icon="3" 
                title="Manage Live" 
                description="Real-time check-in, notifications, and analytics" 
              />
              <ProcessStep 
                step={4} 
                icon="4" 
                title="Analyze Results" 
                description="Get comprehensive reports and attendee feedback" 
              />
            </div>
          </div>

          {/* Team */}
          <div>
            <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">Our Team</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-w-4xl mx-auto">
              <TeamCard name="Priya S." role="Founder" />
              <TeamCard name="Rahul K." role="CTO" />
              <TeamCard name="Anita R." role="Design" />
              <TeamCard name="Vikram M." role="Dev" />
              <TeamCard name="Sneha P." role="Support" />
            </div>
          </div>

        </div>
      </div>
    </PublicLayout>
  );
}
