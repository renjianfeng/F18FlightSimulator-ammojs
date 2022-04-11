import * as BABYLON from '@babylonjs/core';
import * as GUI from '@babylonjs/gui';
import { url } from '../../base/config';
import { F18Physics } from './f18Physics';

/**
 * HUD
 */
export class F18HUD {

    private scene

    constructor(scene) {
        this.scene = scene
        this.init()
    }
    init() {
        this.creatFppUI_HUD(this.scene)
    }

    //侧滚
    private rollRectGui: BABYLON.Mesh;
    //偏航
    private yawRectGui: BABYLON.Mesh;
    //数值面板
    private numberGui: BABYLON.Mesh;

    public hudGround: BABYLON.Mesh;

    /**
     * @description: 创建飞机第一人称gui
     * @param {*}
     * @return {*}
     */
    private async creatFppUI_HUD(scene) {

        this.hudGround = BABYLON.Mesh.CreateGround("ground1", 0, 0, 2, scene);
        this.hudGround.position = new BABYLON.Vector3(0, -1.30, -7);
        this.hudGround.rotation = new BABYLON.Vector3(Math.PI / 2, 0, 0);
        this.hudGround.scaling = new BABYLON.Vector3(0.3, 1, 0.3);
        this.hudGround.isVisible = false;
        this.hudGround.applyFog = false;

        this.rollRectGui = BABYLON.Mesh.CreateGround("ground1", 8, 4, 2, scene);
        this.yawRectGui = BABYLON.Mesh.CreateGround("ground1", 8, 4, 2, scene);
        this.numberGui = BABYLON.Mesh.CreateGround("numberGui", 10.08, 1.6, 2, scene);
        this.yawRectGui.position = new BABYLON.Vector3(0, 0, 1);
        let forwardIcon = BABYLON.Mesh.CreateGround("ground1", 4, 4, 2, scene);
        this.rollRectGui.parent = this.hudGround;
        this.yawRectGui.parent = this.hudGround;
        this.numberGui.parent = this.hudGround;
        forwardIcon.parent = this.hudGround;

        for (let mesh of this.hudGround.getChildMeshes()) {
            mesh.applyFog = false;
            mesh.renderingGroupId = 2
        }


        this.setHudMaterial(this.rollRectGui, this.creatPitchGuiTool(this.rollRectGui), scene)
        this.setHudMaterial(this.yawRectGui, this.creatYawGuiTool(this.yawRectGui), scene)
        await this.creatSpeedGuiTool(this.numberGui)
        this.setHudMaterial(this.numberGui, this.advancedTextureSpeed, scene)
        this.setHudMaterial(forwardIcon, this.createForward(forwardIcon), scene)
    }


    private setHudMaterial(mesh, advancedTexture, scene) {
        mesh.material = new BABYLON.StandardMaterial("Mat", scene);
        mesh.material.backFaceCulling = false;
        mesh.material.disableLighting = true;
        mesh.material.opacityTexture = advancedTexture;
        mesh.material.specularColor = new BABYLON.Color3(0, 0, 0);
        if (mesh.name == "numberGui") {
            mesh.material.emissiveTexture = advancedTexture;
            mesh.material.emissiveTexture.level = 1
            mesh.material.emissiveColor = new BABYLON.Color3(0, 1, 0);
        } else {
            mesh.material.emissiveColor = new BABYLON.Color3(0, 1, 0);
        }
    }

    public setRoll(val) {
        if (!this.rollRectGui) { return false }
        this.rollRectGui.rotation.y = val

    }

    public setYaw(val) {
        let offset = -0.075
        if (!this.yawRectGui) { return false }
        this.yawRectGui.material["opacityTexture"].uOffset = val + offset

    }

    public setPitch(val) {
        let offset = -0.0076
        if (!this.rollRectGui) { return false }
        this.rollRectGui.material["opacityTexture"].vOffset = val + offset
    }

    private ySet = 3

    private advancedTexturePitch

