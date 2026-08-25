'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useExchangeStore } from "@/lib/store/exchange-store";

export default function LoginPage() {
  const router = useRouter();
  const {
    colleges,
    onboardingSkills,
    login,
    signup,
  } = useExchangeStore();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [step, setStep] = useState<"credentials" | "skills" | "complete">("credentials");

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
    login(email, collegeId);
    router.push("/");
  };

  const handleSignupCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("skills");
  };

  const handleSignupComplete = () => {
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
                onClick={() => setMode("login")}
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
                onClick={() => setMode("signup")}
                className={`flex-1 py-2 text-xs transition-colors cursor-pointer ${
                  mode === "signup"
                    ? "border-b-2 border-white text-[#F5F5F5] font-semibold"
                    : "text-[#8B8F96] hover:text-[#F5F5F5]"
                }`}
              >
                Create Account
              </button>
            </div>

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
                    <span>Continue to {currentCollegeName}</span>
                    <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </Button>
                </div>

                <div className="pt-3 border-t border-white/10 text-center">
                  <span className="text-[11px] text-[#5F636A]">
                    Quick demo? Default set to Alex Morgan at SRM Institute of Science and Technology.
                  </span>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSignupCredentialsSubmit} className="space-y-4">
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
                      Year
                    </label>
                    <select
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      className="w-full rounded-md border border-white/10 bg-[#111315] px-3 py-2 text-xs text-[#F5F5F5] focus:outline-none focus:border-white/30"
                    >
                      <option value="Freshman">Freshman</option>
                      <option value="Sophomore">Sophomore</option>
                      <option value="Junior">Junior</option>
                      <option value="Senior">Senior</option>
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
                  <Button type="submit" className="w-full text-xs font-semibold h-9 bg-[#F5F5F5] text-[#08090A] hover:bg-white">
                    <span>Next: Select Your Skills</span>
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
              <div className="text-xs text-[#8B8F96]">
                Capability Profile
              </div>
              <h2 className="text-base font-bold text-[#F5F5F5]">
                What can you help other students with?
              </h2>
              <p className="text-xs text-[#8B8F96]">
                Select 1–5 skills you can offer or tutor. This establishes your initial campus capability profile.
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
              <span>{selectedSkills.length} of 5 selected</span>
              <button
                type="button"
                onClick={() => setStep("credentials")}
                className="hover:text-[#F5F5F5] hover:underline"
              >
                Back
              </button>
            </div>

            <Button
              type="button"
              onClick={handleSignupComplete}
              disabled={selectedSkills.length === 0}
              className="w-full text-xs font-semibold h-9 bg-[#F5F5F5] text-[#08090A] hover:bg-white"
            >
              <span>Complete Profile</span>
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
                Your account is scoped to {currentCollegeName}.
              </p>
            </div>

            <div className="rounded-md bg-[#111315] border border-white/10 p-4 text-left space-y-2 text-xs">
              <div className="flex justify-between text-[#8B8F96]">
                <span>Campus</span>
                <span className="text-[#F5F5F5] font-semibold">{currentCollegeName}</span>
              </div>

              <div className="pt-1 border-t border-white/10">
                <span className="text-xs text-[#8B8F96] block mb-1">
                  Can offer:
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
              className="w-full text-xs font-semibold h-9 bg-[#F5F5F5] text-[#08090A] hover:bg-white"
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
