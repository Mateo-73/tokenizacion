import { BrowserRouter, Route, Routes } from 'react-router';
import { Layout } from './components/Layout.jsx';
import { Admin, AssetDetail, Catalog, NotFound, Portfolio } from './pages/Pages.jsx';

export default function App() { return <BrowserRouter><Layout><Routes><Route path="/" element={<Catalog />} /><Route path="/activo/:id" element={<AssetDetail />} /><Route path="/portafolio" element={<Portfolio />} /><Route path="/admin" element={<Admin />} /><Route path="*" element={<NotFound />} /></Routes></Layout></BrowserRouter>; }
