<!--
 * @Author: renjianfeng
 * @Date: 2021-02-27 22:59:10
 * @LastEditors: renjianfeng
 * @LastEditTime: 2022-04-11 20:34:13
 * @FilePath: /fly/README.en.md
-->
# F18 Fighter Simulation(ammojs)

[中文说明](/README.md)

A fighter flight control system based on babylonjs+ammojs is implemented, and the flight control part is all implemented based on the ammojs physics engine:
#### [Play Now]: https://renjianfeng.github.io/F18FlightSimulator-ammojs/dist/index.html
## Main function list: ##
1. Tail, flap, elevator, rudder, landing gear: (based on babylonjs skeleton control and related methods of ammojs vehicle class, such as suspension height, tire position information, rotation information, etc., babylonjs skeleton ik, fk control)
2. HUD head-up display (babylonjs gui implementation, world coordinate conversion, gui AdvancedDynamicTexture, gui xmlloader)
3. Vector control of aircraft yaw, roll and pitch. (Based on the physical control of force control, drag, lift, and angular momentum based on ammojs, the main control of flight control is realized)
4. Details of body physics (physical realization of explosion disintegration, application of body ammojs complex)
6. Performance optimization (body LOD strategy implementation, resource recovery, package implementation of dispose method)
7. Map acquisition (map from: http://fastmap.xidayun.com/)
8. Input control (support keyboard and handle control, among which xbox and ps4 handle support vibration feedback)
9. Spatial sound effects (supports 3D spatial sound effects, and attenuates sound effects from different perspectives, such as attenuation inside and outside the cabin)
10. Trailing effect (the aircraft will have a wake effect during the climb)

## screenshot ##
![Alt ​​text](/screenshot/image1.png)
![Alt ​​text](/screenshot/image2.png)
![Alt ​​text](/screenshot/image3.png)
![Alt ​​text](/screenshot/image4.png)
![Alt ​​text](/screenshot/image5.png)
![Alt ​​text](/screenshot/image6.png)
## How to quickly preview a project? ##

1. Download and install Node.js
2. Run the following command at the command line:
````
npm install
npm start
````
3. Open a browser and enter: [http://localhost:8080](http://localhost:8080)

## How to publish a project? ##
1. The packaging instructions are as follows:
````
npm run build
````
2. Deployable applications will be in the dist folder

## How to quickly apply it in your project? ##
````javascript
//Enable babylonjs physics using ammojs
this.scene.enablePhysics(new BABYLON.Vector3(0, -10, 0), new AmmoJSPlugin(true, Ammo));
//Load f18 model
let f18FighterAssets = new F18Assets(this._engine, this.scene)
await f18FighterAssets.init()
this.flyMesh = f18FighterAssets;;

//create airport
this.airportScene = new AirportScene(this.scene, this._engine)
await this.airportScene.init()

//create fighter
this.fly = new F18Physics(this._canvas, this._engine, this.scene, this.flyMesh)
this.fly.init(
    position,
    quaternion,
)

// camera controller
F18CameraController.ins.init(this._canvas, this.scene, this._engine)
//input controller
F18InputController.ins.init(this.scene)
// handle controller
F18GamepadController.ins.init(this.scene)

//Current view target aircraft
F18CameraController.ins.tergetVehicle(this.fly)
//Currently control the target aircraft
F18InputController.ins.tergetVehicle(this.fly)


// delete the plane
this.fly.dispose()

// make the plane explode
this.fly.explode()
````
## Directory Structure Description ##
````
fly
├─src
| ├─.DS_Store
| ├─ammo.d.ts (ammo ts prompt file)
| ├─game.ts (game entry file)
| ├─index.ejs (html template)
| ├─index.ts (project entry file)
| ├─vehicleObject (vehicle folder)
| | ├─f18 (f18 fighter related method collection)
| | | ├─f18Animation.ts (animation control implementation)
| | | ├─f18Assets.ts (resource loading strategy implementation)
| | | ├─f18CameraController.ts (camera controller)
| | | ├─f18Explode.ts (physical explosion related implementation)
| | | ├─f18GamePadController.ts(handle controller)
| | | ├─f18Global.ts (global variable)
| | | ├─f18HUD.ts (HUD head-up display implementation)
| | | ├─f18InputController.ts(input controller)
| | | ├─f18LODManager.ts(LOD Manager)
| | | ├─f18Physics.ts (implementation of aircraft physics body)
| | | └f18Sound.ts (3D stereo sound implementation)
| ├─physicsScene
| | └airportScene.ts (airport implementation)
| ├─interface
| | └fly.ts (flight control interface)
| ├─base
| | ├─config.ts (global configuration)
| | └funt.ts
| ├─assets (resource folder)
| | ├─video
| | ├─texture
| | ├─sound
| | ├─mesh
| | ├─image
| | ├─gui
├─map (map blender source file)
├─f18(F18 blender binding bone source file)
├─dist (packaging folder)
````

## References ##
1. https://doc.babylonjs.com/
2. https://gamepad-tester.com/