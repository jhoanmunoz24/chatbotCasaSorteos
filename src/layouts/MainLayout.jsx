import React from 'react';
import { SidebarInset, SidebarProvider } from '../components/ui/sidebar';
import { SidebarLayout } from '../components/Sidebar/SidebarLayout';
import { HeaderLayout } from '@/components/Header/HeaderLayout';
export const MainLayout = ({ children }) => {
  return (
    <SidebarProvider>
      <SidebarLayout />
      <SidebarInset>
        <header className="p-3 h-auto bg-background flex justify-between text-foreground">
          <HeaderLayout />
        </header>

        <main>{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
};
