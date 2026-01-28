import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Logs from './pages/LogKegiatan';
import PresensiMasuk from './pages/PresensiMasuk';
import Profil from './pages/Profil';
import EksporKegiatan from './pages/EksporKegiatan';
import EksporPresensi from './pages/EksporPresensi';
import PengajuanIzin from './pages/PengajuanIzin';
import RiwayatIzin from './pages/RiwayatIzin';
import CameraTest from './pages/CameraTest';

function App() {
    return (
        <Router>
            <AuthProvider>
                {/* Decorative Batik Background (Fixed) - Global */}
                <div className="fixed inset-0 bg-batik-pattern z-0 pointer-events-none opacity-5"></div>

                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="/dashboard" element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    } />
                    <Route path="/log-kegiatan" element={
                        <ProtectedRoute>
                            <Logs />
                        </ProtectedRoute>
                    } />
                    <Route path="/presensi-masuk" element={
                        <ProtectedRoute>
                            <PresensiMasuk />
                        </ProtectedRoute>
                    } />
                    <Route path="/profil" element={
                        <ProtectedRoute>
                            <Profil />
                        </ProtectedRoute>
                    } />
                    <Route path="/ekspor-kegiatan" element={
                        <ProtectedRoute>
                            <EksporKegiatan />
                        </ProtectedRoute>
                    } />
                    <Route path="/ekspor-presensi" element={
                        <ProtectedRoute>
                            <EksporPresensi />
                        </ProtectedRoute>
                    } />
                    <Route path="/pengajuan-izin" element={
                        <ProtectedRoute>
                            <PengajuanIzin />
                        </ProtectedRoute>
                    } />
                    <Route path="/riwayat-izin" element={
                        <ProtectedRoute>
                            <RiwayatIzin />
                        </ProtectedRoute>
                    } />
                    <Route path="/camera-test" element={<CameraTest />} />
                </Routes>
            </AuthProvider>
        </Router>
    );
}

export default App;
