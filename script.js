const canvas = document.getElementById("starfield");


const scene = new THREE.Scene();

scene.background = new THREE.Color(0x02020a);

const camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.1,
    2000
);

camera.position.set(0, 0, 0);


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


const STAR_COUNT = 2000;
const SKY_RADIUS = 500;

const positions = new Float32Array(
    STAR_COUNT * 3
);

const colors = new Float32Array(
    STAR_COUNT * 3
);


const STAR_COLORS = [
    new THREE.Color("#ffffff"),
    new THREE.Color("#ffb8b8"),
    new THREE.Color("#ffd166"),
    new THREE.Color("#70a1ff"),
    new THREE.Color("#ff9ff3"),
    new THREE.Color("#eccc68")
];


for (let i = 0; i < STAR_COUNT; i++) {

    const theta =
        Math.random() * Math.PI * 2;

    const phi =
        Math.acos(
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

    const color =
        STAR_COLORS[
            Math.floor(
                Math.random() *
                STAR_COLORS.length
            )
        ];


    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
}


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

const starMaterial =
    new THREE.PointsMaterial({

        size: 2.2,

        sizeAttenuation: false,

        vertexColors: true,

        transparent: true,

        opacity: 0.95,

        depthWrite: false
    });

const starField =
    new THREE.Points(
        starGeometry,
        starMaterial
    );

scene.add(starField);

function createTitle() {

    const canvas =
        document.createElement("canvas");

    canvas.width = 1024;
    canvas.height = 256;

    const context =
        canvas.getContext("2d");

    context.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    context.font =
        "800 110px Poppins, sans-serif";

    context.textAlign = "center";
    context.textBaseline = "middle";

    context.shadowColor =
        "rgba(255,255,255,0.8)";

    context.shadowBlur = 30;


    context.fillStyle =
        "#ffffff";


    context.fillText(
        "TIME CAPSULE",
        canvas.width / 2,
        canvas.height / 2
    );

    const texture =
        new THREE.CanvasTexture(canvas);

    texture.colorSpace =
        THREE.SRGBColorSpace;


    // Sprite material

    const material =
        new THREE.SpriteMaterial({

            map: texture,

            transparent: true,

            depthWrite: false
        });


    const title =
        new THREE.Sprite(material);

    title.position.set(
        0,
        2,
        -25
    );


    title.scale.set(
        14,
        3.5,
        1
    );


    scene.add(title);

    return title;
}


const title =
    createTitle();


let alpha = 0;
let beta = 0;
let gamma = 0;

let orientationAvailable = false;

function handleOrientation(event) {

    if (
        event.alpha === null &&
        event.beta === null &&
        event.gamma === null
    ) {
        return;
    }


    orientationAvailable = true;


    alpha =
        event.alpha || 0;

    beta =
        event.beta || 0;

    gamma =
        event.gamma || 0;


    console.log(
        "Orientation:",
        alpha,
        beta,
        gamma
    );
}

window.addEventListener(
    "deviceorientation",
    handleOrientation,
    true
);

const deviceEuler =
    new THREE.Euler(
        0,
        0,
        0,
        "YXZ"
    );


function updateDeviceCamera() {

    if (!orientationAvailable) {
        return;
    }

    const alphaRad =
        THREE.MathUtils.degToRad(alpha);

    const betaRad =
        THREE.MathUtils.degToRad(beta);

    const gammaRad =
        THREE.MathUtils.degToRad(gamma);


    deviceEuler.set(
        betaRad,
        alphaRad,
        -gammaRad,
        "YXZ"
    );


    camera.quaternion
        .setFromEuler(deviceEuler);
}

let mouseX = 0;
let mouseY = 0;

let mouseTargetX = 0;
let mouseTargetY = 0;


window.addEventListener(
    "mousemove",
    (event) => {

        if (orientationAvailable) {
            return;
        }


        mouseTargetX =
            (
                event.clientX /
                window.innerWidth
                - 0.5
            ) * 2;

        mouseTargetY =
            (
                event.clientY /
                window.innerHeight
                - 0.5
            ) * 2;
    }
);


function updateMouseCamera() {

    if (orientationAvailable) {
        return;
    }


    mouseX +=
        (mouseTargetX - mouseX) * 0.08;

    mouseY +=
        (mouseTargetY - mouseY) * 0.08;


    camera.rotation.y =
        -mouseX * 1.5;

    camera.rotation.x =
        -mouseY * 0.8;
}

function animate() {

    requestAnimationFrame(animate);

    if (orientationAvailable) {

        updateDeviceCamera();

    } else {

        updateMouseCamera();

    }


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