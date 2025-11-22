import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, Users, Key, BarChart3, ArrowRight, CheckCircle2, XCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
    const { token } = useAuth();
    const [stats, setStats] = useState({
        keys: 0,
        tokens: 0,
        keyRequests: 0,
        tokenEnabled: 0,
        tokenDisabled: 0,
        todayRequests: 0
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const headers = { 'X-Admin-Token': token };
                const [keysRes, tokensRes, keyStatsRes, tokenStatsRes, todayReqRes] = await Promise.all([
                    fetch('/admin/keys', { headers }),
                    fetch('/admin/tokens', { headers }),
                    fetch('/admin/keys/stats', { headers }),
                    fetch('/admin/tokens/stats', { headers }),
                    fetch('/admin/today-requests', { headers })
                ]);

                const keys = await keysRes.json();
                const tokens = await tokensRes.json();
                const keyStats = await keyStatsRes.json();
                const tokenStats = await tokenStatsRes.json();
                const todayReq = await todayReqRes.json();

                setStats({
                    keys: keys.length,
                    tokens: tokens.length,
                    keyRequests: keyStats.totalRequests || 0,
                    tokenEnabled: tokenStats.enabled || 0,
                    tokenDisabled: tokenStats.disabled || 0,
                    todayRequests: todayReq.todayRequests || 0
                });
            } catch (error) {
                console.error('Failed to fetch dashboard data', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [token]);

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-8"
        >
            {/* Welcome Section */}
            <motion.div variants={item} className="relative overflow-hidden rounded-2xl bg-zinc-900 p-8 text-white shadow-lg">
                <div className="absolute top-0 right-0 -mt-4 -mr-4 h-32 w-32 rounded-full bg-zinc-800 blur-2xl opacity-50" />
                <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-32 w-32 rounded-full bg-zinc-800 blur-2xl opacity-50" />

                <div className="relative z-10">
                    <h2 className="text-2xl font-semibold mb-2 tracking-tight">欢迎回来, 管理员</h2>
                    <p className="text-zinc-400 text-base max-w-2xl">
                        Antigravity API 网关正在平稳运行。这里是您的控制中心，您可以管理 Token、密钥并监控系统状态。
                    </p>
                </div>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="服务状态"
                    value="运行中"
                    icon={Activity}
                    color="text-emerald-600"
                    bg="bg-emerald-50"
                    subtext="系统正常"
                />
                <StatsCard
                    title="Token 账号"
                    value={stats.tokens}
                    icon={Users}
                    color="text-blue-600"
                    bg="bg-blue-50"
                    subtext={
                        <div className="flex gap-2 text-xs">
                            <span className="text-emerald-600 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> {stats.tokenEnabled}</span>
                            <span className="text-zinc-400 flex items-center gap-1"><XCircle className="w-3 h-3" /> {stats.tokenDisabled}</span>
                        </div>
                    }
                />
                <StatsCard
                    title="API 密钥"
                    value={stats.keys}
                    icon={Key}
                    color="text-violet-600"
                    bg="bg-violet-50"
                    subtext={`总请求: ${stats.keyRequests}`}
                />
                <StatsCard
                    title="今日请求"
                    value={stats.todayRequests}
                    icon={BarChart3}
                    color="text-orange-600"
                    bg="bg-orange-50"
                    subtext="实时统计"
                />
            </div>

            {/* Quick Start */}
            <motion.div variants={item} className="bg-white rounded-xl border border-zinc-200 p-8 shadow-sm">
                <h3 className="text-lg font-semibold text-zinc-900 mb-6">快速开始指南</h3>
                <div className="grid gap-6 md:grid-cols-2">
                    <QuickStartStep
                        number="01"
                        title="获取 Google Token"
                        desc="在 Token 管理页面登录 Google 账号获取 Access Token，这是服务的核心凭证。"
                        link="/tokens"
                    />
                    <QuickStartStep
                        number="02"
                        title="生成 API 密钥"
                        desc="在密钥管理页面生成对外服务的 API Key，支持设置频率限制。"
                        link="/keys"
                    />
                    <QuickStartStep
                        number="03"
                        title="测试接口"
                        desc="使用 API 测试工具验证接口连通性，确保模型回复正常。"
                        link="/test"
                    />
                    <QuickStartStep
                        number="04"
                        title="监控日志"
                        desc="在日志页面查看实时请求记录，排查潜在问题。"
                        link="/logs"
                    />
                </div>
            </motion.div>
        </motion.div>
    );
}

function StatsCard({ title, value, icon: Icon, color, bg, subtext }) {
    return (
        <motion.div
            variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0 }
            }}
            className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm hover:shadow-md transition-all duration-300 group"
        >
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-lg ${bg} ${color} group-hover:scale-105 transition-transform duration-300`}>
                    <Icon className="w-5 h-5" />
                </div>
            </div>
            <h3 className="text-zinc-500 text-xs font-medium mb-1 uppercase tracking-wider">{title}</h3>
            <div className="text-2xl font-bold text-zinc-900 mb-2">{value}</div>
            <div className="text-xs text-zinc-400">{subtext}</div>
        </motion.div>
    );
}

function QuickStartStep({ number, title, desc, link }) {
    return (
        <Link to={link} className="flex gap-4 p-4 rounded-xl hover:bg-zinc-50 transition-colors group cursor-pointer border border-transparent hover:border-zinc-100">
            <div className="text-3xl font-bold text-zinc-100 group-hover:text-zinc-200 transition-colors">
                {number}
            </div>
            <div>
                <h4 className="text-base font-semibold text-zinc-900 mb-1 group-hover:text-zinc-900 transition-colors flex items-center gap-2">
                    {title}
                    <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-zinc-400" />
                </h4>
                <p className="text-zinc-500 text-sm leading-relaxed">
                    {desc}
                </p>
            </div>
        </Link>
    );
}
