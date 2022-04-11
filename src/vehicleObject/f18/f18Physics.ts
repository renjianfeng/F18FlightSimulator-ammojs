import { F18CameraController } from './f18CameraController';
import { F18SoundController } from './f18Sound';
import * as BABYLON from '@babylonjs/core'
import { async } from 'rxjs'
import { autoLOD } from '../../base/funt'
import { F18HUD } from './f18HUD'
import { F18LODManager } from './f18LODManager'
import { F18Animation } from './f18Animation';
import { F18Explode } from './f18Explode';
import { Vector3 } from '@babylonjs/core';

const v3 = BABYLON.Vector3
/**
 * 物理
 */
export class F18Physics {


    public vehicle: Ammo.btRaycastVehicle
    private vehicleBody: Ammo.btRigidBody
    public chassisMesh: BABYLON.Mesh

    public wheelMeshes = [];

    private vehicleReady = false;

    private ZERO_QUATERNION = new BABYLON.Quaternion();

    private chassisWidth = 2;
    private chassisHeight = 0.6;
    private chassisLength = 8;
    private massVehicle = 200;

    private wheelAxisPositionBack = -1.32;
    private wheelRadiusBack = .212;
    private wheelWidthBack = .3;
    private wheelHalfTrackBack = 1.13;
    //后轮轴高度
    private wheelAxisHeightBack = 0.05;

    // v
    private wheelAxisFrontPosition = 2.12;

    //前轮轴宽度
    private wheelHalfTrackFront = 0;

    //前轮轴高度
    private wheelAxisHeightFront = 0.05;
    //前轮半径
    private wheelRadiusFront = .181;
    private wheelWidthFront = .3;

    //悬挂刚度
    private suspensionStiffness = 18;

    //悬挂阻尼
    private suspensionDamping = 0.3;
    //悬挂压缩
    private suspensionCompression = 4.4;
    //悬架静止长度
    private suspensionRestLength = 0.6;

    //转动影响
    private rollInfluence = 0.1;

    private steeringIncrement = .1;
    private steeringClamp = 0.4;

    private FRONT_LEFT = 0;
    private FRONT_RIGHT = 1;
    private BACK_LEFT = 2;
    private BACK_RIGHT = 3;

    private wheelDirectionCS0;
    private wheelAxleCS;


    private vehicleSteering = 0;

    private _engine
    private _canvas
    private scene: BABYLON.Scene;




    //飞机输入数据
    public flyGamePadData = {
        pitchNumber: 0,
        rollNumber: 0,
        yawNumber: 0,
        accelerateNumber: 0,
        brakeNumber: 0,
        switchCameraNumber: 0,
        switchUndercarriageNumber: 0,
    }


    public flyData: FlyData = {
        accelerateSize: 0,
        resistance: 0.1,
        flySpeed: 0,
        flyLift: 0
    }

    public flyMesh

    public flyMeshExplode;

    //起落架状态
    public undercarriageState = true;

    public YawPitchRollInBeigin = new BABYLON.Vector3(0, 0, 0)

    private stats = {
        angularVelocityMaxs: new v3(Math.PI * 0.8, Math.PI * 0.8, Math.PI * 0.8),
        angularAcceleration: new v3(Math.PI * 0.3, Math.PI * 0.3, Math.PI * 0.3),
        angularDeceleration: new v3(0.95, 0.95, 0.95),
        currentSpeeds: new v3(0, 0, 0)
    }

    private f18HUDController: F18HUD

    private f18AnimationController: F18Animation
    private f18ExplodeController: F18Explode

    public skeletons

    constructor(_canvas, _engine, scene, flyMesh) {
        this._engine = _engine;
        this._canvas = _canvas;
        this.scene = scene;
        console.log(flyMesh)
        this.flyMesh = flyMesh.assetContainer.instantiateModelsToScene();
        console.log("flyMesh.assetExplodeContainer", flyMesh.assetExplodeContainer)
        this.flyMeshExplode = flyMesh.assetExplodeContainer.instantiateModelsToScene();
        console.log("this.flyMeshExplode ", this.flyMeshExplode)
        this.f18HUDController = new F18HUD(this.scene);
        this.f18ExplodeController = new F18Explode(this, this.scene)
        console.log(this.flyMesh)
        this.skeletons = this.flyMesh.skeletons;
        this.f18AnimationController = new F18Animation(this.scene, this)
    }


