const canvas = document.getElementById("starfield");

const startButton = document.getElementById("startButton");
const statusText = document.getElementById("status");

const alphaText = document.getElementById("alpha");
const betaText = document.getElementById("beta");
const gammaText = document.getElementById("gamma");


// ============================================================
// THREE.JS SETUP
// ============================================================

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x02020a);


// Camera

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    2000
);

camera.position.set(0, 0, 0);


// Renderer

const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
});

renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, 2)
);

renderer.setSize(
    window.innerWidth,
    window.innerHeight
);


// ============================================================
// STAR DOME
// ============================================================

const STAR_COUNT = 1500;

const positions = new Float32Array(STAR_COUNT * 3);
const colors = new Float32Array(STAR_COUNT * 3);
const sizes = new Float32Array(STAR_COUNT);


// Star colors

const STAR_COLORS = [
    new THREE.Color("#ffffff"),
    new THREE.Color("#ffb8b8"),
    new THREE.Color("#ffd166"),
    new THREE.Color("#70a1ff"),
    new THREE.Color("#ff9ff3"),
    new THREE.Color("#eccc68")
];


// Radius of our imaginary sky

const SKY_RADIUS = 500;


// Generate stars on a sphere

for (let i = 0; i < STAR_COUNT; i++) {

    /*
        Generate a random point on a sphere.

        We use spherical coordinates:

        theta = horizontal angle
        phi   = vertical angle
    */

    const theta = Math.random() * Math.PI * 2;

    const phi = Math.acos(
        2 * Math.random() - 1
    );


    const x =
        SKY_RADIUS *
        Math.sin(phi) *
        Math.cos(theta);

    const y =
        SKY_RADIUS *
        Math.cos(phi);

    const z =
        SKY_RADIUS *
        Math.sin(phi) *
        Math.sin(theta);


    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;


    // Random star color

    const color =
        STAR_COLORS[
            Math.floor(
                Math.random() * STAR_COLORS.length
            )
        ];

    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;


    // Random size

    sizes[i] =
        Math.random() * 2.5 + 0.5;
}


// Geometry

const starGeometry =
    new THREE.BufferGeometry();

starGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(
        positions,
        3
    )
);

starGeometry.setAttribute(
    "color",
    new THREE.BufferAttribute(
        colors,
        3
    )
);

starGeometry.setAttribute(
    "size",
    new THREE.BufferAttribute(
        sizes,
        1
    )
);


// ============================================================
// STAR MATERIAL
// ============================================================

const starMaterial =
    new THREE.PointsMaterial({

        size: 2.5,

        sizeAttenuation: false,

        vertexColors: true,

        transparent: true,

        opacity: 0.95,

        depthWrite: false
    });


// Create star field

const starField =
    new THREE.Points(
        starGeometry,
        starMaterial
    );

scene.add(starField);


// ============================================================
// DEVICE ORIENTATION
// ============================================================

let deviceAlpha = 0;
let deviceBeta = 0;
let deviceGamma = 0;


// Smooth values

let smoothAlpha = 0;
let smoothBeta = 0;
let smoothGamma = 0;


// When the phone moves

function handleOrientation(event) {

    if (event.alpha !== null) {

        deviceAlpha = event.alpha;

    }

    if (event.beta !== null) {

        deviceBeta = event.beta;

    }

    if (event.gamma !== null) {

        deviceGamma = event.gamma;

    }


    // Debug information

    alphaText.textContent =
        deviceAlpha.toFixed(1);

    betaText.textContent =
        deviceBeta.toFixed(1);

    gammaText.textContent =
        deviceGamma.toFixed(1);
}


// ============================================================
// START DEVICE ORIENTATION
// ============================================================

async function startDeviceOrientation() {

    /*
        iOS requires permission to access
        motion/orientation sensors.

        Android normally doesn't need this button.
    */

    if (
        typeof DeviceOrientationEvent !== "undefined" &&
        typeof DeviceOrientationEvent.requestPermission === "function"
    ) {

        try {

            const permission =
                await DeviceOrientationEvent.requestPermission();

            if (permission !== "granted") {

                statusText.textContent =
                    "Motion permission was denied.";

                return;
            }

        } catch (error) {

            console.error(error);

            statusText.textContent =
                "Could not access motion sensors.";

            return;
        }
    }


    window.addEventListener(
        "deviceorientation",
        handleOrientation,
        true
    );


    statusText.textContent =
        "Move your phone to explore the sky";


    startButton.style.display =
        "none";
}


// Button

startButton.addEventListener(
    "click",
    startDeviceOrientation
);


// ============================================================
// CAMERA ROTATION
// ============================================================

function updateCamera() {

    /*
        DeviceOrientation gives us degrees.

        Three.js uses radians.
    */

    const alpha =
        THREE.MathUtils.degToRad(
            smoothAlpha
        );

    const beta =
        THREE.MathUtils.degToRad(
            smoothBeta
        );

    const gamma =
        THREE.MathUtils.degToRad(
            smoothGamma
        );


    /*
        The order matters.

        This creates a simple approximation of
        the phone's orientation.
    */

    const euler =
        new THREE.Euler(
            beta,
            alpha,
            -gamma,
            "YXZ"
        );


    camera.quaternion.setFromEuler(
        euler
    );
}


// ============================================================
// ANIMATION
// ============================================================

function animate() {

    requestAnimationFrame(animate);


    /*
        Smooth the sensor movement.

        Without this, the camera can feel
        extremely shaky because phone sensors
        are noisy.
    */

    smoothAlpha +=
        (deviceAlpha - smoothAlpha) * 0.12;

    smoothBeta +=
        (deviceBeta - smoothBeta) * 0.12;

    smoothGamma +=
        (deviceGamma - smoothGamma) * 0.12;


    updateCamera();


    renderer.render(
        scene,
        camera
    );
}


animate();


window.addEventListener(
    "resize",
    () => {

        camera.aspect =
            window.innerWidth /
            window.innerHeight;

        camera.updateProjectionMatrix();


        renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );
    }
);