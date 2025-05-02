
import React from 'react';
import { Button } from '@/components/ui/button';

const Header = () => {
  return (
    <header className="w-full py-4 border-b border-gray-200 bg-white">
      <div className="container flex items-center justify-between">
        <div className="flex items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-noteflow-purple to-noteflow-dark-purple flex items-center justify-center">
              <span className="text-white font-bold text-lg">NF</span>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-noteflow-purple to-noteflow-dark-purple text-transparent bg-clip-text">
              NoteFlow
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            Docs
          </Button>
          <Button size="sm" className="bg-noteflow-purple hover:bg-noteflow-dark-purple">
            Get Started
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
