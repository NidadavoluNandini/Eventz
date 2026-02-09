import React from "react";
import PublicLayout from "../layouts/PublicLayout";

export default function AboutUs() {
  return (
    <PublicLayout>
      <div className="bg-animated bg-gradient-to-br from-indigo-50 via-white to-slate-50">
        <div className="max-w-6xl mx-auto px-6 py-16 space-y-20">

          {/* ================= HERO ================= */}
          <section className="space-y-4">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
              About <span className="text-indigo-600">Eventz</span>
            </h1>
            <p className="text-slate-600 max-w-3xl">
              Eventz is a professional event management and discovery platform
              designed to simplify how events are created, managed, and experienced.
            </p>
          </section>

          {/* ================= MISSION & VISION ================= */}
          <section className="grid md:grid-cols-2 gap-10">
            <div className="space-y-3">
              <h2 className="text-xl font-semibold text-slate-900">
                Our Mission
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed">
                Our mission is to eliminate complexity in event management by
                providing reliable, easy-to-use tools that help organizers focus
                on delivering meaningful experiences.
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="text-xl font-semibold text-slate-900">
                Our Vision
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed">
                We envision a unified global platform where events of all sizes
                can be planned, executed, and analyzed with clarity and confidence.
              </p>
            </div>
          </section>

          {/* ================= WHY EVENTZ EXISTS ================= */}
          <section className="space-y-8">
            <h2 className="text-xl font-semibold text-slate-900">
              Why Eventz Exists
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 border border-slate-200 rounded-xl bg-white/90
                              transition hover:shadow-md hover:-translate-y-1">
                <h3 className="font-semibold text-indigo-600 mb-2">
                  The Challenge
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Event organizers often rely on disconnected tools, manual
                  processes, and limited reporting, which increases operational
                  overhead.
                </p>
              </div>

              <div className="p-6 border border-slate-200 rounded-xl bg-white/90
                              transition hover:shadow-md hover:-translate-y-1">
                <h3 className="font-semibold text-indigo-600 mb-2">
                  Our Solution
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Eventz brings event creation, ticketing, attendee management,
                  and analytics into one unified platform.
                </p>
              </div>
            </div>
          </section>

          {/* ================= PLATFORM IMPACT ================= */}
          <section className="space-y-8">
            <h2 className="text-xl font-semibold text-slate-900">
              Platform Impact
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { stat: "10K+", label: "Events" },
                { stat: "50K+", label: "Users" },
                { stat: "98%", label: "Success" },
                { stat: "24/7", label: "Support" },
              ].map((item, i) => (
                <div
                  key={i}
                  className="p-5 border border-slate-200 rounded-xl text-center
                             bg-white/80 transition hover:bg-white hover:shadow-sm"
                >
                  <div className="text-xl font-bold text-indigo-600">
                    {item.stat}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* ================= CLOSING ================= */}
          <section className="max-w-3xl space-y-3">
            <h2 className="text-xl font-semibold text-slate-900">
              Built for Organizers. Trusted by Communities.
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Eventz evolves with a strong focus on usability, performance, and
              long-term value—supporting the entire event lifecycle.
            </p>
          </section>

        </div>
      </div>
    </PublicLayout>
  );
}
