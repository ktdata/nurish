import React from 'react';
import { Sprout, Users, Truck, Globe, PhoneCall, Heart } from 'lucide-react';
import { AppMode, Language } from '../types';
import { TRANSLATIONS } from '../data/mockData';

interface HeaderProps {
  mode: AppMode;
  onModeChange: (mode: AppMode) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onEmergencyClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  mode,
  onModeChange,
  language,
  onLanguageChange,
  onEmergencyClick
}) => {
  const t = TRANSLATIONS[language];

  return (
    <header className="sticky top-0 z-40 bg-[#FFFFFF] border-b border-[#1E5128]/10 shadow-xs">
      {/* Reassuring Community Emergency Banner */}
      <div className="bg-[#1E5128] text-white px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium flex items-center justify-between">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 truncate">
            <Heart className="w-4 h-4 text-[#8CC38F] shrink-0 fill-current" />
            <span className="truncate">{t.emergencyBanner}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onEmergencyClick}
              className="underline hover:text-[#8CC38F] font-semibold text-xs transition-colors cursor-pointer"
            >
              Open Drive-Thru Near Me
            </button>
            <span className="opacity-40">|</span>
            <Google211ReplacementButton />
          </div>
        </div>
      </div>

      {/* Main Brand Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-colors shadow-xs ${
              mode === 'volunteers' ? 'bg-[#2563EB] text-white' : 'bg-[#1E5128] text-white'
            }`}
          >
            {mode === 'volunteers' ? (
              <Truck className="w-6 h-6" />
            ) : (
              <Sprout className="w-6 h-6 text-[#9CD49E]" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-[#111C2D]">
                Nourish<span className={mode === 'volunteers' ? 'text-[#2563EB]' : 'text-[#1E5128]'}>Together</span>
              </span>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  mode === 'volunteers'
                    ? 'bg-[#DBEAFE] text-[#1E40AF]'
                    : 'bg-[#E8EFE9] text-[#1E5128]'
                }`}
              >
                {mode === 'volunteers' ? 'Logistics & Driver' : 'Community Access'}
              </span>
            </div>
            <p className="text-xs text-[#414940] hidden sm:block">
              {mode === 'volunteers'
                ? 'Volunteer Delivery Dispatch & Hub Coordination'
                : 'Dignified Food Sovereignty & Neighbor Mutual Aid'}
            </p>
          </div>
        </div>

        {/* Action Controls & Mode Switcher */}
        <div className="flex items-center gap-2.5 sm:gap-4 ml-auto">
          {/* Language selector */}
          <div className="relative flex items-center">
            <Globe className="w-4 h-4 text-[#71796F] absolute left-2.5 pointer-events-none" />
            <select
              aria-label="Select Language"
              value={language}
              onChange={(e) => onLanguageChange(e.target.value as Language)}
              className="pl-8 pr-3 py-1.5 text-xs font-semibold rounded-full border border-[#CBD5E1] bg-[#F4F7F4] text-[#1E293B] hover:border-[#1E5128] focus:outline-hidden focus:ring-2 focus:ring-[#1E5128] cursor-pointer"
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="vi">Tiếng Việt</option>
              <option value="zh">中文 (Chinese)</option>
              <option value="ar">العربية (Arabic)</option>
            </select>
          </div>

          {/* Mode Switcher: Community Neighbor vs Volunteer Driver */}
          <div className="bg-[#E8EFE9] p-1 rounded-full flex items-center border border-[#1E5128]/15">
            <button
              onClick={() => onModeChange('neighbors')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                mode === 'neighbors'
                  ? 'bg-[#1E5128] text-white shadow-xs'
                  : 'text-[#414940] hover:text-[#111C2D]'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Neighbor</span>
            </button>
            <button
              onClick={() => onModeChange('volunteers')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                mode === 'volunteers'
                  ? 'bg-[#2563EB] text-white shadow-xs'
                  : 'text-[#414940] hover:text-[#111C2D]'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Driver Portal</span>
            </button>
          </div>

          {/* Firebase Authentication Button / Profile */}
          <AuthProfileButton />
        </div>
      </div>
    </header>
  );
};

const Google211ReplacementButton: React.FC = () => {
  const [user, setUser] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    import('../services/firebase').then(({ onUserChange }) => {
      unsubscribe = onUserChange((u) => setUser(u));
    });
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const handleAuth = async () => {
    setLoading(true);
    const { signInWithGoogle } = await import('../services/firebase');
    await signInWithGoogle();
    setLoading(false);
  };

  if (user) {
    return (
      <span className="inline-flex items-center gap-1.5 bg-[#14381B] px-2.5 py-0.5 rounded-full text-[11px] font-bold text-[#8CC38F]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#8CC38F] animate-pulse" />
        <span>Connected: {user.displayName ? user.displayName.split(' ')[0] : 'Google'} (Replaces 211)</span>
      </span>
    );
  }

  return (
    <button
      onClick={handleAuth}
      disabled={loading}
      className="inline-flex items-center gap-1.5 bg-white text-[#1E5128] hover:bg-[#8CC38F] hover:text-[#111C2D] px-2.5 py-0.5 rounded-full text-xs font-bold transition-all shadow-xs cursor-pointer"
      title="Skip 211 hold time: Sign in with Google to request immediate doorstep food assistance"
    >
      <svg className="w-3 h-3 shrink-0" viewBox="0 0 24 24">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        />
      </svg>
      <span>{loading ? 'Connecting...' : 'Sign In with Google (Replaces 211)'}</span>
    </button>
  );
};

const AuthProfileButton: React.FC = () => {
  const [user, setUser] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    import('../services/firebase').then(({ onUserChange }) => {
      unsubscribe = onUserChange((u) => setUser(u));
    });
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const handleAuth = async () => {
    setLoading(true);
    const { signInWithGoogle, logOut } = await import('../services/firebase');
    if (user) {
      await logOut();
    } else {
      await signInWithGoogle();
    }
    setLoading(false);
  };

  if (user) {
    return (
      <div className="flex items-center gap-2 pl-1 border-l border-slate-200">
        <div className="flex items-center gap-1.5 bg-[#F4F7F4] border border-[#1E5128]/20 px-2.5 py-1 rounded-full text-xs">
          {user.photoURL ? (
            <img src={user.photoURL} alt="" className="w-5 h-5 rounded-full object-cover" />
          ) : (
            <div className="w-5 h-5 rounded-full bg-[#1E5128] text-white flex items-center justify-center text-[10px] font-bold">
              {user.displayName ? user.displayName[0] : 'U'}
            </div>
          )}
          <span className="font-semibold text-[#111C2D] max-w-[80px] sm:max-w-[120px] truncate">
            {user.displayName || 'Steward'}
          </span>
          <button
            onClick={handleAuth}
            disabled={loading}
            className="text-[11px] text-slate-500 hover:text-red-600 font-bold ml-1 cursor-pointer"
            title="Sign out of Firebase"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={handleAuth}
      disabled={loading}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-[#111C2D] text-white hover:bg-black transition-colors cursor-pointer shadow-2xs"
      title="Sign in with Google Firebase Auth"
    >
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        />
      </svg>
      <span>{loading ? 'Connecting...' : 'Sign In'}</span>
    </button>
  );
};