    /**
     * @description: 创建仰角度数集合gui
     * @param {*} pitchListRectGui
     * @return {*}
     */
    private creatPitchGuiTool(mesh) {

        this.advancedTexturePitch = GUI.AdvancedDynamicTexture.CreateForMesh(
            mesh,
            1024,
            4320 * this.ySet
        );
        this.advancedTexturePitch.isForeground = false;
        this.advancedTexturePitch.wrapV = BABYLON.Texture.FIXED_EQUIRECTANGULAR_MODE;
        this.advancedTexturePitch.vScale = 0.125 / this.ySet;

        let pitchListGui = []
        let pitchScaleLabel = []
        let pitchScaleLabel2 = []
        let pitchNum = 360;


        for (let i = 0; i <= 72; i++) {

            let pitchImgRes: GUI.Image = new GUI.Image("but", url + "assets/gui/image/jiantou2.png");
            pitchImgRes.top = 12
            pitchImgRes.left = 0
            pitchImgRes.width = "264px";
            pitchImgRes.height = "40px";
            //  console.log(i)
            pitchNum -= 5
            if (pitchNum <= 0) {
                pitchNum = 360;
            }
            pitchListGui[i] = new GUI.Rectangle();
            pitchListGui[i].verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
            pitchListGui[i].horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
            pitchListGui[i].top = 60 * i * this.ySet;
            pitchListGui[i].left = "0px"
            pitchListGui[i].width = "490px";
            pitchListGui[i].height = "26px";
            pitchListGui[i].thickness = 0;
            // pitchListRectGui.addControl( pitchListGui[i]);
            this.advancedTexturePitch.addControl(pitchListGui[i]);
            pitchScaleLabel[i] = new GUI.TextBlock();
            pitchScaleLabel2[i] = new GUI.TextBlock();
            if (pitchNum == 0 || pitchNum == 360) {
                pitchImgRes.alpha = 0;
                pitchScaleLabel[i].text = "";
                pitchScaleLabel[i].color = "#ffffff"
                pitchScaleLabel2[i].text = "";
                pitchScaleLabel2[i].color = "#ffffff"

            } else {
                pitchScaleLabel[i].text = "" + pitchNum + "°";
                pitchScaleLabel[i].color = "#00cf00"
                pitchScaleLabel2[i].text = "" + pitchNum + "°";
                pitchScaleLabel2[i].color = "#00cf00"
            }


            pitchScaleLabel[i].textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
            pitchScaleLabel[i].fontSize = "30px"
            pitchScaleLabel[i].left = "-180px"

            pitchScaleLabel2[i].textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
            pitchScaleLabel2[i].fontSize = "30px"
            pitchScaleLabel2[i].left = "180px"

            pitchListGui[i].addControl(pitchScaleLabel[i]);
            pitchListGui[i].addControl(pitchScaleLabel2[i]);
            pitchListGui[i].addControl(pitchImgRes);
        }



        let groundLine: GUI.Rectangle = new GUI.Rectangle();
        groundLine.width = "240px";
        groundLine.height = "4px";
        groundLine.left = "160px"
        groundLine.background = "#00cf00";
        groundLine.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
        groundLine.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        groundLine.top = 4260 * this.ySet;


        let groundLine2: GUI.Rectangle = new GUI.Rectangle();
        groundLine2.width = "240px";
        groundLine2.height = "4px";
        groundLine2.left = "-160px"
        groundLine2.background = "#00cf00";
        groundLine2.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
        groundLine2.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        groundLine2.top = 4260 * this.ySet;

        this.advancedTexturePitch.addControl(groundLine);
        this.advancedTexturePitch.addControl(groundLine2);

        return this.advancedTexturePitch
    }

    private advancedTextureForward

    private createForward(mesh) {
        this.advancedTextureForward = GUI.AdvancedDynamicTexture.CreateForMesh(
            mesh,
            1024,
            1024
        );
        let forwardIcon = new GUI.Image("but", url + "assets/gui/image/jiantou3.png");
        forwardIcon.width = "160px";
        forwardIcon.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        forwardIcon.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        forwardIcon.height = "80px";
        this.advancedTextureForward.addControl(forwardIcon)
        return this.advancedTextureForward;
    }

    private xSet = 2

    private advancedTextureYaw

