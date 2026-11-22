import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Footer } from './Footer.jsx';
import { Navbar } from './Navbar.jsx';
import { TestnetNotice } from './TestnetNotice.jsx';

export function Layout() {
  const { pathname } = useLocation();
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="flex min-h-dvh flex-col">
      <Navbar />
      {pathname !== '/' && <TestnetNotice />}
      <main className="flex-1">
        <AnimatePresence mode="sync" initial={false}>
          <motion.div key={pathname} initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -5 }} transition={{ duration: 0.12, ease: [0.23, 1, 0.32, 1] }}>
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}
