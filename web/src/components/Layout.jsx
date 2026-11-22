import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router';
import { Footer } from './Footer.jsx';
import { Navbar } from './Navbar.jsx';
import { TestnetNotice } from './TestnetNotice.jsx';

export function Layout() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="flex min-h-dvh flex-col">
      <Navbar />
      {pathname !== '/' && <TestnetNotice />}
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