    /**
     * @description: 创建偏移角度数集合gui
     * @param {*} rollRectGui
     * @return {*}
     */
    private creatYawGuiTool(mesh) {

        this.advancedTextureYaw = GUI.AdvancedDynamicTexture.CreateForMesh(
            mesh,
            5760 * this.xSet,
            1024
        );
        this.advancedTextureYaw.isForeground = false;
        this.advancedTextureYaw.wrapU = BABYLON.Texture.FIXED_EQUIRECTANGULAR_MODE;
        this.advancedTextureYaw.uScale = 1 / 3.625 / this.xSet;

        let yawListGui = []
        let yawScaleLabel = []
        let yawNum = 360;

        for (let i = 0; i <= 72; i++) {

            let yawBg: GUI.Rectangle = new GUI.Rectangle();
            yawBg.width = "6px";
            yawBg.height = "60px";
            yawBg.left = "0px"
            yawBg.top = "30px"
            yawBg.background = "#00cf00";
            yawBg.thickness = 0;
            yawBg.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
            yawBg.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
            yawBg.top = 0;
            //  console.log(i)
            yawNum -= 5
            if (yawNum <= 0) {
                yawNum = 360;
            }
            yawListGui[i] = new GUI.Rectangle();
            yawListGui[i].verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
            yawListGui[i].horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
            yawListGui[i].top = 0
            yawListGui[i].left = i * 80 * this.xSet;
            yawListGui[i].width = "150px";
            yawListGui[i].height = "200px";
            yawListGui[i].thickness = 0;
            this.advancedTextureYaw.addControl(yawListGui[i]);
            yawScaleLabel[i] = new GUI.TextBlock();
            if (yawNum == 0 || yawNum == 360) {
                //yawBg.alpha=0;
                yawScaleLabel[i].text = "0";
                yawScaleLabel[i].color = "#ffffff"

            } else {
                yawScaleLabel[i].text = "" + yawNum + "°";
                yawScaleLabel[i].color = "#00cf00"
            }

            if (yawNum % 10 != 0) {
                yawScaleLabel[i].text = "";
            }

            yawScaleLabel[i].textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
            yawScaleLabel[i].fontSize = "64px"
            yawScaleLabel[i].left = "10px"
            yawScaleLabel[i].top = "60px"
            yawScaleLabel[i].isEnabled = false;
            yawListGui[i].addControl(yawScaleLabel[i]);
            yawListGui[i].addControl(yawBg);
        }

        return this.advancedTextureYaw
    }

    private guiSources = []

    private xmlLoader: GUI.XmlLoader

    private advancedTextureSpeed

    /**
    * @description: 创建偏移角度数集合gui
    * @param {*} rollRectGui
    * @return {*}
    */
    private async creatSpeedGuiTool(mesh) {
        let res = url + "assets/gui/assets/";
        this.guiSources['a1d9c6b6-f9b5-4189-a45a-bcfc2dd28d08'] = res + "a1d9c6b6-f9b5-4189-a45a-bcfc2dd28d08.png"
        this.guiSources['ff60ccea-6e82-43db-b18b-3d4a7c543dc2'] = res + "ff60ccea-6e82-43db-b18b-3d4a7c543dc2.png"
        this.advancedTextureSpeed = GUI.AdvancedDynamicTexture.CreateForMesh(
            mesh,
            1080,
            190
        );
        this.advancedTextureSpeed.isForeground = false;
        return new Promise((success) => {
            this.xmlLoader = new GUI.XmlLoader(this);
            this.xmlLoader.loadLayout(url + "assets/gui/hud_speed.xml", this.advancedTextureSpeed, () => {
                success(this.xmlLoader)
            });
        })
    }


    updateFlyData() {
        if (this.xmlLoader.getNodeById("flySpeed")) {
            this.xmlLoader.getNodeById("flySpeed").text = `${this.vehicle.flyData.flySpeed.toFixed()}`
            this.xmlLoader.getNodeById("throttleSize").text = `${this.vehicle.flyData.accelerateSize}`
            if (this.vehicle.undercarriageState) {
                this.xmlLoader.getNodeById("undercarriageState").text = "起落架:打开"
            } else {
                this.xmlLoader.getNodeById("undercarriageState").text = "起落架:收起"
            }
        }
    }



    /**
     * 显示HUD
     * @param state 是否展示
     */
    public setShow(state) {
        if (state) {
            this.hudGround.scaling = new BABYLON.Vector3(0.3, 1, 0.3);
        } else {
            this.hudGround.scaling = new BABYLON.Vector3(0, 0, 0);
        }
    }

    private vehicle: F18Physics

    public tergetVehicle(vehicle: F18Physics) {
        this.vehicle = vehicle
        this.hudGround.parent = this.vehicle.chassisMesh;
    }

    public dispose() {
        this.rollRectGui.dispose()
        this.yawRectGui.dispose()
        this.hudGround.dispose()
        this.numberGui.dispose()
        this.advancedTexturePitch.dispose()
        this.advancedTextureSpeed.dispose()
        this.advancedTextureForward.dispose()
        this.advancedTextureYaw.dispose()
    }
}