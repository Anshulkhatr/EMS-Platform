import React, { useEffect, useState } from 'react';
import { Users, ChevronDown, ChevronRight, Building2, Crown, User, Search } from 'lucide-react';
import axiosInstance from '../../services/axiosInstance';

const DEPT_COLORS = [
  { bg: 'from-indigo-600 to-purple-600', ring: 'ring-indigo-500/30', badge: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
  { bg: 'from-emerald-600 to-teal-600', ring: 'ring-emerald-500/30', badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  { bg: 'from-amber-600 to-orange-600', ring: 'ring-amber-500/30', badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  { bg: 'from-rose-600 to-pink-600', ring: 'ring-rose-500/30', badge: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
  { bg: 'from-cyan-600 to-blue-600', ring: 'ring-cyan-500/30', badge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' },
  { bg: 'from-violet-600 to-indigo-600', ring: 'ring-violet-500/30', badge: 'bg-violet-500/10 text-violet-400 border-violet-500/20' },
];

const getDeptColor = (deptName, index) => DEPT_COLORS[index % DEPT_COLORS.length];

// ─── OrgNode Component ───────────────────────────────────────────────────
const OrgNode = ({ node, children, depth = 0, colorScheme, search }) => {
  const [collapsed, setCollapsed] = useState(false);
  const hasChildren = children && children.length > 0;
  const isRoot = depth === 0;

  const matchesSearch = search
    ? node.name?.toLowerCase().includes(search.toLowerCase()) ||
      node.title?.toLowerCase().includes(search.toLowerCase()) ||
      node.department?.toLowerCase().includes(search.toLowerCase())
    : true;

  if (!matchesSearch && !hasChildren) return null;

  return (
    <div className="flex flex-col items-center">
      {/* Vertical connector line from parent */}
      {depth > 0 && (
        <div className="w-px h-8 bg-[var(--theme-border)]" />
      )}

      {/* Node Card */}
      <div
        onClick={() => hasChildren && setCollapsed(!collapsed)}
        className={`relative flex flex-col items-center group transition-all duration-300 ${hasChildren ? 'cursor-pointer' : ''}`}
      >
        <div className={`
          relative w-44 glass border border-[var(--theme-border)] rounded-2xl p-4 text-center shadow-lg
          transition-all duration-300
          ${hasChildren ? 'hover:border-[var(--theme-accent)] hover:shadow-xl hover:shadow-[var(--theme-accent-glow)]' : ''}
          ${isRoot ? 'ring-2 ' + colorScheme.ring : ''}
          ${!matchesSearch && hasChildren ? 'opacity-50' : 'opacity-100'}
        `}>
          {/* Avatar */}
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorScheme.bg} flex items-center justify-center font-bold text-white text-lg mx-auto mb-2 shadow-md`}>
            {node.name?.[0] || '?'}
          </div>

          {/* Crown for top-level */}
          {!node.parentId && (
            <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
              <Crown className="w-4 h-4 text-amber-400 fill-amber-400" />
            </div>
          )}

          <p className="font-bold text-xs text-[var(--theme-text)] leading-snug truncate w-full" title={node.name}>{node.name}</p>
          <p className="text-[10px] text-[var(--theme-text-muted)] mt-0.5 truncate w-full" title={node.title}>{node.title || 'N/A'}</p>

          {node.department && (
            <span className={`inline-block mt-2 px-2 py-0.5 text-[9px] font-bold rounded-full border ${colorScheme.badge} truncate max-w-full`}>
              {node.department}
            </span>
          )}

          {/* Expand/Collapse toggle */}
          {hasChildren && (
            <div className={`absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-[var(--theme-accent)] flex items-center justify-center shadow-md transition-transform duration-300 ${collapsed ? 'rotate-0' : 'rotate-180'}`}>
              <ChevronDown className="w-3 h-3 text-white" />
            </div>
          )}
        </div>
      </div>

      {/* Children */}
      {hasChildren && !collapsed && (
        <div className="flex flex-col items-center">
          {/* Vertical stem down */}
          <div className="w-px h-8 bg-[var(--theme-border)]" />

          {/* Horizontal bar connecting children */}
          {children.length > 1 && (
            <div className="relative flex items-start justify-center">
              <div
                className="absolute top-0 h-px bg-[var(--theme-border)]"
                style={{ left: '50px', right: '50px' }}
              />
            </div>
          )}

          <div className={`flex gap-6 items-start`}>
            {children.map((child, idx) => (
              <OrgNode
                key={child.id}
                node={child}
                children={child._children}
                depth={depth + 1}
                colorScheme={getDeptColor(child.department, (depth + idx + 1))}
                search={search}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────
const OrgChartPage = () => {
  const [orgData, setOrgData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('tree'); // 'tree' | 'list'

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axiosInstance.get('/employees/org-chart');
        setOrgData(res.data?.data || []);
      } catch (err) {
        console.error('Failed to load org chart:', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  // Build tree from flat list
  const buildTree = (nodes) => {
    const map = {};
    const roots = [];
    nodes.forEach(n => { map[n.id] = { ...n, _children: [] }; });
    nodes.forEach(n => {
      if (n.parentId && map[n.parentId]) {
        map[n.parentId]._children.push(map[n.id]);
      } else if (!n.parentId) {
        roots.push(map[n.id]);
      }
    });
    return roots;
  };

  const treeRoots = buildTree(orgData);

  const filteredList = search
    ? orgData.filter(n =>
        n.name?.toLowerCase().includes(search.toLowerCase()) ||
        n.title?.toLowerCase().includes(search.toLowerCase()) ||
        n.department?.toLowerCase().includes(search.toLowerCase())
      )
    : orgData;

  // Dept summary
  const deptMap = {};
  orgData.forEach(n => {
    if (n.department) {
      deptMap[n.department] = (deptMap[n.department] || 0) + 1;
    }
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--theme-text)]">Organization Chart</h1>
          <p className="text-[var(--theme-text-muted)] mt-1">Visual hierarchy of your company's team structure and reporting lines.</p>
        </div>
        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="glass flex border border-[var(--theme-border)] rounded-xl overflow-hidden">
            {['tree', 'list'].map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-4 py-2 text-sm font-semibold capitalize transition-all ${
                  viewMode === mode
                    ? 'bg-[var(--theme-accent)] text-white'
                    : 'text-[var(--theme-text-muted)] hover:text-[var(--theme-text)]'
                }`}
              >
                {mode === 'tree' ? '🌳 Tree' : '📋 List'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass p-4 rounded-2xl border border-[var(--theme-border)] text-center">
          <Users className="w-5 h-5 text-indigo-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-[var(--theme-text)]">{orgData.length}</p>
          <p className="text-xs text-[var(--theme-text-muted)] font-medium">Total Employees</p>
        </div>
        <div className="glass p-4 rounded-2xl border border-[var(--theme-border)] text-center">
          <Building2 className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-[var(--theme-text)]">{Object.keys(deptMap).length}</p>
          <p className="text-xs text-[var(--theme-text-muted)] font-medium">Departments</p>
        </div>
        <div className="glass p-4 rounded-2xl border border-[var(--theme-border)] text-center">
          <Crown className="w-5 h-5 text-amber-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-[var(--theme-text)]">{treeRoots.length}</p>
          <p className="text-xs text-[var(--theme-text-muted)] font-medium">Top-Level Leaders</p>
        </div>
        <div className="glass p-4 rounded-2xl border border-[var(--theme-border)] text-center">
          <User className="w-5 h-5 text-purple-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-[var(--theme-text)]">{orgData.filter(n => n.parentId).length}</p>
          <p className="text-xs text-[var(--theme-text-muted)] font-medium">Team Members</p>
        </div>
      </div>

      {/* Departments Summary Pills */}
      {Object.keys(deptMap).length > 0 && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(deptMap).map(([dept, count], i) => (
            <span
              key={dept}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold ${getDeptColor(dept, i).badge}`}
            >
              {dept} ({count})
            </span>
          ))}
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-[var(--theme-text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search by name, designation, department..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-[var(--theme-input-bg)] border border-[var(--theme-border)] rounded-xl py-2.5 pl-10 pr-4 text-sm text-[var(--theme-text)] placeholder-[var(--theme-text-muted)] outline-none focus:border-[var(--theme-accent)] transition-all"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : orgData.length === 0 ? (
        <div className="glass flex flex-col items-center justify-center py-24 text-[var(--theme-text-muted)] rounded-3xl border border-[var(--theme-border)]">
          <Users className="w-12 h-12 mb-3 stroke-[1.5] opacity-40" />
          <p className="font-semibold">No employee data found</p>
          <p className="text-sm mt-1 opacity-60">Add employees to see the org chart.</p>
        </div>
      ) : viewMode === 'tree' ? (
        /* ── Tree View ── */
        <div className="glass border border-[var(--theme-border)] rounded-3xl p-8 overflow-x-auto">
          <div className="flex justify-center min-w-max">
            {treeRoots.length === 0 ? (
              <p className="text-[var(--theme-text-muted)] text-sm">No hierarchy found.</p>
            ) : treeRoots.length === 1 ? (
              <OrgNode
                node={treeRoots[0]}
                children={treeRoots[0]._children}
                depth={0}
                colorScheme={getDeptColor(treeRoots[0].department, 0)}
                search={search}
              />
            ) : (
              <div className="flex gap-12 items-start">
                {treeRoots.map((root, idx) => (
                  <OrgNode
                    key={root.id}
                    node={root}
                    children={root._children}
                    depth={0}
                    colorScheme={getDeptColor(root.department, idx)}
                    search={search}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ── List View ── */
        <div className="glass border border-[var(--theme-border)] rounded-3xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--theme-border)] bg-[var(--theme-card)] text-xs font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider">
                  <th className="p-4 pl-6">Employee</th>
                  <th className="p-4">Designation</th>
                  <th className="p-4">Department</th>
                  <th className="p-4 pr-6">Reports To</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--theme-border-muted)] text-sm">
                {filteredList.map((emp, idx) => {
                  const color = getDeptColor(emp.department, idx);
                  const manager = orgData.find(n => n.id === emp.parentId);
                  return (
                    <tr key={emp.id} className="hover:bg-[var(--theme-border-muted)] transition-all">
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${color.bg} flex items-center justify-center font-bold text-white text-sm flex-shrink-0`}>
                            {emp.name?.[0] || '?'}
                          </div>
                          <div>
                            <p className="font-semibold text-[var(--theme-text)]">{emp.name}</p>
                            {!emp.parentId && (
                              <span className="text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full px-1.5 py-0.5 font-bold">
                                Leadership
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-[var(--theme-text-muted)]">{emp.title || 'N/A'}</td>
                      <td className="p-4">
                        {emp.department ? (
                          <span className={`px-2.5 py-1 text-[10px] font-semibold rounded-lg border ${color.badge}`}>
                            {emp.department}
                          </span>
                        ) : (
                          <span className="text-[var(--theme-text-muted)]">—</span>
                        )}
                      </td>
                      <td className="p-4 pr-6">
                        {manager ? (
                          <div className="flex items-center gap-2 text-[var(--theme-text-muted)]">
                            <ChevronRight className="w-3.5 h-3.5" />
                            <span className="text-[var(--theme-text)]">{manager.name}</span>
                          </div>
                        ) : (
                          <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full px-2.5 py-0.5 font-bold">
                            Top Level
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrgChartPage;
