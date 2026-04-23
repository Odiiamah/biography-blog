import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, ArrowLeft, Eye, EyeOff, Lock, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import SEOHead from '../../components/SEOHead';

export default function ChangePasswordPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!currentPassword.trim()) { setError('Current password is required.'); return; }
    if (newPassword.length < 6) { setError('New password must be at least 6 characters.'); return; }
    if (newPassword !== confirmPassword) { setError('New passwords do not match.'); return; }
    if (currentPassword === newPassword) { setError('New password must be different from current password.'); return; }

    setLoading(true);

    // Verify current password by re-authenticating
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user!.email!,
      password: currentPassword,
    });

    if (signInError) {
      setError('Current password is incorrect.');
      setLoading(false);
      return;
    }

    // Update password
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setSuccess(true);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <>
      <SEOHead title="Change Password — BiographyHub Admin" />

      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900 border-b border-slate-800 h-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
          <Link to="/admin/dashboard" className="flex items-center gap-2 text-white">
            <div className="w-7 h-7 bg-amber-500 rounded-lg flex items-center justify-center">
              <BookOpen size={14} />
            </div>
            <span className="font-bold text-sm">BiographyHub Admin</span>
          </Link>
          <Link
            to="/admin/dashboard"
            className="text-slate-400 hover:text-white text-xs transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </header>

      <div className="pt-14 min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-3 mb-6">
            <Link to="/admin/dashboard" className="text-slate-400 hover:text-slate-700 transition-colors">
              <ArrowLeft size={18} />
            </Link>
            <h1 className="text-xl font-bold text-slate-900">Change Password</h1>
          </div>

          <div className="bg-white border border-slate-100 rounded-2xl p-8 shadow-sm">
            {success ? (
              <div className="text-center py-6">
                <CheckCircle size={48} className="text-emerald-500 mx-auto mb-4" />
                <h2 className="text-lg font-bold text-slate-900 mb-2">Password Updated</h2>
                <p className="text-slate-500 text-sm mb-6">Your password has been changed successfully.</p>
                <Link
                  to="/admin/dashboard"
                  className="inline-flex items-center gap-2 bg-amber-500 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-amber-600 transition-colors text-sm"
                >
                  Return to Dashboard
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Current Password</label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showCurrent ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      required
                      className="w-full pl-9 pr-10 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrent(!showCurrent)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">New Password</label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showNew ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      required
                      className="w-full pl-9 pr-10 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {newPassword.length > 0 && (
                    <div className="mt-1.5">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map((level) => (
                          <div
                            key={level}
                            className={`h-1 flex-1 rounded-full ${
                              newPassword.length >= level * 3
                                ? newPassword.length >= 12 ? 'bg-emerald-500' : newPassword.length >= 8 ? 'bg-amber-500' : 'bg-red-400'
                                : 'bg-slate-200'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        {newPassword.length < 6 ? 'Too short' : newPassword.length < 8 ? 'Fair' : newPassword.length < 12 ? 'Good' : 'Strong'}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm New Password</label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      required
                      className="w-full pl-9 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                    />
                    {confirmPassword.length > 0 && (
                      <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium ${newPassword === confirmPassword ? 'text-emerald-600' : 'text-red-500'}`}>
                        {newPassword === confirmPassword ? 'Match' : 'Mismatch'}
                      </span>
                    )}
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2.5">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-amber-500 text-white font-semibold py-3 rounded-xl hover:bg-amber-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <Lock size={16} />
                  )}
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
