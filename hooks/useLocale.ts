"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase";

type Locale = "es" | "en";

export function useLocale() {
  const [locale, setLocaleState] = useState<Locale>("es");
  const supabase = createClient();

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("preferred_language")
        .eq("id", user.id)
        .single();

      if (data?.preferred_language === "en" || data?.preferred_language === "es") {
        setLocaleState(data.preferred_language);
      } else {
        const browserLang = navigator.language.startsWith("en") ? "en" : "es";
        setLocaleState(browserLang);
      }
    };

    load();
  }, [supabase]);

  const setLocale = useCallback(async (next: Locale) => {
    setLocaleState(next);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("profiles")
      .update({ preferred_language: next })
      .eq("id", user.id);
  }, [supabase]);

  return { locale, setLocale };
}
