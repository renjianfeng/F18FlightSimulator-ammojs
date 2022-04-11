<!--
 * @Author: renjianfeng
 * @Date: 2021-02-27 22:59:10
 * @LastEditors: renjianfeng
 * @LastEditTime: 2022-04-11 17:51:56
 * @FilePath: /fly/README.md
-->
# F18 Fighter Simulation(ammojs)

实现了一个基于babylonjs+ammojs的战斗机飞控系统，飞控部分全部基于ammojs物理引擎实现：
#### [Play Now]:https://renjianfeng.github.io/F18FlightSimulator-ammojs/dist/index.html
## 主要功能列举： ##
1. 尾翼、襟翼、升降舵、方向舵、起落架：（基于babylonjs骨骼控制和ammojs载具类的相关方法实现，如悬架高度、轮胎位置信息、旋转信息等，babylonjs骨骼ik、fk控制）
2. HUD抬头显示器(babylonjs gui实现、世界坐标转换、gui AdvancedDynamicTexture、gui xmlloader)
3. 飞机的偏航、翻滚、俯仰的矢量控制。（基于ammojs的作用力控制、阻力、升力、角动量的物理控制，实现飞控主要操控）
4. 机体物理细节（爆炸解体物理实现、机体ammojs复合体的应用）
6. 性能优化(机体LOD策略实现、资源回收、dispose方法的封装实现)
7. 地图获取（地图获取来自：http://fastmap.xidayun.com/）
8. 输入控制（支持键盘、手柄控制，其中xbox、ps4手柄支持震动反馈）
9. 空间音效(支持3D空间音效，并对不同视角的音效做了衰减处理，如舱内和舱外的衰减)
10. 拖尾效果（飞机在爬升过程中会产生尾流效果）

## 截图 ##
![Alt text](/screenshot/image1.png)
![Alt text](/screenshot/image2.png)
![Alt text](/screenshot/image3.png)
![Alt text](/screenshot/image4.png)
![Alt text](/screenshot/image5.png)
![Alt text](/screenshot/image6.png)
## 如何快速预览项目? ##

1. 下载并安装 Node.js
2. 在命令行运行下面的指令：
```
npm install 
npm start
```
3. 打开浏览器输入： [http://localhost:8080](http://localhost:8080)

## 如何发布项目？ ##
1. 打包指令如下：
```
npm run build
```
2. 可部署的应用会在dist文件夹中

## 如何快速应用在您的项目中？ ##
```javascript
//使用ammojs启用babylonjs物理特性
this.scene.enablePhysics(new BABYLON.Vector3(0, -10, 0), new AmmoJSPlugin(true, Ammo));
//加载f18模型
let f18FighterAssets = new F18Assets(this._engine, this.scene)
await f18FighterAssets.init()
this.flyMesh = f18FighterAssets;;

//创建机场
this.airportScene = new AirportScene(this.scene, this._engine)
await this.airportScene.init()

//创建战斗机
this.fly = new F18Physics(this._canvas, this._engine, this.scene, this.flyMesh)
this.fly.init(
    position,
    quaternion,
)

//相机控制器
F18CameraController.ins.init(this._canvas, this.scene, this._engine)
//输入控制器
F18InputController.ins.init(this.scene)
//手柄控制器
F18GamepadController.ins.init(this.scene)

//当前视图目标飞机
F18CameraController.ins.tergetVehicle(this.fly)
//当前控制目标飞机
F18InputController.ins.tergetVehicle(this.fly)


//删除飞机
this.fly.dispose()

//使飞机爆炸
this.fly.explode()
```
## 目录结构说明 ##
```
fly
├─src
|  ├─.DS_Store
|  ├─ammo.d.ts(ammo ts提示文件)
|  ├─game.ts(游戏入口文件)
|  ├─index.ejs（html模板）
|  ├─index.ts（项目入口文件）
|  ├─vehicleObject(载具文件夹)
|  |       ├─f18(f18战斗机相关方法集合)
|  |       |  ├─f18Animation.ts(动画控制实现)
|  |       |  ├─f18Assets.ts(资源加载策略实现)
|  |       |  ├─f18CameraController.ts(相机控制器)
|  |       |  ├─f18Explode.ts(物理爆炸相关实现)
|  |       |  ├─f18GamePadController.ts(手柄控制器)
|  |       |  ├─f18Global.ts(全局变量)
|  |       |  ├─f18HUD.ts(HUD抬头显示器实现)
|  |       |  ├─f18InputController.ts(输入控制器)
|  |       |  ├─f18LODManager.ts(LOD管理器)
|  |       |  ├─f18Physics.ts(飞机物理主体实现)
|  |       |  └f18Sound.ts(3D立体音实现)
|  ├─physicsScene
|  |      └airportScene.ts(机场实现)
|  ├─interface
|  |     └fly.ts(飞控接口)
|  ├─base
|  |  ├─config.ts(全局配置)
|  |  └funt.ts
|  ├─assets(资源文件夹)
|  |   ├─video
|  |   ├─texture
|  |   ├─sound
|  |   ├─mesh
|  |   ├─image
|  |   ├─gui
├─map(地图blender源文件)
├─f18(F18 blender绑定谷歌源文件)
├─dist(打包文件夹)
```

## 参考资料 ##
1. https://doc.babylonjs.com/
2. https://gamepad-tester.com/