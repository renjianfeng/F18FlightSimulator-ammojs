import * as BABYLON from '@babylonjs/core'
import 'babylonjs-materials';
import { AmmoJSPlugin }from '@babylonjs/core';
import { url } from '../base/config';
//  import { meshList } from '../base/test2';

/**
 * 飞机场地图
 */
export class AirportScene{

    private scene;
    private _engine

    constructor(scene,_engine){
        this.scene=scene;
        this._engine=_engine;
    }

    private ground:BABYLON.Mesh

    private assetContainer:BABYLON.AssetContainer

    private waterMesh:BABYLON.AbstractMesh

    public flyPositions=[]

    async init(){
         this.addEvent()
         this.createSkybox(this.scene)
        //  this.ground = BABYLON.Mesh.CreateGround("ground", 800, 800, 200, this.scene);
        //  this.ground.physicsImpostor = new BABYLON.PhysicsImpostor(this.ground, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, friction: 0.5, restitution: 0.7 }, this.scene);
        //  this.ground.material =createMapMtl(this.scene)


         this.assetContainer = await this.loadMap(this._engine, this.scene);
         this.assetContainer.addAllToScene()


        for(let mesh of this.assetContainer.meshes) {
            if(mesh.name.indexOf("flymesh")!=-1){
              this.flyPositions[mesh.name.split("_")[1]]=mesh;
              mesh.parent=null
              mesh.setEnabled(false)
            }
        }

         for(let mesh of this.assetContainer.meshes) {
             if(mesh.name.indexOf("water")!=-1){
                this.waterMesh=mesh
             }

             if(mesh.name.indexOf("_phusics")!=-1||mesh.name.indexOf("root")!=-1){
                mesh.physicsImpostor = new BABYLON.PhysicsImpostor(mesh, BABYLON.PhysicsImpostor.MeshImpostor, { mass: 0 });
             }
         }

       
         console.log("map", this.assetContainer)

        //   this.createBox(new BABYLON.Vector3(4, 1, 12), new BABYLON.Vector3(0, 0, 25), new BABYLON.Vector3(-Math.PI / 8, 0, 0), 0);
        //   this.createBox(new BABYLON.Vector3(4, 1, 12), new BABYLON.Vector3(25, 0, 0), new BABYLON.Vector3(-Math.PI / 8, Math.PI / 2, 0), 0);
        //   this.createBox(new BABYLON.Vector3(4, 1, 12), new BABYLON.Vector3(0, 0, -25), new BABYLON.Vector3(Math.PI / 8, 0, 0), 0);
        //   this.createBox(new BABYLON.Vector3(4, 1, 12), new BABYLON.Vector3(-25, 0, 0), new BABYLON.Vector3(Math.PI / 8, Math.PI / 2, 0), 0);
  
        //   let s = new BABYLON.Vector3();
        //   let p = new BABYLON.Vector3();
        //   let r = new BABYLON.Vector3();
        //   for (let i = 0; i < 20; i++) {
        //       let m = Math.random() * 300 - 150 + 5;
        //       let m3 = Math.random() * 300 - 150 + 5;
        //       let m2 = Math.random() * 10;
        //       s.set(m2, m2, m2);
        //       p.set(m3, 0, m);
        //       r.set(m, m, m);
        //       this.createBox(s, p, r, 0);
        //   }
  
        //   for (let i = 0; i < 30; i++) {
        //       let m = Math.random() * 300 - 150 + 5;
        //       let m3 = Math.random() * 300 - 150 + 5;
        //       let m2 = Math.random() * 3;
        //       s.set(m2, m2, m2);
        //       p.set(m3, 0, m);
        //       r.set(m, m, m);
        //       this.createBox(s, p, r, 5);
        //   }

        //  this.createHeightMap()
    }

    private loadMap(engine, scene: BABYLON.Scene): any {
        return new Promise((success) => {
            BABYLON.SceneLoader.LoadAssetContainer(url + "assets/mesh/map/", "map.glb", scene, async (container) => {
                success(container)
            });
        })
    }


    private groundList=[]


    // private createHeightMap(){
    //    let heightMapWidth=1024
    //    let heightMapHeight=1024
    //    console.log(Date.now())