    public undercarriageChange() {
        this.f18AnimationController.undercarriageChange()
    }



    private beforeRender;

    private addEvent() {
        this.beforeRender = this.scene.onBeforeRenderObservable.add(() => {
            this.render()
        })
    }

    private removeEvent() {
        this.scene.onBeforeRenderObservable.remove(this.beforeRender)
    }

    private isInit = false;

    private position: BABYLON.Vector3;
    private quaternion: BABYLON.Quaternion;

    //复合体透明度
    private compoundVisibility = 0

    public init(position: BABYLON.Vector3, quaternion: BABYLON.Quaternion) {
        if (this.isInit) { return false }
        this.isInit = true;
        this.wheelDirectionCS0 = new Ammo.btVector3(0, -1, 0);
        this.wheelAxleCS = new Ammo.btVector3(-1, 0, 0);
        this.position = position;
        this.quaternion = quaternion;
        this.createVehicle();
        this.addEvent()
        F18LODManager.ins.init(this.flyMesh.rootNodes[0])
        //翅膀复合体
        this.addCompound(
            { x: 6.8, y: 0.3, z: 2 },
            { x: 0, y: 0.6, z: -1.2 },
            BABYLON.Quaternion.RotationAxis(new BABYLON.Vector3(0, 1, 0), 0)
        )

        //尾翼复合体
        this.addCompound(
            { x: 4.2, y: 0.2, z: 2 },
            { x: 0, y: 0.6, z: -4.2 },
            BABYLON.Quaternion.RotationAxis(new BABYLON.Vector3(0, 1, 0), 0)
        )

        //尾翼上复合体
        this.addCompound(
            { x: 2.2, y: 0.8, z: 0.8 },
            { x: 0, y: 1.8, z: -3.6 },
            BABYLON.Quaternion.RotationAxis(new BABYLON.Vector3(0, 1, 0), 0)
        )

        //机身复合体
        this.addCompound(
            { x: 1, y: 0.8, z: 9 },
            { x: 0, y: 0.8, z: 0 },
            BABYLON.Quaternion.RotationAxis(new BABYLON.Vector3(0, 1, 0), 0)
        )
    }

