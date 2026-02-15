"use client";

import { useState, useEffect } from "react";
import { X, Sparkles, User, Mail } from "lucide-react";
import { useUserStore } from "@/stores/user-store";

/**
 * Welcome Modal — First-visit authentication gate.
 * WHY: Assignment requires simple auth (name + email).
 * Shows on first visit when no user profile exists.
 * Can be dismissed but will show again next visit
 * unless the form is submitted.
 */
export function WelcomeModal() {
  const user = useUserStore((s) => s.user);
  const hasSeenWelcome = useUserStore((s) => s.hasSeenWelcome);
  const setUser = useUserStore((s) => s.setUser);
  const markWelcomeSeen = useUserStore((s) => s.markWelcomeSeen);

  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});

  // Show modal on mount if user hasn't authenticated
  useEffect(() => {
    if (!user && !hasSeenWelcome) {
      // Small delay so it feels intentional, not jarring
      const timer = setTimeout(() => setIsOpen(true), 500);
      return () => clearTimeout(timer);
    }
  }, [user, hasSeenWelcome]);

  const validate = () => {
    const newErrors: { name?: string; email?: string } = {};
    if (!name.trim()) newErrors.name = "Name is required";
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Enter a valid email";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setUser({ name: name.trim(), email: email.trim() });
    setIsOpen(false);
  };

  const handleDismiss = () => {
    markWelcomeSeen();
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm animate-fade-in"
        onClick={handleDismiss}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="fixed inset-0 z-[101] flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-label="Welcome to Swaad AI"
      >
        <div className="relative w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--background-secondary)] p-6 shadow-2xl animate-fade-in-up">
          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-lg text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--background-tertiary)] transition-colors"
            aria-label="Skip for now"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Header */}
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--primary)] text-black">
              <Sparkles className="h-7 w-7" />
            </div>
            <h2 className="text-xl font-bold text-[var(--foreground)]">
              Welcome to <span className="text-gradient">Swaad AI</span>
            </h2>
            <p className="mt-1 text-sm text-[var(--foreground-secondary)]">
              Tell us a bit about yourself to get started
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label
                htmlFor="welcome-name"
                className="mb-1.5 block text-sm font-medium text-[var(--foreground)]"
              >
                Your Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--foreground-muted)]" />
                <input
                  id="welcome-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rahul"
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--background-tertiary)] py-2.5 pl-10 pr-4 text-sm text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
                  autoFocus
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-xs text-[var(--error)]">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="welcome-email"
                className="mb-1.5 block text-sm font-medium text-[var(--foreground)]"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--foreground-muted)]" />
                <input
                  id="welcome-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="rahul@example.com"
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--background-tertiary)] py-2.5 pl-10 pr-4 text-sm text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-[var(--error)]">{errors.email}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--primary)] py-3 text-sm font-bold text-black hover:bg-[var(--primary-hover)] transition-colors glow-primary"
            >
              Start Ordering
              <Sparkles className="h-4 w-4" />
            </button>

            <p className="text-center text-xs text-[var(--foreground-muted)]">
              We only use this to personalize your experience
            </p>
          </form>
        </div>
      </div>
    </>
  );
}
