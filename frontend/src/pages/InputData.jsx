import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { healthService, predictionService } from '../services/api';
import { Save, Loader2 } from 'lucide-react';

const InputData = () => {
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
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
            alert('Error saving data. Please ensure all numeric fields are filled correctly.');
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

            <form onSubmit={handleSubmit} className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    <div>
                        <h3 style={{ marginBottom: '1.5rem', color: 'var(--primary)' }}>Hormones & Vitals</h3>
                        <div style={{ marginBottom: '1rem' }}>
                            <label>Date</label>
                            <input type="date" name="date" value={formData.date} onChange={handleChange} style={{ width: '100%' }} required />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div><label>LH Level</label><input type="number" step="0.1" name="lh" value={formData.lh} onChange={handleChange} style={{ width: '100%' }} /></div>
                            <div><label>Estrogen</label><input type="number" step="0.1" name="estrogen" value={formData.estrogen} onChange={handleChange} style={{ width: '100%' }} /></div>
                            <div><label>PdG</label><input type="number" step="0.1" name="pdg" value={formData.pdg} onChange={handleChange} style={{ width: '100%' }} /></div>
                            <div><label>Sleep Score</label><input type="number" name="overall_score" value={formData.overall_score} onChange={handleChange} style={{ width: '100%' }} /></div>
                            <div><label>Heart Rate (Avg)</label><input type="number" name="avg_resting_heart_rate" value={formData.avg_resting_heart_rate} onChange={handleChange} style={{ width: '100%' }} /></div>
                            <div><label>Daily Steps</label><input type="number" name="daily_steps" value={formData.daily_steps} onChange={handleChange} style={{ width: '100%' }} /></div>
                        </div>
                    </div>

                    <div>
                        <h3 style={{ marginBottom: '1.5rem', color: 'var(--secondary)' }}>Symptoms (0-4 Scale)</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                            <div><label>Cramps</label><LikertScale name="cramps" current={formData.cramps} /></div>
                            <div><label>Fatigue</label><LikertScale name="fatigue" current={formData.fatigue} /></div>
                            <div><label>Mood Swings</label><LikertScale name="moodswing" current={formData.moodswing} /></div>
                            <div><label>Bloating</label><LikertScale name="bloating" current={formData.bloating} /></div>
                            <div><label>Sleep Issues</label><LikertScale name="sleepissue" current={formData.sleepissue} /></div>
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
