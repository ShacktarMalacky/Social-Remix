import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import SocialPage from "./pages/SocialPage";
import Marketplace from "./pages/Marketplace";
import Messages from "./pages/Messages";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import Layout from "./components/Layout";
import Atmosphere from "./components/Atmosphere";
import { ImmersiveProvider } from "./context/ImmersiveContext";

import Hardware from "./pages/Hardware";
import Galactica from "./pages/Galactica";

export default function App() {
  return (
    <ImmersiveProvider>
      <Router>
        <Atmosphere />
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/galactica" element={<Galactica />} />
            <Route path="/social" element={<SocialPage />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/hardware" element={<Hardware />} />
            <Route path="/mensajes" element={<Messages />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/perfil/:handle" element={<Profile />} />
          </Routes>
        </Layout>
      </Router>
    </ImmersiveProvider>
  );
}
