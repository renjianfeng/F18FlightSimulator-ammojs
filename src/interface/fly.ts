
/**
 * throttleSize 油门大小
 * resistance 阻力
 * flySpeed 飞行速度
 * flyLift 飞行升力
 */
interface FlyData {
    accelerateSize,
    resistance,
    flySpeed,
    flyLift
}

/**
 //俯仰
pitchUp: boolean;pitchDown: boolean;

 //翻滚
rollLeft: boolean;
rollRight: boolean;

 //偏航
yawLeft: boolean;
yawRight: boolean;

 //加速
accelerate: boolean;

 //刹车
brake: boolean;

 //切换起落架
switchUndercarriage: boolean;

 //切换视角
switchCamera: boolean;
 */
interface FlyInputData {
    pitchUp: boolean;
    pitchDown: boolean;
    rollLeft: boolean;
    rollRight: boolean;
    yawLeft: boolean;
    yawRight: boolean;
    accelerate: boolean;
    brake: boolean;
}