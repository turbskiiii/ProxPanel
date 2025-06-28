'use client';

import { useRouter, usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Server,
  Settings,
  LogOut,
  User,
  Activity,
  HelpCircle,
} from 'lucide-react';

const menuItems = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'VPS List',
    url: '/dashboard/vps',
    icon: Server,
  },
  {
    title: 'Monitoring',
    url: '/dashboard/monitoring',
    icon: Activity,
  },
  {
    title: 'Settings',
    url: '/dashboard/settings',
    icon: Settings,
  },
  {
    title: 'Support',
    url: '/dashboard/support',
    icon: HelpCircle,
  },
];

export function AppSidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.removeItem('auth-token');
    router.push('/login');
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <div className='flex items-center gap-2 px-2 py-2'>
          <Server className='h-6 w-6 text-blue-500' />
          <span className='font-semibold'>ProxPanel</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map(item => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <a href={item.url}>
                      <item.icon className='h-4 w-4 text-blue-500' />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <User className='h-4 w-4 text-blue-500' />
              <span>Admin User</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Button
              variant='ghost'
              className='w-full justify-start px-2 text-blue-500 hover:bg-blue-500/10'
              onClick={handleLogout}
            >
              <LogOut className='mr-2 h-4 w-4 text-blue-500' />
              Logout
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