    public render(): void {
        if (!this.chassisMesh) {
            return
        }

        //   console.log(this.compoundMesh.position,this.compoundMesh.physicsImpostor.physicsBody.getWorldTransform().getOrigin().y())

        let globalAngularSpeeds = this.vehicleBody.getAngularVelocity()
        let YawPitchRollIn = new v3(0, 0, 0)

        // console.log(this.vehicleBody)

        let fpsDt: any = this.scene.getAnimationRatio()

        if (this.vehicleReady) {

            this.flyData.flySpeed = this.vehicle.getCurrentSpeedKmHour();

            const _scale = new BABYLON.Vector3();
            const _rotation = new BABYLON.Quaternion();
            const _position = new BABYLON.Vector3();

            this.chassisMesh.getWorldMatrix().decompose(_scale, _rotation, _position);

            //飞机hud更新参数
            let flyRotation = _rotation.toEulerAngles()
            this.f18HUDController.setPitch(flyRotation.x / (Math.PI * 2))
            this.f18HUDController.setRoll(-flyRotation.z - Math.PI)
            this.f18HUDController.setYaw(flyRotation.y / (Math.PI * 2))

            if (this.flyData.flySpeed > 40) {
                YawPitchRollIn.x = -2 * this.flyGamePadData.pitchNumber
                this.vehicleBody.applyForce(new Ammo.btVector3(
                    -this.chassisMesh.up.x * 18 * this.flyGamePadData.pitchNumber * this.flyData.accelerateSize * fpsDt,
                    -this.chassisMesh.up.y * 18 * this.flyGamePadData.pitchNumber * this.flyData.accelerateSize * fpsDt,
                    -this.chassisMesh.up.z * 18 * this.flyGamePadData.pitchNumber * this.flyData.accelerateSize * fpsDt
                ), new Ammo.btVector3(0, 0, 0));
            }


            if (this.flyData.flySpeed > 10) {
                YawPitchRollIn.y = 0.8 * this.flyGamePadData.yawNumber
                this.vehicleBody.applyForce(new Ammo.btVector3(
                    -this.chassisMesh.right.x * 18 * this.flyGamePadData.yawNumber * this.flyData.accelerateSize * fpsDt,
                    -this.chassisMesh.right.y * 18 * this.flyGamePadData.yawNumber * this.flyData.accelerateSize * fpsDt,
                    -this.chassisMesh.right.z * 18 * this.flyGamePadData.yawNumber * this.flyData.accelerateSize * fpsDt
                ), new Ammo.btVector3(0, 0, 0));
            }

            if (this.flyData.flySpeed > 10) {
                this.vehicleBody.applyForce(new Ammo.btVector3(
                    this.chassisMesh.right.x * 18 * this.flyGamePadData.yawNumber * this.flyData.accelerateSize * fpsDt,
                    this.chassisMesh.right.y * 18 * this.flyGamePadData.yawNumber * this.flyData.accelerateSize * fpsDt,
                    this.chassisMesh.right.z * 18 * this.flyGamePadData.yawNumber * this.flyData.accelerateSize * fpsDt
                ), new Ammo.btVector3(0, 0, 0));
                YawPitchRollIn.y = -0.8 * this.flyGamePadData.yawNumber
            }

            this.vehicleSteering = BABYLON.Scalar.Lerp(this.vehicleSteering, this.steeringClamp * this.flyGamePadData.yawNumber, 0.1)


            this.flyData.accelerateSize = this.flyGamePadData.accelerateNumber



            this.f18SoundController.render(this)

            if (this.flyGamePadData.brakeNumber == 1) {

                this.vehicle.setBrake(10 / 2 * fpsDt, this.FRONT_LEFT);
                this.vehicle.setBrake(10 / 2 * fpsDt, this.FRONT_RIGHT);
                this.vehicle.setBrake(10 * fpsDt, this.BACK_LEFT);
                this.vehicle.setBrake(10 * fpsDt, this.BACK_RIGHT);
            } else {
                this.vehicle.setBrake(0 / 2 * fpsDt, this.FRONT_LEFT);
                this.vehicle.setBrake(0 / 2 * fpsDt, this.FRONT_RIGHT);
                this.vehicle.setBrake(0, this.BACK_LEFT);
                this.vehicle.setBrake(0, this.BACK_RIGHT);
            }



            if (this.flyData.flySpeed > 40) {
                YawPitchRollIn.z = 4 * this.flyGamePadData.rollNumber
            }


            let lerp1 = (0.1 * fpsDt) >= 0.99 ? 0.99 : (0.1 * fpsDt)

            //第一人称相机视角缓动动画
            this.YawPitchRollInBeigin = BABYLON.Vector3.Lerp(this.YawPitchRollInBeigin, new BABYLON.Vector3(
                YawPitchRollIn.x,
                YawPitchRollIn.y,
                YawPitchRollIn.z
            ), lerp1);



            //设置转向值
            this.vehicle.setSteeringValue(this.vehicleSteering, this.FRONT_LEFT);
            this.vehicle.setSteeringValue(this.vehicleSteering, this.FRONT_RIGHT);

            //设置起落架
            // get_m_chassisConnectionPointCS(): btVector3;
            // set_m_chassisConnectionPointCS(m_chassisConnectionPointCS: btVector3): void;
            if (this.undercarriageState) {
                this.vehicle.getWheelInfo(0).set_m_wheelsRadius(this.wheelRadiusFront)
                this.vehicle.getWheelInfo(1).set_m_wheelsRadius(this.wheelRadiusFront)
                this.vehicle.getWheelInfo(2).set_m_wheelsRadius(this.wheelRadiusBack)
                this.vehicle.getWheelInfo(3).set_m_wheelsRadius(this.wheelRadiusBack)
            } else {
                this.vehicle.getWheelInfo(0).set_m_wheelsRadius(0.001)
                this.vehicle.getWheelInfo(1).set_m_wheelsRadius(0.001)
                this.vehicle.getWheelInfo(2).set_m_wheelsRadius(0.001)
                this.vehicle.getWheelInfo(3).set_m_wheelsRadius(0.001)
            }

            //轮胎位置和旋转信息
            let tm, p, q, i;
            let n = this.vehicle.getNumWheels();
            for (i = 0; i < n; i++) {
                this.vehicle.updateWheelTransform(i, true);
                tm = this.vehicle.getWheelTransformWS(i);
                p = tm.getOrigin();
                q = tm.getRotation();
                this.wheelMeshes[i].position.set(p.x(), p.y(), p.z());


                this.wheelMeshes[i].rotationQuaternion.set(q.x(), q.y(), q.z(), q.w());
                this.wheelMeshes[i].rotate(BABYLON.Axis.Z, Math.PI / 2);
            }

            //车体的位置和旋转
            tm = this.vehicle.getChassisWorldTransform();
            p = tm.getOrigin();
            q = tm.getRotation();
            this.chassisMesh.position.set(p.x(), p.y(), p.z());
            this.chassisMesh.rotationQuaternion.set(q.x(), q.y(), q.z(), q.w());
            this.chassisMesh.rotate(BABYLON.Axis.X, Math.PI);

            //动画render
            this.f18AnimationController.render()

        }
        //  console.log(chassisMesh.forward)
        let _speed2 = 18 * this.flyData.accelerateSize;

        YawPitchRollIn = (new v3(YawPitchRollIn.x * this.stats.angularAcceleration.x, YawPitchRollIn.y * this.stats.angularAcceleration.y, YawPitchRollIn.z * this.stats.angularAcceleration.z))
        let matr = new BABYLON.Matrix();
        this.chassisMesh.rotationQuaternion.toRotationMatrix(matr)
        YawPitchRollIn = BABYLON.Vector3.TransformCoordinates(YawPitchRollIn, matr);


        let lerp2 = (0.05 * fpsDt) >= 0.99 ? 0.99 : (0.05 * fpsDt)
        let newYPR = v3.Lerp(new v3(globalAngularSpeeds.x(), globalAngularSpeeds.y(), globalAngularSpeeds.z()), YawPitchRollIn, lerp2)
        newYPR.multiplyInPlace(this.stats.angularDeceleration)
        this.vehicleBody.setAngularVelocity(new Ammo.btVector3(newYPR.x, newYPR.y, newYPR.z))

        //不同速度下的升力
        if (this.flyData.flySpeed > 300) {
            this.flyData.flyLift = 2000
        } else if (this.flyData.flySpeed < 300 && this.flyData.flySpeed > 150) {
            this.flyData.flyLift = 500
        } else {
            this.flyData.flyLift = this.flyData.flySpeed;
        }

        //执行升力
        this.vehicleBody.applyForce(new Ammo.btVector3(0, this.flyData.flyLift * fpsDt, 0), new Ammo.btVector3(0, 0, 0));

        //不同速度下的阻力
        if (this.flyData.flySpeed > 300) {
            this.flyData.resistance = 0.7
        } else if (this.flyData.flySpeed < 300 && this.flyData.flySpeed > 150) {
            this.flyData.resistance = 0.5
        } else {
            this.flyData.resistance = 0.2
        }

        this.vehicleBody.setDamping(this.flyData.resistance, 0);         //  vehicleBody.po

        //喷气式发动机推力
        this.vehicleBody.applyForce(new Ammo.btVector3(
            -this.chassisMesh.forward.x * _speed2 * fpsDt,
            -this.chassisMesh.forward.y * _speed2 * fpsDt,
            -this.chassisMesh.forward.z * _speed2 * fpsDt
        ), new Ammo.btVector3(0, 0, 0));

        //是否显示HUD
        this.f18HUDController.setShow(this.showHud)
        this.f18HUDController.updateFlyData()
    }

