import React, { useState, useEffect } from 'react';
import api, { healthService, predictionService, datasetService } from '../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Brain, TrendingUp, Calendar, Heart, Zap, Moon } from 'lucide-react';

const Dashboard = () => {
    const [records, setRecords] = useState([]);
    const [predictions, setPredictions] = useState([]);
    const [datasets, setDatasets] = useState([]);
    const [globalSummary, setGlobalSummary] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            healthService.getRecords(),
            predictionService.getHistory(),
            datasetService.list(),
            api.get('/datasets/summary')
        ]).then(([recRes, predRes, dataRes, globalRes]) => {
            // Backend returns data in ASC order now
            setRecords(recRes.data);
            setPredictions(predRes.data);
            setDatasets(dataRes.data);
            setGlobalSummary(globalRes.data);
        }).finally(() => setLoading(false));
    }, []);

    const isExampleData = records.length > 0 && records[0].is_example;
    const latestPrediction = predictions[0] || (isExampleData ? { phase: 'Luteal (Sample)', confidence: 0.92 } : null);

    if (loading) return <div style={{ padding: '2rem' }}>Loading Insights...</div>;

    return (
        <div style={{ padding: '0 2rem 4rem' }}>
            {isExampleData && (
                <div style={{
                    background: 'rgba(245, 158, 11, 0.15)',
                    color: 'var(--warning)',
                    padding: '1rem',
                    borderRadius: 'var(--radius)',
                    marginBottom: '2rem',
                    border: '1px solid var(--warning)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                }}>
                    <Zap size={24} />
                    <div>
                        <strong>Example Data Mode:</strong> This is not accurate data and this is not your data. This is example study data shown because you haven't added any personal health records yet.
                    </div>
                </div>
            )}
            <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 className="title-gradient" style={{ fontSize: '2.5rem' }}>{isExampleData ? 'Example Health Intelligence' : 'Your Health Intelligence'}</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        {isExampleData ? 'Visualizing global study patterns' : 'AI-powered insights based on your physiological data'}
                    </p>
                </div>
                <div className="card glass" style={{ padding: '1rem 2rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                        <Brain color="var(--primary)" size={32} />
                        <div>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Current Phase Prediction</p>
                            <h3 style={{ margin: 0 }}>{latestPrediction ? latestPrediction.phase : 'N/A'}</h3>
                        </div>
                    </div>
                    <div style={{ padding: '4px 12px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 600 }}>
                        {latestPrediction ? `${(latestPrediction.confidence * 100).toFixed(1)}% Confidence` : 'No data'}
                    </div>
                </div>
            </header>

            {globalSummary && (
                <div className="card" style={{ marginBottom: '2rem', background: 'linear-gradient(135deg, #1e293b, #0f172a)', color: 'white', border: 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                            <Zap color="var(--warning)" /> Project Insights (Global Study Data)
                        </h2>
                        <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>Source: data/raw/*.csv</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ opacity: 0.7, fontSize: '0.8rem', marginBottom: '0.4rem' }}>STUDY DATA POINTS</p>
                            <h2 style={{ margin: 0 }}>{globalSummary.total_records.toLocaleString()}</h2>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ opacity: 0.7, fontSize: '0.8rem', marginBottom: '0.4rem' }}>AVG HEART RATE</p>
                            <h2 style={{ margin: 0 }}>{Math.round(globalSummary.avg_heart_rate)} BPM</h2>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ opacity: 0.7, fontSize: '0.8rem', marginBottom: '0.4rem' }}>TOTAL STEPS DRIVEN</p>
                            <h2 style={{ margin: 0 }}>{(globalSummary.total_steps / 1000000).toFixed(1)}M</h2>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ opacity: 0.7, fontSize: '0.8rem', marginBottom: '0.4rem' }}>PHASE DOMINANCE</p>
                            <h2 style={{ margin: 0 }}>{Object.keys(globalSummary.phase_distribution)[0] || 'N/A'}</h2>
                        </div>
                    </div>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                <StatCard icon={<Heart color="#ef4444" />} label="Avg Heart Rate" value={records.length ? Math.round(records[records.length - 1].avg_resting_heart_rate) : '--'} unit="BPM" />
                <StatCard icon={<Zap color="#f59e0b" />} label="Step Count" value={records.length ? records[records.length - 1].daily_steps : '--'} unit="steps" />
                <StatCard icon={<TrendingUp color="#6366f1" />} label="Stress Score" value={records.length ? Math.round(records[records.length - 1].stress_score) : '--'} unit="/ 100" />
                <StatCard icon={<Moon color="#ec4899" />} label="Sleep Quality" value={records.length ? records[records.length - 1].overall_score : '--'} unit="/ 100" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                <div className="card">
                    <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <TrendingUp size={20} /> Hormone Trends
                    </h3>
                    <div style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={records}>
                                <defs>
                                    <linearGradient id="colorLh" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Area type="monotone" dataKey="lh" stroke="var(--primary)" fillOpacity={1} fill="url(#colorLh)" />
                                <Area type="monotone" dataKey="estrogen" stroke="var(--secondary)" fillOpacity={0} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="card">
                    <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Calendar size={20} /> Prediction History
                    </h3>
                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        {predictions.map((p, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: i < predictions.length - 1 ? '1px solid var(--border)' : 'none' }}>
                                <div>
                                    <p style={{ fontWeight: 600 }}>{p.phase}</p>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{p.date}</p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <p style={{ fontSize: '0.8rem', fontWeight: 500 }}>{(p.confidence * 100).toFixed(0)}%</p>
                                </div>
                            </div>
                        ))}
                        {predictions.length === 0 && <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginTop: '2rem' }}>No predictions yet.</p>}
                    </div>
                </div>
            </div>

            <div className="card" style={{ marginTop: '2rem' }}>
                <h3 style={{ marginBottom: '1.5rem' }}>Physiological Activity</h3>
                <div style={{ height: '250px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={records}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="daily_steps" stroke="var(--success)" strokeWidth={2} dot={false} />
                            <Line type="monotone" dataKey="overall_score" stroke="var(--secondary)" strokeWidth={2} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="card" style={{ marginTop: '2rem' }}>
                <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Calendar size={20} /> Project Datasets (Root Folder)
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                    {datasets.map((ds, i) => (
                        <div key={i} className="glass" style={{ padding: '1rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                            <div style={{ fontWeight: 600, color: 'var(--primary)', marginBottom: '0.4rem' }}>{ds.name}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                Type: <span style={{ textTransform: 'uppercase', fontWeight: 600 }}>{ds.type}</span> | Size: {ds.size}
                            </div>
                        </div>
                    ))}
                </div>
                <p style={{ marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                    * These datasets are used as the core of NeoHealth AI's analytics engine.
                </p>
            </div>
        </div >
    );
};

const StatCard = ({ icon, label, value, unit }) => (
    <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ padding: '0.8rem', borderRadius: '12px', background: 'var(--background)' }}>
            {icon}
        </div>
        <div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>{label}</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.3rem' }}>
                <h3 style={{ margin: 0 }}>{value}</h3>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{unit}</span>
            </div>
        </div>
    </div>
);

export default Dashboard;
