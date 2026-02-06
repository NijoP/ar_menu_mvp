
import fs from 'fs';
import path from 'path';
import * as THREE from 'three';
import { GLTFExporter } from 'three-stdlib';
// import { createCanvas } from 'canvas'; // Canvas not strictly required for geometry gen
import { JSDOM } from 'jsdom';

// Mocks for Three.js in Node
const mockDOM = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.window = mockDOM.window;
global.document = mockDOM.window.document;
global.HTMLCanvasElement = mockDOM.window.HTMLCanvasElement;
global.createElement = mockDOM.window.document.createElement;


// Helper for random variance
const rand = (min, max) => Math.random() * (max - min) + min;

// Enhanced Generators
const generators = {
    chicken_curry: () => {
        const group = new THREE.Group();

        // HIGH FIDELITY BOWL (LatheGeometry)
        // Profile for a realistic ceramic bowl
        const points = [];
        for (let i = 0; i < 10; i++) {
            points.push(new THREE.Vector2(Math.sin(i * 0.2) * 3 + 0.5, (i - 5) * 0.5));
        }
        const bowlGeo = new THREE.LatheGeometry(points, 64);
        const bowlMat = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.05, // Ceramic glaze
            metalness: 0.1
        });
        const bowl = new THREE.Mesh(bowlGeo, bowlMat);
        bowl.scale.set(1, 1, 1);
        group.add(bowl);

        // Curry Liquid (Stochastic Surface)
        const curryGeo = new THREE.CircleGeometry(2.8, 64);
        // Perturb vertices for "liquid" look? Hard in node without full geo access easily.
        // We use material properties for depth.
        const curryMat = new THREE.MeshStandardMaterial({
            color: 0xd2691e,
            emissive: 0x8b4500,
            emissiveIntensity: 0.3,
            roughness: 0.2,
            metalness: 0.1
        });
        const curry = new THREE.Mesh(curryGeo, curryMat);
        curry.rotation.x = -Math.PI / 2;
        curry.position.y = 1.0; // Higher up in the lathe bowl
        group.add(curry);

        // Chicken Chunks (Realistic placement)
        const chunkGeo = new THREE.DodecahedronGeometry(0.6);
        const chunkMat = new THREE.MeshStandardMaterial({ color: 0xcd853f, roughness: 0.7 });
        for (let i = 0; i < 5; i++) {
            const chunk = new THREE.Mesh(chunkGeo, chunkMat);
            // Spiral distribution
            const angle = i * 2.4;
            const r = i * 0.4;
            chunk.position.set(Math.cos(angle) * r, 1.3, Math.sin(angle) * r);
            chunk.rotation.set(Math.random(), Math.random(), Math.random());
            group.add(chunk);
        }
        return group;
    },
    paneer_butter_masala: () => {
        const group = new THREE.Group();
        // Copper Bowl Style
        const bowlGeo = new THREE.SphereGeometry(3, 64, 32, 0, Math.PI * 2, 0, Math.PI / 2);
        const bowlMat = new THREE.MeshStandardMaterial({ color: 0xb87333, metalness: 0.6, roughness: 0.3 });
        const bowl = new THREE.Mesh(bowlGeo, bowlMat);
        bowl.rotation.x = Math.PI;
        group.add(bowl);

        // Rich Orange Gravy
        const gravyGeo = new THREE.CircleGeometry(2.8, 64);
        const gravyMat = new THREE.MeshStandardMaterial({ color: 0xff8c00, roughness: 0.4 });
        const gravy = new THREE.Mesh(gravyGeo, gravyMat);
        gravy.rotation.x = -Math.PI / 2;
        gravy.position.y = 0.4;
        group.add(gravy);

        // Paneer Cubes (Soft, white)
        const cubeGeo = new THREE.BoxGeometry(0.8, 0.8, 0.8);
        const cubeMat = new THREE.MeshStandardMaterial({ color: 0xfffff0, roughness: 0.9 });
        for (let i = 0; i < 5; i++) {
            const cube = new THREE.Mesh(cubeGeo, cubeMat);
            cube.position.set(rand(-1.2, 1.2), 0.8, rand(-1.2, 1.2));
            cube.rotation.y = rand(0, 3);
            group.add(cube);
        }

        // Garnish (Green specs)
        const garnishGeo = new THREE.PlaneGeometry(0.2, 0.2);
        const garnishMat = new THREE.MeshBasicMaterial({ color: 0x228b22, side: THREE.DoubleSide });
        for (let i = 0; i < 10; i++) {
            const g = new THREE.Mesh(garnishGeo, garnishMat);
            g.position.set(rand(-1, 1), 0.85, rand(-1, 1));
            g.rotation.x = -Math.PI / 2;
            group.add(g);
        }
        return group;
    },
    veg_fried_rice: () => {
        const group = new THREE.Group();
        // White Plate
        const plateGeo = new THREE.CylinderGeometry(3.5, 3, 0.2, 64);
        const plateMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1 });
        const plate = new THREE.Mesh(plateGeo, plateMat);
        group.add(plate);

        // Rice Mound (Noise texture simulated by roughness/bumps not easy here, so using particles)
        const moundGeo = new THREE.SphereGeometry(2.8, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
        const moundMat = new THREE.MeshStandardMaterial({ color: 0xfffff0, roughness: 1.0 });
        const mound = new THREE.Mesh(moundGeo, moundMat);
        mound.position.y = 0.1;
        mound.scale.y = 0.6;
        group.add(mound);

        // Veggies
        const vegGeo = new THREE.BoxGeometry(0.15, 0.15, 0.15);
        const carrotMat = new THREE.MeshStandardMaterial({ color: 0xff4500 });
        const peaMat = new THREE.MeshStandardMaterial({ color: 0x32cd32 });

        for (let i = 0; i < 50; i++) {
            const isCarrot = Math.random() > 0.5;
            const veg = new THREE.Mesh(vegGeo, isCarrot ? carrotMat : peaMat);
            // Distribute on mound surface approximately
            const r = rand(0, 2.5);
            const theta = rand(0, Math.PI * 2);
            veg.position.set(r * Math.cos(theta), 0.2 + (2.8 - r) * 0.4, r * Math.sin(theta));
            veg.rotation.set(rand(0, 3), rand(0, 3), rand(0, 3));
            group.add(veg);
        }
        return group;
    },
    chicken_biriyani: () => {
        const group = new THREE.Group();
        // Clay Pot
        const potGeo = new THREE.CylinderGeometry(3.2, 2.8, 1.5, 32);
        const potMat = new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.8 });
        const pot = new THREE.Mesh(potGeo, potMat);
        group.add(pot);

        // Biryani Rice (Yellow/Orange)
        const riceGeo = new THREE.SphereGeometry(3, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
        const riceMat = new THREE.MeshStandardMaterial({ color: 0xffa500, roughness: 0.9 });
        const rice = new THREE.Mesh(riceGeo, riceMat);
        rice.position.y = 0.5;
        rice.scale.y = 0.4;
        group.add(rice);

        // Leg Piece
        const legGeo = new THREE.CapsuleGeometry(0.5, 1.5, 4, 8);
        const legMat = new THREE.MeshStandardMaterial({ color: 0xa0522d, roughness: 0.5 });
        const leg = new THREE.Mesh(legGeo, legMat);
        leg.position.set(0, 1.2, 0.5);
        leg.rotation.z = Math.PI / 4;
        group.add(leg);

        return group;
    },
    masala_dosa: () => {
        const group = new THREE.Group();
        // Plate
        const plateGeo = new THREE.CylinderGeometry(4, 4, 0.1, 64);
        const plateMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee, metalness: 0.2 });
        const plate = new THREE.Mesh(plateGeo, plateMat);
        group.add(plate);

        // Dosa (Golden, crispy)
        const dosaGeo = new THREE.CylinderGeometry(1.2, 1.2, 7, 32, 1, true);
        const dosaMat = new THREE.MeshStandardMaterial({ color: 0xdaa520, side: THREE.DoubleSide, roughness: 0.6 });
        const dosa = new THREE.Mesh(dosaGeo, dosaMat);
        dosa.rotation.z = Math.PI / 2;
        dosa.rotation.y = Math.PI / 6;
        dosa.position.y = 0.6;
        dosa.scale.x = 0.6;
        group.add(dosa);

        return group;
    },
    butter_naan: () => {
        const group = new THREE.Group();
        // Naan (Irregular, bubbly)
        const shape = new THREE.Shape();
        shape.ellipse(0, 0, 3, 2, 0, 2 * Math.PI);
        const naanGeo = new THREE.ShapeGeometry(shape);
        const naanMat = new THREE.MeshStandardMaterial({
            color: 0xf5deb3,
            side: THREE.DoubleSide,
            roughness: 0.8,
            map: null
        });
        const naan = new THREE.Mesh(naanGeo, naanMat);
        naan.rotation.x = -Math.PI / 2;

        // Butter patch
        const butterGeo = new THREE.CircleGeometry(0.8, 16);
        const butterMat = new THREE.MeshStandardMaterial({ color: 0xffff00, opacity: 0.6, transparent: true, roughness: 0.2 });
        const butter = new THREE.Mesh(butterGeo, butterMat);
        butter.position.z = 0.01; // slightly above naan (in local space after rotation)
        naan.add(butter);

        group.add(naan);
        return group;
    },
    veg_burger: () => {
        const group = new THREE.Group();
        // Seeded Bun Texture (Simulated with dots)
        const bunGeo = new THREE.SphereGeometry(2.5, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2);
        const bunMat = new THREE.MeshStandardMaterial({ color: 0xcd853f, roughness: 0.6 });
        const topBun = new THREE.Mesh(bunGeo, bunMat);
        topBun.position.y = 1.6;

        // Seeds
        const seedGeo = new THREE.BoxGeometry(0.1, 0.1, 0.1);
        const seedMat = new THREE.MeshStandardMaterial({ color: 0xf5deb3 });
        for (let i = 0; i < 30; i++) {
            const s = new THREE.Mesh(seedGeo, seedMat);
            const r = 2.4;
            const theta = rand(0, Math.PI * 2);
            const phi = rand(0, Math.PI / 2.5);
            s.position.setFromSphericalCoords(r, phi, theta);
            topBun.add(s);
        }
        group.add(topBun);

        const botBunGeo = new THREE.CylinderGeometry(2.5, 2.5, 0.6, 32);
        const botBun = new THREE.Mesh(botBunGeo, bunMat);
        botBun.position.y = -1.6;
        group.add(botBun);

        // Patty (Charred)
        const pattyGeo = new THREE.CylinderGeometry(2.5, 2.5, 0.8, 32);
        const pattyMat = new THREE.MeshStandardMaterial({ color: 0x3e2723, roughness: 0.9 });
        const patty = new THREE.Mesh(pattyGeo, pattyMat);
        group.add(patty);

        // Cheese
        const cheeseGeo = new THREE.BoxGeometry(4, 0.1, 4);
        const cheeseMat = new THREE.MeshStandardMaterial({ color: 0xffd700, roughness: 0.4 });
        const cheese = new THREE.Mesh(cheeseGeo, cheeseMat);
        cheese.position.y = 0.5;
        cheese.rotation.y = Math.PI / 4; // Diamond placement
        group.add(cheese);

        // Lettuce (Ruffled torus?)
        const lettuceGeo = new THREE.TorusGeometry(2.6, 0.2, 8, 20);
        const lettuceMat = new THREE.MeshStandardMaterial({ color: 0x32cd32 });
        const lettuce = new THREE.Mesh(lettuceGeo, lettuceMat);
        lettuce.rotation.x = Math.PI / 2;
        lettuce.position.y = 0.8;
        lettuce.scale.z = 0.5; // Flatten
        group.add(lettuce);

        return group;
    },
    french_fries: () => {
        const group = new THREE.Group();
        // Red Box
        const boxGeo = new THREE.BoxGeometry(2.5, 3.5, 1.5);
        const boxMat = new THREE.MeshStandardMaterial({ color: 0xdc143c, roughness: 0.4 });
        const box = new THREE.Mesh(boxGeo, boxMat);
        group.add(box);

        // Fries (Golden, crispy)
        const fryGeo = new THREE.BoxGeometry(0.3, 4, 0.3);
        const fryMat = new THREE.MeshStandardMaterial({ color: 0xffd700, roughness: 0.5 });

        for (let i = 0; i < 20; i++) {
            const fry = new THREE.Mesh(fryGeo, fryMat);
            fry.position.set(rand(-1, 1), 2 + rand(0, 1), rand(-0.4, 0.4));
            fry.rotation.z = rand(-0.3, 0.3);
            fry.rotation.x = rand(-0.2, 0.2);
            group.add(fry);
        }
        return group;
    },
    pizza_slice: () => {
        const group = new THREE.Group();
        const shape = new THREE.Shape();
        shape.moveTo(0, 0);
        shape.lineTo(2.5, 5);
        shape.lineTo(-2.5, 5);
        shape.lineTo(0, 0);

        const extrudeSettings = { depth: 0.3, bevelEnabled: true, bevelThickness: 0.1, bevelSize: 0.1 };
        const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        const mat = new THREE.MeshStandardMaterial({ color: 0xffd700, roughness: 0.6 });
        const slice = new THREE.Mesh(geo, mat);
        slice.rotation.x = -Math.PI / 2;
        group.add(slice);

        // Crust
        const crustGeo = new THREE.CylinderGeometry(0.4, 0.4, 5.2, 16);
        const crustMat = new THREE.MeshStandardMaterial({ color: 0xcd853f });
        const crust = new THREE.Mesh(crustGeo, crustMat);
        crust.rotation.z = Math.PI / 2;
        crust.position.set(0, 0.2, -5);
        group.add(crust);

        // Pepperoni
        const pepGeo = new THREE.CylinderGeometry(0.6, 0.6, 0.05, 16);
        const pepMat = new THREE.MeshStandardMaterial({ color: 0xa52a2a, roughness: 0.4 });

        const p1 = new THREE.Mesh(pepGeo, pepMat); p1.position.set(0, 0.31, -2); group.add(p1);
        const p2 = new THREE.Mesh(pepGeo, pepMat); p2.position.set(1, 0.31, -3.5); group.add(p2);
        const p3 = new THREE.Mesh(pepGeo, pepMat); p3.position.set(-1, 0.31, -3.5); group.add(p3);

        return group;
    },
    ice_cream: () => {
        const group = new THREE.Group();
        // Waffle Cone (Textured Grid ideally, but color variation for now)
        const coneGeo = new THREE.ConeGeometry(1.5, 5, 32);
        const coneMat = new THREE.MeshStandardMaterial({ color: 0xd2b48c, roughness: 0.7 });
        const cone = new THREE.Mesh(coneGeo, coneMat);
        cone.rotation.x = Math.PI;
        cone.position.y = -1;
        group.add(cone);

        // Scoops (Shiny)
        const scoopGeo = new THREE.SphereGeometry(1.5, 32, 32);
        const strawberryMat = new THREE.MeshStandardMaterial({ color: 0xff69b4, roughness: 0.4, metalness: 0.1 });
        const scoop1 = new THREE.Mesh(scoopGeo, strawberryMat);
        scoop1.position.y = 1.5;
        group.add(scoop1);

        const vanillaMat = new THREE.MeshStandardMaterial({ color: 0xfffff0, roughness: 0.4, metalness: 0.1 });
        const scoop2 = new THREE.Mesh(scoopGeo, vanillaMat);
        scoop2.position.y = 3.2;
        scoop2.scale.setScalar(0.8);
        group.add(scoop2);

        return group;
    }
};