    public showHud = false;

    private compound: Ammo.btCompoundShape

    /**
     * 创建载具
     */
    private createVehicle() {
        //Going Native 创建物理世界
        let physicsWorld = this.scene.getPhysicsEngine().getPhysicsPlugin().world;

        //车体盒子
        //this.geometry = new Ammo.btCompoundShape();
        let geometry = new Ammo.btBoxShape(new Ammo.btVector3(this.chassisWidth * .5, this.chassisHeight * .5, this.chassisLength * .5));
        let transform = new Ammo.btTransform();
        transform.setIdentity();
        transform.setOrigin(new Ammo.btVector3(this.position.x, this.position.y, this.position.z));
        transform.setRotation(new Ammo.btQuaternion(this.quaternion.x, this.quaternion.y, this.quaternion.z, this.quaternion.w));

        let motionState = new Ammo.btDefaultMotionState(transform);
        //局部惯性
        let localInertia = new Ammo.btVector3(0, 0, 0);
        //计算局部惯性
        geometry.calculateLocalInertia(this.massVehicle, localInertia);


        this.chassisMesh = this.createChassisMesh(this.chassisWidth, this.chassisHeight, this.chassisLength);
        this.f18HUDController.tergetVehicle(this)

        //质量偏移
        let massOffset = new Ammo.btVector3(0, 0.4, 0);

        let transform2 = new Ammo.btTransform();
        transform2.setIdentity();
        transform2.setOrigin(massOffset);
        //车体复合形状组合
        this.compound = new Ammo.btCompoundShape();
        this.compound.addChildShape(transform2, geometry);

        //载具身体
        this.vehicleBody = new Ammo.btRigidBody(new Ammo.btRigidBodyConstructionInfo(this.massVehicle, motionState, this.compound, localInertia));
        this.vehicleBody.setActivationState(4);
        physicsWorld.addRigidBody(this.vehicleBody);

        //发动机
        let tuning = new Ammo.btVehicleTuning();
        let rayCaster = new Ammo.btDefaultVehicleRaycaster(physicsWorld);
        this.vehicle = new Ammo.btRaycastVehicle(tuning, this.vehicleBody, rayCaster);
        this.vehicle.setCoordinateSystem(0, 1, 2);
        physicsWorld.addAction(this.vehicle);

        let addWheel = (isFront, pos, radius, width, index) => {

            let wheelInfo = this.vehicle.addWheel(
                pos,
                this.wheelDirectionCS0,
                this.wheelAxleCS,
                this.suspensionRestLength,
                radius,
                tuning,
                isFront);

            wheelInfo.set_m_suspensionStiffness(this.suspensionStiffness);
            wheelInfo.set_m_wheelsDampingRelaxation(this.suspensionDamping);
            wheelInfo.set_m_wheelsDampingCompression(this.suspensionCompression);
            wheelInfo.set_m_maxSuspensionForce(600000);
            wheelInfo.set_m_frictionSlip(10);
            wheelInfo.set_m_rollInfluence(this.rollInfluence);

            this.wheelMeshes[index] = this.createWheelMesh(radius, width);
        }

        addWheel(true, new Ammo.btVector3(this.wheelHalfTrackFront, this.wheelAxisHeightFront, this.wheelAxisFrontPosition), this.wheelRadiusFront, this.wheelWidthFront, this.FRONT_LEFT);
        addWheel(true, new Ammo.btVector3(-this.wheelHalfTrackFront, this.wheelAxisHeightFront, this.wheelAxisFrontPosition), this.wheelRadiusFront, this.wheelWidthFront, this.FRONT_RIGHT);
        addWheel(false, new Ammo.btVector3(-this.wheelHalfTrackBack, this.wheelAxisHeightBack, this.wheelAxisPositionBack), this.wheelRadiusBack, this.wheelWidthBack, this.BACK_LEFT);
        addWheel(false, new Ammo.btVector3(this.wheelHalfTrackBack, this.wheelAxisHeightBack, this.wheelAxisPositionBack), this.wheelRadiusBack, this.wheelWidthBack, this.BACK_RIGHT);

        this.vehicleReady = true;

    }

