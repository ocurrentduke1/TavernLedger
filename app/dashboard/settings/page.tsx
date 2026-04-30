"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import { useLocale } from "@/hooks/useLocale";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type UserProfile = {
  email: string;
  displayName: string;
};

export default function SettingsPage() {
  const t = useTranslations("settings");
  const router = useRouter();
  const supabase = createClient();
  const { theme } = useTheme();
  const { locale, setLocale } = useLocale();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile>({ email: "", displayName: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  // Profile tab
  const [displayName, setDisplayName] = useState("");

  // Email tab
  const [newEmail, setNewEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  // Password tab
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Language tab
  const [localeSaved, setLocaleSaved] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push("/login");
          return;
        }

        const name = (user.user_metadata?.displayName as string) || "";
        setProfile({ email: user.email || "", displayName: name });
        setDisplayName(name);
        setNewEmail(user.email || "");
      } catch {
        setError(t("errorLoad"));
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [supabase, router, t]);

  const handleUpdateProfile = async () => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const { error: err } = await supabase.auth.updateUser({
        data: { displayName },
      });

      if (err) throw err;

      setProfile(prev => ({ ...prev, displayName }));
      setSuccess(t("successProfile"));
      setTimeout(() => setSuccess(""), 3000);
    } catch {
      setError(t("errorProfile"));
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateEmail = async () => {
    if (!newEmail.trim()) {
      setError(t("errorEmailRequired"));
      return;
    }

    if (newEmail === profile.email) {
      setError(t("errorEmailSame"));
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const { error: err } = await supabase.auth.updateUser({
        email: newEmail,
      });

      if (err) throw err;

      setEmailSent(true);
      setSuccess(t("email.sent"));
      setTimeout(() => setSuccess(""), 5000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "";
      if (message.includes("already")) {
        setError(t("errorEmailTaken"));
      } else {
        setError(t("errorEmail"));
      }
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    setError("");
    setSuccess("");

    if (!currentPassword.trim()) {
      setError(t("errorPasswordCurrent"));
      return;
    }

    if (!newPassword.trim()) {
      setError(t("errorPasswordRequired"));
      return;
    }

    if (newPassword.length < 6) {
      setError(t("errorPasswordLength"));
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(t("errorPasswordMatch"));
      return;
    }

    if (newPassword === currentPassword) {
      setError(t("errorPasswordSame"));
      return;
    }

    setSaving(true);

    try {
      const { error: err } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (err) throw err;

      setSuccess(t("successPassword"));
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "";
      setError(message || t("errorPassword"));
    } finally {
      setSaving(false);
    }
  };

  const handleSetLocale = async (next: "es" | "en") => {
    await setLocale(next);
    setLocaleSaved(true);
    setTimeout(() => setLocaleSaved(false), 2000);
  };

  if (loading) {
    return (
      <div className="p-12">
        <p className="font-cinzel text-[0.85rem] italic text-prose-muted">
          {t("loading")}
        </p>
      </div>
    );
  }

  return (
    <div className="p-12 max-w-2xl">

      {/* Back */}
      <Link
        href="/dashboard"
        className="font-cinzel text-[0.7rem] tracking-[0.1em] uppercase text-prose-muted no-underline inline-block mb-8 hover:text-gold transition-colors"
      >
        {t("back")}
      </Link>

      {/* Header */}
      <div className="mb-10">
        <p className="font-cinzel text-[0.7rem] tracking-[0.3em] uppercase text-gold mb-2">
          {t("subtitle")}
        </p>
        <h1 className="font-cinzel-dec text-[clamp(1.5rem,3vw,2.2rem)] text-prose leading-tight">
          {t("title")}
        </h1>
      </div>

      {/* Error banner */}
      {error && (
        <div className="p-3 mb-6 bg-blood-ui/10 border border-blood-ui/20 font-crimson text-[0.85rem] italic text-blood-ui">
          {error}
        </div>
      )}

      {/* Success banner */}
      {success && (
        <div className="p-3 mb-6 bg-gold/10 border border-gold/20 font-crimson text-[0.85rem] italic text-gold">
          {success}
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="profile">
        <TabsList className="w-full">
          <TabsTrigger value="profile" className="font-cinzel text-[0.7rem] tracking-[0.08em] uppercase">
            {t("tabs.profile")}
          </TabsTrigger>
          <TabsTrigger value="appearance" className="font-cinzel text-[0.7rem] tracking-[0.08em] uppercase">
            {t("tabs.appearance")}
          </TabsTrigger>
          <TabsTrigger value="language" className="font-cinzel text-[0.7rem] tracking-[0.08em] uppercase">
            {t("tabs.language")}
          </TabsTrigger>
          <TabsTrigger value="email" className="font-cinzel text-[0.7rem] tracking-[0.08em] uppercase">
            {t("tabs.email")}
          </TabsTrigger>
          <TabsTrigger value="password" className="font-cinzel text-[0.7rem] tracking-[0.08em] uppercase">
            {t("tabs.password")}
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="p-8 border border-gold/10">
          <div className="mb-6">
            <label className="block font-cinzel text-[0.7rem] tracking-[0.15em] uppercase text-gold mb-2">
              {t("profile.displayName")}
            </label>
            <Input
              type="text"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder="Tu nombre en TavernLedger..."
              className="font-crimson text-base"
            />
            <p className="font-cinzel text-[0.65rem] text-prose-muted mt-1 tracking-[0.05em]">
              {t("profile.displayNameHint")}
            </p>
          </div>

          <div className="mb-6">
            <label className="block font-cinzel text-[0.7rem] tracking-[0.15em] uppercase text-gold mb-2">
              {t("profile.email")}
            </label>
            <div className="px-4 py-3 bg-canvas/50 border border-gold/10 font-crimson text-base text-prose-soft">
              {profile.email}
            </div>
            <p className="font-cinzel text-[0.65rem] text-prose-muted mt-1 tracking-[0.05em]">
              {t("profile.emailHint")}
            </p>
          </div>

          <Button
            onClick={handleUpdateProfile}
            disabled={saving}
            className="w-full font-cinzel text-[0.85rem] tracking-[0.15em] uppercase"
          >
            {saving ? t("profile.saving") : t("profile.save")}
          </Button>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance" className="p-8 border border-gold/10">
          <p className="font-cinzel text-[0.65rem] tracking-[0.15em] uppercase text-prose-muted mb-6">
            {t("appearance.title")}
          </p>
          <div className="flex items-center justify-between px-5 py-4 bg-canvas/40 border border-gold/15">
            <div>
              <p className="font-cinzel text-[0.8rem] tracking-[0.08em] text-prose mb-1">
                {theme === "dark" ? t("appearance.dark") : t("appearance.light")}
              </p>
              <p className="font-crimson text-[0.9rem] text-prose-muted italic">
                {theme === "dark" ? t("appearance.darkHint") : t("appearance.lightHint")}
              </p>
            </div>
            <ThemeToggle />
          </div>
        </TabsContent>

        {/* Language Tab */}
        <TabsContent value="language" className="p-8 border border-gold/10">
          <p className="font-cinzel text-[0.65rem] tracking-[0.15em] uppercase text-prose-muted mb-4">
            {t("language.title")}
          </p>
          <div className="flex gap-3">
            <Button
              variant={locale === "es" ? "default" : "outline"}
              onClick={() => handleSetLocale("es")}
              className="font-cinzel text-[0.75rem] tracking-[0.1em]"
            >
              {t("language.es")}
            </Button>
            <Button
              variant={locale === "en" ? "default" : "outline"}
              onClick={() => handleSetLocale("en")}
              className="font-cinzel text-[0.75rem] tracking-[0.1em]"
            >
              {t("language.en")}
            </Button>
          </div>
          <p className="font-cinzel text-[0.65rem] text-prose-muted mt-3 italic">
            {t("language.hint")}
          </p>
          {localeSaved && (
            <p className="font-cinzel text-[0.75rem] text-gold mt-2">
              {t("language.saved")}
            </p>
          )}
        </TabsContent>

        {/* Email Tab */}
        <TabsContent value="email" className="p-8 border border-gold/10">
          <div className="mb-6">
            <label className="block font-cinzel text-[0.7rem] tracking-[0.15em] uppercase text-gold mb-2">
              {t("email.current")}
            </label>
            <div className="px-4 py-3 bg-canvas/50 border border-gold/10 font-crimson text-base text-prose-soft">
              {profile.email}
            </div>
          </div>

          <div className="mb-6">
            <label className="block font-cinzel text-[0.7rem] tracking-[0.15em] uppercase text-gold mb-2">
              {t("email.new")}
            </label>
            <Input
              type="email"
              value={newEmail}
              onChange={e => setNewEmail(e.target.value)}
              placeholder="nuevo@email.com"
              className="font-crimson text-base"
            />
            <p className="font-cinzel text-[0.65rem] text-prose-muted mt-1 tracking-[0.05em]">
              {t("email.newHint")}
            </p>
          </div>

          {emailSent && (
            <p className="font-crimson text-[0.9rem] italic text-gold mb-4 px-3 py-2 bg-gold/10 border border-gold/20">
              {t("email.sent")}
            </p>
          )}

          <Button
            onClick={handleUpdateEmail}
            disabled={saving}
            className="w-full font-cinzel text-[0.85rem] tracking-[0.15em] uppercase"
          >
            {saving ? t("email.submitting") : t("email.submit")}
          </Button>
        </TabsContent>

        {/* Password Tab */}
        <TabsContent value="password" className="p-8 border border-gold/10">
          <div className="mb-6">
            <label className="block font-cinzel text-[0.7rem] tracking-[0.15em] uppercase text-gold mb-2">
              {t("password.current")}
            </label>
            <Input
              type="password"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              placeholder="•••••••"
              className="font-crimson text-base"
            />
          </div>

          <div className="mb-6">
            <label className="block font-cinzel text-[0.7rem] tracking-[0.15em] uppercase text-gold mb-2">
              {t("password.new")}
            </label>
            <Input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="•••••••"
              className="font-crimson text-base"
            />
            <p className="font-cinzel text-[0.65rem] text-prose-muted mt-1 tracking-[0.05em]">
              {t("password.newHint")}
            </p>
          </div>

          <div className="mb-6">
            <label className="block font-cinzel text-[0.7rem] tracking-[0.15em] uppercase text-gold mb-2">
              {t("password.confirm")}
            </label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="•••••••"
              className="font-crimson text-base"
            />
          </div>

          <Button
            onClick={handleChangePassword}
            disabled={saving}
            className="w-full font-cinzel text-[0.85rem] tracking-[0.15em] uppercase"
          >
            {saving ? t("password.submitting") : t("password.submit")}
          </Button>
        </TabsContent>
      </Tabs>

      {/* Account info */}
      <div className="mt-12 p-6 bg-surface/20 border border-dashed border-gold/12">
        <p className="font-cinzel text-[0.65rem] tracking-[0.15em] uppercase text-prose-muted mb-3">
          {t("account.title")}
        </p>
        <p className="font-crimson text-[0.95rem] text-prose-soft leading-relaxed">
          {t("account.body", { email: profile.email })}
        </p>
      </div>
    </div>
  );
}
