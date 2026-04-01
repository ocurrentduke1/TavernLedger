import Sidebar from "@/components/dashboard/Sidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--ink)" }}>
      <Sidebar />
      <main style={{
        flex: 1, marginLeft: 240,
        minHeight: "100vh",
        display: "flex", flexDirection: "column",
      }}>
        <DashboardHeader title="Panel del Aventurero" />
        {children}
      </main>
    </div>
  );
}