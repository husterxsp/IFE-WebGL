var scene, renderer, camera, listener, canvas, stat,
    light, ambientLight, vehicle, vehicleZ, sounds, score = 0,
    crash = 0,
    shapeArr = [];

var groundArr = [];
var groundLen = 512;
var startTime = Date.now();
var scoreElement = document.getElementById('score');
var timeElement = document.getElementById('time');
var crashElement = document.getElementById('crash');

var textLoader = new THREE.TextureLoader();
var audioLoader = new THREE.AudioLoader();


Physijs.scripts.worker = '../lib/physijs_worker.js';
Physijs.scripts.ammo = '../lib/ammo.js';

function initScene() {
    canvas = document.getElementById('mainCanvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    scene = new Physijs.Scene;
    // 设置重力方向Y负方向10
    scene.setGravity(new THREE.Vector3(0, -10, 0));
    scene.addEventListener('update', function () {
        scene.simulate(undefined, 1);
    });

    renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true
    });
    renderer.setClearColor(0x404040);

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    renderer.shadowMapSoft = true;

    renderer.shadowCameraNear = 3;
    renderer.shadowCameraFov = 50;

    renderer.shadowMapBias = 0.0039;
    renderer.shadowMapDarkness = 0.5;
    renderer.shadowMapWidth = 1024;
    renderer.shadowMapHeight = 1024;

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, .1, 100000);
    camera.position.set(0, 20, 20);
    camera.lookAt(scene.position);

    listener = new THREE.AudioListener();
    camera.add(listener);

    scene.add(camera);

    scene.addEventListener('update', function () {
        if (input && vehicle) {
            if (input.direction !== null) {
                input.steering += input.direction / 4;
                if (input.steering < -.5) input.steering = -.5;
                if (input.steering > .5) input.steering = .5;
            } else {
                input.steering = 0;
            }

            vehicle.setSteering(input.steering, 0);
            vehicle.setSteering(input.steering, 1);

            if (input.power === true) {
                if (!sounds['accelerate'].isPlaying) {
                    sounds['accelerate'].play();
                }
                vehicle.applyEngineForce(300);
            } else if (input.power === false) {
                if (!sounds['bounce'].isPlaying) {
                    sounds['bounce'].play();
                }
                vehicle.setBrake(20, 2);
                vehicle.setBrake(20, 3);
                vehicle.applyEngineForce(-100);
                vehicle.setBrake(20, 2);
                vehicle.setBrake(20, 3);
            } else {
                vehicle.applyEngineForce(0);
            }
        }

        scene.simulate(undefined, 2);
    });

    scene.simulate();
}

function initLight() {
    ambientLight = new THREE.AmbientLight(0xaaaaaa);
    light = new THREE.DirectionalLight(0xffffff);

    light.position.set(100, 100, -100);
    light.castShadow = true;

    // 把光照的范围设置大一点让掉落的那些物体也能被光照照到。
    light.shadow.camera.left = -80;
    light.shadow.camera.right = 80;
    light.shadow.camera.top = 50;
    light.shadow.camera.bottom = -50;

    scene.add(ambientLight);
    scene.add(light);
}

function render() {
    if (vehicle) {

        camera.position.copy(vehicle.mesh.position).add(new THREE.Vector3(0, 25, 40));
        camera.lookAt(vehicle.mesh.position);

        light.target = vehicle.mesh;
        light.position.copy(vehicle.mesh.position).add(new THREE.Vector3(100, 100, -100));

        updateGround();
    }

    stats.update();

    timeElement.innerHTML = ((Date.now() - startTime) / 1000).toFixed(2);

    renderer.render(scene, camera);
    requestAnimationFrame(render);
}

// 用两块地面拼接显示
function updateGround() {
    vehicleZ = vehicle.mesh.position.z;
    var distance0 = Math.abs(vehicleZ - groundArr[0].position.z);
    var distance1 = Math.abs(vehicleZ - groundArr[1].position.z);
    var curDistance; //小车距离当前地面的中心点的距离
    var otherDistance;

    if (distance0 < distance1) {
        cur = 0;
        other = 1;
        curDistance = distance0;
        otherDistance = distance1;
    } else {
        cur = 1;
        other = 0;
        curDistance = distance1;
        otherDistance = distance0;
    }

    // 小车已行驶距离到距当前所在的地面中心的1/4处并且另外一块地面在小车后方，移动另外一块地面到小车行驶前方
    if (curDistance > groundLen / 4 && otherDistance > groundLen) {
        if (vehicleZ < groundArr[other].position.z) {
            groundArr[other].position.z -= groundLen * 2;
        } else {
            groundArr[other].position.z += groundLen * 2;
        }
    }
    groundArr[other].__dirtyPosition = true;
}

