import { lightClear, setLightClear } from './f18Global';
import { F18Physics } from "./f18Physics";
import * as BABYLON from '@babylonjs/core'
import { GUI } from 'dat.gui'

export class F18Animation {

    //载具物理对象
    public vehicle: F18Physics;

    //起落架骨骼
    public bones = []

    //起落架轮胎
    public ikMeshes = []

    //物理轮胎
    public ikMeshesClone = []

    //副翼
    private ailerons = []

    //襟翼
    private flaps = []

    //方向舵
    private rudders = []

    //升降舵
    private elevators = []

    //起落架角度集合
    public axises = []

    //和骨骼绑定的前轮轴网格（起落架放下时隐藏）
    private wheelFrontAxisMesh: BABYLON.Mesh

    //用于和前轮悬挂绑定的前轮轴网格（起落架收起时隐藏）
    private wheelFrontAxisMeshClone: BABYLON.Mesh

    //缓存高度
    private wheelFrontAxisMeshPositionY = 0

    private scene: BABYLON.Scene

    //尾焰集合
    private flames = []


    constructor(scene, vehicle: F18Physics) {
        this.scene = scene
        this.vehicle = vehicle;
        this.init()
    }



    public init() {
        //默认停止动画
        this.vehicle.flyMesh.animationGroups.map((item) => {
            item.loopAnimation = false;
            item.start(false, 3, item.to, item.from, false);
        })
        console.log("this.vehicle.skeletons", this.vehicle.skeletons)
        for (let bone of this.vehicle.skeletons[0].bones) {
            if (bone.name.indexOf("k4_qlik") != -1) { this.bones[0] = bone }

            if (bone.name.indexOf("后轮液压左") != -1) { this.bones[3] = bone }

            if (bone.name.indexOf("后轮液压右") != -1) { this.bones[2] = bone }
        }

        for (let bone of this.vehicle.skeletons[1].bones) {
            if (bone.name.indexOf("副翼右") != -1) { this.ailerons[0] = bone }

            if (bone.name.indexOf("副翼左") != -1) { this.ailerons[1] = bone }

            if (bone.name.indexOf("方向舵右") != -1) { this.rudders[0] = bone }

            if (bone.name.indexOf("方向舵左") != -1) { this.rudders[1] = bone }

            if (bone.name.indexOf("升降舵") != -1) { this.elevators[0] = bone }
        }

        this.vehicle.flyMesh.rootNodes[0].getChildMeshes(false, (mesh) => {
            if (mesh.name.indexOf("前轮子_LOD_DO_3") != -1) {
                this.ikMeshes[0] = mesh
            }

            if (mesh.name.indexOf("后轮左_LOD_DO_3") != -1) {
                this.ikMeshes[3] = mesh
            }

            if (mesh.name.indexOf("后轮右_LOD_DO_3") != -1) {
                this.ikMeshes[2] = mesh
            }

            if (mesh.name.indexOf("前轮子子轮_LOD_DO_3") != -1) {
                this.ikMeshesClone[0] = mesh.clone()
                mesh.visibility = 0;
            }

            if (mesh.name.indexOf("后轮右子轮_LOD_DO_3") != -1) {
                this.ikMeshesClone[2] = mesh.clone()
                mesh.visibility = 0;
            }

            if (mesh.name.indexOf("后轮左子轮_LOD_DO_3") != -1) {
                this.ikMeshesClone[3] = mesh.clone()
                mesh.visibility = 0;
            }


            if (mesh.name.indexOf("火柱.001") != -1) {
                this.flames[0] = mesh;
            }

            if (mesh.name.indexOf("火柱.002") != -1) {
                this.flames[1] = mesh;
            }

            if (mesh.name.indexOf("前轴子_LOD_DO_1_clone") != -1) {
                this.wheelFrontAxisMeshClone = mesh
                this.wheelFrontAxisMeshPositionY = mesh.position.y
            }

            if (mesh.name.indexOf("前轴子_LOD_DO_1_old") != -1) {
                this.wheelFrontAxisMesh = mesh
            }


        })

        this.axises[3] = new BABYLON.Vector3(1.1358679619668433, 0.2505825808367135, -0.15801067199257712);


        this.initWheel(0)
        this.initWheel(2)
        this.initWheel(3)
        this.lightFlash()

        // let gui = new GUI()
        // gui.add( this, 'px', -Math.PI/1, Math.PI/1).name('pole target x');
        // gui.add( this, 'py', -Math.PI/1, Math.PI/1).name('pole target y');
        // gui.add( this, 'pz', -Math.PI/1, Math.PI/1).name('pole target z');

    }

