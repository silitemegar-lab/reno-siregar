import React, { useState } from 'react';
import { Check, Info, KeyRound, Lock, ShieldCheck, UserCheck, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { hashString } from '../utils/crypto';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, login, logout } = useApp();
  const [selectedRole, setSelectedRole] = useState<'admin' | 'user'>(currentUser.role);
  const [username, setUsername] = useState(currentUser.username || (currentUser.role === 'admin' ? 'admin' : 'saksi01'));
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState(currentUser.displayName || '');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (selectedRole === 'admin') {
      // Required: user admin, password admin
      if (username.trim().toLowerCase() !== 'admin' || password !== 'admin') {
        setErrorMessage('Username atau kata sandi Admin salah! Gunakan username: admin dan password: admin');
        return;
      }
      const finalName = displayName.trim() || 'Admin Tim Inti Paman Usman';
      login('admin', 'admin', finalName);
      setSuccessMessage(`Berhasil login sebagai Admin: ${finalName}`);
      setTimeout(() => {
        onClose();
      }, 700);
    } else {
      // User: password user
      if (password !== 'user') {
        setErrorMessage('Kata sandi User salah! Gunakan kata sandi: user');
        return;
      }
      const finalUsername = username.trim() || 'user';
      const finalName = displayName.trim() || `Saksi Tim (${finalUsername})`;
      login('user', finalUsername, finalName);
      setSuccessMessage(`Berhasil masuk sebagai Saksi/User: ${finalName}`);
      setTimeout(() => {
        onClose();
      }, 700);
    }
  };

  const handleQuickSwitch = (role: 'admin' | 'user') => {
    setSelectedRole(role);
    setErrorMessage('');
    setSuccessMessage('');
    if (role === 'admin') {
      setUsername('admin');
      setPassword('admin');
      setDisplayName('Koordinator Admin Tim Usman');
    } else {
      setUsername('saksi_tracap');
      setPassword('user');
      setDisplayName('Saksi TPS Lapangan');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-900 px-6 py-5 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-600/30 border border-blue-500/40 text-blue-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Autentikasi & Identitas Tim</h3>
              <p className="text-xs text-slate-400">Sistem Keamanan Pilkades Desa Tracap</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Active User Status */}
        <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Sesi Aktif:</span>
            <span className="font-semibold text-slate-800">{currentUser.displayName}</span>
          </div>
          <span
            className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${
              currentUser.role === 'admin'
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : 'bg-blue-100 text-blue-800 border border-blue-300'
            }`}
          >
            {currentUser.role === 'admin' ? 'Akses Admin (Kelola)' : 'Akses User (Lihat Saja)'}
          </span>
        </div>

        {/* Role Selector Tabs */}
        <div className="p-6">
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl mb-5">
            <button
              type="button"
              id="role-admin-tab"
              onClick={() => handleQuickSwitch('admin')}
              className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${
                selectedRole === 'admin'
                  ? 'bg-white text-emerald-700 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Admin (Kelola Data)</span>
            </button>
            <button
              type="button"
              id="role-user-tab"
              onClick={() => handleQuickSwitch('user')}
              className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${
                selectedRole === 'user'
                  ? 'bg-white text-blue-700 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>User (Lihat Saja)</span>
            </button>
          </div>

          {/* Guidelines Notice */}
          <div className="mb-4 p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              {selectedRole === 'admin' ? (
                <span>
                  <strong>Admin:</strong> Username: <code className="bg-blue-100 px-1 rounded font-mono">admin</code>, Kata Sandi:{' '}
                  <code className="bg-blue-100 px-1 rounded font-mono">admin</code>. Memiliki hak akses penuh untuk menginput, mengedit, menghapus pemilih, dan ekspor data.
                </span>
              ) : (
                <span>
                  <strong>User/Saksi:</strong> Kata Sandi:{' '}
                  <code className="bg-blue-100 px-1 rounded font-mono">user</code>. Hanya dapat melihat data, peta persebaran, dan grafik perolehan suara secara aman tanpa mengubah data.
                </span>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {selectedRole === 'admin' ? (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Username Admin
                </label>
                <input
                  type="text"
                  id="login-username-input"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="admin"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  required
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Username / ID Saksi TPS
                </label>
                <input
                  type="text"
                  id="login-username-input"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Contoh: saksi_tps01"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tanda / Nama Lengkap Petugas
              </label>
              <input
                type="text"
                id="login-displayname-input"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder={selectedRole === 'admin' ? 'Misal: Budi Santoso (Admin Tim Inti)' : 'Misal: Slamet (Saksi TPS 01)'}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Nama ini akan tercatat pada log aktivitas setiap ada pemantauan atau perubahan data.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kata Sandi (Terenkripsi)
              </label>
              <div className="relative">
                <input
                  type="password"
                  id="login-password-input"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={selectedRole === 'admin' ? 'admin' : 'user'}
                  className="w-full pl-3 pr-9 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                  required
                />
                <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
              </div>
              {password && (
                <div className="text-[10px] text-slate-400 font-mono mt-1 truncate">
                  Hash Enkripsi: {hashString(password)}
                </div>
              )}
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                {errorMessage}
              </div>
            )}

            {successMessage && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>{successMessage}</span>
              </div>
            )}

            <div className="pt-2 flex items-center gap-3">
              <button
                type="submit"
                id="submit-login-btn"
                className={`flex-1 py-2.5 px-4 rounded-xl text-white font-bold text-xs shadow-md transition ${
                  selectedRole === 'admin'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                Masuk Sebagai {selectedRole === 'admin' ? 'Admin' : 'User/Saksi'}
              </button>

              {currentUser.role === 'admin' && (
                <button
                  type="button"
                  id="logout-btn"
                  onClick={() => {
                    logout();
                    onClose();
                  }}
                  className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
                >
                  Keluar Sesi
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
