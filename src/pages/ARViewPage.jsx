import React, { useState, useRef, Suspense } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { XR, ARButton, useXR, useHitTest, Interactive } from '@react-three/xr';
import { OrbitControls, useGLTF, Environment, ContactShadows } from '@react-three/drei';
import menuData from '../data/menu.json';

function Model({ url, scaleVal }) {
    const { scene } = useGLTF(url);
    return <primitive object={scene} scale={[scaleVal, scaleVal, scaleVal]} />;
}

function XRExperience({ modelUrl, scale }) {
    const { isPresenting } = useXR();
    const reticleRef = useRef();
    const [modelPos, setModelPos] = useState(null);

    // Hit test logic - only runs in XR
    useHitTest((hitMatrix) => {
        if (!modelPos && reticleRef.current) {
            hitMatrix.decompose(
                reticleRef.current.position,
                reticleRef.current.quaternion,
                reticleRef.current.scale
            );
            reticleRef.current.rotation.x = -Math.PI / 2;
            reticleRef.current.visible = true;
        }
    });

    const handlePlace = () => {
        if (reticleRef.current && isPresenting && !modelPos) {
            setModelPos(reticleRef.current.position.clone());
        }
    };

    return (
        <>
            <ambientLight intensity={1.5} />
            <directionalLight position={[5, 10, 5]} intensity={2} castShadow />
            <pointLight position={[-5, 5, -5]} intensity={1} />
            <Environment preset="city" />

            {/* PREVIEW MODE: Show model at center if not in AR */}
            {!isPresenting && (
                <group position={[0, -0.2, 0]}>
                    <OrbitControls makeDefault enableZoom={true} minDistance={1} maxDistance={10} />
                    <Suspense fallback={null}>
                        <Model url={modelUrl} scaleVal={scale * 2} />
                    </Suspense>
                    <ContactShadows position={[0, -0.01, 0]} opacity={0.4} scale={10} blur={2} />
                </group>
            )}

            {/* AR MODE: Show reticle and allow placement */}
            {isPresenting && !modelPos && (
                <>
                    <Interactive onSelect={handlePlace}>
                        <mesh ref={reticleRef} visible={false}>
                            <ringGeometry args={[0.1, 0.12, 32]} />
                            <meshStandardMaterial color="#ff4081" emissive="#ff4081" emissiveIntensity={2} />
                            <mesh>
                                <circleGeometry args={[0.01, 16]} />
                                <meshBasicMaterial color="white" />
                            </mesh>
                        </mesh>
                    </Interactive>
                    {/* Fallback invisible plane for taps */}
                    <mesh onClick={handlePlace} rotation-x={-Math.PI / 2} visible={false}>
                        <planeGeometry args={[50, 50]} />
                    </mesh>
                </>
            )}

            {/* PLACED MODEL IN AR */}
            {isPresenting && modelPos && (
                <group position={modelPos}>
                    <OrbitControls enableZoom={false} enablePan={false} />
                    <Suspense fallback={null}>
                        <Model url={modelUrl} scaleVal={scale} />
                    </Suspense>
                </group>
            )}
        </>
    );
}

const ARViewPage = () => {
    const { id } = useParams();
    const item = menuData.find(i => i.id === id);
    // Setting a default scale that is realistic for tabletop (5cm units scaled down)
    const [scale, setScale] = useState(0.05);

    if (!item) return <div style={{ color: 'white', padding: 20 }}>Item not found</div>;

    return (
        <div style={{
            width: '100vw',
            height: '100vh',
            background: '#000',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Header Overlay */}
            <div style={{
                position: 'absolute',
                top: '0',
                width: '100%',
                padding: '25px 20px',
                zIndex: 20,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)'
            }}>
                <Link to="/menu" style={{
                    color: 'white',
                    background: 'rgba(255,255,255,0.1)',
                    padding: '12px 20px',
                    borderRadius: '12px',
                    textDecoration: 'none',
                    backdropFilter: 'blur(10px)',
                    fontSize: '0.9rem',
                    fontWeight: '800',
                    border: '1px solid rgba(255,255,255,0.2)'
                }}>
                    &larr; BACK
                </Link>
                <div style={{ textAlign: 'right' }}>
                    <h2 style={{ margin: 0, fontSize: '1.4rem', color: '#fff', fontWeight: '800' }}>{item.name}</h2>
                    <p style={{ margin: 0, fontSize: '1rem', color: '#ff4081', fontWeight: '900' }}>₹{item.price}</p>
                </div>
            </div>

            {/* AR Control Button */}
            <ARButton
                sessionInit={{ requiredFeatures: ['hit-test'] }}
                style={{
                    position: 'absolute',
                    bottom: '40px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 25,
                    background: '#ff4081',
                    color: 'white',
                    padding: '18px 45px',
                    borderRadius: '50px',
                    fontWeight: '900',
                    border: 'none',
                    boxShadow: '0 10px 40px rgba(255, 64, 129, 0.6)',
                    fontSize: '1.2rem',
                    letterSpacing: '1px',
                    cursor: 'pointer',
                    textTransform: 'uppercase'
                }}
            />

            {/* Instructions (Hidden by default in CSS for desktop if needed, but useful in mobile) */}
            <div style={{
                position: 'absolute',
                top: '120px',
                width: '100%',
                textAlign: 'center',
                zIndex: 10,
                pointerEvents: 'none'
            }}>
                <div style={{
                    display: 'inline-block',
                    background: 'rgba(0,0,0,0.7)',
                    padding: '12px 30px',
                    borderRadius: '35px',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.1)'
                }}>
                    <p style={{ color: 'white', margin: 0, fontSize: '0.95rem', fontWeight: '500' }}>
                        Scan surface & tap to place dish
                    </p>
                </div>
            </div>

            {/* Manual Scaling Controls */}
            <div style={{
                position: 'absolute',
                bottom: '140px',
                right: '25px',
                display: 'flex',
                flexDirection: 'column',
                gap: '15px',
                zIndex: 20
            }}>
                <button
                    onClick={() => setScale(s => s * 1.15)}
                    style={{ width: '60px', height: '60px', borderRadius: '20px', background: 'rgba(255,255,255,0.2)', color: 'white', fontSize: '2rem', border: '1px solid rgba(255,255,255,0.4)', backdropFilter: 'blur(15px)', fontWeight: 'bold' }}
                >
                    +
                </button>
                <button
                    onClick={() => setScale(s => s / 1.15)}
                    style={{ width: '60px', height: '60px', borderRadius: '20px', background: 'rgba(255,255,255,0.2)', color: 'white', fontSize: '2rem', border: '1px solid rgba(255,255,255,0.4)', backdropFilter: 'blur(15px)', fontWeight: 'bold' }}
                >
                    -
                </button>
            </div>

            <Canvas shadows gl={{ antialias: true }} camera={{ position: [0, 1, 3], fov: 45 }}>
                <XR>
                    <XRExperience modelUrl={item.model_path} scale={scale} />
                </XR>
            </Canvas>
        </div>
    );
};

export default ARViewPage;
