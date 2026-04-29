"use client";

import { useState, useEffect } from "react";
import { NextIntlClientProvider } from "next-intl";
import { createClient } from "@/lib/supabase";

type Locale = "es" | "en";

type Messages = Record<string, unknown>;

async function getMessages(locale: Locale): Promise<Messages> {
  return (await import(`../../messages/${locale}.json`)).default as Messages;
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>("es");
  const [messages, setMessages] = useState<Messages>({});
  const supabase = createClient();

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      let resolvedLocale: Locale = "es";
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("preferred_language")
          .eq("id", user.id)
          .single();
        if (data?.preferred_language === "en") resolvedLocale = "en";
      } else {
        resolvedLocale = navigator.language.startsWith("en") ? "en" : "es";
      }

      const msgs = await getMessages(resolvedLocale);
      setLocale(resolvedLocale);
      setMessages(msgs);
    };

    load();
  }, [supabase]);

  if (Object.keys(messages).length === 0) return null;

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