    // px=0;
    // py=0;
    // pz=0;

    private initWheel(i) {
        this.undercarriageTime = Date.now()
        this.ikMeshes[i].visibility = 1;
        this.ikMeshesClone[i].visibility = 0;
        this.wheelFrontAxisMesh.visibility = 1;
        this.wheelFrontAxisMeshClone.visibility = 0;
        setTimeout(() => {
            this.ikMeshes[i].visibility = 0;
            this.wheelFrontAxisMesh.visibility = 0;
            this.wheelFrontAxisMeshClone.visibility = 1;
            this.ikMeshesClone[i].visibility = 1;
        }, 1000)
        this.ikMeshesClone[i].parent = null
        this.ikMeshesClone[i].rotation = new BABYLON.Vector3(Math.PI * 1, 0, 0)
        this.ikMeshesClone[i].scaling = new BABYLON.Vector3(5, 5, 5)
    }


    private lightMeshes = []

    /**
     * 信号灯闪烁
     * @returns 
     */
    private lightFlash() {
        //由于材质是共享的，所以不能多次调用。
        if (lightClear) {
            return
        }
        clearInterval(lightClear)
        this.vehicle.flyMesh.rootNodes[0].getChildMeshes(false, (mesh) => {
            if (mesh.name.indexOf("Mesh_0869.001") != -1) {
                this.lightMeshes[0] = mesh
            }

            if (mesh.name.indexOf("Mesh_0860_LOD_DO_5") != -1 && mesh.material && mesh.material.emissiveTexture) {
                console.log(mesh.name)
                this.lightMeshes[1] = mesh
                this.lightMeshes[1].material.emissiveTexture.level = 2
            }
        })

        setLightClear(setInterval(() => {
            this.lightMeshes[0].material.emissiveTexture.level = 40
            setTimeout(() => {
                this.lightMeshes[0].material.emissiveTexture.level = 0
            }, 100)
        }, 1000))
    }


    //起落架冻结时间
    private undercarriageTime

    private flyAn: BABYLON.AnimationGroup

    private undercarriageState = true;

    /**
     * 起落架改变
     * @param  
     */
    public undercarriageChange() {

        if (!this.undercarriageTime) {
            this.undercarriageTime = Date.now()
        }
        //切换冻结时间1500毫秒
        if (Date.now() - this.undercarriageTime > 1500) {
            this.undercarriageTime = Date.now()
        } else {
            return
        }
        this.vehicle.undercarriageState = !this.vehicle.undercarriageState
        this.flyAn = this.vehicle.flyMesh.animationGroups[0];
        if (this.vehicle.undercarriageState) {
            this.flyAn.start(false, 3, this.flyAn.to, this.flyAn.from, false);
        } else {
            this.flyAn.start(false, 3, this.flyAn.from, this.flyAn.to, false);
        }

        // this.ikMeshesClone[0].visibility=0;
        // this.ikMeshesClone[2].visibility=0;
        // this.ikMeshesClone[3].visibility=0;

        if (!this.vehicle.undercarriageState) {
            this.undercarriageState = this.vehicle.undercarriageState
            this.ikMeshes[0].visibility = 1;
            this.ikMeshes[2].visibility = 1;
            this.ikMeshes[3].visibility = 1;
            this.wheelFrontAxisMesh.visibility = 1;
            this.ikMeshesClone[0].visibility = 0;
            this.ikMeshesClone[2].visibility = 0;
            this.ikMeshesClone[3].visibility = 0;
            this.wheelFrontAxisMeshClone.visibility = 0;
        }

        setTimeout(() => {
            if (this.vehicle.undercarriageState) {
                this.undercarriageState = this.vehicle.undercarriageState
                this.ikMeshes[0].visibility = 0;
                this.ikMeshes[2].visibility = 0;
                this.ikMeshes[3].visibility = 0;
                this.wheelFrontAxisMesh.visibility = 0;
                this.ikMeshesClone[0].visibility = 1;
                this.ikMeshesClone[2].visibility = 1;
                this.ikMeshesClone[3].visibility = 1;
                this.wheelFrontAxisMeshClone.visibility = 1;
            }
        }, 1000);
    }


