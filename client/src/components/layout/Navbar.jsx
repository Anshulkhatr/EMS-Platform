import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Bell, Search, Check, Trash, Palette } from 'lucide-react';
import axiosInstance from '../../services/axiosInstance';

const Navbar = () => {
  const { user } = useSelector((state) => state.auth);
  const [notifications, setNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(localStorage.getItem('ems-theme') || 'slate');

  const themes = [
    { id: 'slate', name: 'Glass Slate', bg: 'bg-[#090d16]', border: 'border-[#1e293b]', accent: 'bg-[#6366f1]' },
    { id: 'light', name: 'Elegant Light', bg: 'bg-[#f8fafc]', border: 'border-[#e2e8f0]', accent: 'bg-[#4f46e5]' },
    { id: 'cyberpunk', name: 'Cyberpunk Neon', bg: 'bg-[#030303]', border: 'border-[#06b6d4]', accent: 'bg-[#06b6d4]' },
    { id: 'deep-space', name: 'Deep Space', bg: 'bg-[#05020c]', border: 'border-[#7c3aed]', accent: 'bg-[#a78bfa]' }
  ];

  const handleThemeChange = (themeId) => {
    setCurrentTheme(themeId);
    document.documentElement.setAttribute('data-theme', themeId);
    localStorage.setItem('ems-theme', themeId);
    setShowThemeMenu(false);
  };

  const fetchNotifications = async () => {
    try {
      const res = await axiosInstance.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Poll notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleMarkAsRead = async (id) => {
    try {
      await axiosInstance.put(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await axiosInstance.put('/notifications/read-all');
      fetchNotifications();
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const handleDeleteNotification = async (id, e) => {
    e.stopPropagation();
    try {
      await axiosInstance.delete(`/notifications/${id}`);
      fetchNotifications();
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="h-16 border-b border-[var(--theme-border)] bg-[var(--theme-navbar)] px-8 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md transition-colors duration-300">
      <div className="flex items-center gap-4">
        <div className="relative w-64">
          <Search className="w-4 h-4 text-[var(--theme-text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search dashboard..."
            className="w-full bg-[var(--theme-input-bg)] border border-[var(--theme-border)] rounded-xl py-1.5 pl-10 pr-4 text-sm focus:outline-none focus:border-[var(--theme-accent)] transition-all text-[var(--theme-text)] placeholder-[var(--theme-text-muted)]"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Theme Switcher */}
        <div className="relative">
          <button 
            onClick={() => setShowThemeMenu(!showThemeMenu)}
            className="p-2 text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-border)] rounded-xl relative transition-all"
            title="Switch Theme"
          >
            <Palette className="w-5 h-5" />
          </button>

          {showThemeMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-[var(--theme-sidebar)] border border-[var(--theme-border)] rounded-2xl shadow-xl p-3 z-50 animate-fade-in-up">
              <div className="flex items-center justify-between mb-2 pb-2 border-b border-[var(--theme-border)]">
                <h3 className="text-xs font-bold text-[var(--theme-text-muted)] uppercase tracking-wider">Themes</h3>
              </div>
              <div className="space-y-1.5">
                {themes.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleThemeChange(t.id)}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-semibold transition-all hover:bg-[var(--theme-border)] ${
                      currentTheme === t.id
                        ? 'text-[var(--theme-accent)] bg-[var(--theme-accent-glow)]'
                        : 'text-[var(--theme-text)]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-5 h-5 rounded-md ${t.bg} border ${t.border} flex items-center justify-center`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${t.accent}`} />
                      </div>
                      <span>{t.name}</span>
                    </div>
                    {currentTheme === t.id && <Check className="w-3.5 h-3.5 text-[var(--theme-accent)]" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => setShowNotif(!showNotif)}
            className="p-2 text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-border)] rounded-xl relative transition-all"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[var(--theme-accent)] rounded-full border-2 border-[var(--theme-sidebar)] animate-pulse"></span>
            )}
          </button>

          {showNotif && (
            <div className="absolute right-0 mt-2 w-80 bg-[var(--theme-sidebar)] border border-[var(--theme-border)] rounded-2xl shadow-xl p-4 z-50">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-[var(--theme-border)]">
                <h3 className="text-sm font-semibold text-[var(--theme-text)]">Notifications ({unreadCount} unread)</h3>
                {unreadCount > 0 && (
                  <button 
                    onClick={handleMarkAllRead}
                    className="text-[10px] text-[var(--theme-accent)] hover:text-[var(--theme-text)] font-semibold flex items-center gap-1"
                  >
                    <Check className="w-3 h-3" /> Mark all read
                  </button>
                )}
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-xs text-[var(--theme-text-muted)] text-center py-4">No notifications</p>
                ) : (
                  notifications.map((notif) => (
                    <div 
                      key={notif._id}
                      onClick={() => !notif.read && handleMarkAsRead(notif._id)}
                      className={`p-2.5 rounded-xl border relative transition-all group cursor-pointer ${
                        notif.read 
                          ? 'bg-[var(--theme-card)] border-[var(--theme-border-muted)] text-[var(--theme-text-muted)]' 
                          : 'bg-[var(--theme-accent-glow)] border-[var(--theme-border)] text-[var(--theme-text)] hover:opacity-90'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <p className="font-semibold text-xs">{notif.title}</p>
                          <p className="text-[11px] text-[var(--theme-text-muted)] mt-0.5">{notif.message}</p>
                        </div>
                        <button
                          onClick={(e) => handleDeleteNotification(notif._id, e)}
                          className="text-[var(--theme-text-muted)] hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity p-0.5"
                        >
                          <Trash className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-[9px] text-[var(--theme-text-muted)] mt-1.5">
                        {new Date(notif.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-[var(--theme-border)]"></div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-semibold">
              {user?.employeeProfile ? `${user.employeeProfile.firstName} ${user.employeeProfile.lastName}` : 'System User'}
            </p>
            <p className="text-xs text-[var(--theme-accent)] font-medium capitalize">{user?.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
