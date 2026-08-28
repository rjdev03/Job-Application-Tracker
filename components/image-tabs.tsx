"use client";

import { useState } from 'react';
import Image from 'next/image';
import { LayoutGrid, Target, Kanban } from 'lucide-react';

export default function ImageTabs() {
  const [activeTab, setActiveTab] = useState("organize");
  
  const tabs = [
    { id: "organize", label: "Organize Applications", icon: LayoutGrid, image: "/hero-images/hero1.png" },
    { id: "hired", label: "Get Hired Faster", icon: Target, image: "/hero-images/hero2.png" },
    { id: "boards", label: "Visual Kanban Boards", icon: Kanban, image: "/hero-images/hero3.png" },
  ];
  
  return (
    <section className="py-8 sm:py-16">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-5xl">
          {/* Segmented Tab Controls */}
            <div className="flex justify-start sm:justify-center overflow-x-auto pb-4 sm:pb-0 mb-8 max-w-full">
              <div className="inline-flex items-center gap-1 rounded-xl bg-gray-100/80 p-1.5 border border-gray-200/60 shadow-inner">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 rounded-lg px-3.5 sm:px-5 py-2 text-xs sm:text-sm font-medium transition-all whitespace-nowrap shrink-0 ${
                        isActive
                          ? "bg-white text-gray-900 shadow-sm"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-200/50"
                      }`}>
                      <Icon className={`h-4 w-4 ${isActive ? "text-primary" : "text-gray-500"}`} />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

              {/* Browser Window Frame */}
              <div className="relative mx-auto overflow-hidden rounded-xl border border-gray-200/80 bg-gray-900/5 shadow-2xl backdrop-blur">
                {/* Window Header */}
                <div className="flex items-center gap-2 border-b border-gray-200/80 bg-gray-50 px-4 py-3">
                  <div className="flex gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-rose-400" />
                    <div className="h-3 w-3 rounded-full bg-amber-400" />
                    <div className="h-3 w-3 rounded-full bg-emerald-400" />
                  </div>
                  <div className="mx-auto hidden sm:block rounded-md bg-gray-200/60 px-3 py-0.5 text-[11px] font-medium text-gray-500">
                    job-application-tracker.app
                  </div>
                </div>

                {/* Tab Images */}
                <div className="bg-white">
                  {tabs.map((tab) => (
                    tab.id === activeTab && (
                      <Image 
                        key={tab.id}
                        src={tab.image} 
                        alt={tab.label}
                        width={1200}
                        height={800}
                        priority
                        className="w-full h-auto object-cover transition-opacity duration-300"
                      />
                    )
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
    );
}