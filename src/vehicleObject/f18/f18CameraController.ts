import * as BABYLON from '@babylonjs/core'
import { F18Physics } from './f18Physics';

/**
 * 相机控制器
 */
export class F18CameraController {

    private static instance: F18CameraController;

    public static get ins(): F18CameraController {
        if (!this.instance) {
            this.instance = new F18CameraController();
        }
        return this.instance;
    }

    //private parentMesh;
    private scene:BABYLON.Scene;
    private canvas;
    private _engine 
;

    public moveX = 0;
    public moveY = 0;

    private _rotate3D;

    public meshCamera: BABYLON.Mesh;
    public fpsFlyCamera: BABYLON.UniversalCamera;
    public tpsFlyCamera: BABYLON.UniversalCamera;
    public lookAtCamera: BABYLON.UniversalCamera;
    public targetCamera:BABYLON.ArcRotateCamera;

    //视角集合
    public flyViews = ["tps", "fps","target"]
    //当前视角的索引
    public flyViewIndex = 0

    constructor() {
       
    }

    public init(canvas: HTMLCanvasElement, scene: BABYLON.Scene,_engine){
        this.scene = scene;
        this.canvas = canvas;
        this._engine = _engine;
        this.create();
        this.addEvent();
    }

    private _pointerlockchange
    private _canvasclick

    private addEvent() {
        document.getElementById("play_button").addEventListener('click', this._canvasclick=(e) => {
            this.canvas.requestPointerLock();
        });
        //this.scene.physicsEnabled= false;
        // 检测鼠标锁定状态变化
        document.addEventListener('pointerlockchange', this._pointerlockchange=() => {
            // this.moveX = 0;
            // this.moveY = 0;
            if (document.pointerLockElement == this.canvas) {
                document.getElementById("input_panel").style.display="none"
              //  this.scene.physicsEnabled= true;
                console.log("锁定")
                document.addEventListener("mousemove", this._rotate3D = (event) => this.rotate3D(event), false);
            } else {
              //  this.scene.physicsEnabled= false;
                document.getElementById("input_panel").style.display="block"
                console.log("取消")
                document.removeEventListener("mousemove", this._rotate3D, false);

            }
        }, false);

        this.beforeRender=this.scene.onBeforeRenderObservable.add(()=>{
            this.render()
        })
    }

    private beforeRender;

    private removeEvent(){
        this.scene.onBeforeRenderObservable.remove(this.beforeRender);
        document.removeEventListener("mousemove", this._rotate3D, false);
        document.removeEventListener("pointerlockchange", this._pointerlockchange, false);
        document.removeEventListener("click", this._canvasclick, false);
    }

    private create(): void {
        // console.log("parentMesh",parentMesh)
        this.fpsFlyCamera = new BABYLON.UniversalCamera("UniversalCamera", new BABYLON.Vector3(0, -1.30, -2.35), this.scene);
        this.fpsFlyCamera.minZ = 0;
        this.fpsFlyCamera.maxZ = 20000;
        this.fpsFlyCamera.fov = 1.2
        this.fpsFlyCamera.rotation = new BABYLON.Vector3(-Math.PI * 1, Math.PI * 0, Math.PI * 2)
        this.fpsFlyCamera.viewport = new BABYLON.Viewport(0, 0, 1, 1);

        this.tpsFlyCamera = new BABYLON.UniversalCamera("UniversalCamera", new BABYLON.Vector3(0, -1.9, 12.3), this.scene);
        this.tpsFlyCamera.minZ = 0;
        this.tpsFlyCamera.maxZ = 20000;
        this.tpsFlyCamera.fov = 1.2;
        this.tpsFlyCamera.viewport = new BABYLON.Viewport(0, 0, 1, 1);

        this.meshCamera = BABYLON.MeshBuilder.CreateBox("meshCamera", { width: 0, depth: 0, height: 0 }, this.scene);
        this.meshCamera.position = new BABYLON.Vector3(0, -3.5, 12.3);
        this.meshCamera.visibility = 0;
        this.meshCamera.rotation = new BABYLON.Vector3(-Math.PI * 1, Math.PI * 0, Math.PI * 2)

        // Creates, angles, distances and targets the camera
        this.targetCamera = new BABYLON.ArcRotateCamera("Camera", 0, 0, 10, new BABYLON.Vector3(0, 0, 0), this.scene);
        this.targetCamera.upperRadiusLimit=30;
        this.targetCamera.lowerRadiusLimit=10
        this.targetCamera.angularSensibilityX=10000
        this.targetCamera.angularSensibilityY=10000

       
       
       
        this.lookAtCamera = new BABYLON.UniversalCamera("UniversalCamera", new BABYLON.Vector3(100, 300, 100), this.scene);
        this.lookAtCamera.minZ = 0;
        this.lookAtCamera.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;
        this.lookAtCamera.maxZ = 100000;
        this.lookAtCamera.fov = 0.4
        this.lookAtCamera.viewport = new BABYLON.Viewport(0, 0.3, 0.2, 0.2);
        let ratio = this.canvas.width / this.canvas.height;
        let zoom = 10;
        let width = zoom * ratio;
        this.lookAtCamera.orthoTop = zoom;
        this.lookAtCamera.orthoLeft = -width;
        this.lookAtCamera.orthoRight = width;
        this.lookAtCamera.orthoBottom = -zoom;

        // var ssr = new BABYLON.ScreenSpaceReflectionPostProcess("ssr", this.scene, 1.0, this.tpsFlyCamera);
        // console.log(ssr)
        // ssr.reflectionSamples = 25; // Low quality.
        // ssr.strength = 0.7; // Set default strength of reflections.
        // ssr.step=1.5
        // ssr.reflectionSpecularFalloffExponent = 2;
    }

