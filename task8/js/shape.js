function createShape() {

    var box_geometry = new THREE.BoxGeometry(3, 3, 3);
    var sphere_geometry = new THREE.SphereGeometry(1.5, 32, 32);

    var shape;
    var material = Physijs.createMaterial(
        new THREE.MeshLambertMaterial({ map: textLoader.load('../img/task8/plywood.jpg') }),
        1,
        0.1
    );

    switch (Math.floor(Math.random() * 2)) {
        case 0:
            shape = new Physijs.BoxMesh(
                box_geometry,
                material
            );
            // 设置正方体可以穿透。
            // https://github.com/chandlerprall/Physijs/issues/82
            // https://github.com/chandlerprall/Physijs/issues/187
            shape._physijs.collision_flags = 4;

            shape.name = 'BoxMesh';
            break;
        case 1:
            shape = new Physijs.SphereMesh(
                sphere_geometry,
                material,
                0 // mass为0静止。
            );
            shape.name = 'SphereMesh';
            break;
    }

    shape.castShadow = true;
    shape.receiveShadow = true;

    shape.position.set(
        Math.random() * 16 - 8,
        2,
        vehicleZ ? vehicleZ - 50 - 100 * Math.random() : -50 - 100 * Math.random()
    );

    shape.addEventListener('collision', handleCollision);
    shape.addEventListener('ready', function () {
        // 避免正方体掉落穿过地面。 https://github.com/chandlerprall/Physijs/issues/102
        this.setCcdMotionThreshold(0.1);
        this.setCcdSweptSphereRadius(1);
        this.setLinearFactor(new THREE.Vector3(0, 0, 0));
        this.setAngularFactor(new THREE.Vector3(0, 0, 0));
    });

    setTimeout(createShape, 3000);
    // 删除之后会报错还是ammo.js里面的。。
    // setTimeout(clear, 15000);
    // function clear () {
    //     if (shapeArr.length) {
    //         scene.remove(shapeArr[0]);
    //         shapeArr.splice(0, 1);
    //     }
    // }

    scene.add(shape);
    shapeArr.push(shape);

    function handleCollision(object, linearVelocity, angularVelocity) {
        if (this.collisioned || object.name != 'car') return;
        if (this.name == 'BoxMesh') {
            if (!sounds['score'].isPlaying) {
                sounds['score'].play();
            }

            this.collisioned = true;

            score += 10;
            scoreElement.innerHTML = score;

            var _this = this;
            var twinkling = setInterval(function () {
                _this.material.color.setRGB(Math.random(), Math.random(), Math.random());
            }, 100);

            setTimeout(function () {
                clearInterval(twinkling);
                scene.remove(_this);
            }, 3000);
        }
        else if (this.name == 'SphereMesh') {
            if (!sounds['crash'].isPlaying) {
                sounds['crash'].play();
            }

            if (this.crashed ) {
                return;
            }
            this.crashed = true;

            crash++;
            crashElement.innerHTML = crash;
        }
    }
}
