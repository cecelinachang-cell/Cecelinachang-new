'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Package, Tags, Zap, PlusCircle, ExternalLink, BookOpen, Users, MousePointer2, Activity } from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalItems: 0,
    totalCategories: 0,
    totalCourses: 0,
    uniqueVisitors: 0,
    activeNow: 0,
    totalClicks: 0
  });

  const [topPages, setTopPages] = useState<{path: string, views: number}[]>([]);
  const [recentClicks, setRecentClicks] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchBasicStats = async () => {
      try {
        const [{ count: itemsCount, data: itemsData }, { count: coursesCount }] = await Promise.all([
          supabase.from('items').select('category', { count: 'exact' }),
          supabase.from('courses').select('id', { count: 'exact', head: true }),
        ]);

        if (!isMounted) return;

        const categories = new Set();
        itemsData?.forEach(data => {
          if (data.category && data.category !== 'Semua Produk') {
            categories.add(data.category);
          }
        });

        setStats(prev => ({
          ...prev,
          totalItems: itemsCount || 0,
          totalCategories: categories.size,
          totalCourses: coursesCount || 0,
        }));
        
        // Continue fetching analytics data
        fetchAnalytics();

      } catch (err: any) {
        if (err.message && err.message.includes('schema cache')) {
           console.warn('Supabase schema not initialized yet.');
        } else {
           console.error('Error fetching stats:', err.message || err);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    const fetchAnalytics = async () => {
      try {
        // Fetch all sessions to count unique ones for total visitors
        // In a production app with millions of views, you'd use a postgres function or a summary table.
        const { data: allSessions, error: sessionsErr } = await supabase
          .from('page_views')
          .select('session_id');

        const { count: clicksCount } = await supabase
          .from('clicks')
          .select('id', { count: 'exact', head: true });

        let uniqueVisitors = 0;
        if (allSessions) {
          const sessions = new Set(allSessions.map(s => s.session_id));
          uniqueVisitors = sessions.size;
        }

        let activeNow = 0;
        let totalClicks = clicksCount || 0;
        let topPagesData: {path: string, views: number}[] = [];
        let clicksData: any[] = [];
        
        try {
          const nowMs = Date.now();
          const fiveMinsAgoMs = nowMs - 5 * 60000;
          const fiveMinsAgoIso = new Date(fiveMinsAgoMs).toISOString();

          // Load active sessions softly
          const [recentViewsResponse, recentClicksResponse, sampledViewsResponse] = await Promise.all([
             supabase.from('page_views').select('session_id').gte('created_at', fiveMinsAgoIso),
             supabase.from('clicks').select('*').order('created_at', { ascending: false }).limit(10),
             supabase.from('page_views').select('path').limit(2000)
          ]);

          if (recentViewsResponse.data) {
             const activeSessions = new Set(recentViewsResponse.data.map(v => v.session_id));
             activeNow = activeSessions.size;
          }

          if (recentClicksResponse.data) {
             clicksData = recentClicksResponse.data;
          }

          if (sampledViewsResponse.data) {
            const pageCounts: Record<string, number> = {};
            sampledViewsResponse.data.forEach(v => {
              if (v.path) pageCounts[v.path] = (pageCounts[v.path] || 0) + 1;
            });
            topPagesData = Object.entries(pageCounts)
              .map(([path, views]) => ({ path, views }))
              .sort((a, b) => b.views - a.views)
              .slice(0, 5);
          }

        } catch (e) {
          console.error("Error fetching analytics details", e);
        }

        if (!isMounted) return;

        setStats(prev => ({
          ...prev,
          uniqueVisitors,
          activeNow,
          totalClicks
        }));
        
        setTopPages(topPagesData);
        setRecentClicks(clicksData);
      } catch (e) {
        console.error("Error fetching analytics overall", e);
      }
    };

    fetchBasicStats();
    
    // Subscribe to updates for product changes only
    const channel = supabase
      .channel('dashboard_stats')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'items' }, () => {
         fetchBasicStats();
      })
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  // If loading, we could render the exact same UI but with skeletons instead of hiding the whole UI
  // But for now, we will just render the empty state / 0 stats directly to feel instant.

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-stone-900">Dashboard Overview</h1>
        <p className="text-stone-500 mt-2">Welcome to your admin control panel. Analytics are real-time.</p>
      </div>

      {/* Analytics Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-stone-500 font-medium text-sm">Active Visitors (Last 5m)</h3>
            <div className="text-3xl font-bold text-stone-900 flex items-baseline gap-2">
              {stats.activeNow}
              {stats.activeNow > 0 && (
                <span className="text-xs text-green-500 font-medium animate-pulse flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500 block"></span> Live
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-stone-500 font-medium text-sm">Unique Visitors</h3>
            <div className="text-3xl font-bold text-stone-900">{stats.uniqueVisitors}</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
            <MousePointer2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-stone-500 font-medium text-sm">Tracked Link Clicks</h3>
            <div className="text-3xl font-bold text-stone-900">{stats.totalClicks}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-stone-500 font-medium">Total Items</h3>
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-stone-900">{stats.totalItems}</div>
          <div className="text-sm text-stone-500 mt-2 flex items-center">
            Published products in store
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-stone-500 font-medium">Product Categories</h3>
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
              <Tags className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-stone-900">{stats.totalCategories}</div>
          <div className="text-sm text-stone-500 mt-2 flex items-center">
            Active categories
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-stone-500 font-medium">Total Courses</h3>
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-stone-900">{stats.totalCourses}</div>
          <div className="text-sm text-stone-500 mt-2 flex items-center">
            Published online courses
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-stone-500 font-medium">Quick Actions</h3>
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
              <Zap className="w-5 h-5" />
            </div>
          </div>
          <div className="flex flex-col gap-2 mt-2">
            <Link href="/admin/items" className="flex items-center text-sm font-medium text-stone-700 hover:text-orange-600 transition-colors p-2 hover:bg-orange-50 rounded-lg -mx-2">
              <PlusCircle className="w-4 h-4 mr-2" /> Add New Product
            </Link>
            <Link href="/admin/courses" className="flex items-center text-sm font-medium text-stone-700 hover:text-orange-600 transition-colors p-2 hover:bg-orange-50 rounded-lg -mx-2">
              <PlusCircle className="w-4 h-4 mr-2" /> Add New Course
            </Link>
            <Link href="/toko" target="_blank" className="flex items-center text-sm font-medium text-stone-700 hover:text-orange-600 transition-colors p-2 hover:bg-orange-50 rounded-lg -mx-2">
              <ExternalLink className="w-4 h-4 mr-2" /> View Storefront
            </Link>
          </div>
        </div>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-12">
        {/* Top Pages */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
          <div className="p-6 border-b border-stone-100">
            <h3 className="font-semibold text-stone-900">Top Visited Pages</h3>
          </div>
          <div className="p-0">
            {topPages.length > 0 ? (
              <table className="w-full text-sm table-fixed">
                <thead className="bg-stone-50 border-b border-stone-100">
                  <tr>
                    <th className="px-6 py-3 text-left font-medium text-stone-500 w-2/3">Page Path</th>
                    <th className="px-6 py-3 text-right font-medium text-stone-500 w-1/3">Total Views</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {topPages.map((page, idx) => (
                    <tr key={idx} className="hover:bg-stone-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-stone-900 truncate" title={page.path || '/'}>{page.path || '/'}</td>
                      <td className="px-6 py-4 text-right text-stone-600">{page.views}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-6 text-center text-stone-500 text-sm">No page views recorded yet.</div>
            )}
          </div>
        </div>

        {/* Recent Clicks */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
          <div className="p-6 border-b border-stone-100">
            <h3 className="font-semibold text-stone-900">Recent Outbound/Link Clicks</h3>
          </div>
          <div className="p-0">
            {recentClicks.length > 0 ? (
              <table className="w-full text-sm table-fixed">
                <thead className="bg-stone-50 border-b border-stone-100">
                  <tr>
                    <th className="px-6 py-3 text-left font-medium text-stone-500 w-1/3">Link Text</th>
                    <th className="px-6 py-3 text-left font-medium text-stone-500 w-1/3">Target URL</th>
                    <th className="px-6 py-3 text-right font-medium text-stone-500 w-1/3">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {recentClicks.map((click, idx) => (
                    <tr key={idx} className="hover:bg-stone-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-stone-900 truncate" title={click.link_text}>{click.link_text || '(Empty)'}</td>
                      <td className="px-6 py-4 text-stone-600 truncate" title={click.url}>
                        <a href={click.url} target="_blank" rel="noopener noreferrer" className="hover:text-orange-600 hover:underline">{click.url}</a>
                      </td>
                      <td className="px-6 py-4 text-right text-stone-500 text-xs">
                        {new Date(click.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-6 text-center text-stone-500 text-sm">No clicks tracked yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
