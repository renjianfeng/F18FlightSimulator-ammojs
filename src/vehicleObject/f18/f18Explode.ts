/*
 * @Date: 2022-03-25 10:11:42
 * @LastEditTime: 2022-04-02 14:27:14
 * @LastEditors: renjianfeng
 */
import { F18Physics } from "./f18Physics";
import * as BABYLON from '@babylonjs/core'
import { url } from "../../base/config";

/**
 * 爆炸载具
 */
export class F18Explode {

    private vehicle: F18Physics
    private scene: BABYLON.Scene;
    private physicsHelper: BABYLON.PhysicsHelper;
    constructor(vehicle: F18Physics, scene: BABYLON.Scene) {
        this.vehicle = vehicle;
        this.scene = scene;
        this.physicsHelper = new BABYLON.PhysicsHelper(this.scene);
        this.init()
    }

    private boomSprite: BABYLON.SpriteManager
    private boom: BABYLON.Sprite


    public init() {
        this.boomSprite = new BABYLON.SpriteManager("treesManager", url + "assets/texture/boom3.png", 160, { width: 200, height: 200 }, this.scene);
        this.boom = new BABYLON.Sprite("player", this.boomSprite);
        this.boom.isPickable = false;
        this.boom.size = 0;

        let node = this.vehicle.flyMeshExplode.rootNodes[0];

        console.log(this.vehicle.flyMeshExplode, node)

        // for (let mesh of node._children) {
        //     console.log(mesh.name)
        //     this.createBox(mesh, new BABYLON.Vector3(1, 0.3, 1), node.absolutePosition, new BABYLON.Vector3(0, 0, 0), 1);
        // }
        console.log("node.getChildMeshes(false)",node.getChildMeshes(false))

        for(let mesh of node.getChildMeshes(false)){
           // console.log(mesh.name)
            this.createBox(mesh, new BABYLON.Vector3(1, 0.3, 1), node.absolutePosition, new BABYLON.Vector3(0, 0, 0), 1);
        }

        // node.getChildren((mesh) => {
        //    // if (mesh.name.indexOf("primitive") == -1) {
        //        console.log(mesh.name)
        //         this.createBox(mesh, new BABYLON.Vector3(1, 0.3, 1), node.absolutePosition, new BABYLON.Vector3(0, 0, 0), 1);
        //    // }
        // },false)

    }

    private boxList: Array<BABYLON.Mesh> = []

    private particles = []

    private clones: Array<BABYLON.Mesh> = []

    /**
     * 根据box创建每一个爆炸的颗粒
     * @param mesh 
     * @param size 
     * @param position 
     * @param rotation 
     * @param mass 
     * @returns 
     */
    private createBox(mesh: BABYLON.Mesh, size, position, rotation, mass) {
        let index = this.boxList.length;
        //  this.clones[index]=mesh.clone(mesh.name+"_clone",null,true)
        this.clones[index] = mesh
        //如果获取不到包围盒则废弃
        mesh.position = new BABYLON.Vector3(0, 0, 0)
       // console.log(this.clones[index].name)
        if (!this.clones[index].getBoundingInfo) {
            // this.clones[index].dispose(false, false)
            size = { x: 0.5, y: 0.2, z: 0.4 };
        } else {
            size = this.clones[index].getBoundingInfo().boundingBox.extendSize;

        }
      //  console.log(this.clones[index].name)

        this.boxList[index] = BABYLON.MeshBuilder.CreateBox("box", { width: size.x, depth: size.z, height: size.y }, this.scene);
        this.boxList[index].position.set(position.x, position.y, position.z);
        this.boxList[index].rotation.set(rotation.x, rotation.y, rotation.z);
        this.boxList[index].scaling = new BABYLON.Vector3(5, 5, 5)
        this.boxList[index].visibility = 0;
        this.boxList[index].parent=this.vehicle.chassisMesh
        this.clones[index].setEnabled(false)
        this.clones[index].parent = this.boxList[index];
        if (!mass) {
            mass = 0;
        } else {
            this.boxList[index].position.y += 5;
        }
        this.boxList[index].physicsImpostor = new BABYLON.PhysicsImpostor(this.boxList[index], BABYLON.PhysicsImpostor.BoxImpostor, { mass: mass, friction: 0.5, restitution: 0.7 }, this.scene);
        this.boxList[index].physicsImpostor.sleep()
        console.log("activated", this.boxList[index].physicsImpostor.physicsBody)

        // this.boxList[index].physicsImpostor.physicsBody.setActivationState(4)
        // this.boxList[index].physicsImpostor.physicsBody.setActivationState()
        // Smoke
        BABYLON.ParticleHelper.CreateAsync("smoke", this.scene).then((set) => {
            this.particles[index] = set
            this.particles[index].emitterNode = this.boxList[index];
           // console.log("set.systems[0]",set.systems[0])
            // set.systems[0].color1=new BABYLON.Color4(188/255,87/277,3/255,1)
            // set.systems[0].color2=new BABYLON.Color4(188/255,87/277,3/255,1)
            set.systems[0].emitRate=10
            set.systems[0].maxLifeTime = 1.5;
            set.systems[0].minLifeTime = 0.4;
        });
    }

    /**
     * 苏醒物理刚体效果，并进行爆炸
     * @param index 
     */
    physicsStart(index) {
        this.boxList[index].parent = null
        this.boxList[index].position = this.vehicle.chassisMesh.absolutePosition
        this.clones[index].setEnabled(true)
        this.boxList[index].physicsImpostor.wakeUp()
        this.boxList[index].physicsImpostor.applyImpulse(new BABYLON.Vector3(Math.random() * 20 - 10, Math.random() * 20, Math.random() * 20 - 10), this.boxList[index].getAbsolutePosition());
    }

    /**
     * 开始粒子尾焰
     * @param index 
     */
    particleStart(index) {
        if (!this.particles[index]) {
            return false;
        }
        this.particles[index].start();
        setTimeout(() => {
            this.particles[index].systems[0].stop()
        }, 5000)
        setTimeout(() => {
            this.particles[index].dispose()
        }, 10000)

        setTimeout(() => {
            this.boxList = []
            this.particles = []
            this.clones = []
        }, 11000)
    }

    public dispose() {
        for (let i = 0; i < this.boxList.length; i++) {
            this.boxList[i].dispose(false, false)
        }
        this.boom.dispose()
        this.boomSprite.dispose()
    }

    public start() {
        this.vehicle.f18SoundController.f18EngineBoom.play()
        this.boom.position = this.vehicle.chassisMesh.absolutePosition.clone();
        this.boom.position.y += 3
        this.boom.size = 15;
        this.boom.playAnimation(0, 36, false, 60, () => {
            this.boom.size = 0;
        });

        for (let i = 0; i < this.boxList.length; i++) {
            this.physicsStart(i)
            this.particleStart(i)
        }

        setTimeout(() => {
            this.dispose()
        }, 5000)
    }

    public render() {

    }
}