import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { healthService, predictionService } from '../services/api';
import { Save, Loader2 } from 'lucide-react';

const InputData = () => {
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        last_period_date: '',
        lh: '', estrogen: '', pdg: '',
        cramps: 0, fatigue: 0, moodswing: 0,
        stress: 0, bloating: 0, sleepissue: 0,
        overall_score: '', deep_sleep_in_minutes: '',
        avg_resting_heart_rate: '', stress_score: '', daily_steps: ''
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleLikert = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // 1. Submit Record
            await healthService.addRecord(formData);
            // 2. Run Prediction
            await predictionService.predict({ date: formData.date });
            navigate('/');
        } catch (err) {
            console.error(err);
            const errorMsg = err.response?.data?.msg || err.response?.data?.error || 'Error saving data. Please ensure all numeric fields are filled correctly.';
            alert(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const LikertScale = ({ name, current }) => (
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
            {[0, 1, 2, 3, 4].map(v => (
                <button
                    key={v}
                    type="button"
                    onClick={() => handleLikert(name, v)}
                    style={{
                        width: '32px', height: '32px', borderRadius: '50%',
                        backgroundColor: current === v ? 'var(--primary)' : 'var(--background)',
                        color: current === v ? 'white' : 'var(--text-main)',
                        border: `1px solid ${current === v ? 'var(--primary)' : 'var(--border)'}`
                    }}
                >
                    {v}
                </button>
            ))
            }
        </div >
    );

    return (
        <div style={{ padding: '0 2rem 4rem' }}>
            <h2 className="title-gradient" style={{ marginBottom: '2rem' }}>Log Your Daily Health</h2>

            <form onSubmit={handleSubmit} className="card" style={{ maxWidth: '850px', margin: '0 auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1.2fr) 1fr', gap: '2rem' }}>
                    <div>
                        <h3 style={{ marginBottom: '1.5rem', color: 'var(--primary)' }}>Hormones & Vitals</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div>
                                <label style={{ fontSize: '0.85rem' }}>Entry Date</label>
                                <input type="date" name="date" value={formData.date} onChange={handleChange} style={{ width: '100%' }} required />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.85rem' }}>Last Period Start Date</label>
                                <input type="date" name="last_period_date" value={formData.last_period_date} onChange={handleChange} style={{ width: '100%' }} />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
                            <div>
                                <label style={{ fontSize: '0.85rem' }}>LH Level (mIU/mL)</label>
                                <input type="number" step="0.1" name="lh" value={formData.lh} onChange={handleChange} placeholder="e.g. 5.0 - 20.0" style={{ width: '100%' }} />
                                <small style={{ opacity: 0.6, fontSize: '0.7rem' }}>Normal: 1.9 - 14.6</small>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.85rem' }}>Estrogen (pg/mL)</label>
                                <input type="number" step="0.1" name="estrogen" value={formData.estrogen} onChange={handleChange} placeholder="e.g. 100 - 400" style={{ width: '100%' }} />
                                <small style={{ opacity: 0.6, fontSize: '0.7rem' }}>Normal: 30 - 400</small>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.85rem' }}>PdG (ug/mL)</label>
                                <input type="number" step="0.1" name="pdg" value={formData.pdg} onChange={handleChange} placeholder="e.g. 5.0 - 25.0" style={{ width: '100%' }} />
                                <small style={{ opacity: 0.6, fontSize: '0.7rem' }}>Progesterone metabolite</small>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.85rem' }}>Sleep Score (0-100)</label>
                                <input type="number" name="overall_score" value={formData.overall_score} onChange={handleChange} placeholder="e.g. 85" style={{ width: '100%' }} />
                                <small style={{ opacity: 0.6, fontSize: '0.7rem' }}>From your smart watch</small>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.85rem' }}>Deep Sleep (Mins)</label>
                                <input type="number" name="deep_sleep_in_minutes" value={formData.deep_sleep_in_minutes} onChange={handleChange} placeholder="e.g. 90" style={{ width: '100%' }} />
                                <small style={{ opacity: 0.6, fontSize: '0.7rem' }}>Suggested: 60 - 120</small>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.85rem' }}>Heart Rate (Avg BPM)</label>
                                <input type="number" name="avg_resting_heart_rate" value={formData.avg_resting_heart_rate} onChange={handleChange} placeholder="e.g. 72" style={{ width: '100%' }} />
                                <small style={{ opacity: 0.6, fontSize: '0.7rem' }}>Normal: 60 - 100</small>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.85rem' }}>Stress Score (0-100)</label>
                                <input type="number" name="stress_score" value={formData.stress_score} onChange={handleChange} placeholder="e.g. 20" style={{ width: '100%' }} />
                                <small style={{ opacity: 0.6, fontSize: '0.7rem' }}>Lower is better</small>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.85rem' }}>Daily Steps</label>
                                <input type="number" name="daily_steps" value={formData.daily_steps} onChange={handleChange} placeholder="e.g. 8000" style={{ width: '100%' }} />
                                <small style={{ opacity: 0.6, fontSize: '0.7rem' }}>Recommended: 7000+</small>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 style={{ marginBottom: '1.5rem', color: 'var(--secondary)' }}>Symptoms (0-4 Scale)</h3>
                        <p style={{ fontSize: '0.8rem', opacity: 0.7, marginBottom: '1rem' }}>0: None, 1: Mild, 2: Moderate, 3: High, 4: Severe</p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.2rem' }}>
                            <div><label style={{ fontSize: '0.85rem' }}>Cramps</label><LikertScale name="cramps" current={formData.cramps} /></div>
                            <div><label style={{ fontSize: '0.85rem' }}>Fatigue</label><LikertScale name="fatigue" current={formData.fatigue} /></div>
                            <div><label style={{ fontSize: '0.85rem' }}>Mood Swings</label><LikertScale name="moodswing" current={formData.moodswing} /></div>
                            <div><label style={{ fontSize: '0.85rem' }}>Bloating</label><LikertScale name="bloating" current={formData.bloating} /></div>
                            <div><label style={{ fontSize: '0.85rem' }}>Sleep Issues</label><LikertScale name="sleepissue" current={formData.sleepissue} /></div>
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: '3rem', textAlign: 'center' }}>
                    <button type="submit" disabled={loading} className="btn-primary" style={{ padding: '12px 48px', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.8rem', margin: '0 auto' }}>
                        {loading ? <Loader2 className="animate-spin" /> : <Save />}
                        {loading ? 'Processing AI Prediction...' : 'Save & Run AI Prediction'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default InputData;
