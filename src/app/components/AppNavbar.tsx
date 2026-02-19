import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { Shield, Home, MessageSquare, BarChart3, Lock, Settings, FileText, ShieldCheck, Bell, User, ChevronDown, LogOut } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

const navItems = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/chat', label: 'Secure Chat', icon: MessageSquare },
  { path: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  { path: '/policies', label: 'Policies', icon: ShieldCheck },
  { path: '/audit', label: 'Audit Logs', icon: FileText },
];

export function AppNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [notificationCount] = useState(3);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="px-6 py-3 flex items-center justify-between">
        {/* Left: Logo + Nav */}
        <div className="flex items-center gap-6">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate('/')}
          >
            <div className="w-8 h-8 bg-[#0078D4] rounded flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-gray-900 text-sm whitespace-nowrap">
              Azure AI Governance
            </span>
          </div>

          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Button
                  key={item.path}
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(item.path)}
                  className={
                    isActive
                      ? 'bg-blue-50 text-[#0078D4] hover:bg-blue-50 hover:text-[#0078D4]'
                      : 'text-gray-600 hover:text-gray-900'
                  }
                >
                  <Icon className="w-4 h-4 mr-1.5" />
                  {item.label}
                </Button>
              );
            })}
          </nav>
        </div>

        {/* Right: Status + Notifications + User */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-lg border border-green-200">
            <Lock className="w-3.5 h-3.5 text-green-600" />
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs text-green-700 font-medium">Secure & Operational</span>
          </div>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="sm"
            className="relative text-gray-600"
            onClick={() => navigate('/dashboard')}
          >
            <Bell className="w-4 h-4" />
            {notificationCount > 0 && (
              <Badge className="absolute -top-1 -right-1 w-4 h-4 p-0 flex items-center justify-center bg-red-500 text-white text-[10px] hover:bg-red-500">
                {notificationCount}
              </Badge>
            )}
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center gap-2 text-gray-700">
                <div className="w-7 h-7 bg-[#0078D4] rounded-full flex items-center justify-center">
                  <span className="text-xs text-white font-medium">JD</span>
                </div>
                <span className="text-sm hidden md:block">John Doe</span>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span className="font-medium">John Doe</span>
                  <span className="text-xs text-gray-500 font-normal">admin@contoso.com</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/settings')}>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/audit')}>
                <FileText className="w-4 h-4 mr-2" />
                My Activity
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600 focus:text-red-600">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
