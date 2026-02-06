import React, { useState, useRef, Suspense } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { XR, ARButton, useXR, useHitTest, useXREvent } from '@react-three/xr';
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

    // Hit test logic - updates the reticle position
    useHitTest((hitMatrix) => {
        if (!modelPos && reticleRef.current) {
            reticleRef.current.visible = true;
            // Apply hit matrix position and rotation
            reticleRef.current.position.setFromMatrixPosition(hitMatrix);
            reticleRef.current.quaternion.setFromRotationMatrix(hitMatrix);
        }
    });

    // Global tap event in AR
    useXREvent('select', () => {
        if (isPresenting && reticleRef.current && reticleRef.current.visible && !modelPos) {
            setModelPos(reticleRef.current.position.clone());
        }
    });

    return (
        <>
            <ambientLight intensity={1.5} />
            <directionalLight position={[5, 10, 5]} intensity={2} />
            <Environment preset="city" />

            {/* PREVIEW MODE: Centered model on black background */}
            {!isPresenting && (
                <group position={[0, -0.4, 0]}>
                    <OrbitControls makeDefault enableZoom={true} minDistance={1} maxDistance={10} />
                    <Suspense fallback={null}>
                        <Model url={modelUrl} scaleVal={scale * 3} />
                    </Suspense>
                    <ContactShadows position={[0, -0.01, 0]} opacity={0.5} scale={10} blur={2.5} />
                </group>
            )}

            {/* AR MODE: Placement Reticle (Pink Ring) */}
            {isPresenting && !modelPos && (
                <mesh ref={reticleRef} visible={false}>
                    <ringGeometry args={[0.08, 0.1, 32]} />
                    <meshBasicMaterial color="#ff4081" transparent opacity={1} />
                    <mesh rotation={[Math.PI / 2, 0, 0]}>
                        <circleGeometry args={[0.015, 16]} />
                        <meshBasicMaterial color="white" />
                    </mesh>
                </mesh>
            )}

            {/* AR MODE: Placed Model */}
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
    const [scale, setScale] = useState(0.06); // Realistic dish size

    if (!item) return <div style={{ color: 'white', padding: 20 }}>Item not found</div>;

    return (
        <div style={{ width: '100vw', height: '100vh', background: '#000', position: 'relative', overflow: 'hidden' }}>
            {/* Header */}
            <div style={{
                position: 'absolute', top: '0', width: '100%', padding: '25px 20px', zIndex: 100,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: 'linear-gradient(to bottom, rgba(0,0,0,0.9), transparent)'
            }}>
                <Link to="/menu" style={{
                    color: 'white', background: 'rgba(255,255,255,0.15)', padding: '12px 20px',
                    borderRadius: '12px', textDecoration: 'none', backdropFilter: 'blur(15px)',
                    fontSize: '0.9rem', fontWeight: '800', border: '1px solid rgba(255,255,255,0.2)'
                }}>
                    &larr; BACK
                </Link>
                <div style={{ textAlign: 'right' }}>
                    <h2 style={{ margin: 0, fontSize: '1.4rem', color: '#fff', fontWeight: '900' }}>{item.name}</h2>
                    <p style={{ margin: 0, fontSize: '1.1rem', color: '#ff4081', fontWeight: '900' }}>₹{item.price}</p>
                </div>
            </div>

            {/* Help Overlay (Instructions) */}
            <div style={{ position: 'absolute', top: '120px', width: '100%', textAlign: 'center', zIndex: 50, pointerEvents: 'none' }}>
                <div style={{
                    display: 'inline-block', background: 'rgba(255, 64, 129, 0.2)',
                    padding: '12px 30px', borderRadius: '40px', backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 64, 129, 0.4)'
                }}>
                    <p style={{ color: 'white', margin: 0, fontSize: '0.9rem', fontWeight: '600', letterSpacing: '0.5px' }}>
                        SCAN TABLE & TAP TO PLACE
                    </p>
                </div>
            </div>

            {/* AR Control Button */}
            <ARButton
                sessionInit={{ requiredFeatures: ['hit-test'] }}
                style={{
                    position: 'absolute', bottom: '40px', left: '50%', transform: 'translateX(-50%)',
                    zIndex: 100, background: '#ff4081', color: 'white', padding: '18px 50px',
                    borderRadius: '50px', fontWeight: '900', border: 'none',
                    boxShadow: '0 10px 40px rgba(255, 64, 129, 0.6)', fontSize: '1.2rem',
                    letterSpacing: '1px', textTransform: 'uppercase'
                }}
            />

            <Canvas shadows gl={{ antialias: true }} camera={{ position: [0, 1, 3], fov: 45 }}>
                <XR>
                    <XRExperience modelUrl={item.model_path} scale={scale} />
                </XR>
            </Canvas>
        </div>
    );
};

export default ARViewPage;
