/*
 * ExtremaduraStats
 * Copyright (C) 2026 Gonzalo Suárez Barrientos <suarezbarrientosgonzalo@gmail.com>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 */
import { Routes, Route } from 'react-router-dom';
import Navbar from "./components/Navbar";
import ScrollToTop from './components/ScrollToTop';
import Inicio from "./pages/Inicio"
import Temporada from './pages/Temporada';
import DetallePartido from './pages/DetallePartido';
import PerfilJugador from './pages/PerfilJugador';
import Palmares from './pages/Palmares';
import JugadoresHistoricos from './pages/Jugadores';
import Entrenadores from './pages/Entrenadores';
import PerfilEntrenador from './pages/PerfilEntrenador';
import Contacto from './pages/Contacto';
import PoliticaPrivacidad from './pages/PoliticaPrivacidad';
import AvisoLegal from './pages/AvisoLegal';
import NotFound from './pages/NotFound';
import Footer from './components/Footer';

export default function App() {
  return (
    <>
      <a href="#main-content" className="skip-link">Saltar al contenido principal</a>
      <Navbar />

      <main id="main-content" className="p-md">
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/temporadas" element={<Temporada />} />
          <Route path="/partido/:id" element={<DetallePartido />} />
          <Route path="/jugador/:id" element={<PerfilJugador />} />
          <Route path="/palmares" element={<Palmares />} />
          <Route path="/jugadores" element={<JugadoresHistoricos />} />
          <Route path="/entrenadores" element={<Entrenadores />} />
          <Route path="/entrenador/:id" element={<PerfilEntrenador />} />
          <Route path="/contacto" element={<Contacto />} />
          <Route path="/politica-privacidad" element={<PoliticaPrivacidad />} />
          <Route path="/aviso-legal" element={<AvisoLegal />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <Footer />
    </>
  )
}