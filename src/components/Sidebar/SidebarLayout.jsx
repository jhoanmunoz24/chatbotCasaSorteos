import React from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';

import { TicketMinus, LayoutDashboard, Receipt, ChartLine } from 'lucide-react';
export const SidebarLayout = () => {
  const sidebarElements = [
    {
      icon: <LayoutDashboard />,
      title: 'Dashboard',
    },
    {
      icon: <TicketMinus />,
      title: 'Boletas vendidas',
    },
    {
      icon: <Receipt />,
      title: 'Pagos Pendientes',
    },
    {
      icon: <ChartLine />,
      title: 'Reportes',
    },
  ];
  return (
    <Sidebar>
      <SidebarHeader className="flex flex-row p-4 items-center">
        <TicketMinus />
        <span className="text-xl">TicketManager</span>
      </SidebarHeader>
      <hr />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {sidebarElements.map((item, index) => (
                <SidebarMenuItem key={index}>
                  <SidebarMenuButton
                    asChild
                    size="lg"
                    className="text-base h-14"
                  >
                    <a href={item.href}>
                      {item.icon}
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};