    //     for(let i=0;i<meshList.length;i++){
    //         this.groundList[i] = BABYLON.MeshBuilder.CreateGroundFromHeightMap("Terrain_",
    //             meshList[i].heightMapBase64, {
    //             width:heightMapWidth, height:heightMapHeight,
    //             subdivisions:100, 
    //             maxHeight:200, 
    //             minHeight:-200,
    //             updatable:false,
    //             onReady:()=>{
    //                 this.groundList[i].physicsImpostor = new BABYLON.PhysicsImpostor(this.groundList[i], BABYLON.PhysicsImpostor.MeshImpostor, { mass: 0 });
    //             }
    //         }, this.scene);
    //         this.groundList[i].material = new BABYLON.PBRMaterial('Terrain_'+i, this.scene);
    //         this.groundList[i].material.albedoTexture = new BABYLON.Texture(meshList[i].albedoTexture, this.scene);
    //         this.groundList[i].material.metallicTexture = new BABYLON.Texture(meshList[i].metallicTexture, this.scene);
    //         this.groundList[i].material.metallicTexture.vScale=-1;
    //         this.groundList[i].material.albedoTexture.vScale=-1;
    //         this.groundList[i].material.metallic = 1;
    //         this.groundList[i].material.roughness = 1;
    //         this.groundList[i].material.useRoughnessFromMetallicTextureAlpha = false;
    //         this.groundList[i].material.useRoughnessFromMetallicTextureGreen = true;
    //         this.groundList[i].material.useMetallnessFromMetallicTextureBlue = true;
    //         this.groundList[i].position.x=heightMapWidth*(i%3)+0;
    //         this.groundList[i].position.z=heightMapHeight*Math.floor(i/3)+0;
    //         this.groundList[i].position.y=190
    //     } 
    // }


    private boxList=[]


    private createBox(size, position, rotation, mass) {
        let index=this.boxList.length;
        this.boxList[index] = BABYLON.MeshBuilder.CreateBox("box", { width: size.x, depth: size.z, height: size.y }, this.scene);
        this.boxList[index].position.set(position.x, position.y, position.z);
        this.boxList[index].rotation.set(rotation.x, rotation.y, rotation.z);
        if (!mass) {
            mass = 0;
           // box.material = redMaterial;
        } else {
            this.boxList[index].position.y += 5;
           // box.material = blueMaterial;
        }
        this.boxList[index].physicsImpostor = new BABYLON.PhysicsImpostor(this.boxList[index], BABYLON.PhysicsImpostor.BoxImpostor, { mass: mass, friction: 0.5, restitution: 0.7 }, this.scene);
    }


    private skySphere:BABYLON.Mesh;
    private gl:BABYLON.GlowLayer

    private createSkybox(scene) {

        let skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
            skyboxMaterial.backFaceCulling = false;
            skyboxMaterial.diffuseTexture =  new BABYLON.Texture(url+"assets/texture/skybox6.png",scene);
            skyboxMaterial.emissiveTexture =  new BABYLON.Texture(url+"assets/texture/skybox6.png",scene);
            skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
            skyboxMaterial.emissiveColor  = new BABYLON.Color3(0, 0, 0);
            skyboxMaterial.disableLighting = true;
    
            /**
             * 天空球
             */
            this.skySphere = BABYLON.MeshBuilder.CreateSphere("skySphere", {diameter: 15000}, scene);
            this.skySphere.rotation.x=Math.PI;
            this.skySphere.position.y=100;
            this.skySphere.scaling.y=0.5
            this.skySphere.material=skyboxMaterial
            this.skySphere.applyFog=false;
    
    
            scene.environmentTexture= new BABYLON.CubeTexture(url+"assets/texture/skybox6/skybox6",scene);
            scene.environmentTexture.level=1; 

            scene.fogMode = BABYLON.Scene.FOGMODE_EXP;
            scene.fogDensity = 0.00005;
            scene.fogColor = new BABYLON.Color3(0.2,0.2,0.2);
    
           
            this.gl = new BABYLON.GlowLayer("glow", scene);
            this.gl.intensity = 1;
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

    private render(){
        if(this.waterMesh){
            this.waterMesh.material["bumpTexture"].uOffset+=0.001
        }
    }

    public dispose(){
        this.removeEvent()
       // this.ground.dispose(false, true)
        this.skySphere.dispose(false, true)
        this.assetContainer.removeAllFromScene()
        this.assetContainer.dispose()

        for(let i=0;i<this.assetContainer.meshes.length;i++){
            this.assetContainer.meshes[i].dispose(false, true)
        }


        this.gl.dispose()
        for(let i=0;i<this.groundList.length;i++){
            this.groundList[i].dispose(false, true)
        }
        this.groundList=[]
        for(let i=0;i<this.boxList.length;i++){
            this.boxList[i].dispose(false, true)
        }
        this.boxList=[]
        this.scene.environmentTexture=null;
    }


}