import ThemeProvider from '../components/ThemeProvider';
import Sidebar from '../components/Sidebar';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <style>{`
          /* Hide content until theme is applied to prevent flash */
          body:not(.theme-loaded) {
            visibility: hidden;
          }
            /* Set default zoom to 90% */
          body {
            zoom: 80%;
          }

        `}</style>
      </head>
      <body>
        <ThemeProvider>
          <div className="drawer">
            <input id="sidebar" type="checkbox" className="drawer-toggle" />
            <div className="drawer-content">
              {/* Mobile Navbar */}
              <header className="navbar bg-base-200 lg:hidden fixed top-0 left-0 right-0 z-50">
                <div className="flex-1">
                  <label
                    htmlFor="sidebar"
                    className="btn btn-ghost drawer-button"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    </svg>
                  </label>
                  <a className="btn btn-ghost text-xl">Jobscript</a>
                </div>
              </header>
              {/* Desktop Layout */}
              <div className="flex min-h-screen">
                <div className="hidden lg:block fixed top-0 left-0 w-30 h-full">
                  <Sidebar />
                </div>
                <main className="flex-1 p-4 lg:ml-30 mt-16 lg:mt-0">
                  {children}
                </main>
              </div>
            </div>
            <div className="drawer-side z-40">
              <label
                htmlFor="sidebar"
                aria-label="Close sidebar"
                className="drawer-overlay"
              ></label>
              <Sidebar />
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
