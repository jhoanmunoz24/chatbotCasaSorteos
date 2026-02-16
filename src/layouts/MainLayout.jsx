import React from 'react';
import { SidebarProvider } from '../components/ui/sidebar';
import { SidebarLayout } from '../components/Sidebar/SidebarLayout';
import { HeaderLayout } from '@/components/Header/HeaderLayout';
export const MainLayout = ({ children }) => {
  return (
    <SidebarProvider>
      <SidebarLayout />
      <main className="  flex flex-1 flex-col">
        <header className="p-3 h-auto bg-background flex justify-between text-foreground">
          <HeaderLayout />
        </header>

        {children}
      </main>
    </SidebarProvider>
  );
};