    private compoundMeshs: Array<BABYLON.Mesh> = []
    private geometrys: Array<Ammo.btBoxShape> = []
    /**
     * 添加复合体
     * @param size 
     * @param position 
     * @param quaternion 
     */
    private addCompound(size, position, quaternion) {
        let compoundIndex = this.compoundMeshs.length;
        this.compoundMeshs[compoundIndex] = BABYLON.MeshBuilder.CreateBox("box", { width: size.x, depth: size.z, height: size.y }, this.scene)
        this.compoundMeshs[compoundIndex].position = new BABYLON.Vector3(-position.x, -position.y, -position.z)
        this.compoundMeshs[compoundIndex].rotationQuaternion = new BABYLON.Quaternion(quaternion.x, quaternion.y, quaternion.z, quaternion.w)
        this.compoundMeshs[compoundIndex].parent = this.chassisMesh
        this.compoundMeshs[compoundIndex].visibility = this.compoundVisibility
        this.geometrys[compoundIndex] = new Ammo.btBoxShape(new Ammo.btVector3(size.x * .5, size.y * .5, size.z * .5));
        let transform = new Ammo.btTransform();
        transform.setIdentity();
        transform.setOrigin(new Ammo.btVector3(position.x, position.y, position.z));
        transform.setRotation(new Ammo.btQuaternion(quaternion.x, quaternion.y, quaternion.z, quaternion.w));
        this.compound.addChildShape(transform, this.geometrys[compoundIndex])
    }


