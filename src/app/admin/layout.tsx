import type { ReactNode } from 'react';
import { AdminSidebar } from '@/components/layout/admin-sidebar';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-100 text-[#1d348a]">
      <div className="md:grid md:grid-cols-[18rem_1fr]">
        <AdminSidebar />
        <main className="p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
