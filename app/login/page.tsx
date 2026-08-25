'use client';

import { useState, useTransition, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Check, AlertCircle, Sparkles, Building2, UserCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useExchangeStore } from "@/lib/store/exchange-store";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = searchParams.get("mode") === "signup" ? "signup" : "login";

  const {
    users,
    colleges,
    onboardingSkills,
    login,
    signup,
    switchUser,
  } = useExchangeStore();

  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [step, setStep] = useState<"credentials" | "skills" | "complete">("credentials");
  const [loginError, setLoginError] = useState<string | null>(null);

  // Form Fields
  const [email, setEmail] = useState("alex.m@srmist.edu.in");
  const [name, setName] = useState("Alex Morgan");
  const [collegeId, setCollegeId] = useState(colleges[0]?.id || "college-srm");
  const [course, setCourse] = useState("Computer Science & Engineering");
  const [year, setYear] = useState("Junior");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([
    "Python",
    "Figma",
    "Calculus",
  ]);

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== skill));
    } else {
      if (selectedSkills.length < 5) {
        setSelectedSkills([...selectedSkills, skill]);
      }
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const user = login(email, collegeId);

    if (user) {
      // If user exists and profile is complete, navigate directly to Discover
      if (user.selectedSkills && user.selectedSkills.length > 0 && user.year) {
        router.push("/");
      } else {
        // Incomplete profile: guide to skill selection
        setName(user.name);
        setCourse(user.course || "General Studies");
        setYear(user.year || "Junior");
        setSelectedSkills(user.selectedSkills || []);
        setStep("skills");
      }
    } else {
      // Genuinely new user: do not auto-provision generic account; redirect to Sign Up onboarding
      setLoginError(
        `No account found for "${email}" at ${
          colleges.find((c) => c.id === collegeId)?.name || "your college"
        }. Let's create your campus profile!`
      );
      setName(
        email
          .split("@")[0]
          .split(".")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ")
      );
      setMode("signup");
      setStep("credentials");
    }
  };

  const handleSignupCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setStep("skills");
  };

  const handleSignupComplete = () => {
    if (selectedSkills.length === 0) return;
    signup({
      email,
      name,
      collegeId,
      course,
      year,
      selectedSkills,
    });
    setStep("complete");
  };

  const handleStartExploring = () => {
    router.push("/");
  };

  const handleQuickDemoSelect = (demoUserId: string) => {
    const demoUser = users.find((u) => u.id === demoUserId);
    if (demoUser) {
      switchUser(demoUserId);
      router.push("/");
    }
  };

  const currentCollegeName =
    colleges.find((c) => c.id === collegeId)?.name || "Your College";

  return (
    <div className="container mx-auto max-w-md px-5 py-12 sm:py-16 space-y-8">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <Link href="/" className="inline-flex items-center space-x-2">
          <div className="flex h-7 w-7 items-center justify-center rounded bg-[#111315] border border-white/10 text-[#F5F5F5]">
            <span className="text-xs font-bold">↔</span>
          </div>
          <span className="font-bold text-base text-[#F5F5F5] tracking-tight">
            RExchange
          </span>
        </Link>
        <p className="text-xs text-[#8B8F96]">
          Your college exchange network for skills, gear, and opportunities.
        </p>
      </div>

      {/* Main Form Container */}
      <div className="rounded-lg border border-white/10 bg-[#0D0F11] p-6 space-y-6">
        {/* Step 1: Login / Credentials */}
        {step === "credentials" && (
          <div className="space-y-5">
            {/* Mode Switcher */}
            <div className="flex border-b border-white/10 text-xs">
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setLoginError(null);
                }}
                className={`flex-1 py-2 text-xs transition-colors cursor-pointer ${
                  mode === "login"
                    ? "border-b-2 border-white text-[#F5F5F5] font-semibold"
                    : "text-[#8B8F96] hover:text-[#F5F5F5]"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setLoginError(null);
                }}
                className={`flex-1 py-2 text-xs transition-colors cursor-pointer ${
                  mode === "signup"
                    ? "border-b-2 border-white text-[#F5F5F5] font-semibold"
                    : "text-[#8B8F96] hover:text-[#F5F5F5]"
                }`}
              >
                Sign Up
              </button>
            </div>

            {loginError && (
              <div className="rounded-md border border-[#A78BFA]/30 bg-[#111315] p-3 text-xs text-[#A78BFA] flex items-start space-x-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{loginError}</span>
              </div>
            )}

            {mode === "login" ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-[#8B8F96]">
                    College Campus
                  </label>
                  <select
                    value={collegeId}
                    onChange={(e) => setCollegeId(e.target.value)}
                    className="w-full rounded-md border border-white/10 bg-[#111315] px-3 py-2 text-xs text-[#F5F5F5] focus:outline-none focus:border-white/30"
                  >
                    {colleges.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-[#8B8F96]">
                    Campus Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@campus.edu"
                    className="w-full rounded-md border border-white/10 bg-[#111315] px-3 py-2 text-xs text-[#F5F5F5] placeholder:text-[#5F636A] focus:outline-none focus:border-white/30"
                  />
                </div>

                <div className="pt-2">
                  <Button type="submit" className="w-full text-xs font-semibold h-9 bg-[#F5F5F5] text-[#08090A] hover:bg-white">
                    <span>Sign In to {currentCollegeName}</span>
                    <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </Button>
                </div>

                {/* Demo Quick Selectors */}
                <div className="pt-4 border-t border-white/10 space-y-2">
                  <div className="text-[11px] font-semibold text-[#8B8F96] uppercase tracking-wider">
                    Quick Demo Profiles
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => handleQuickDemoSelect("user_alex")}
                      className="p-2 rounded bg-[#111315] border border-white/10 text-left hover:border-white/20 transition-all cursor-pointer"
                    >
                      <div className="font-semibold text-[#F5F5F5] truncate">Alex Morgan</div>
                      <div className="text-[10px] text-[#8B8F96]">Junior • SRM</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickDemoSelect("user_sarah")}
                      className="p-2 rounded bg-[#111315] border border-white/10 text-left hover:border-white/20 transition-all cursor-pointer"
                    >
                      <div className="font-semibold text-[#F5F5F5] truncate">Sarah Khan</div>
                      <div className="text-[10px] text-[#8B8F96]">Sophomore • SRM</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickDemoSelect("user_priya")}
                      className="p-2 rounded bg-[#111315] border border-white/10 text-left hover:border-white/20 transition-all cursor-pointer"
                    >
                      <div className="font-semibold text-[#F5F5F5] truncate">Priya Sharma</div>
                      <div className="text-[10px] text-[#8B8F96]">Sophomore • SRM</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickDemoSelect("user_vikram")}
                      className="p-2 rounded bg-[#111315] border border-white/10 text-left hover:border-white/20 transition-all cursor-pointer"
                    >
                      <div className="font-semibold text-[#F5F5F5] truncate">Vikram Reddy</div>
                      <div className="text-[10px] text-[#8B8F96]">Junior • VIT Chennai</div>
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSignupCredentialsSubmit} className="space-y-4">
                <div className="space-y-1">
                  <h2 className="text-sm font-bold text-[#F5F5F5]">
                    Join your campus exchange.
                  </h2>
                  <p className="text-xs text-[#8B8F96]">
                    Create your profile so RExchange can find exchanges that actually fit you.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-[#8B8F96]">
                    Your College
                  </label>
                  <select
                    value={collegeId}
                    onChange={(e) => setCollegeId(e.target.value)}
                    className="w-full rounded-md border border-white/10 bg-[#111315] px-3 py-2 text-xs text-[#F5F5F5] focus:outline-none focus:border-white/30"
                  >
                    {colleges.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-[#8B8F96]">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Jordan Smith"
                    className="w-full rounded-md border border-white/10 bg-[#111315] px-3 py-2 text-xs text-[#F5F5F5] placeholder:text-[#5F636A] focus:outline-none focus:border-white/30"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs text-[#8B8F96]">
                      Major / Course
                    </label>
                    <input
                      type="text"
                      required
                      value={course}
                      onChange={(e) => setCourse(e.target.value)}
                      placeholder="e.g. Data Science"
                      className="w-full rounded-md border border-white/10 bg-[#111315] px-3 py-2 text-xs text-[#F5F5F5] placeholder:text-[#5F636A] focus:outline-none focus:border-white/30"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-[#8B8F96]">
                      Academic Year
                    </label>
                    <select
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      className="w-full rounded-md border border-white/10 bg-[#111315] px-3 py-2 text-xs text-[#F5F5F5] focus:outline-none focus:border-white/30"
                    >
                      <option value="Freshman">Freshman (1st year)</option>
                      <option value="Sophomore">Sophomore (2nd year)</option>
                      <option value="Junior">Junior (3rd year)</option>
                      <option value="Senior">Senior (4th year)</option>
                      <option value="Graduate">Graduate</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-[#8B8F96]">
                    Campus Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@campus.edu"
                    className="w-full rounded-md border border-white/10 bg-[#111315] px-3 py-2 text-xs text-[#F5F5F5] placeholder:text-[#5F636A] focus:outline-none focus:border-white/30"
                  />
                </div>

                <div className="pt-2">
                  <Button type="submit" className="w-full text-xs font-semibold h-9 bg-[#F5F5F5] text-[#08090A] hover:bg-white cursor-pointer">
                    <span>Next: Select Capabilities</span>
                    <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </Button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Step 2: Skill Selection Onboarding */}
        {step === "skills" && (
          <div className="space-y-5">
            <div className="space-y-1">
              <div className="text-xs font-semibold text-[#8B8F96] uppercase tracking-wider">
                Your Capabilities
              </div>
              <h2 className="text-base font-bold text-[#F5F5F5]">
                Select a few things you can offer other students.
              </h2>
              <p className="text-xs text-[#8B8F96]">
                These capabilities establish your initial campus profile and allow Make Me Matchable to discover reciprocal exchange opportunities for you.
              </p>
            </div>

            {/* Skill Selector Grid */}
            <div className="flex flex-wrap gap-2 pt-2">
              {onboardingSkills.map((skill) => {
                const isSelected = selectedSkills.includes(skill);
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#F5F5F5] text-[#08090A] font-semibold"
                        : "bg-[#111315] text-[#8B8F96] border border-white/10 hover:text-[#F5F5F5] hover:border-white/20"
                    }`}
                  >
                    {isSelected && <Check className="h-3 w-3 text-[#08090A]" />}
                    <span>{skill}</span>
                  </button>
                );
              })}
            </div>

            <div className="pt-2 flex items-center justify-between text-xs text-[#8B8F96]">
              <span>{selectedSkills.length} of 5 selected (minimum 1 required)</span>
              <button
                type="button"
                onClick={() => setStep("credentials")}
                className="hover:text-[#F5F5F5] hover:underline cursor-pointer"
              >
                Back
              </button>
            </div>

            <Button
              type="button"
              onClick={handleSignupComplete}
              disabled={selectedSkills.length === 0}
              className="w-full text-xs font-semibold h-9 bg-[#F5F5F5] text-[#08090A] hover:bg-white cursor-pointer"
            >
              <span>Complete Profile &amp; Enter Campus</span>
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </div>
        )}

        {/* Step 3: Profile Completion Summary */}
        {step === "complete" && (
          <div className="space-y-5 text-center py-2">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#111315] border border-[#22C55E] text-[#22C55E]">
              <Check className="h-5 w-5" />
            </div>

            <div className="space-y-1">
              <h2 className="text-base font-bold text-[#F5F5F5]">You&apos;re ready.</h2>
              <p className="text-xs text-[#8B8F96]">
                Your account is verified and scoped to {currentCollegeName}.
              </p>
            </div>

            <div className="rounded-md bg-[#111315] border border-white/10 p-4 text-left space-y-2 text-xs">
              <div className="flex justify-between text-[#8B8F96]">
                <span>Student</span>
                <span className="text-[#F5F5F5] font-semibold">{name} ({year})</span>
              </div>
              <div className="flex justify-between text-[#8B8F96]">
                <span>Campus</span>
                <span className="text-[#F5F5F5] font-semibold">{currentCollegeName}</span>
              </div>

              <div className="pt-1 border-t border-white/10">
                <span className="text-xs text-[#8B8F96] block mb-1">
                  Active Capabilities:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedSkills.map((s) => (
                    <span
                      key={s}
                      className="px-2 py-0.5 rounded bg-[#0D0F11] border border-white/10 text-xs text-[#F5F5F5]"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <Button
              type="button"
              onClick={handleStartExploring}
              className="w-full text-xs font-semibold h-9 bg-[#F5F5F5] text-[#08090A] hover:bg-white cursor-pointer"
            >
              <span>Start Exploring {currentCollegeName}</span>
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto max-w-md px-5 py-16 text-center">
          <Loader2 className="h-5 w-5 text-[#F5F5F5] animate-spin mx-auto" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