    //飞机尾流
    public newTrail: BABYLON.TrailMesh
    public newTrail2: BABYLON.TrailMesh


    //音频控制器
    public f18SoundController: F18SoundController

    /**
     * 创建载具主题
     * @param w 宽度
     * @param l 深度
     * @param h 高度
     * @returns 
     */
    private createChassisMesh(w, l, h) {

        let mesh = BABYLON.MeshBuilder.CreateBox("box", { width: w, depth: h, height: l }, this.scene);
        mesh.rotationQuaternion = new BABYLON.Quaternion();
        mesh.visibility = this.compoundVisibility;
        this.flyMesh.rootNodes[0].parent = mesh;
        //   this.flyMeshExplode.rootNodes[0].parent = mesh;
        this.flyMeshExplode.rootNodes[0].setEnabled(false)
        this.flyMesh.rootNodes[0].position.y = 0.6
        this.flyMesh.rootNodes[0].rotation = new BABYLON.Vector3(Math.PI * 1, 0, 0)
        this.flyMesh.rootNodes[0].scaling = new BABYLON.Vector3(5, 5, 5)


        //创建气流位置
        let newPos = BABYLON.MeshBuilder.CreateBox("meshCamera", { width: 0, depth: 0, height: 0 }, this.scene);
        newPos.position = new BABYLON.Vector3(3.5, -0.6, 2);
        newPos.parent = mesh
        newPos.visibility = 0;

        let newPos2 = BABYLON.MeshBuilder.CreateBox("meshCamera", { width: 0, depth: 0, height: 0 }, this.scene);
        newPos2.position = new BABYLON.Vector3(-3.5, -0.6, 2);
        newPos2.parent = mesh
        newPos2.visibility = 0;


        let newTrailMaterial = new BABYLON.StandardMaterial("RedMaterial", this.scene);
        newTrailMaterial.diffuseColor = new BABYLON.Color3(1, 1, 1);
        newTrailMaterial.emissiveColor = new BABYLON.Color3(1, 1, 1);
        newTrailMaterial.alpha = 0.1;
        newTrailMaterial.backFaceCulling = false;

        this.newTrail = new BABYLON.TrailMesh("name", newPos, this.scene, 0, 500, true);
        this.newTrail.material = newTrailMaterial;


        this.newTrail2 = new BABYLON.TrailMesh("name", newPos2, this.scene, 0, 500, true);
        this.newTrail2.material = newTrailMaterial;

        this.f18SoundController = new F18SoundController(mesh, this.scene)
        return mesh;
    }


    /**
     * 创建轮子
     * @param radius 半径
     * @param width 轮宽
     * @returns 
     */
    private createWheelMesh(radius, width) {
        let mesh = BABYLON.MeshBuilder.CreateCylinder("Wheel", { diameter: radius * 2, height: 0.5, tessellation: 6 }, this.scene);
        mesh.rotationQuaternion = new BABYLON.Quaternion();
        mesh.visibility = this.compoundVisibility;
        return mesh;
    }

    /**
     * 销毁载具
     */
    public dispose() {
        this.removeEvent()
        this.f18HUDController.dispose()
        this.f18SoundController.dispose()
        this.f18AnimationController.dispose()
        this.chassisMesh.dispose(false, false)
        this.chassisMesh = null;
        this.newTrail.dispose(false, true)
        this.newTrail2.dispose(false, true)
        this.chassisMesh = null
        for (let i = 0; i < this.wheelMeshes.length; i++) {
            if (this.wheelMeshes[i] && !this.wheelMeshes[i].isDisposed()) {
                this.wheelMeshes[i].dispose(false, true);
                this.wheelMeshes[i] = null;
            }
        }
        this.wheelMeshes = []

        for (let i = 0; i < this.compoundMeshs.length; i++) {
            if (this.compoundMeshs[i] && !this.compoundMeshs[i].isDisposed()) {
                this.compoundMeshs[i].dispose(false, true);
                this.compoundMeshs[i] = null;
            }
        }

        this.compoundMeshs = []
        this.geometrys = []

        let physicsWorld = this.scene.getPhysicsEngine().getPhysicsPlugin().world;
        console.log("Ammo", Ammo, physicsWorld)

        physicsWorld.removeRigidBody(this.vehicleBody);
        this.vehicleBody = null;
        this.vehicle = null
    }

    /**
     * 爆炸载具
     */
    public explode() {
        this.f18ExplodeController.start()
        this.dispose()
    }

}