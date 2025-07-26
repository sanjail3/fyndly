'use client';

import Dashboard from '@/components/dashboard/Dashboard';
import { ConnectionsProvider } from '@/components/ConnectionsProvider';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const hideNavbar = pathname === '/swipe';

  return (
    <ConnectionsProvider>
      {hideNavbar ? children : <Dashboard>{children}</Dashboard>}
    </ConnectionsProvider>
  );
} 