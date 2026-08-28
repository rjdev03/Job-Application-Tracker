import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Briefcase, TrendingUp, CheckCircle2, Sparkles, ShieldCheck, Zap } from 'lucide-react';
import ImageTabs from "@/components/image-tabs";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 sm:py-24 md:py-32">
          {/* Subtle Ambient Background Gradients */}
          <div className="absolute top-0 left-1/2 -z-10 h-100 w-150 -translate-x-1/2 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
          
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center">
              {/* Product Badge */}
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3.5 py-1.5 text-xs sm:text-sm font-medium text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                <span>The modern job search dashboard</span>
              </div>

              {/* Main Headline */}
              <h1 className="mb-6 text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-gray-900 leading-[1.15]">
                A better way to track your <span className="text-primary">job applications.</span>
              </h1>

              {/* Subtitle */}
              <p className="mb-8 sm:mb-10 text-base sm:text-lg md:text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
                Capture, organize, and manage your job applications in one centralized workspace. Say goodbye to messy spreadsheets.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
                <Link href="/sign-up">
                  <Button size="lg" className="h-12 px-5 text-base font-semibold transition-all">
                    <span className='mb-0.5'>Start for free</span> 
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center justify-center gap-6 text-xs sm:text-sm text-gray-500 font-medium">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" /> Free Forever
                </span>
                <span className="flex items-center gap-1.5">
                  <Zap className="h-4 w-4 text-amber-500" /> 2-Minute Setup
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Hero Demo Showcase */}
        <ImageTabs />

        {/* Feature Cards Section */}
        <section className="border-t border-gray-100 bg-gray-50/50 py-16 sm:py-24">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="mx-auto max-w-3xl text-center mb-12 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mb-3">
                Everything you need to land your next role
              </h2>
              <p className="text-gray-600 text-sm sm:text-base">
                Streamline your workflow with tools designed specifically for job seekers.
              </p>
            </div>

            <div className="grid gap-6 sm:gap-8 md:grid-cols-3 max-w-6xl mx-auto">
              <div className="rounded-xl border border-gray-200/80 bg-white p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow">
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Briefcase className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-gray-900">
                  Organize Applications
                </h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  Create custom boards and columns to track your applications dynamically at every stage.
                </p>
              </div>

              <div className="rounded-xl border border-gray-200/80 bg-white p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow">
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-gray-900">
                  Track Progress
                </h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  Monitor statuses from applied to interview to offer with clear visual status indicators.
                </p>
              </div>

              <div className="rounded-xl border border-gray-200/80 bg-white p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow">
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-gray-900">
                  Centralized Info
                </h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  Keep job descriptions, contact emails, and interview notes linked in one single view.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}