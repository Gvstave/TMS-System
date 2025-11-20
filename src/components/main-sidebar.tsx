
'use client';

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarFooter,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { LayoutDashboard } from 'lucide-react';
import { Logo } from './logo';
import { usePathname } from 'next/navigation';
import { SidebarUserProfile } from './sidebar-user-profile';
import { Separator } from './ui/separator';
import { useIsMobile } from '@/hooks/use-mobile';
import { useEffect } from 'react';

export function MainSidebar() {
  const pathname = usePathname();
  const isMobile = useIsMobile();

  return (
    <Sidebar
      collapsible="icon"
      defaultOpen={!isMobile}
    >
      <SidebarHeader>
        <Logo />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              href="/dashboard"
              isActive={pathname.startsWith('/dashboard')}
              tooltip="Dashboard"
            >
              <LayoutDashboard />
              Dashboard
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <Separator />
      <SidebarFooter>
        <SidebarUserProfile />
      </SidebarFooter>
    </Sidebar>
  );
}
