import { F18GamepadController } from './f18GamePadController';
/*
 * @Author: renjianfeng
 * @Date: 2022-03-21 15:08:40
 * @LastEditTime: 2022-04-02 14:28:49
 * @LastEditors: renjianfeng
 */
import { F18CameraController } from './f18CameraController';
import { F18Physics } from './f18Physics';
import { url } from '../../base/config';
import * as BABYLON from '@babylonjs/core';

/**
 * 声音控制器
 */
export class F18SoundController {
    public f18EngineSound: BABYLON.Sound;
    public f18EngineBoom: BABYLON.Sound;
    public f18EngineSoundSelect: BABYLON.Sound;
    private scene: BABYLON.Scene
    private mesh: BABYLON.Mesh
    constructor(mesh, scene) {
        this.scene = scene
        this.mesh = mesh;
        this.init()
    }

    public init() {
        this.f18EngineSound = new BABYLON.Sound("f18", url + "assets/sound/f18.mp3", this.scene, () => {
            this.f18EngineSound.play()
            this.f18EngineSound.setVolume(0.5)
            this.f18EngineSound.attachToMesh(this.mesh);
        }, { loop: true, maxDistance: 100 })

        this.f18EngineBoom = new BABYLON.Sound("f18", url + "assets/sound/boom2.mp3", this.scene, () => {
            this.f18EngineBoom.setVolume(1)
            this.f18EngineBoom.attachToMesh(this.mesh);
        }, { loop: false, maxDistance: 150 })

        this.f18EngineSoundSelect = new BABYLON.Sound("f18", url + "assets/sound/f18.mp3", this.scene, () => {
            this.f18EngineSoundSelect.play()
            this.f18EngineSoundSelect.setVolume(0.5)
        }, { loop: true })
    }

    private targetSoundRender(Sound) {
        if (F18CameraController.ins.flyViews[F18CameraController.ins.flyViewIndex] == "tps") {
            Sound.setVolume(0.5)
        } else if (F18CameraController.ins.flyViews[F18CameraController.ins.flyViewIndex] == "target") {
            Sound.setVolume(0.5)
        } else {
            Sound.setVolume(0.1)
        }
    }

    public render(f18PhysicsController: F18Physics) {

        this.targetSoundRender(this.f18EngineSound)
        //手柄震动反馈，仅支持ps4和xbox
        F18GamepadController.ins.vibrationActuator(
            100,
            ( (f18PhysicsController.flyGamePadData.accelerateNumber)) / 2000,
            0
        )

        if (F18CameraController.ins.vehicle.chassisMesh == f18PhysicsController.chassisMesh) {
            this.f18EngineSound.setVolume(0)
            this.targetSoundRender(this.f18EngineSoundSelect)
        } else {
            this.f18EngineSoundSelect.setVolume(0)
        }
        this.f18EngineBoom.setPlaybackRate(1)
        this.f18EngineSoundSelect.setPlaybackRate((2000 + (f18PhysicsController.flyData.accelerateSize)) / 3000)
    }

    public dispose() {
        this.f18EngineSound.stop()
        this.f18EngineSoundSelect.stop()
        setTimeout(() => {
            this.f18EngineBoom.dispose()
            this.f18EngineBoom = null
        }, 1500)
        this.f18EngineSound.dispose()
        this.f18EngineSoundSelect.dispose()
        this.f18EngineSound = null
        this.f18EngineSoundSelect = null
    }

}