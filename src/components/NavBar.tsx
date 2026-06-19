import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Candy } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { cn } from '../lib/utils';

export function NavBar() {
  const location = useLocation();
  const candies = useGameStore(state => state.candies);

  const navItems = [
    { path: '/', label: '我的小兽', icon: Home },
    { path: '/works', label: '发现作品', icon: Search },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-gray-100 z-50">
      <div className="max-w-lg mx-auto px-4">
        <div className="flex items-center justify-around h-16">
          {navItems.map(item => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex flex-col items-center gap-1 px-4 py-2 transition-colors',
                  isActive ? 'text-coral-500' : 'text-gray-400 hover:text-gray-600'
                )}
              >
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}

          <div className="flex flex-col items-center gap-1 px-4 py-2 text-amber-500">
            <Candy size={22} />
            <span className="text-xs font-medium">{candies.total}</span>
          </div>
        </div>
      </div>
    </nav>
  );
}
