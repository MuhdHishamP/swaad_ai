"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  MapPin,
  Phone,
  User,
  Mail,
  FileText,
  ArrowLeft,
  ShoppingBag,
  Banknote,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { useOrderStore } from "@/stores/order-store";
import { useUserStore } from "@/stores/user-store";
import { formatPrice, getFoodImagePath } from "@/lib/utils";
import type { DeliveryAddress } from "@/types";
import Link from "next/link";

/**
 * Checkout Page — Auth check → Delivery form → Order summary → COD.
 * WHY: Assignment requires a checkout flow with delivery form
 * and Cash on Delivery. Auth is collected here (not on first visit)
 * so users can explore freely before committing.
 */
export default function CheckoutPage() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const getTotal = useCartStore((s) => s.getTotal);
  const clearCart = useCartStore((s) => s.clearCart);
  const placeOrder = useOrderStore((s) => s.placeOrder);
  const user = useUserStore((s) => s.user);
  const setUser = useUserStore((s) => s.setUser);

  // Auth form state
  const [authName, setAuthName] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authErrors, setAuthErrors] = useState<{ name?: string; email?: string }>({});

  // Delivery form state
  const [form, setForm] = useState<DeliveryAddress>({
    fullName: user?.name || "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    pincode: "",
    instructions: "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof DeliveryAddress, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if cart is empty
  if (items.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <ShoppingBag className="mb-4 h-16 w-16 text-[var(--foreground-muted)]" />
        <h2 className="text-xl font-bold text-[var(--foreground)] mb-2">
          Your cart is empty
        </h2>
        <p className="text-sm text-[var(--foreground-secondary)] mb-6">
          Add some delicious dishes before checking out!
        </p>
        <Link
          href="/"
          className="rounded-xl bg-[var(--primary)] px-6 py-3 text-sm font-bold text-black hover:bg-[var(--primary-hover)] transition-colors"
        >
          Start Ordering
        </Link>
      </div>
    );
  }

  // ---------- Auth form handlers ----------
  const validateAuth = () => {
    const newErrors: { name?: string; email?: string } = {};
    if (!authName.trim()) newErrors.name = "Name is required";
    if (!authEmail.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(authEmail)) {
      newErrors.email = "Enter a valid email";
    }
    setAuthErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAuth()) return;
    setUser({ name: authName.trim(), email: authEmail.trim() });
    // Pre-fill the delivery name
    setForm((prev) => ({ ...prev, fullName: authName.trim() }));
  };

  // ---------- Auth gate: show login first ----------
  if (!user) {
    return (
      <div className="min-h-screen px-4 py-6 sm:px-6">
        <div className="mx-auto max-w-md">
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-2 text-sm text-[var(--foreground-secondary)] hover:text-[var(--foreground)] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Chat
          </Link>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--background-secondary)] p-6 animate-fade-in-up">
            {/* Header */}
            <div className="mb-6 text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--primary)] text-black">
                <Sparkles className="h-7 w-7" />
              </div>
              <h1 className="text-xl font-bold text-[var(--foreground)]">
                Almost there!
              </h1>
              <p className="mt-1 text-sm text-[var(--foreground-secondary)]">
                Tell us who you are before we proceed
              </p>
            </div>

            {/* Mini order summary */}
            <div className="mb-6 rounded-lg bg-[var(--background-tertiary)] p-3">
              <p className="text-xs text-[var(--foreground-muted)] mb-1">
                Your order
              </p>
              <p className="text-sm font-medium text-[var(--foreground)]">
                {items.length} item{items.length !== 1 ? "s" : ""} •{" "}
                <span className="text-[var(--primary)] font-bold">
                  {formatPrice(getTotal())}
                </span>
              </p>
            </div>

            {/* Auth Form */}
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="auth-name"
                  className="mb-1.5 block text-sm font-medium text-[var(--foreground)]"
                >
                  Your Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--foreground-muted)]" />
                  <input
                    id="auth-name"
                    type="text"
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    placeholder="e.g. Rahul"
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--background-tertiary)] py-2.5 pl-10 pr-4 text-sm text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
                    autoFocus
                  />
                </div>
                {authErrors.name && (
                  <p className="mt-1 text-xs text-[var(--error)]">{authErrors.name}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="auth-email"
                  className="mb-1.5 block text-sm font-medium text-[var(--foreground)]"
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--foreground-muted)]" />
                  <input
                    id="auth-email"
                    type="email"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="rahul@example.com"
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--background-tertiary)] py-2.5 pl-10 pr-4 text-sm text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
                  />
                </div>
                {authErrors.email && (
                  <p className="mt-1 text-xs text-[var(--error)]">{authErrors.email}</p>
                )}
              </div>

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--primary)] py-3 text-sm font-bold text-black hover:bg-[var(--primary-hover)] transition-colors glow-primary"
              >
                Continue to Checkout
                <ChevronRight className="h-4 w-4" />
              </button>

              <p className="text-center text-xs text-[var(--foreground-muted)]">
                We only use this to personalize your order
              </p>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ---------- Delivery form handlers ----------
  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof DeliveryAddress, string>> = {};

    if (!form.fullName.trim()) newErrors.fullName = "Name is required";
    if (!form.phone.trim()) {
      newErrors.phone = "Phone is required";
    } else if (!/^[6-9]\d{9}$/.test(form.phone.replace(/\s/g, ""))) {
      newErrors.phone = "Enter a valid 10-digit phone number";
    }
    if (!form.addressLine1.trim()) newErrors.addressLine1 = "Address is required";
    if (!form.city.trim()) newErrors.city = "City is required";
    if (!form.pincode.trim()) {
      newErrors.pincode = "Pincode is required";
    } else if (!/^\d{6}$/.test(form.pincode.trim())) {
      newErrors.pincode = "Enter a valid 6-digit pincode";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 800));

    placeOrder(items, getTotal(), form);
    clearCart();
    router.push("/order-confirmed");
  };

  const updateField = (field: keyof DeliveryAddress, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const total = getTotal();
  const deliveryFee = 0;
  const grandTotal = total + deliveryFee;

  return (
    <div className="min-h-screen px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-4xl">
        {/* Back link */}
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm text-[var(--foreground-secondary)] hover:text-[var(--foreground)] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Chat
        </Link>

        {/* Logged-in greeting */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            Checkout
          </h1>
          <p className="text-sm text-[var(--foreground-secondary)]">
            Ordering as{" "}
            <span className="font-medium text-[var(--foreground)]">{user.name}</span>
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          {/* Left: Delivery Form */}
          <form onSubmit={handleSubmit} id="checkout-form" className="space-y-6">
            {/* Delivery Address Section */}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--background-secondary)] p-5">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-[var(--foreground)] mb-4">
                <MapPin className="h-5 w-5 text-[var(--primary)]" />
                Delivery Address
              </h2>

              <div className="space-y-4">
                <FormField
                  id="fullName"
                  label="Full Name"
                  icon={<User className="h-4 w-4" />}
                  value={form.fullName}
                  onChange={(v) => updateField("fullName", v)}
                  error={errors.fullName}
                  placeholder="Enter your full name"
                />
                <FormField
                  id="phone"
                  label="Phone Number"
                  icon={<Phone className="h-4 w-4" />}
                  value={form.phone}
                  onChange={(v) => updateField("phone", v)}
                  error={errors.phone}
                  placeholder="10-digit mobile number"
                  type="tel"
                />
                <FormField
                  id="addressLine1"
                  label="Address"
                  icon={<MapPin className="h-4 w-4" />}
                  value={form.addressLine1}
                  onChange={(v) => updateField("addressLine1", v)}
                  error={errors.addressLine1}
                  placeholder="House/Flat number, Street name"
                />
                <FormField
                  id="addressLine2"
                  label="Landmark (Optional)"
                  value={form.addressLine2 || ""}
                  onChange={(v) => updateField("addressLine2", v)}
                  placeholder="Near a landmark..."
                />
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    id="city"
                    label="City"
                    value={form.city}
                    onChange={(v) => updateField("city", v)}
                    error={errors.city}
                    placeholder="City name"
                  />
                  <FormField
                    id="pincode"
                    label="Pincode"
                    value={form.pincode}
                    onChange={(v) => updateField("pincode", v)}
                    error={errors.pincode}
                    placeholder="6-digit pincode"
                  />
                </div>
                <div>
                  <label
                    htmlFor="instructions"
                    className="mb-1.5 block text-sm font-medium text-[var(--foreground)]"
                  >
                    Delivery Instructions (Optional)
                  </label>
                  <textarea
                    id="instructions"
                    value={form.instructions || ""}
                    onChange={(e) => updateField("instructions", e.target.value)}
                    placeholder="Ring the doorbell, leave at the door, etc."
                    rows={2}
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--background-tertiary)] px-4 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent resize-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--background-secondary)] p-5">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-[var(--foreground)] mb-4">
                <Banknote className="h-5 w-5 text-[var(--primary)]" />
                Payment Method
              </h2>
              <label
                htmlFor="cod"
                className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-[var(--primary)] bg-[var(--primary-soft)] p-4"
              >
                <input
                  type="radio"
                  id="cod"
                  name="payment"
                  value="cod"
                  defaultChecked
                  className="h-4 w-4 accent-[var(--primary)]"
                />
                <div>
                  <p className="text-sm font-semibold text-[var(--foreground)]">
                    Cash on Delivery
                  </p>
                  <p className="text-xs text-[var(--foreground-secondary)]">
                    Pay when your order arrives
                  </p>
                </div>
              </label>
            </div>
          </form>

          {/* Right: Order Summary */}
          <div className="lg:sticky lg:top-20 h-fit">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--background-secondary)] p-5">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-[var(--foreground)] mb-4">
                <FileText className="h-5 w-5 text-[var(--primary)]" />
                Order Summary
              </h2>

              <div className="space-y-3 mb-4">
                {items.map((item) => (
                  <div
                    key={`${item.food.id}-${item.selectedSize || ""}`}
                    className="flex items-center gap-3"
                  >
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-[var(--background-tertiary)]">
                      <Image
                        src={getFoodImagePath(item.food.image)}
                        alt={item.food.name}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--foreground)] truncate">
                        {item.food.name}
                      </p>
                      <p className="text-xs text-[var(--foreground-muted)]">
                        Qty: {item.quantity}
                        {item.selectedSize && ` • ${item.selectedSize}`}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-[var(--foreground)]">
                      {formatPrice(item.unitPrice * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-[var(--border)] pt-3 space-y-2">
                <div className="flex justify-between text-sm text-[var(--foreground-secondary)]">
                  <span>Subtotal</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between text-sm text-[var(--foreground-secondary)]">
                  <span>Delivery</span>
                  <span className="text-[var(--success)]">Free</span>
                </div>
                <div className="flex justify-between border-t border-[var(--border)] pt-2">
                  <span className="font-semibold text-[var(--foreground)]">
                    Total
                  </span>
                  <span className="text-lg font-bold text-[var(--primary)]">
                    {formatPrice(grandTotal)}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                form="checkout-form"
                disabled={isSubmitting}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--primary)] py-3.5 text-sm font-bold text-black hover:bg-[var(--primary-hover)] transition-colors glow-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black" />
                    Processing...
                  </>
                ) : (
                  <>
                    Place Order — {formatPrice(grandTotal)}
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </button>

              <p className="mt-2 text-center text-xs text-[var(--foreground-muted)]">
                Cash on Delivery • Free delivery
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Reusable form field */
function FormField({
  id,
  label,
  icon,
  value,
  onChange,
  error,
  placeholder,
  type = "text",
}: {
  id: string;
  label: string;
  icon?: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-sm font-medium text-[var(--foreground)]"
      >
        {label}
      </label>
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)]">
            {icon}
          </span>
        )}
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full rounded-xl border bg-[var(--background-tertiary)] py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all ${
            icon ? "pl-10 pr-4" : "px-4"
          } ${error ? "border-[var(--error)]" : "border-[var(--border)]"}`}
        />
      </div>
      {error && (
        <p className="mt-1 text-xs text-[var(--error)]">{error}</p>
      )}
    </div>
  );
}
