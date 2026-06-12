import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  LayoutDashboard, Users, CalendarDays, ClipboardCheck, Settings, LogOut, 
  FileText, BarChart3, Briefcase, Mail, Sparkles, Bell, X, Check, Trash2,
  Info, AlertTriangle, CheckCircle2, Inbox, Banknote, Network, Receipt
} from 'lucide-react';
import axiosInstance from '../../services/axiosInstance';

const Sidebar = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');

  const handleLogout = () => {
    dispatch({ type: 'auth/logout' });
    navigate('/login');
  };

  const fetchNotifications = async () => {
    try {
      const res = await axiosInstance.get('/notifications');
      if (res.data?.success) {
        setNotifications(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Poll notifications every 20 seconds
      const interval = setInterval(fetchNotifications, 20000);
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

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['Admin', 'HR', 'Manager', 'Employee', 'Leadership'] },
    { name: 'Notifications', isButton: true, onClick: () => setShowNotifPanel(!showNotifPanel), icon: Bell, badge: unreadCount, roles: ['Admin', 'HR', 'Manager', 'Employee', 'Leadership'] },
    { name: user?.role === 'Employee' ? 'My Profile' : 'Employees', path: '/employees', icon: Users, roles: ['Admin', 'HR', 'Manager', 'Employee', 'Leadership'] },
    { name: 'Attendance', path: '/attendance', icon: CalendarDays, roles: ['Admin', 'HR', 'Manager', 'Employee', 'Leadership'] },
    { name: 'Leaves', path: '/leaves', icon: ClipboardCheck, roles: ['Admin', 'HR', 'Manager', 'Employee', 'Leadership'] },
    { name: 'Documents', path: '/documents', icon: FileText, roles: ['Admin', 'HR', 'Manager', 'Employee', 'Leadership'] },
    { name: 'Job Board', path: '/jobs', icon: Briefcase, roles: ['Admin', 'HR', 'Manager', 'Employee', 'Leadership'] },
    { name: 'Payroll', path: '/payroll', icon: Banknote, roles: ['Admin', 'HR', 'Manager', 'Employee', 'Leadership'] },
    { name: 'Org Chart', path: '/org-chart', icon: Network, roles: ['Admin', 'HR', 'Manager', 'Employee', 'Leadership'] },
    { name: 'Expenses', path: '/expenses', icon: Receipt, roles: ['Admin', 'HR', 'Manager', 'Employee', 'Leadership'] },
    { name: 'Direct Email', path: '/emails', icon: Mail, roles: ['Admin', 'HR'] },
    { name: 'Reports', path: '/reports', icon: BarChart3, roles: ['Admin', 'HR', 'Manager', 'Leadership'] },
    { name: 'AI Analytics', path: '/ai-analytics', icon: Sparkles, roles: ['Admin', 'HR', 'Manager', 'Leadership'] },
    { name: 'Settings', path: '/settings', icon: Settings, roles: ['Admin', 'HR'] },
  ];

  // Filters for notifications
  const filters = [
    { name: 'All', type: null },
    { name: 'Leaves', type: 'Leave' },
    { name: 'Jobs', type: 'Job' },
    { name: 'Docs', type: 'Document' },
    { name: 'Attendance', type: 'Attendance' },
    { name: 'Emails', type: 'Email' },
    { name: 'System', type: ['Info', 'Success', 'Warning', 'Error'] }
  ];

  const filteredNotifications = notifications.filter(notif => {
    if (activeFilter === 'All') return true;
    const filterObj = filters.find(f => f.name === activeFilter);
    if (!filterObj) return true;
    
    if (Array.isArray(filterObj.type)) {
      return filterObj.type.includes(notif.type);
    }
    return notif.type === filterObj.type;
  });

  const getNotifTypeStyles = (type) => {
    switch (type) {
      case 'Leave':
        return { icon: ClipboardCheck, bg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' };
      case 'Attendance':
        return { icon: CalendarDays, bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
      case 'Job':
        return { icon: Briefcase, bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
      case 'Document':
        return { icon: FileText, bg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' };
      case 'Email':
        return { icon: Mail, bg: 'bg-purple-500/10 text-purple-400 border-purple-500/20' };
      case 'Error':
        return { icon: AlertTriangle, bg: 'bg-rose-500/10 text-rose-400 border-rose-500/20' };
      case 'Warning':
        return { icon: AlertTriangle, bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
      case 'Success':
        return { icon: CheckCircle2, bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
      default:
        return { icon: Info, bg: 'bg-slate-500/10 text-slate-400 border-slate-500/20' };
    }
  };

  return (
    <>
      <aside className="w-64 bg-[var(--theme-sidebar)] border-r border-[var(--theme-border)] flex flex-col h-screen sticky top-0 z-40 transition-colors duration-300">
        <div className="p-6 pb-2 flex-shrink-0">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[var(--theme-accent)] flex items-center justify-center shadow-lg shadow-[var(--theme-accent-glow)]">
              <span className="text-white font-bold text-xl">E</span>
            </div>
            <div>
              <h1 className="font-bold text-lg leading-none">EMS Platform</h1>
              <span className="text-xs text-[var(--theme-accent)] font-medium">Enterprise Hub</span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-2">
          <nav className="space-y-1">
            {navItems
              .filter((item) => !item.roles || (user && item.roles.includes(user.role)))
              .map((item) => {
                const Icon = item.icon;
                if (item.isButton) {
                  const isActive = showNotifPanel;
                  return (
                    <button
                      key={item.name}
                      onClick={item.onClick}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-205 ${
                        isActive
                          ? 'bg-[var(--theme-accent)] text-white shadow-lg shadow-[var(--theme-accent-glow)]'
                          : 'text-[var(--theme-text-muted)] hover:bg-[var(--theme-border)] hover:text-[var(--theme-text)]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5" />
                        <span>{item.name}</span>
                      </div>
                      {item.badge > 0 && (
                        <span className={`px-2 py-0.5 text-2xs rounded-full font-bold transition-all ${
                          isActive ? 'bg-white text-[var(--theme-accent)]' : 'bg-[var(--theme-accent)] text-white'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                }

                return (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-205 ${
                        isActive
                          ? 'bg-[var(--theme-accent)] text-white shadow-lg shadow-[var(--theme-accent-glow)]'
                          : 'text-[var(--theme-text-muted)] hover:bg-[var(--theme-border)] hover:text-[var(--theme-text)]'
                      }`
                    }
                  >
                    <Icon className="w-5 h-5" />
                    {item.name}
                  </NavLink>
                );
              })}
          </nav>
        </div>

        <div className="p-6 border-t border-[var(--theme-border)] flex-shrink-0 mt-auto">
          <div className="flex items-center gap-3 mb-4 p-2 rounded-xl bg-[var(--theme-card)] border border-[var(--theme-border)]">
            <div className="w-8 h-8 rounded-full bg-[var(--theme-border)] flex items-center justify-center font-semibold text-sm text-[var(--theme-accent)]">
              {user?.employeeProfile?.firstName?.[0] || 'U'}
            </div>
            <div className="overflow-hidden">
              <h4 className="text-sm font-semibold truncate leading-none mb-1 text-[var(--theme-text)]">
                {user?.employeeProfile ? `${user.employeeProfile.firstName} ${user.employeeProfile.lastName}` : 'System User'}
              </h4>
              <span className="text-xs text-[var(--theme-text-muted)] font-medium truncate block capitalize">{user?.role}</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--theme-border)] hover:bg-red-500/10 hover:border-red-500/30 text-[var(--theme-text-muted)] hover:text-red-400 text-sm font-medium transition-all duration-200"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Sidebar Notification sliding drawer panel */}
      <div 
        className={`fixed top-0 bottom-0 w-96 bg-[var(--theme-sidebar)] border-r border-[var(--theme-border)] z-30 shadow-2xl flex flex-col backdrop-blur-md transition-all duration-300 ease-out ${
          showNotifPanel ? 'left-64' : '-left-[384px] pointer-events-none'
        }`}
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-[var(--theme-border)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-[var(--theme-accent)]" />
            <h3 className="font-bold text-[var(--theme-text)]">Notifications</h3>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 bg-[var(--theme-accent-glow)] text-[var(--theme-accent)] border border-[var(--theme-border)] text-[10px] rounded-full font-bold">
                {unreadCount} new
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllRead}
                title="Mark all as read"
                className="p-1.5 text-[var(--theme-text-muted)] hover:text-[var(--theme-accent)] hover:bg-[var(--theme-border-muted)] rounded-lg transition-all"
              >
                <Check className="w-4 h-4" />
              </button>
            )}
            <button 
              onClick={() => setShowNotifPanel(false)}
              className="p-1.5 text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-border-muted)] rounded-lg transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Tab Chips */}
        <div className="px-4 py-3 border-b border-[var(--theme-border)] flex gap-1.5 overflow-x-auto no-scrollbar scroll-smooth">
          {filters.map((f) => (
            <button
              key={f.name}
              onClick={() => setActiveFilter(f.name)}
              className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all whitespace-nowrap ${
                activeFilter === f.name
                  ? 'bg-[var(--theme-accent)] text-white shadow-md'
                  : 'bg-[var(--theme-border)] text-[var(--theme-text-muted)] hover:bg-[var(--theme-border-muted)] hover:text-[var(--theme-text)]'
              }`}
            >
              {f.name}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-[var(--theme-text-muted)]">
              <Inbox className="w-10 h-10 mb-3 stroke-[1.5]" />
              <p className="text-xs font-semibold">No {activeFilter === 'All' ? '' : activeFilter.toLowerCase()} notifications</p>
            </div>
          ) : (
            filteredNotifications.map((notif) => {
              const styles = getNotifTypeStyles(notif.type);
              const NotifIcon = styles.icon;
              return (
                <div
                  key={notif._id}
                  onClick={() => !notif.read && handleMarkAsRead(notif._id)}
                  className={`p-3 rounded-2xl border flex items-start gap-3 relative transition-all group cursor-pointer ${
                    notif.read
                      ? 'bg-[var(--theme-card)] border-[var(--theme-border-muted)] text-[var(--theme-text-muted)] hover:bg-[var(--theme-border)]'
                      : 'bg-[var(--theme-accent-glow)] border-[var(--theme-accent)]/20 text-[var(--theme-text)] hover:opacity-90'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 border ${styles.bg}`}>
                    <NotifIcon className="w-4 h-4" />
                  </div>
                  
                  <div className="flex-1 min-w-0 pr-4">
                    <p className="font-semibold text-xs truncate leading-snug">{notif.title}</p>
                    <p className="text-[11px] text-[var(--theme-text-muted)] mt-1 leading-normal break-words">{notif.message}</p>
                    <span className="text-[9px] text-[var(--theme-text-muted)] mt-2 block">
                      {new Date(notif.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <div className="absolute right-3 top-3 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => handleDeleteNotification(notif._id, e)}
                      title="Delete notification"
                      className="p-1 text-[var(--theme-text-muted)] hover:text-rose-450 hover:bg-[var(--theme-border-muted)] rounded-md transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
