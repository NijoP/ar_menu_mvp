import React from 'react';

const LandingPage = () => {
    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-color)',
            color: 'var(--text-primary)',
            textAlign: 'center',
            padding: '20px'
        }}>
            <h1 style={{
                fontSize: '4rem',
                marginBottom: '40px',
                background: 'var(--accent-gradient)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 800
            }}>
                AR GOURMET
            </h1>

            <div className="glass" style={{
                padding: '40px',
                borderRadius: '30px',
                background: 'rgba(255, 255, 255, 0.03)'
            }}>
                <img
                    src="/qr.png"
                    alt="Scan for Menu"
                    style={{
                        width: '300px',
                        height: '300px',
                        borderRadius: '20px',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                    }}
                />
                <p style={{
                    marginTop: '20px',
                    fontSize: '1.2rem',
                    color: 'var(--text-secondary)'
                }}>
                    Scan to View Menu in AR
                </p>
            </div>
        </div>
    );
};

export default LandingPage;