    public vehicle;

    public cameraChange(){
        if (this.flyViewIndex < 2) {
            this.flyViewIndex++
        } else {
            this.flyViewIndex = 0
        }
        this.onChange()
    }

    public tergetVehicle(vehicle: F18Physics) {
        //把上一个选中的飞机hud关闭
        this.vehicle?this.vehicle.showHud=false:"";
        this.vehicle = vehicle
        this.fpsFlyCamera.parent = this.vehicle.chassisMesh
        this.meshCamera.parent = this.vehicle.chassisMesh;
        this.targetCamera.setTarget( this.vehicle.chassisMesh);
        this.fpsFlyCamera.rotation = new BABYLON.Vector3(-Math.PI * 1, Math.PI * 0, Math.PI * 2)
        this.moveX = 0;
        this.moveY = 0;
    }

    private movementX = 0
    private movementY = 0

    private rotate3D(event) {

        if(this.flyViews[this.flyViewIndex]!="fps"){
            return
        }

        this.movementX = event.movementX;
        this.movementY = event.movementY;
        console.log("x", event.movementX)

        var _moveX = this.moveX + event.movementX;
        var _moveY = this.moveY + event.movementY;


        let xRotationMax = 1800
        let xRotationMin = -1800

        let yRotationMax = 1000
        let yRotationMin = -1000

        this.moveX = _moveX;
        this.moveY = _moveY;

        if (this.moveX > xRotationMax && event.movementY >= 0) {
            this.moveX = xRotationMax;
        }

        if (this.moveX < xRotationMin && event.movementY <= 0) {
            this.moveX = xRotationMin;
        }

        if (this.moveY > yRotationMax && event.movementX >= 0) {
            this.moveY = yRotationMax;
        }

        if (this.moveY < yRotationMin && event.movementX <= 0) {
            this.moveY = yRotationMin;
        }
    }

    public onChange(){
        this.fpsFlyCamera.rotation = new BABYLON.Vector3(-Math.PI * 1, Math.PI * 0, Math.PI * 2)
        this.moveX = 0;
        this.moveY = 0;
    }

    public render() {
        if (!this.vehicle) {
            return
        }

        let YawPitchRollInBeigin = this.vehicle.YawPitchRollInBeigin;
        let chassisMesh = this.vehicle.chassisMesh;

        if (this.flyViews[this.flyViewIndex] == "tps") {
            this.vehicle.showHud=false;
            this.scene.activeCameras = [this.tpsFlyCamera];
            this.targetCamera.detachControl(this.canvas);
        } else if (this.flyViews[this.flyViewIndex] == "fps") {
            this.vehicle.showHud=true;
            this.scene.activeCameras = [this.fpsFlyCamera];
            this.targetCamera.detachControl(this.canvas);
        } else if (this.flyViews[this.flyViewIndex] == "target") {
            this.vehicle.showHud=false;
            this.scene.activeCameras = [this.targetCamera];
            this.targetCamera.attachControl(this.canvas, true);
        }
        let fpsDt: any = this.scene.getAnimationRatio()

        let lerp1=(0.4*fpsDt)>=0.99?0.99:(0.4*fpsDt)
        let lerp2=(0.2*fpsDt)>=0.99?0.99:(0.2*fpsDt)

        // let i=0;
        // i=BABYLON.Scalar.Lerp(i,10,0.1)

        this.tpsFlyCamera.position = BABYLON.Vector3.Lerp(this.tpsFlyCamera.position, this.meshCamera.absolutePosition, lerp1);

        if (!this.tpsFlyCamera.rotationQuaternion) {
            this.tpsFlyCamera.rotationQuaternion = this.meshCamera.absoluteRotationQuaternion;
        }
        this.tpsFlyCamera.rotationQuaternion = BABYLON.Quaternion.Slerp(this.tpsFlyCamera.rotationQuaternion, this.meshCamera.absoluteRotationQuaternion,lerp2);

        // this.fpsFlyCamera.rotation = BABYLON.Vector3.Lerp(
        //     this.fpsFlyCamera.rotation, new BABYLON.Vector3(
        //         (this.moveY / 1000 - Math.PI * 1) + (YawPitchRollInBeigin.x * 0.02),
        //         -this.moveX / 1000 + Math.PI * 0,
        //         YawPitchRollInBeigin.z * 0.02
        //     ), lerp2);
        this.fpsFlyCamera.rotation = new BABYLON.Vector3(
            (this.moveY / 1000 - Math.PI * 1) + (YawPitchRollInBeigin.x * 0.02),
            -this.moveX / 1000 + Math.PI * 0,
            YawPitchRollInBeigin.z * 0.02+ Math.PI * 2
        )
        
        
        chassisMesh && this.lookAtCamera.setTarget(chassisMesh.position);

        BABYLON.Engine.audioEngine.audioContext.listener.setPosition(
            this.scene.activeCameras[0].globalPosition.x, 
            this.scene.activeCameras[0].globalPosition.y,
            this.scene.activeCameras[0].globalPosition.z);

       
    }

    public dispose(){
        this.vehicle=null;
        this.flyViewIndex=0;
        this.moveX = 0;
        this.moveY = 0;
        this.removeEvent()
        this.meshCamera.dispose(false,true)
        this.fpsFlyCamera.dispose()
        this.tpsFlyCamera.dispose()
        this.lookAtCamera.dispose()
    }

}