
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
    const [rotation, setRotation] = useState(0);

    // Update reticle
    useHitTest((hitMatrix) => {
        if (!modelPos && reticleRef.current) {
            hitMatrix.decompose(reticleRef.current.position, reticleRef.current.quaternion, reticleRef.current.scale);
            // Ensure reticle is flat
            // reticleRef.current.rotation.x = -Math.PI / 2; 
        }
    });

    const handleSelect = () => {
        if (reticleRef.current && !modelPos) {
            setModelPos(reticleRef.current.position.clone());
        }
    };

    // Simple Drag Logic (Touch)
    // We'll use a transparent plane on top of the model to handle drag if model is present?
    // Or just simple rotation buttons for MVP to avoid "rotate by drag" complexity with XREvents.
    // User requested "Rotate by drag", so we'll try OrbitControls around the model, that often works in AR too.

    return (
        <>
            <ambientLight />
            <pointLight position={[10, 10, 10]} />

            {!modelPos && (
                <mesh ref={reticleRef} rotation-x={-Math.PI / 2}>
                    <ringGeometry args={[0.1, 0.25, 32]} />
                    <meshBasicMaterial color="white" />
                </mesh>
            )}

            {/* Place on tap */}
            <mesh onClick={handleSelect} rotation-x={-Math.PI / 2} visible={false}>
                <planeGeometry args={[100, 100]} />
            </mesh>

            {/* The Model */}
            {modelPos && (
                <group position={modelPos}>
                    {/* OrbitControls allows dragging to rotate */}
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
    const [scale, setScale] = useState(0.8);

    if (!item) return <div style={{ color: 'white', padding: 20 }}>Item not found</div>;

    return (
        <div style={{ width: '100vw', height: '100vh', background: 'black' }}>
            <ARButton sessionInit={{ requiredFeatures: ['hit-test'] }}
                style={{
                    position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)',
                    zIndex: 10, background: 'var(--accent)', color: 'white', padding: '12px 24px',
                    borderRadius: '24px', fontWeight: 'bold'
                }}
            />

            {/* UI Overlay */}
            <div style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 10 }}>
                <Link to="/" style={{ color: 'white', background: 'rgba(0,0,0,0.5)', padding: '8px 16px', borderRadius: '16px' }}>
                    &larr; Back
                </Link>
            </div>

            <div style={{ position: 'absolute', bottom: '100px', right: '20px', display: 'flex', flexDirection: 'column', gap: '10px', zIndex: 10 }}>
                <button className="glass" onClick={() => setScale(s => Math.min(s + 0.1, 2))} style={{ width: '40px', height: '40px', color: 'white', fontSize: '1.2rem' }}>+</button>
                <button className="glass" onClick={() => setScale(s => Math.max(s - 0.1, 0.2))} style={{ width: '40px', height: '40px', color: 'white', fontSize: '1.2rem' }}>-</button>
            </div>

            <Canvas>
                <XR>
                    <XRExperience modelUrl={item.model_path} scale={scale} />
                </XR>
            </Canvas>
        </div>
    );
};

export default ARViewPage;
