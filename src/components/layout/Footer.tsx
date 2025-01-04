import React from 'react';
import Link from 'next/link';
import { Github, Twitter } from 'lucide-react';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t">
      <div className="container px-4 py-8 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Branding */}
          <div className="space-y-3">
            <h3 className="font-bold">AI Solana Wallet</h3>
            <p className="text-sm text-muted-foreground">
              Secure, intelligent wallet for the Solana blockchain.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground"
              >
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-3">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/dashboard">
                  <a className="text-sm text-muted-foreground hover:text-foreground">Dashboard</a>
                </Link>
              </li>
              <li>
                <Link href="/send">
                  <a className="text-sm text-muted-foreground hover:text-foreground">Send</a>
                </Link>
              </li>
              <li>
                <Link href="/settings">
                  <a className="text-sm text-muted-foreground hover:text-foreground">Settings</a>
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold mb-3">Resources</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/docs">
                  <a className="text-sm text-muted-foreground hover:text-foreground">Documentation</a>
                </Link>
              </li>
              <li>
                <Link href="/help">
                  <a className="text-sm text-muted-foreground hover:text-foreground">Help Center</a>
                </Link>
              </li>
              <li>
                <Link href="/security">
                  <a className="text-sm text-muted-foreground hover:text-foreground">Security</a>
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-3">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy">
                  <a className="text-sm text-muted-foreground hover:text-foreground">Privacy Policy</a>
                </Link>
              </li>
              <li>
                <Link href="/terms">
                  <a className="text-sm text-muted-foreground hover:text-foreground">Terms of Service</a>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>© {year} AI Solana Wallet. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}