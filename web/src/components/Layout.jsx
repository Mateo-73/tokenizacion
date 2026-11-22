import { useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router';
import { m } from 'motion/react';
import { EASE_OUT } from '../lib/motion.js';
import { Footer } from './Footer.jsx';
import { Navbar } from './Navbar.jsx';
import { TestnetNotice } from './TestnetNotice.jsx';

export function Layout() {
  const { pathname } = useLocation();
  const firstRender = useRef(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    firstRender.current = false;
  }, [pathname]);

  return (
    <div className="flex min-h-dvh flex-col">
      <Navbar />
      {pathname !== '/' && <TestnetNotice />}
      <main className="flex-1">
        <m.div
          key={pathname}
          initial={firstRender.current ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, ease: EASE_OUT }}
        >
          <Outlet />
        </m.div>
      </main>
      <Footer />
    </div>
  );
}
