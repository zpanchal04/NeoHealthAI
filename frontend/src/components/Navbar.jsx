import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, LogOut, LayoutDashboard, PlusCircle } from 'lucide-react';

const Navbar = ({ user, setUser }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        setUser(null);
        navigate('/login');
    };

    return (
        <nav className="glass" style={{
            position: 'sticky', top: 0, zIndex: 100,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '1rem 2rem', marginBottom: '2rem', borderBottom: '1px solid var(--border)'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Activity color="var(--primary)" size={28} />
                <span className="title-gradient" style={{ fontSize: '1.5rem' }}>NeoHealth AI</span>
            </div>

            <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                <Link to="/" style={{ textDecoration: 'none', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <LayoutDashboard size={18} /> Dashboard
                </Link>
                <Link to="/input" style={{ textDecoration: 'none', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <PlusCircle size={18} /> Add Health Data
                </Link>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '1px solid var(--border)', paddingLeft: '2rem' }}>
                    <span style={{ fontWeight: 500 }}>{user.username}</span>
                    <button onClick={handleLogout} className="btn-secondary" style={{ padding: '0.5rem', display: 'flex', alignItems: 'center' }}>
                        <LogOut size={18} />
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
