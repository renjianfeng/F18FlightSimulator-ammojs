import { F18GamepadController } from './vehicleObject/f18/f18GamePadController';
import * as BABYLON from '@babylonjs/core'
// import * as BABYLON from 'babylonjs';
import * as GUI from 'babylonjs-gui';
// import { AmmoJSPlugin } from '@babylonjs/core';
import { AmmoJSPlugin } from '@babylonjs/core';

import { F18Assets } from './vehicleObject/f18/f18Assets';
import { F18Physics } from './vehicleObject/f18/f18Physics';
import { AirportScene } from './physicsScene/airportScene';
import { F18CameraController } from './vehicleObject/f18/f18CameraController';
import { F18InputController } from './vehicleObject/f18/f18InputController';


export class Game {

    private _canvas: HTMLCanvasElement;
    private _engine: any;
    private scene: BABYLON.Scene

    constructor(canvasElement: string) {
        this._canvas = <HTMLCanvasElement>document.getElementById(canvasElement);
        this._engine = new BABYLON.Engine(this._canvas, true);
    }

    private flyList = []

    private flyMesh;

    private shadow;

    private airportScene: AirportScene;

    /**
     * Creates the BABYLONJS Scene
     */
    async createScene() {
        // Setup basic scene
        this.scene = new BABYLON.Scene(this._engine);

        this.scene.enablePhysics(new BABYLON.Vector3(0, -10, 0), new AmmoJSPlugin(true, Ammo));

        let camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 5, -10), this.scene);
        camera.setTarget(BABYLON.Vector3.Zero());
        camera.attachControl(this._canvas, true);

        let dir = new BABYLON.Vector3(0.3, -1, 0.3);
        let light = new BABYLON.DirectionalLight("DirectionalLight", dir, this.scene);

        this._engine.displayLoadingUI();
        //加载f18模型
        let f18FighterAssets = new F18Assets(this._engine, this.scene)
        await f18FighterAssets.init()
        this.flyMesh = f18FighterAssets;;

        //创建机场
        this.airportScene = new AirportScene(this.scene, this._engine)
        await this.airportScene.init()
        //
        console.log("this.airportScene.flyPositions", this.airportScene.flyPositions, this.airportScene.flyPositions[0].absoluteRotationQuaternion)
        //创建1号物理效果飞机
        this.flyList[0] = new F18Physics(this._canvas, this._engine, this.scene, this.flyMesh)
        this.flyList[0].init(
            this.airportScene.flyPositions[0].absolutePosition.clone(),
            this.airportScene.flyPositions[0].absoluteRotationQuaternion.clone(),
            // BABYLON.Quaternion.RotationAxis(new BABYLON.Vector3(0, 1, 0),  this.airportScene.flyPositions[0].absoluteRotationQuaternion.z)
        )

        //创建2号物理效果飞机
        this.flyList[1] = new F18Physics(this._canvas, this._engine, this.scene, this.flyMesh)
        this.flyList[1].init(
            this.airportScene.flyPositions[1].absolutePosition.clone(),
            this.airportScene.flyPositions[1].absoluteRotationQuaternion.clone(),
        )
        //相机控制器
        F18CameraController.ins.init(this._canvas, this.scene, this._engine)
        //输入控制器
        F18InputController.ins.init(this.scene)
        //手柄控制器
        F18GamepadController.ins.init(this.scene)
        //视图目标1号飞机
        F18CameraController.ins.tergetVehicle(this.flyList[0])

        //控制目标1号飞机
        F18InputController.ins.tergetVehicle(this.flyList[0])



        this.shadow = new BABYLON.CascadedShadowGenerator(1024, light);
        light.intensity = 2.5;

        // shadow.lambda = 0.2;
        // shadow.penumbraDarkness = 0.3;

        for (let mesh of this.scene.meshes) {
            if (mesh.name != "skySphere") {
                this.shadow.getShadowMap().renderList.push(mesh);
                mesh.receiveShadows = true;
                mesh.isPickable = false;
            }
        }

        this.shadow.shadowMaxZ = 256;
        this.shadow.forceBackFacesOnly = true
        this.shadow.splitFrustum();

        this.renderDom()

        this._engine.hideLoadingUI();

        this._engine.runRenderLoop(() => {
            this.scene.render();
            document.getElementById("showFps").innerHTML = `fps:${this._engine.getFps().toFixed()}`
        });

        window.addEventListener("resize", () => { this._engine.resize(); });
    }


    /**
     * 渲染dom
     */
    private renderDom() {
        let dom = document.getElementById("flyList");
        dom.innerHTML = ""

        let button = document.createElement("button")
        button.textContent = `添加战斗机(Add F18 fighter to the Scene)`;
        button.onclick = () => { this.addFly() }
        dom.appendChild(button)

        let button2 = document.createElement("button")
        button2.textContent = `删除场景(Delete Scene)`;
        button2.onclick = () => { this.disposeAirport() }
        dom.appendChild(button2)

        let button3 = document.createElement("button")
        button3.textContent = `重置场景(Reset Scene)`;
        button3.onclick = () => { this.resetScene() }
        dom.appendChild(button3)

        let button4 = document.createElement("button")
        button4.textContent = `暂停/恢复(Start/Pause)`;
        button4.onclick = () => { this.startOrPauses() }
        dom.appendChild(button4)

        for (let i = 0; i < this.flyList.length; i++) {
            let list = document.createElement("div")
            list.className = i + ""
            list.textContent = `[item]:F18-${i}`;
            dom.appendChild(list)

            let b1 = document.createElement("button")
            b1.textContent = `驾驶(Pilot)`;
            b1.onclick = () => { this.seleteFly(list.className) }
            list.appendChild(b1)

            let b2 = document.createElement("button")
            b2.textContent = `销毁(Dispose)`;
            b2.onclick = () => { this.disposeFly(list.className) }
            list.appendChild(b2)

            let b3 = document.createElement("button")
            b3.textContent = `爆炸(Explode)`;
            b3.onclick = () => { this.explodeFly(list.className) }
            list.appendChild(b3)
        }


    }

    /**
     * 开始、暂时物理效果
     */
    private startOrPauses() {
        this.scene.physicsEnabled = !this.scene.physicsEnabled
    }

    private async resetScene() {
        this.airportScene.dispose()
        await this.airportScene.init()
    }

    /**
     * 删除场景
     */
    private disposeAirport() {
        this.airportScene.dispose()
    }

    private removeAll() {
        for (let fly of this.flyList) {
            fly.dispose()
        }
        this.flyList = []
        this.renderDom()
        this.airportScene.dispose()
        F18CameraController.ins.dispose()
        F18InputController.ins.dispose()
    }

    /**
     * 驾驶场景中其中一个飞机
     * @param index 
     * @returns 
     */
    private seleteFly(index) {
        console.log(index)
        if (!this.flyList[index]) {
            return
        }
        F18CameraController.ins.tergetVehicle(this.flyList[index])
        F18InputController.ins.tergetVehicle(this.flyList[index])
        this.renderDom()
    }

    /**
     * 销毁飞机
     * @param index 
     */
    private disposeFly(index) {
        this.flyList[index].dispose()
        this.flyList[index]=null;
        this.flyList.splice(index, 1)
        this.renderDom()
    }

    /**
     * 爆炸销毁飞机
     * @param index 
     */
    private explodeFly(index) {
        this.flyList[index].explode()
        this.flyList[index]=null;
        this.flyList.splice(index, 1)
        this.renderDom()
    }

    /**
     * 添加飞机
     */
    private addFly() {
        //创建2号物理效果飞机
        let _index = this.flyList.length
        this.flyList[_index] = new F18Physics(this._canvas, this._engine, this.scene, this.flyMesh)
        this.flyList[_index].init(
            this.airportScene.flyPositions[_index].absolutePosition.clone(),
            this.airportScene.flyPositions[_index].absoluteRotationQuaternion.clone(),
        )

        //  this.flyList[this.flyList.length-1].init(
        //     new BABYLON.Vector3(20*(this.flyList.length-1), 4, 0), 
        //     BABYLON.Quaternion.RotationAxis(new BABYLON.Vector3(0, 1, 0), 0)
        // )

        this.shadow.getShadowMap().renderList = []
        for (let mesh of this.scene.meshes) {
            if (mesh.name != "skySphere") {
                this.shadow.getShadowMap().renderList.push(mesh);
                mesh.receiveShadows = true;
            }
        }

        this.renderDom()
    }


}