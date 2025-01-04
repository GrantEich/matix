import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  Wallet, 
  Menu, 
  X, 
  Sun, 
  Moon,
  Settings,
  BarChart2
} from 'lucide-react';
import { useCrossmintWallet } from '@/hooks/useCrossmintWallet';
import { formatUtils } from '@/lib/utils/format';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isDarkMode, setIsDarkMode] = React.useState(false);
  const router = useRouter();
  const { address, balance, isLoading } = useCrossmintWallet();

  const navItems = [
    { label: 'Dashboard', href: '/', icon: BarChart2 },
    { label: 'Send', href: '/send', icon: Wallet },
    { label: 'Settings', href: '/settings', icon: Settings },
  ];

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container px-4 mx-auto">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div onClick={() => router.push('/')} className="flex items-center space-x-2 cursor-pointer">
            <Wallet className="h-6 w-6" />
            <span className="font-bold">AI Solana Wallet</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navItems.map(({ label, href, icon: Icon }) => (
              <div
                key={href}
                onClick={() => router.push(href)}
                className={`flex items-center space-x-2 text-sm font-medium transition-colors hover:text-primary cursor-pointer ${
                  router.pathname === href ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </div>
            ))}
          </nav>

          {/* Wallet Status & Theme Toggle */}
          <div className="flex items-center space-x-4">
            {address && (
              <div className="hidden md:flex items-center space-x-2 px-4 py-2 bg-secondary rounded-full">
                <span className="text-sm font-medium">
                  {formatUtils.formatAddress(address)}
                </span>
                {!isLoading && (
                  <span className="text-sm text-muted-foreground">
                    {formatUtils.formatSOL(balance ? balance.toString() : '0')} SOL
                  </span>
                )}
              </div>
            )}

            <button
              onClick={toggleDarkMode}
              className="p-2 hover:bg-secondary rounded-full"
              aria-label="Toggle theme"
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 hover:bg-secondary rounded-full"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t">
          <div className="container px-4 py-4">
            <nav className="flex flex-col space-y-4">
              {navItems.map(({ label, href, icon: Icon }) => (
                <div
                  key={href}
                  onClick={() => {
                    router.push(href);
                    setIsMenuOpen(false);
                  }}
                  className={`flex items-center space-x-2 text-sm font-medium transition-colors hover:text-primary cursor-pointer ${
                    router.pathname === href ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </div>
              ))}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}