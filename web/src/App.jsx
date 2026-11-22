import { BrowserRouter, Route, Routes } from 'react-router';
import { LazyMotion, MotionConfig, domAnimation } from 'motion/react';
import { Layout } from './components/Layout.jsx';
import { Admin } from './pages/Admin.jsx';
import { AssetDetail } from './pages/AssetDetail.jsx';
import { Catalog } from './pages/Catalog.jsx';
import { NotFound } from './pages/NotFound.jsx';
import { Portfolio } from './pages/Portfolio.jsx';
import { TransactionDetail } from './pages/TransactionDetail.jsx';

export default function App() {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<Catalog />} />
              <Route path="activo/:id" element={<AssetDetail />} />
              <Route path="portafolio" element={<Portfolio />} />
              <Route path="admin" element={<Admin />} />
              <Route path="tx/:hash" element={<TransactionDetail />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </MotionConfig>
    </LazyMotion>
  );
}
