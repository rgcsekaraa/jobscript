'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  DocumentTextIcon,
  MapIcon,
  CogIcon,
} from '@heroicons/react/24/outline';

const Sidebar: React.FC = () => {
  const pathname = usePathname();

  return (
    <div className="w-30 h-full bg-base-200 text-base-content flex flex-col">
      {/* Logo Section */}
      <div className="p-6 flex-col items-center">
        <div>
          <Link href="/" className="flex items-center">
            <img src="logo.png" alt="Jobscript Logo" className="w-16 h-16" />
          </Link>
        </div>
        <div>
          <span className="font-mono text-xs ">JobScript</span>
        </div>
      </div>
      {/* Navigation Section */}
      <div className="flex-1 p-4">
        <ul className="menu">
          <li>
            <Link
              href="/resume"
              className="flex flex-col items-center gap-2 p-2 rounded-lg hover:bg-transparent focus:bg-transparent"
            >
              <div
                className={`p-2 rounded-lg transition-colors ${
                  pathname === '/resume' ? 'bg-base-300' : ''
                } hover:bg-base-300`}
              >
                <DocumentTextIcon className="w-8 h-8" />
              </div>
              <span className="text-xs text-center">Resume Generator</span>
            </Link>
          </li>
          <li>
            <Link
              href="/cv"
              className="flex flex-col items-center gap-2 p-2 rounded-lg hover:bg-transparent focus:bg-transparent"
            >
              <div
                className={`p-2 rounded-lg transition-colors ${
                  pathname === '/cv' ? 'bg-base-300' : ''
                } hover:bg-base-300`}
              >
                <DocumentTextIcon className="w-8 h-8" />
              </div>
              <span className="text-xs text-center">CV Generator</span>
            </Link>
          </li>
          <li>
            <Link
              href="/mail"
              className="flex flex-col items-center gap-2 p-2 rounded-lg hover:bg-transparent focus:bg-transparent"
            >
              <div
                className={`p-2 rounded-lg transition-colors ${
                  pathname === '/mail' ? 'bg-base-300' : ''
                } hover:bg-base-300`}
              >
                <MapIcon className="w-8 h-8" />
              </div>
              <span className="text-xs text-center">Mail Generator</span>
            </Link>
          </li>
        </ul>
      </div>
      {/* Settings Section */}
      <div className="p-4">
        <ul className="menu space-y-2">
          <li>
            <Link
              href="/settings"
              className={`flex flex-col items-center gap-2 p-2 hover:bg-base-300 rounded-lg ${
                pathname === '/settings' ? 'bg-base-300' : ''
              }`}
            >
              <CogIcon className="w-8 h-8" />
              <span className="text-xs">Settings</span>
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
