"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from '@/components/ui/label';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";
import { signUp } from "@/lib/auth/auth-client";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

export default function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signUp.email({
        name,
        email,
        password,
      });
      if (result.error) {
        setError(result.error.message ?? "Failed to sign up");
        toast.error(result.error.message ?? "Failed to sign up");
      } else {
        toast.success("Account created successfully!");
        router.push("/dashboard");
      }
    } catch (err) {
      setError(`An unexpected error has occurred: ${err}`);
    } finally {
      setLoading(false);
    }
  }
  
  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-50/60 px-4 py-8 sm:px-6">
      {/* Background Gradient Accent */}
      <div className="absolute top-1/4 left-1/2 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/5 blur-3xl pointer-events-none" />

      <Card className="w-full max-w-md border-gray-200/80 bg-white shadow-xl shadow-gray-200/50">
        <CardHeader className="space-y-3 text-center sm:text-left pt-8 px-6 sm:px-8">
          <div>
            <CardTitle className="text-2xl font-bold tracking-tight text-gray-900">
              Create an account
            </CardTitle>
            <CardDescription className="text-sm text-gray-600 mt-1">
              Start tracking and organizing your job applications today
            </CardDescription>
          </div>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 px-6 sm:px-8">
            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3.5 text-xs sm:text-sm text-destructive font-medium">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-gray-700">
                Full Name
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-11 border-gray-200 text-sm focus-visible:ring-primary/20 focus-visible:border-none transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-gray-700">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 border-gray-200 text-sm focus-visible:ring-primary/20 focus-visible:border-none transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-gray-700">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="New password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="h-11 border-gray-200 text-sm focus-visible:ring-primary/20 focus-visible:border-none transition-all"
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 pb-8 px-6 sm:px-8 pt-2">
            <Button
              type="submit"
              className="mt-2 h-11 w-full bg-primary hover:bg-primary/90 text-sm font-semibold transition-all"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Creating account...
                </span>
              ) : (
                "Sign Up"
              )}
            </Button>
            <p className="text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                href="/sign-in"
                className="font-semibold text-primary hover:underline transition-all"
              >
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}