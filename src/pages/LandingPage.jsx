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
                background: 'rgba(255, 255, 255, 0.03)',
                maxWidth: '90%'
            }}>
                {/* Conditionally show QR code or View Menu button based on screen size/device */}
                <div className="desktop-only" style={{ display: 'block' }}>
                    <img
                        src="/qr.png"
                        alt="Scan for Menu"
                        style={{
                            width: 'min(300px, 80vw)',
                            height: 'auto',
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

                <Link to="/menu" style={{
                    display: 'inline-block',
                    marginTop: '30px',
                    padding: '15px 40px',
                    background: 'var(--accent-gradient)',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '50px',
                    fontWeight: '800',
                    fontSize: '1.2rem',
                    boxShadow: '0 10px 20px rgba(255, 64, 129, 0.4)',
                    transition: 'transform 0.2s'
                }}>
                    VIEW MENU
                </Link>
            </div>
        </div>
    );
};

export default LandingPage;
