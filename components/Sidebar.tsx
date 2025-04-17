import React from 'react';
import ThemeToggle from './ThemeToggle';

const Sidebar = () => {
  return (
    <header className="navbar bg-base-200">
      <div className="flex-1">
        <a className="btn btn-ghost text-xl">JobScript</a>
      </div>
      <div className="flex-none">
        <ThemeToggle />
      </div>
    </header>
  );
};

export default Sidebar;
