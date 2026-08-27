"use client";

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

export default function ImageTabs() {
    const [activeTab, setActiveTab] = useState("organize");

    return (
        <section className="border-t py-10 sm:py-16">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-6xl">
              {/* Tabs */}
              <div className="flex gap-2 justify-start sm:justify-center overflow-x-auto pb-2 sm:pb-0 mb-6 sm:mb-8 max-w-full">
                <Button 
                  onClick={() => setActiveTab("organize")}
                  className={`rounded-lg px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${activeTab === "organize" ? "bg-primary" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                >
                  Organize Applications
                </Button>
                <Button 
                  onClick={() => setActiveTab("hired")}
                  className={`rounded-lg px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${activeTab === "hired" ? "bg-primary" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                >
                  Get Hired
                </Button>
                <Button 
                  onClick={() => setActiveTab("boards")}
                  className={`rounded-lg px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${activeTab === "boards" ? "bg-primary" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                >
                  Manage Boards
                </Button>
              </div>

              {/* Responsive Image Frame */}
              <div className="relative mx-auto max-w-5xl overflow-hidden rounded-lg border border-gray-200 shadow-xl">
                {activeTab === "organize" && (
                  <Image 
                    src='/hero-images/hero1.png' 
                    alt='Organize Applications'
                    width={1200}
                    height={800}
                    className="w-full h-auto object-cover"
                  />
                )}
                
                {activeTab === "hired" && (
                  <Image 
                    src='/hero-images/hero2.png' 
                    alt='Get Hired'
                    width={1200}
                    height={800}
                    className="w-full h-auto object-cover"
                  />
                )}
                
                {activeTab === "boards" && (
                  <Image 
                    src='/hero-images/hero3.png' 
                    alt='Manage Boards'
                    width={1200}
                    height={800}
                    className="w-full h-auto object-cover"
                  />
                )}
              </div>
            </div>
          </div>
        </section>
    );
}