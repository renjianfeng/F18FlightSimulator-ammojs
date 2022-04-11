import { F18CameraController } from './f18CameraController';
import { F18InputController } from './f18InputController';
import * as BABYLON from '@babylonjs/core'

/**
 * 手柄控制器
 */
export class F18GamepadController {
    private static instance: F18GamepadController;

    public static get ins(): F18GamepadController {
        if (!this.instance) {
            this.instance = new F18GamepadController();
        }
        return this.instance;
    }

    private scene: BABYLON.Scene;

    public init(scene) {
        this.scene = scene
        this.addEvent()
    }


    private beforeRender

    private _gamepadconnected
    private _gamepaddisconnected

    private addEvent() {
        this.beforeRender = this.scene.onBeforeRenderObservable.add(() => {
            this.render()
        })

        window.addEventListener("gamepadconnected", this._gamepadconnected = (event) => {
            this.gamepadconnected(event)
        });

        window.addEventListener("gamepaddisconnected", this._gamepaddisconnected = (event) => {
            this.gamepaddisconnected(event)
        });
    }

    private gamepadconnected(event) {
        console.log("A gamepad disconnected:");
        console.log(event["gamepad"]);
        F18InputController.ins.gamePadState=false
    }

    private gamepaddisconnected(event) {
        console.log("A gamepad connected:");
        console.log(event["gamepad"]);
        F18InputController.ins.gamePadState=true
    }

    public vibrationActuator(duration, weakMagnitude, strongMagnitude) {
        this.gamepad &&
            this.gamepad.vibrationActuator &&
            this.gamepad.vibrationActuator.playEffect("dual-rumble", {
                startDelay: 0,
                duration: duration,
                weakMagnitude: weakMagnitude,
                strongMagnitude: strongMagnitude
            });
    }

    private removeEvent() {
        this.scene.onBeforeRenderObservable.remove(this.beforeRender);
        window.removeEventListener('gamepadconnected', this._gamepadconnected, false);
        window.removeEventListener('gamepaddisconnected', this._gamepaddisconnected, false);
    }


    public gamepads

    public gamepad

    private render() {
        this.gamepads = navigator.getGamepads();
        for (let gamepad of this.gamepads) {
            if (gamepad) {
                F18InputController.ins.gamePadState=true
                this.gamepad = gamepad
                this.updateYawNumber()
                this.updateRollNumber()
                this.updatePitchNumber()
                this.updateAccelerateNumberAndBrakeNumber()
                this.updateFpsCameraRotation()
                this.updateOtherButton()
            }
        }
        if(this.gamepads.every((item)=>{return item==null})){
            F18InputController.ins.gamePadState=false
        }

    }

    private buttonsPressedCatch=[]

    private updateOtherButton(){
        for(let i=0;i<this.gamepad.buttons.length;i++){
            if(this.gamepad.buttons[i].pressed&&this.buttonsPressedCatch[i]==undefined){
                this.buttonsPressedCatch[i]=this.gamepad.buttons[i].pressed
                this.onClick(i)
            }
            if(this.gamepad.buttons[i].pressed==false){
                delete this.buttonsPressedCatch[i]
            }
        }
    }

    private onClick(buttonIndex){
        if(buttonIndex==3){
            F18InputController.ins.vehicle.undercarriageChange()
        }

        if(buttonIndex==1){
            F18CameraController.ins.cameraChange()
        }
    }

    /**
     * 摄像机旋转操作
     */
    private updateFpsCameraRotation(){
        if(Math.abs(this.gamepad.axes[0])>0.1){
            F18CameraController.ins.targetCamera.alpha=BABYLON.Scalar.Lerp(
                F18CameraController.ins.targetCamera.alpha,
                F18CameraController.ins.targetCamera.alpha+this.gamepad.axes[0]*Math.PI/5,
                0.1)
            F18CameraController.ins.moveX=BABYLON.Scalar.Lerp(F18CameraController.ins.moveX,this.gamepad.axes[0]*1800,0.1)
        }else{
            F18CameraController.ins.moveX=BABYLON.Scalar.Lerp(F18CameraController.ins.moveX,0,0.1)
        }
        if(Math.abs(this.gamepad.axes[1])>0.1){
            F18CameraController.ins.targetCamera.beta=BABYLON.Scalar.Lerp(
                F18CameraController.ins.targetCamera.beta,
                F18CameraController.ins.targetCamera.beta+this.gamepad.axes[1]*Math.PI/5,
                0.1)
            F18CameraController.ins.moveY=BABYLON.Scalar.Lerp(F18CameraController.ins.moveY,this.gamepad.axes[1]*600,0.1)
        }else{
            F18CameraController.ins.moveY=BABYLON.Scalar.Lerp(F18CameraController.ins.moveY,0,0.1)
        }
    }

    /**
     * 更新油门和刹车
     */
    private updateAccelerateNumberAndBrakeNumber(){
        if(this.gamepad.buttons[12].value==1){
            if (F18InputController.ins.accelerateNumber >= 1000) {
                F18InputController.ins.accelerateNumber = 1000
            } else {
                F18InputController.ins.accelerateNumber += 5
            }
            F18InputController.ins.brakeNumber=0
        }else if(this.gamepad.buttons[13].value==1){
            if (F18InputController.ins.accelerateNumber <= 0) {
                F18InputController.ins.accelerateNumber = 0
            } else {
                F18InputController.ins.accelerateNumber -= 5
            }
            F18InputController.ins.brakeNumber=1
        }else{
            F18InputController.ins.brakeNumber=0
        }
    }

    /**
     * 更新俯仰
     */
    private updatePitchNumber(){
        if(this.gamepad.axes[3]&&Math.abs(this.gamepad.axes[3])>0.1){
            F18InputController.ins.pitchNumber=this.gamepad.axes[3]
        }else{
            F18InputController.ins.pitchNumber=0
        }
    }

     /**
     * 更新翻滚
     */
    private updateRollNumber(){
        if(this.gamepad.axes[2]&&Math.abs(this.gamepad.axes[2])>0.1){
            F18InputController.ins.rollNumber=this.gamepad.axes[2]
        }else{
            F18InputController.ins.rollNumber=0
        }
    }

    /**
     * 更新偏航
     */
    private updateYawNumber() {
       // console.log(this.gamepad.buttons[6].touched, this.gamepad.buttons[7].touched)
        if (this.gamepad.buttons[6].touched) {
            F18InputController.ins.yawNumber = -this.gamepad.buttons[6].value
        }

        if (this.gamepad.buttons[7].touched) {
            F18InputController.ins.yawNumber = this.gamepad.buttons[7].value
        }

        if (!this.gamepad.buttons[6].touched && !this.gamepad.buttons[7].touched) {
            F18InputController.ins.yawNumber = 0
        }

        if (this.gamepad.buttons[6].touched && this.gamepad.buttons[7].touched) {
            F18InputController.ins.yawNumber = 0
        }
    }

    public dispose() {
        this.removeEvent()
    }
}