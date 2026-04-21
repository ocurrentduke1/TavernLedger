import Sidebar from "@/components/dashboard/Sidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-canvas">
      <Sidebar />
      <main className="flex-1 ml-60 min-h-screen flex flex-col">
        <DashboardHeader title="Panel del Aventurero" />
        {children}
      </main>
    </div>
  );
}