const menuItems = [
    { id: '1', name: 'Chicken Curry', price: 250, key: 'chicken_curry' },
    { id: '2', name: 'Paneer Butter Masala', price: 220, key: 'paneer_butter_masala' },
    { id: '3', name: 'Veg Fried Rice', price: 180, key: 'veg_fried_rice' },
    { id: '4', name: 'Chicken Biriyani', price: 280, key: 'chicken_biriyani' },
    { id: '5', name: 'Masala Dosa', price: 120, key: 'masala_dosa' },
    { id: '6', name: 'Butter Naan', price: 40, key: 'butter_naan' },
    { id: '7', name: 'Veg Burger', price: 150, key: 'veg_burger' },
    { id: '8', name: 'French Fries', price: 100, key: 'french_fries' },
    { id: '9', name: 'Pizza Slice', price: 150, key: 'pizza_slice' },
    { id: '10', name: 'Ice Cream', price: 80, key: 'ice_cream' }
];

async function generate() {
    const exporter = new GLTFExporter();
    const menuData = [];

    // Ensure models dir exists
    const modelsDir = path.join('public', 'models');
    if (!fs.existsSync(modelsDir)) {
        fs.mkdirSync(modelsDir, { recursive: true });
    }

    if (!fs.existsSync(path.join('src', 'data'))) {
        fs.mkdirSync(path.join('src', 'data'), { recursive: true });
    }

    for (const item of menuItems) {
        console.log(`Generating high-fidelity ${item.name}...`);
        const generator = generators[item.key];
        if (generator) {
            const scene = new THREE.Scene();
            const model = generator();
            scene.add(model);

            // Export
            await new Promise((resolve, reject) => {
                exporter.parse(
                    scene,
                    (gltf) => {
                        // GLTFExporter with binary:true returns ArrayBuffer
                        // But depending on version, check input. 
                        // If output is generated as binary, it's an ArrayBuffer.
                        // If JSON, it's an object.
                        // We forced binary: true below.
                        let buffer = gltf;
                        if (gltf instanceof ArrayBuffer) {
                            buffer = Buffer.from(gltf);
                        } else if (typeof gltf === 'object') {
                            // Should not happen with binary: true usually, unless specific options
                            buffer = Buffer.from(JSON.stringify(gltf));
                        }

                        fs.writeFileSync(path.join(modelsDir, `${item.key}.glb`), buffer);
                        resolve();
                    },
                    (err) => {
                        console.error('Error exporting', err);
                        reject(err);
                    },
                    { binary: true }
                );
            });

            menuData.push({
                id: item.id,
                name: item.name,
                price: item.price,
                model_path: `/models/${item.key}.glb`,
                description: `Freshly prepared ${item.name}`
            });
        }
    }

    fs.writeFileSync(path.join('src', 'data', 'menu.json'), JSON.stringify(menuData, null, 2));
    console.log('Menu data generated!');
}

generate().catch(err => console.error(err));
