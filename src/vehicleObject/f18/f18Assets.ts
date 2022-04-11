
import * as BABYLON from '@babylonjs/core';
import { url } from '../../base/config';

import { GLTFFileLoader, OBJFileLoader } from 'babylonjs-loaders';

BABYLON.SceneLoader.RegisterPlugin(new GLTFFileLoader())
BABYLON.SceneLoader.RegisterPlugin(new OBJFileLoader())
export class F18Assets {
    private engine: BABYLON.Engine;
    private scene: BABYLON.Scene;
    public assetContainer: BABYLON.AssetContainer;
    public assetExplodeContainer: BABYLON.AssetContainer;
    constructor(engine, scene) {
        this.engine = engine;
        this.scene = scene;
    }

    private isInit = false;

    private videoTexture;

    public async init() {
        if (this.isInit) { return false }
        this.isInit = true;
        this.assetContainer = await this.loadFly(this.engine, this.scene);
        this.assetExplodeContainer = await this.loadFlyExplode(this.engine, this.scene);
        this.videoTexture = new BABYLON.VideoTexture("video", url + "assets/video/rain4.mp4", this.scene, true);
        this.videoTexture.uScale = 2;
        this.videoTexture.vScale = 2;
        this.videoTexture.getAlphaFromRGB = true;
        for (let mesh of this.assetContainer.meshes) {
            // console.log(mesh.name)
            //飞机玻璃效果处理

            if (
                mesh.name.indexOf("boli") != -1 ||
                mesh.name.indexOf("0853") != -1
            ) {
                mesh.material["bumpTexture"] = this.videoTexture
                mesh.material["albedoColor"] = new BABYLON.Color3(1, 1, 1)
                mesh.material["albedoTexture"] = null
                mesh.material["opacityTexture"] = this.videoTexture;
                mesh.material["opacityTexture"].level = 1
                mesh.material["subSurface"].isRefractionEnabled = true;
                mesh.material["subSurface"].indexOfRefraction = 1;
                mesh.material["bumpTexture"].level = 0.4

            }

            if (mesh.name.indexOf("火柱") != -1) {
                mesh.material["albedoTexture"].hasAlpha = true
                mesh.material["specularColor"] = new BABYLON.Color3(0, 0, 0);
                mesh.material.alpha = 0.7
                mesh["disableLighting"] = true;
            }
        }
    }

    private loadFly(engine, scene: BABYLON.Scene): any {
        return new Promise((success) => {
            BABYLON.SceneLoader.LoadAssetContainer(url + "assets/mesh/flymesh/", "f18_v13.glb", scene, async (container) => {
                success(container)
            });
        })
    }

    private loadFlyExplode(engine, scene: BABYLON.Scene): any {
        return new Promise((success) => {
            BABYLON.SceneLoader.LoadAssetContainer(url + "assets/mesh/flyExplode/", "f18_explode.glb", scene, async (container) => {
                success(container)
            });
        })
    }


}