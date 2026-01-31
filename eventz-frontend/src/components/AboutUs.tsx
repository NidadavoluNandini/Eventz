import React from "react";
import PublicLayout from "../layouts/PublicLayout";

/* =======================
   TYPES
======================= */

interface TimelineItemProps {
  date: string;
  title: string;
  description: string;
}

interface TestimonialCardProps {
  quote: string;
  author: string;
  role: string;
}

interface TeamCardProps {
  name: string;
  role: string;
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface PlatformStatsProps {
  stat: string;
  label: string;
  icon: React.ReactNode;
}

interface ValuePropProps {
  number: string;
  title: string;
  description: string;
}

interface ProcessStepProps {
  step: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}

/* =======================
   SMALL COMPONENTS
======================= */

const TimelineItem: React.FC<TimelineItemProps> = ({ date, title, description }) => (
  <div className="flex gap-4 p-4 rounded-2xl border border-slate-200">
    <div className="w-2 h-2 bg-indigo-500 rounded-full mt-3" />
    <div>
      <div className="text-xs font-semibold text-indigo-600 uppercase">{date}</div>
      <h4 className="font-bold text-slate-900 text-sm">{title}</h4>
      <p className="text-slate-600 text-xs">{description}</p>
    </div>
  </div>
);

const TestimonialCard: React.FC<TestimonialCardProps> = ({ quote, author, role }) => (
  <div className="rounded-2xl p-6 border border-slate-200 bg-slate-50">
    <p className="italic text-sm mb-4">"{quote}"</p>
    <div>
      <div className="font-semibold">{author}</div>
      <div className="text-xs text-slate-500">{role}</div>
    </div>
  </div>
);

const TeamCard: React.FC<TeamCardProps> = ({ name, role }) => (
  <div className="rounded-2xl p-4 border border-slate-200 bg-white text-center">
    <h4 className="font-bold text-sm">{name}</h4>
    <p className="text-xs text-slate-500">{role}</p>
  </div>
);

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => (
  <div className="rounded-2xl p-6 border border-slate-200 bg-white">
    <div className="text-2xl mb-3">{icon}</div>
    <h4 className="font-bold mb-2">{title}</h4>
    <p className="text-sm text-slate-600">{description}</p>
  </div>
);

const PlatformStats: React.FC<PlatformStatsProps> = ({ stat, label, icon }) => (
  <div className="text-center p-6 rounded-2xl bg-indigo-50">
    <div className="text-3xl">{icon}</div>
    <div className="text-2xl font-bold">{stat}</div>
    <div className="text-xs text-slate-500">{label}</div>
  </div>
);

const ValueProp: React.FC<ValuePropProps> = ({ number, title, description }) => (
  <div className="p-6 rounded-2xl border border-slate-200">
    <div className="text-xl font-black text-indigo-600 mb-2">{number}</div>
    <h4 className="font-bold mb-2">{title}</h4>
    <p className="text-sm text-slate-600">{description}</p>
  </div>
);

const ProcessStep: React.FC<ProcessStepProps> = ({ icon, title, description }) => (
  <div className="p-6 rounded-2xl border border-slate-200 text-center">
    <div className="text-2xl mb-2">{icon}</div>
    <h4 className="font-bold mb-2">{title}</h4>
    <p className="text-sm text-slate-600">{description}</p>
  </div>
);

/* =======================
   PAGE
======================= */

export default function AboutUs() {
  return (
    <PublicLayout>
      <div className="max-w-6xl mx-auto px-6 py-16 space-y-20">
        {/* HERO */}
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">About Eventz</h1>
          <p className="text-slate-600">Complete solution for event discovery and management</p>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <PlatformStats stat="10K+" label="Events" icon="🎫" />
          <PlatformStats stat="50K+" label="Users" icon="👥" />
          <PlatformStats stat="98%" label="Success" icon="⭐" />
          <PlatformStats stat="24/7" label="Support" icon="⚙️" />
        </div>

        {/* FEATURES */}
        <div className="grid md:grid-cols-2 gap-6">
          <FeatureCard icon="🎟️" title="Smart Ticketing" description="Sell tickets easily" />
          <FeatureCard icon="📊" title="Analytics" description="Track everything live" />
        </div>

        {/* TIMELINE */}
        <div className="space-y-3">
          <TimelineItem date="2024" title="Launch" description="Platform launched" />
          <TimelineItem date="2025" title="Growth" description="Pro tools added" />
        </div>

        {/* PROCESS */}
        <div className="grid md:grid-cols-4 gap-4">
          <ProcessStep step={1} icon="1️⃣" title="Create" description="Create event" />
          <ProcessStep step={2} icon="2️⃣" title="Promote" description="Share event" />
          <ProcessStep step={3} icon="3️⃣" title="Manage" description="Live manage" />
          <ProcessStep step={4} icon="4️⃣" title="Analyze" description="Get reports" />
        </div>

        {/* TEAM */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <TeamCard name="Priya" role="Founder" />
          <TeamCard name="Rahul" role="CTO" />
          <TeamCard name="Anita" role="Design" />
          <TeamCard name="Vikram" role="Dev" />
        </div>

        {/* TESTIMONIALS */}
        <div className="grid md:grid-cols-2 gap-4">
          <TestimonialCard quote="Amazing platform" author="Sarah" role="Organizer" />
          <TestimonialCard quote="Loved it" author="Mike" role="CEO" />
        </div>

        {/* VALUE */}
        <div className="grid md:grid-cols-3 gap-4">
          <ValueProp number="1" title="Easy" description="Easy setup" />
          <ValueProp number="2" title="Fast" description="Fast management" />
          <ValueProp number="3" title="Global" description="Worldwide reach" />
        </div>
      </div>
    </PublicLayout>
  );
}
