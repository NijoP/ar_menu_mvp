
import React, { useState, useRef, Suspense } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { XR, ARButton, useHitTest } from '@react-three/xr';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls, useGLTF } from '@react-three/drei';
import menuData from '../data/menu.json';

function Model({ url, scaleVal }) {
    const { scene } = useGLTF(url);
    const modelRef = useRef();

    return <primitive ref={modelRef} object={scene} scale={[scaleVal, scaleVal, scaleVal]} />;
}

function ARScene({ modelUrl }) {
    const reticleRef = useRef();
    const [models, setModels] = useState([]);
    const [scale, setScale] = useState(0.5);

    useHitTest((hitMatrix, hit) => {
        hitMatrix.decompose(
            reticleRef.current.position,
            reticleRef.current.quaternion,
            reticleRef.current.scale
        );
        reticleRef.current.rotation.set(-Math.PI / 2, 0, 0);
    });

    const placeModel = (e) => {
        // Only place one model for this MVP to keep it simple
        if (models.length === 0) {
            let position = e.intersection.object.position.clone();
            let id = Date.now();
            setModels([{ id, position }]);
        }
    };

    return (
        <>
            <ambientLight intensity={1} />
            <directionalLight position={[10, 10, 5]} intensity={2} />

            {/* Reticle */}
            <mesh ref={reticleRef} rotation-x={-Math.PI / 2}>
                <ringGeometry args={[0.1, 0.25, 32]} />
                <meshStandardMaterial color="white" />
            </mesh>

            {/* Placed Models */}
            {models.map(({ position, id }) => (
                <group key={id} position={position}>
                    {/* Interactive Wrapper for rotation */}
                    <OrbitControls enableZoom={false} enablePan={false} />
                    <Suspense fallback={null}>
                        <Model url={modelUrl} scaleVal={scale} />
                    </Suspense>
                </group>
            ))}

            {/* Hit Test Surface (Invisible plane to catch clicks if WebXR hit test doesn't handle click automagically - actually useHitTest updates reticle, user taps screen) */}
            {/* In @react-three/xr, we typically use the interactive elements or just tap logic. 
          For MVP, we'll assume tapping adds at reticle position. */}
        </>
    );
}

// Simplified AR Component without complex HIT test logic which can be buggy in basic implementations.
// Instead we will just use a "Place" button or tap.
// Actually, standard @react-three/xr pattern:
function XRExperience({ modelUrl, scale }) {
    const reticleRef = useRef();
    const [modelPos, setModelPos] = useState(null);

    // Update reticle position based on hit test
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

    const handleSelect = () => {
        if (reticleRef.current && !modelPos) {
            setModelPos(reticleRef.current.position.clone());
        }
    };

    return (
        <>
            <ambientLight intensity={1.5} />
            <directionalLight position={[5, 10, 5]} intensity={2} />
            <pointLight position={[-5, 5, -5]} intensity={1} />

            {/* Reticle - visible only before placement */}
            {!modelPos && (
                <mesh ref={reticleRef} visible={false}>
                    <ringGeometry args={[0.1, 0.15, 32]} />
                    <meshStandardMaterial color="#ff4081" emissive="#ff4081" emissiveIntensity={2} />
                    {/* Inner dot for better targeting */}
                    <mesh>
                        <circleGeometry args={[0.02, 16]} />
                        <meshBasicMaterial color="white" />
                    </mesh>
                </mesh>
            )}

            {/* Large invisible interactive surface to catch taps anywhere */}
            {!modelPos && (
                <mesh onClick={handleSelect} rotation-x={-Math.PI / 2} visible={false}>
                    <planeGeometry args={[20, 20]} />
                </mesh>
            )}

            {/* The Model */}
            {modelPos && (
                <group position={modelPos}>
                    {/* OrbitControls enables the "Drag to rotate" requirement */}
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
    const [scale, setScale] = useState(0.08); // Smaller default scale for GLTF exported from Three
    const [status, setStatus] = useState('Initializing AR...');

    if (!item) return <div style={{ color: 'white', padding: 20 }}>Item not found</div>;

    return (
        <div style={{ width: '100vw', height: '100vh', background: 'black', position: 'relative' }}>
            {/* AR Button with required features */}
            <ARButton
                sessionInit={{ requiredFeatures: ['hit-test'] }}
                style={{
                    position: 'absolute', bottom: '40px', left: '50%', transform: 'translateX(-50%)',
                    zIndex: 20, background: '#ff4081', color: 'white', padding: '15px 30px',
                    borderRadius: '30px', fontWeight: 'bold', border: 'none', boxShadow: '0 5px 20px rgba(255, 64, 129, 0.4)',
                    fontSize: '1.1rem'
                }}
            />

            {/* UI Overlay */}
            <div style={{ position: 'absolute', top: '30px', left: '20px', zIndex: 20 }}>
                <Link to="/menu" style={{
                    color: 'white',
                    background: 'rgba(0,0,0,0.6)',
                    padding: '10px 20px',
                    borderRadius: '20px',
                    textDecoration: 'none',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)'
                }}>
                    &larr; Exit AR
                </Link>
            </div>

            {/* Instructions Overlay */}
            <div style={{
                position: 'absolute',
                top: '100px',
                width: '100%',
                textAlign: 'center',
                zIndex: 10,
                pointerEvents: 'none'
            }}>
                <p style={{
                    color: 'white',
                    background: 'rgba(0,0,0,0.4)',
                    display: 'inline-block',
                    padding: '8px 20px',
                    borderRadius: '20px',
                    fontSize: '0.9rem',
                    backdropFilter: 'blur(5px)'
                }}>
                    Point at floor and tap to place {item.name}
                </p>
            </div>

            {/* Controls */}
            <div style={{ position: 'absolute', bottom: '120px', right: '20px', display: 'flex', flexDirection: 'column', gap: '15px', zIndex: 20 }}>
                <button
                    onClick={() => setScale(s => s * 1.2)}
                    style={{ width: '50px', height: '50px', borderRadius: '15px', background: 'rgba(255,255,255,0.2)', color: 'white', fontSize: '1.5rem', border: '1px solid white', backdropFilter: 'blur(10px)' }}
                >
                    +
                </button>
                <button
                    onClick={() => setScale(s => s / 1.2)}
                    style={{ width: '50px', height: '50px', borderRadius: '15px', background: 'rgba(255,255,255,0.2)', color: 'white', fontSize: '1.5rem', border: '1px solid white', backdropFilter: 'blur(10px)' }}
                >
                    -
                </button>
            </div>

            <Canvas shadows camera={{ position: [0, 2, 5] }}>
                <XR>
                    <XRExperience modelUrl={item.model_path} scale={scale} />
                </XR>
            </Canvas>
        </div>
    );
};

export default ARViewPage;
