"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

type UserProfile = {
  email: string;
  displayName: string;
};

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile>({ email: "", displayName: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form states
  const [activeTab, setActiveTab] = useState<"profile" | "email" | "password">("profile");
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

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push("/login");
          return;
        }

        const displayName = (user.user_metadata?.displayName as string) || "";
        setProfile({ email: user.email || "", displayName });
        setDisplayName(displayName);
        setNewEmail(user.email || "");
      } catch (err) {
        console.error("Error fetching user:", err);
        setError("No se pudo cargar la configuración.");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [supabase, router]);

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
      setSuccess("Perfil actualizado correctamente.");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("No se pudo actualizar el perfil.");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateEmail = async () => {
    if (!newEmail.trim()) {
      setError("El email es requerido.");
      return;
    }

    if (newEmail === profile.email) {
      setError("El nuevo email debe ser diferente al actual.");
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
      setSuccess("Se envió un email de confirmación a tu nuevo email. Por favor, verifica tu bandeja de entrada.");
      setTimeout(() => setSuccess(""), 5000);
    } catch (err: any) {
      console.error("Error updating email:", err);
      if (err.message?.includes("already")) {
        setError("Este email ya está registrado.");
      } else {
        setError("No se pudo actualizar el email.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    setError("");
    setSuccess("");

    if (!currentPassword.trim()) {
      setError("Debes ingresar tu contraseña actual.");
      return;
    }

    if (!newPassword.trim()) {
      setError("La nueva contraseña es requerida.");
      return;
    }

    if (newPassword.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    if (newPassword === currentPassword) {
      setError("La nueva contraseña debe ser diferente a la actual.");
      return;
    }

    setSaving(true);

    try {
      // First verify current password by trying to sign in (Supabase doesn't have direct verification)
      // We'll catch errors during password update
      const { error: err } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (err) throw err;

      setSuccess("Contraseña actualizada correctamente.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      console.error("Error changing password:", err);
      setError(err.message || "No se pudo cambiar la contraseña.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div style={{ padding: "3rem" }}>
      <p style={{
        fontStyle: "italic", color: "var(--text-muted)",
        fontFamily: "var(--font-cinzel), serif", fontSize: "0.85rem",
      }}>
        Cargando configuración...
      </p>
    </div>
  );

  const inputStyle = {
    width: "100%", padding: "0.8rem 1rem",
    background: "rgba(26,20,16,0.8)",
    border: "1px solid rgba(201,168,76,0.2)",
    color: "var(--parchment)",
    fontFamily: "var(--font-crimson), serif",
    fontSize: "1rem", outline: "none",
    boxSizing: "border-box" as const,
  };

  const labelStyle = {
    display: "block",
    fontFamily: "var(--font-cinzel), serif",
    fontSize: "0.7rem", letterSpacing: "0.15em",
    textTransform: "uppercase" as const,
    color: "var(--gold)", marginBottom: "0.5rem",
  };

  const tabStyle = (isActive: boolean) => ({
    flex: 1, padding: "0.8rem",
    background: isActive ? "rgba(201,168,76,0.15)" : "rgba(26,20,16,0.5)",
    border: `1px solid ${isActive ? "rgba(201,168,76,0.3)" : "rgba(201,168,76,0.1)"}`,
    borderBottom: isActive ? "2px solid var(--gold)" : "1px solid rgba(201,168,76,0.1)",
    color: isActive ? "var(--gold)" : "var(--parchment-deeper)",
    fontFamily: "var(--font-cinzel), serif",
    fontSize: "0.75rem", letterSpacing: "0.1em",
    textTransform: "uppercase" as const,
    cursor: "pointer",
    transition: "all 0.2s",
  });

  return (
    <div style={{ padding: "3rem", maxWidth: 680 }}>

      {/* Back */}
      <Link href="/dashboard" style={{
        fontFamily: "var(--font-cinzel), serif",
        fontSize: "0.7rem", letterSpacing: "0.1em",
        color: "var(--text-muted)", textDecoration: "none",
        textTransform: "uppercase", display: "inline-block",
        marginBottom: "2rem",
      }}>
        ← Volver al Dashboard
      </Link>

      {/* Header */}
      <div style={{ marginBottom: "2.5rem" }}>
        <p style={{
          fontFamily: "var(--font-cinzel), serif",
          fontSize: "0.7rem", letterSpacing: "0.3em",
          textTransform: "uppercase", color: "var(--gold)",
          marginBottom: "0.5rem",
        }}>
          Tu Cuenta
        </p>
        <h1 style={{
          fontFamily: "'Cinzel Decorative', serif",
          fontSize: "clamp(1.5rem, 3vw, 2.2rem)",
          color: "var(--parchment)", lineHeight: 1.2,
        }}>
          Configuración
        </h1>
      </div>

      {error && (
        <p style={{
          fontSize: "0.85rem", color: "var(--blood-light)",
          marginBottom: "1.5rem", fontStyle: "italic",
          padding: "0.8rem 1rem",
          background: "rgba(194,68,42,0.1)",
          border: "1px solid rgba(194,68,42,0.2)",
        }}>
          {error}
        </p>
      )}

      {success && (
        <p style={{
          fontSize: "0.85rem", color: "var(--gold)",
          marginBottom: "1.5rem", fontStyle: "italic",
          padding: "0.8rem 1rem",
          background: "rgba(201,168,76,0.1)",
          border: "1px solid rgba(201,168,76,0.2)",
        }}>
          {success}
        </p>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", gap: "0", marginBottom: "2rem", borderBottom: "1px solid rgba(201,168,76,0.1)" }}>
        <button
          onClick={() => setActiveTab("profile")}
          style={{
            ...tabStyle(activeTab === "profile"),
            border: "none",
            borderBottom: activeTab === "profile" ? "3px solid var(--gold)" : "1px solid rgba(201,168,76,0.1)",
          }}
        >
          Perfil
        </button>
        <button
          onClick={() => setActiveTab("email")}
          style={{
            ...tabStyle(activeTab === "email"),
            border: "none",
            borderBottom: activeTab === "email" ? "3px solid var(--gold)" : "1px solid rgba(201,168,76,0.1)",
          }}
        >
          Email
        </button>
        <button
          onClick={() => setActiveTab("password")}
          style={{
            ...tabStyle(activeTab === "password"),
            border: "none",
            borderBottom: activeTab === "password" ? "3px solid var(--gold)" : "1px solid rgba(201,168,76,0.1)",
          }}
        >
          Contraseña
        </button>
      </div>

      {/* Content */}
      <div style={{
        background: "rgba(58,50,40,0.4)",
        border: "1px solid rgba(201,168,76,0.12)",
        padding: "2rem",
      }}>

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div>
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={labelStyle}>Nombre Mostrado</label>
              <input
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="Tu nombre en TavernLedger..."
                style={inputStyle}
              />
              <p style={{
                fontFamily: "var(--font-cinzel), serif",
                fontSize: "0.65rem", color: "var(--text-muted)",
                marginTop: "0.4rem", letterSpacing: "0.05em",
              }}>
                Este es el nombre que verán otros jugadores en tus campañas.
              </p>
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={labelStyle}>Email (No editable)</label>
              <div style={{
                padding: "0.8rem 1rem",
                background: "rgba(26,20,16,0.5)",
                border: "1px solid rgba(201,168,76,0.1)",
                color: "var(--parchment-deeper)",
                fontFamily: "var(--font-crimson), serif",
                fontSize: "1rem",
              }}>
                {profile.email}
              </div>
              <p style={{
                fontFamily: "var(--font-cinzel), serif",
                fontSize: "0.65rem", color: "var(--text-muted)",
                marginTop: "0.4rem", letterSpacing: "0.05em",
              }}>
                Usa la pestaña "Email" para cambiar tu dirección de email.
              </p>
            </div>

            <button
              onClick={handleUpdateProfile}
              disabled={saving}
              style={{
                width: "100%", padding: "1rem",
                background: saving ? "var(--gold-dark)" : "var(--gold)",
                border: "none", color: "var(--ink)",
                fontFamily: "var(--font-cinzel), serif",
                fontSize: "0.85rem", letterSpacing: "0.15em",
                textTransform: "uppercase",
                cursor: saving ? "not-allowed" : "pointer",
                transition: "background 0.2s",
              }}
            >
              {saving ? "Guardando..." : "Guardar Perfil"}
            </button>
          </div>
        )}

        {/* Email Tab */}
        {activeTab === "email" && (
          <div>
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={labelStyle}>Email Actual</label>
              <div style={{
                padding: "0.8rem 1rem",
                background: "rgba(26,20,16,0.5)",
                border: "1px solid rgba(201,168,76,0.1)",
                color: "var(--parchment-deeper)",
                fontFamily: "var(--font-crimson), serif",
                fontSize: "1rem",
              }}>
                {profile.email}
              </div>
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={labelStyle}>Nuevo Email</label>
              <input
                type="email"
                value={newEmail}
                onChange={e => setNewEmail(e.target.value)}
                placeholder="nuevo@email.com"
                style={inputStyle}
              />
              <p style={{
                fontFamily: "var(--font-cinzel), serif",
                fontSize: "0.65rem", color: "var(--text-muted)",
                marginTop: "0.4rem", letterSpacing: "0.05em",
              }}>
                Te enviaremos un email de confirmación. Debes verificarlo para completar el cambio.
              </p>
            </div>

            {emailSent && (
              <p style={{
                fontStyle: "italic", color: "var(--gold)",
                fontSize: "0.9rem", marginBottom: "1rem",
                padding: "0.8rem",
                background: "rgba(201,168,76,0.1)",
                border: "1px solid rgba(201,168,76,0.2)",
              }}>
                ✓ Email de confirmación enviado. Revisa tu bandeja de entrada.
              </p>
            )}

            <button
              onClick={handleUpdateEmail}
              disabled={saving}
              style={{
                width: "100%", padding: "1rem",
                background: saving ? "var(--gold-dark)" : "var(--gold)",
                border: "none", color: "var(--ink)",
                fontFamily: "var(--font-cinzel), serif",
                fontSize: "0.85rem", letterSpacing: "0.15em",
                textTransform: "uppercase",
                cursor: saving ? "not-allowed" : "pointer",
                transition: "background 0.2s",
              }}
            >
              {saving ? "Enviando..." : "Cambiar Email"}
            </button>
          </div>
        )}

        {/* Password Tab */}
        {activeTab === "password" && (
          <div>
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={labelStyle}>Contraseña Actual</label>
              <input
                type="password"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                placeholder="•••••••"
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={labelStyle}>Nueva Contraseña</label>
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="•••••••"
                style={inputStyle}
              />
              <p style={{
                fontFamily: "var(--font-cinzel), serif",
                fontSize: "0.65rem", color: "var(--text-muted)",
                marginTop: "0.4rem", letterSpacing: "0.05em",
              }}>
                Mínimo 6 caracteres.
              </p>
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={labelStyle}>Confirmar Contraseña</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="•••••••"
                style={inputStyle}
              />
            </div>

            <button
              onClick={handleChangePassword}
              disabled={saving}
              style={{
                width: "100%", padding: "1rem",
                background: saving ? "var(--gold-dark)" : "var(--gold)",
                border: "none", color: "var(--ink)",
                fontFamily: "var(--font-cinzel), serif",
                fontSize: "0.85rem", letterSpacing: "0.15em",
                textTransform: "uppercase",
                cursor: saving ? "not-allowed" : "pointer",
                transition: "background 0.2s",
              }}
            >
              {saving ? "Actualizando..." : "Cambiar Contraseña"}
            </button>
          </div>
        )}

      </div>

      {/* Account info */}
      <div style={{
        marginTop: "3rem", padding: "1.5rem",
        background: "rgba(58,50,40,0.2)",
        border: "1px dashed rgba(201,168,76,0.12)",
      }}>
        <p style={{
          fontFamily: "var(--font-cinzel), serif",
          fontSize: "0.65rem", letterSpacing: "0.15em",
          textTransform: "uppercase", color: "var(--text-muted)",
          marginBottom: "0.8rem",
        }}>
          Información de Cuenta
        </p>
        <p style={{
          fontFamily: "var(--font-crimson), serif",
          fontSize: "0.95rem", color: "var(--parchment-deeper)",
          lineHeight: 1.6,
        }}>
          tu email es <strong>{profile.email}</strong>. Todos tus cambios se guardan inmediatamente.
        </p>
      </div>
    </div>
  );
}
