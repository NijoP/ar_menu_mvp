import React, { useEffect, useState } from 'react';
import menuData from '../data/menu.json';
import { Link } from 'react-router-dom';

const MenuPage = () => {
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        setLoaded(true);
    }, []);

    return (
        <div style={{
            padding: '20px',
            minHeight: '100vh',
            background: 'linear-gradient(to bottom right, #121212, #1a1a1a)',
            color: 'white',
            overflowX: 'hidden'
        }}>
            <header style={{ padding: '20px', textAlign: 'center', marginBottom: '20px' }}>
                <h1 style={{
                    fontSize: '2rem',
                    margin: 0,
                    background: 'var(--accent-gradient)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontWeight: 800
                }}>
                    MENU
                </h1>
                <p style={{ color: 'var(--text-secondary)', margin: '5px 0' }}>Select a dish to view in 3D</p>
            </header>

            <div className="menu-grid" style={{
                display: 'grid',
                gap: '20px',
                padding: '20px',
                maxWidth: '600px',
                margin: '0 auto'
            }}>
                {menuData.map((item, index) => (
                    <div key={item.id} style={{
                        opacity: loaded ? 1 : 0,
                        transform: loaded ? 'translateY(0)' : 'translateY(30px)',
                        transition: `opacity 0.5s ease ${index * 0.1}s, transform 0.5s ease ${index * 0.1}s`,
                        background: 'rgba(30, 30, 30, 0.6)',
                        backdropFilter: 'blur(16px)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '24px',
                        padding: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                    }}>
                        <div style={{ flex: 1 }}>
                            <h3 style={{ margin: '0 0 6px 0', fontSize: '1.25rem', fontWeight: '600', color: '#fff' }}>{item.name}</h3>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: '#888' }}>{item.description || 'Delicious & Fresh'}</p>
                            <div style={{ marginTop: '15px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span style={{
                                    fontSize: '1.2rem',
                                    fontWeight: '800',
                                    color: '#ff4081'
                                }}>₹{item.price}</span>

                                <Link to={`/ar/${item.id}`} style={{
                                    textDecoration: 'none',
                                    background: 'var(--accent-gradient)',
                                    color: 'white',
                                    padding: '8px 16px',
                                    borderRadius: '12px',
                                    fontSize: '0.85rem',
                                    fontWeight: '700',
                                    boxShadow: '0 4px 15px rgba(255, 64, 129, 0.3)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    transition: 'transform 0.2s'
                                }}>
                                    <span style={{ fontSize: '1rem' }}>📦</span>
                                    VIEW IN AR
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MenuPage;