function initGround() {
    for (var i = 0; i < 2; i++) {
        var roadMaterial = Physijs.createMaterial(
            new THREE.MeshLambertMaterial({
                map: textLoader.load('../img/task8/road.jpg'),
                side: THREE.DoubleSide
            }),
            .8, // 高摩擦系数
            .3 // 低弹性形变
        );

        roadMaterial.map.wrapS = roadMaterial.map.wrapT = THREE.RepeatWrapping;
        roadMaterial.map.repeat.set(1, 64);
        var road = new Physijs.BoxMesh(
            new THREE.PlaneGeometry(16, groundLen, 1, 1),
            roadMaterial
        );
        road.position.z = 0;
        road.rotation.x = Math.PI / 2;
        road.receiveShadow = true;

        var groundMaterial = Physijs.createMaterial(
            new THREE.MeshLambertMaterial({
                map: textLoader.load('../img/task8/rocks.jpg'),
                side: THREE.DoubleSide
            }),
            .8,
            .3
        );
        groundMaterial.map.wrapS = groundMaterial.map.wrapT = THREE.RepeatWrapping;
        groundMaterial.map.repeat.set(3, 12);
        // 这里用PlaneMesh就不行。。大概是PlaneMesh是厚度无限接近0，小车经过速度太快。
        var ground = new Physijs.BoxMesh(
            new THREE.BoxGeometry(128, 1, groundLen),
            groundMaterial,
            0 // mass
        );
        ground.position.y = -0.5;
        ground.position.z = -i * groundLen;
        ground.receiveShadow = true;
        ground.add(road);
        road.position.y = 1;

        scene.add(ground);
        groundArr.push(ground);
    }

    createShape();
}

function initModel() {
    var manager = new THREE.LoadingManager();
    var JSONLoader = new THREE.JSONLoader(manager);

    JSONLoader.load("../model/task8/car/car.js", function (car, car_materials) {
        JSONLoader.load("../model/task8/car/car_wheel.js", function (wheel, wheel_materials) {
            var mesh = new Physijs.BoxMesh(
                car,
                new THREE.MultiMaterial(car_materials),
                100
            );
            mesh.position.y = 2;
            mesh.rotation.y = Math.PI;
            mesh.castShadow = mesh.receiveShadow = true;

            vehicle = new Physijs.Vehicle(mesh, new Physijs.VehicleTuning(
                10.88,
                1.83,
                0.28,
                500,
                10.5,
                6000
            ));
            vehicle.mesh.name = 'car';
            // error: object not an instance of THREE.Object3D
            scene.add(vehicle);

            var wheel_material = new THREE.MultiMaterial(wheel_materials);

            for (var i = 0; i < 4; i++) {
                vehicle.addWheel(
                    wheel,
                    wheel_material,
                    new THREE.Vector3(
                        i % 2 === 0 ? -1.6 : 1.6, -1,
                        i < 2 ? 3.3 : -3.2
                    ),
                    new THREE.Vector3(0, -1, 0),
                    new THREE.Vector3(-1, 0, 0),
                    0.5,
                    0.7,
                    i < 2 ? false : true
                );
            }

            input = {
                power: null,
                direction: null,
                steering: 0
            };
            document.addEventListener('keydown', function (e) {
                switch (e.keyCode) {
                    case 37: // left
                        input.direction = 1;
                        break;
                    case 38: // forward
                        input.power = true;
                        break;
                    case 39: // right
                        input.direction = -1;
                        break;
                    case 40: // back
                        input.power = false;
                        break;
                    case 84: // T键回到跑道上
                        input.power = false;
                        input.direction = null;
                        vehicle.mesh.position.x = 0;
                        vehicle.mesh.position.y = 2;
                        mesh.__dirtyPosition = true;
                        vehicle.mesh.setLinearVelocity(new THREE.Vector3(0, 0, 0));
                        vehicle.mesh.setAngularVelocity(new THREE.Vector3(0, 0, 0));
                        scene.simulate();
                }
            });
            document.addEventListener('keyup', function (e) {
                switch (e.keyCode) {
                    case 37: // left
                        input.direction = null;
                        break;
                    case 38: // forward
                        input.power = null;
                        // sounds['accelerate'].pause();
                        break;
                    case 39: // right
                        input.direction = null;
                        break;
                    case 40: // back
                        input.power = null;
                        // sounds['bounce'].pause();
                        break;
                }
            });
        });
    });
}

function initSound() {

    // Web Audio 。。怎么中间好多噪音。。。
    sounds = {
        driving: '../sound/task8/driving.wav',
        accelerate: '../sound/task8/short.wav',
        bounce: '../sound/task8/bounce.wav',
        crash: '../sound/task8/crash.wav',
        score: '../sound/task8/score.mp3',
    };
    for (var key in sounds) {
        (function (key) {
            audioLoader.load(sounds[key], function (buffer) {
                sounds[key] = new THREE.PositionalAudio(listener);
                sounds[key].setBuffer(buffer);
                sounds[key].setRefDistance(10);
                
                if (key == 'driving') {
                    sounds[key].setLoop(true);
                    sounds[key].play();
                }
            });
        }(key))
    }
}

function init() {
    initScene();
    initLight();

    initGround();
    initModel();
    initSound();

    stats = new Stats();
    document.body.appendChild(stats.dom);

    render();
}

init();