    /**
     * 更新飞机尾焰
     */
    private updateFlames() {
        //飞机推力大于250则喷射尾焰
        if (this.vehicle.flyData.accelerateSize > 250) {
            this.flames[0].scaling = new BABYLON.Vector3(Math.random() / 1.5 + 0.5, Math.random() / 1.5 + 0.5, Math.random() / 1.5 + 0.5)
            this.flames[1].scaling = new BABYLON.Vector3(Math.random() / 1.5 + 0.5, Math.random() / 1.5 + 0.5, Math.random() / 1.5 + 0.5)
        } else {
            this.flames[0].scaling = new BABYLON.Vector3(0, 0, 0)
            this.flames[1].scaling = new BABYLON.Vector3(0, 0, 0)
        }
    }


    public render() {
        //如果速度足够大，拉伸飞机机翼产生空气压缩气流
        if (this.vehicle.flyGamePadData.pitchNumber>0.4) {
            if (this.vehicle.flyData.flySpeed > 200) {
                this.vehicle.newTrail["_diameter"] = 0.2
                this.vehicle.newTrail2["_diameter"] = 0.2
            } else {
                this.vehicle.newTrail["_diameter"] = 0
                this.vehicle.newTrail2["_diameter"] = 0
            }
        } else {
            this.vehicle.newTrail["_diameter"] = 0
            this.vehicle.newTrail2["_diameter"] = 0
        }

        this.updateUndercarriage()
        this.updateWheel()
        this.updateAilerons()
        this.updateRudders()
        this.updateElevators()
        this.updateFlames()
    }


    /**
     * 更新升降舵
     */
    private updateElevators() {
        let fpsDt: any = this.scene.getAnimationRatio()
        let lerp2 = (0.2 * fpsDt) >= 0.99 ? 0.99 : (0.2 * fpsDt)

        this.elevators[0].getTransformNode().rotation = BABYLON.Vector3.Lerp(this.elevators[0].getTransformNode().rotation, new BABYLON.Vector3(this.vehicle.flyGamePadData.pitchNumber*0.25, 0, 0), lerp2);
    }


