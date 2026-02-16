import React from 'react';
import { SidebarProvider } from '../components/ui/sidebar';
import { SidebarLayout } from '../components/SidebarLayout';
export const MainLayout = ({ children }) => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <SidebarLayout></SidebarLayout>
        <main className=" bg-amber-500 flex flex-1">
          <header>
            
          </header>
        </main>
      </div>
    </SidebarProvider>
  );
};