    /**
     * 更新方向舵
     */
    private updateRudders() {

        let down_1 = new BABYLON.Vector3(-0.2492525246751598, 0.43173623004032446, -0.9642907171264183)
        let center_1 = new BABYLON.Vector3(-0.4535491510898051, 0.46578566777609876, -1.54313115863458)
        let up_1 = new BABYLON.Vector3(-0.6347028002934163, 0.7272747091375527, -2.473372438025224)

        let down_2 = new BABYLON.Vector3(-0.15801067199257712, -0.36230729840722287, 1.9530544676254245)
        let center_2 = new BABYLON.Vector3(-0.021812921049480405, -0.430406173878771, 1.6125600902676815)
        let up_2 = new BABYLON.Vector3(0.11438482989361676, -0.6347028002934163, 1.0677690864952947)

        //this.rudders[1].getTransformNode().rotation = new BABYLON.Vector3(this.px,this.py,this.pz)
        let fpsDt: any = this.scene.getAnimationRatio()
        let lerp2 = (0.2 * fpsDt) >= 0.99 ? 0.99 : (0.2 * fpsDt)

        if(this.vehicle.flyGamePadData.yawNumber>0){
            this.rudders[0].getTransformNode().rotation = BABYLON.Vector3.Lerp(
                this.rudders[0].getTransformNode().rotation, 
                new BABYLON.Vector3(
                    center_1.x+(up_1.x-center_1.x)*this.vehicle.flyGamePadData.yawNumber, 
                    center_1.y+(up_1.y-center_1.y)*this.vehicle.flyGamePadData.yawNumber,
                    center_1.z+(up_1.z-center_1.z)*this.vehicle.flyGamePadData.yawNumber
                ), 
                lerp2)

            this.rudders[1].getTransformNode().rotation = BABYLON.Vector3.Lerp(
                this.rudders[1].getTransformNode().rotation, 
                new BABYLON.Vector3(
                    center_2.x+(up_2.x-center_2.x)*this.vehicle.flyGamePadData.yawNumber, 
                    center_2.y+(up_2.y-center_2.y)*this.vehicle.flyGamePadData.yawNumber,
                    center_2.z+(up_2.z-center_2.z)*this.vehicle.flyGamePadData.yawNumber
                ), 
                lerp2);
        }else if(this.vehicle.flyGamePadData.yawNumber<0){
            this.rudders[0].getTransformNode().rotation = BABYLON.Vector3.Lerp(
                this.rudders[0].getTransformNode().rotation, 
                new BABYLON.Vector3(
                    center_1.x-(down_1.x-center_1.x)*this.vehicle.flyGamePadData.yawNumber, 
                    center_1.y-(down_1.y-center_1.y)*this.vehicle.flyGamePadData.yawNumber,
                    center_1.z-(down_1.z-center_1.z)*this.vehicle.flyGamePadData.yawNumber
                ), 
                lerp2);

            this.rudders[1].getTransformNode().rotation = BABYLON.Vector3.Lerp(
                this.rudders[1].getTransformNode().rotation, 
                new BABYLON.Vector3(
                    center_2.x-(down_2.x-center_2.x)*this.vehicle.flyGamePadData.yawNumber, 
                    center_2.y-(down_2.y-center_2.y)*this.vehicle.flyGamePadData.yawNumber,
                    center_2.z-(down_2.z-center_2.z)*this.vehicle.flyGamePadData.yawNumber
                ), 
                lerp2);
        }else{
            this.rudders[0].getTransformNode().rotation = BABYLON.Vector3.Lerp(this.rudders[0].getTransformNode().rotation, center_1, lerp2);
            this.rudders[1].getTransformNode().rotation = BABYLON.Vector3.Lerp(this.rudders[1].getTransformNode().rotation, center_2, lerp2);
        }
    }





    /**
     * 更新副翼
     */
    private updateAilerons() {

        let down_1 = new BABYLON.Vector3(-0.08991179652102854, -0.3, -1.519988181423546)
        let center_1 = new BABYLON.Vector3(-0.08991179652102854, -0.08991179652102854, -1.519988181423546)
        let up_1 = new BABYLON.Vector3(-0.08991179652102854, 0.3, -1.519988181423546)

        let down_2 = new BABYLON.Vector3(0.04628595442206773, -0.3, 1.4763623393245853)
        let center_2 = new BABYLON.Vector3(0.04628595442206773, -0.08991179652102854, 1.4763623393245853)
        let up_2 = new BABYLON.Vector3(0.04628595442206773, 0.3, 1.4763623393245853)


        let fpsDt: any = this.scene.getAnimationRatio()
        let lerp2 = (0.2 * fpsDt) >= 0.99 ? 0.99 : (0.2 * fpsDt)

        if(this.vehicle.flyGamePadData.rollNumber>0){
            this.ailerons[0].getTransformNode().rotation = BABYLON.Vector3.Lerp(
                this.ailerons[0].getTransformNode().rotation, 
                new BABYLON.Vector3(
                    center_1.x+(up_1.x-center_1.x)*this.vehicle.flyGamePadData.rollNumber, 
                    center_1.y+(up_1.y-center_1.y)*this.vehicle.flyGamePadData.rollNumber,
                    center_1.z+(up_1.z-center_1.z)*this.vehicle.flyGamePadData.rollNumber
                ), 
                lerp2)

            this.ailerons[1].getTransformNode().rotation = BABYLON.Vector3.Lerp(
                this.ailerons[1].getTransformNode().rotation, 
                new BABYLON.Vector3(
                    center_2.x+(up_2.x-center_2.x)*this.vehicle.flyGamePadData.rollNumber, 
                    center_2.y+(up_2.y-center_2.y)*this.vehicle.flyGamePadData.rollNumber,
                    center_2.z+(up_2.z-center_2.z)*this.vehicle.flyGamePadData.rollNumber
                ), 
                lerp2);
        }else if(this.vehicle.flyGamePadData.rollNumber<0){
            this.ailerons[0].getTransformNode().rotation = BABYLON.Vector3.Lerp(
                this.ailerons[0].getTransformNode().rotation, 
                new BABYLON.Vector3(
                    center_1.x-(down_1.x-center_1.x)*this.vehicle.flyGamePadData.rollNumber, 
                    center_1.y-(down_1.y-center_1.y)*this.vehicle.flyGamePadData.rollNumber,
                    center_1.z-(down_1.z-center_1.z)*this.vehicle.flyGamePadData.rollNumber
                ), 
                lerp2);

            this.ailerons[1].getTransformNode().rotation = BABYLON.Vector3.Lerp(
                this.ailerons[1].getTransformNode().rotation, 
                new BABYLON.Vector3(
                    center_2.x-(down_2.x-center_2.x)*this.vehicle.flyGamePadData.rollNumber, 
                    center_2.y-(down_2.y-center_2.y)*this.vehicle.flyGamePadData.rollNumber,
                    center_2.z-(down_2.z-center_2.z)*this.vehicle.flyGamePadData.rollNumber
                ), 
                lerp2);
        }else{
            this.ailerons[0].getTransformNode().rotation = BABYLON.Vector3.Lerp(this.ailerons[0].getTransformNode().rotation, center_1, lerp2);
            this.ailerons[1].getTransformNode().rotation = BABYLON.Vector3.Lerp(this.ailerons[1].getTransformNode().rotation, center_2, lerp2);
        }

        // this.ailerons[1].getTransformNode().rotation = new BABYLON.Vector3(this.px,this.py,this.pz)
        // console.log(this.px,this.py,this.pz)
    }

    /**
     * 更新起落架
     */
    private updateUndercarriage() {
        //如果起落架是打开状态，则更新起落架和轮胎的骨骼
        if (this.undercarriageState) {
            //获取当前轮胎的悬挂长度
            let y_2 = -this.vehicle.vehicle.getWheelInfo(2).get_m_raycastInfo().get_m_suspensionLength() * 2
            this.axises[2] = new BABYLON.Vector3(1.7358679619668433 + y_2, -0.29420842293567384, 0.11438482989361676);
            this.bones[2].getTransformNode().rotation = this.axises[2]

            //获取当前轮胎的悬挂长度
            let y_3 = -this.vehicle.vehicle.getWheelInfo(3).get_m_raycastInfo().get_m_suspensionLength() * 2
            this.axises[3] = new BABYLON.Vector3(1.7358679619668433 + y_3, 0.2505825808367135, -0.15801067199257712);
            this.bones[3].getTransformNode().rotation = this.axises[3]

            //前轮
            let y_0 = -this.vehicle.vehicle.getWheelInfo(0).get_m_raycastInfo().get_m_suspensionLength() / 4
            this.wheelFrontAxisMeshClone.position.y = this.wheelFrontAxisMeshPositionY + 0.11 + y_0
        }
    }

    /**
     * 更新轮子
     */
    private updateWheel() {
        //前轮
        this.ikMeshesClone[0].position = this.vehicle.wheelMeshes[0].absolutePosition
        this.ikMeshesClone[0].rotationQuaternion = this.vehicle.wheelMeshes[0].rotationQuaternion
        this.ikMeshesClone[0].rotate(BABYLON.Axis.Z, Math.PI / 2);

        //后轮1
        this.ikMeshesClone[3].position = this.vehicle.wheelMeshes[3].absolutePosition
        this.ikMeshesClone[3].rotationQuaternion = this.vehicle.wheelMeshes[3].rotationQuaternion
        this.ikMeshesClone[3].rotate(BABYLON.Axis.Z, Math.PI / 2);

        //后轮2
        this.ikMeshesClone[2].position = this.vehicle.wheelMeshes[2].absolutePosition
        this.ikMeshesClone[2].rotationQuaternion = this.vehicle.wheelMeshes[2].rotationQuaternion
        this.ikMeshesClone[2].rotate(BABYLON.Axis.Z, Math.PI / 2);
    }

    public dispose() {
        this.ikMeshes[0].dispose(false, false)
        this.ikMeshes[2].dispose(false, false)
        this.ikMeshes[3].dispose(false, false)
        this.ikMeshesClone[0].dispose(false, false)
        this.ikMeshesClone[2].dispose(false, false)
        this.ikMeshesClone[3].dispose(false, false)
    }
}
