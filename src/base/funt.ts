import * as BABYLON from '@babylonjs/core';
 
 
/**
 * 求亮点之间的距离
 * @param position1 
 * @param position2 
 * @returns 
 */
 export function getDistance(position1,position2) 
 {   var _x: number = Math.abs(position1.x - position2.x); 
     var _y: number = Math.abs(position1.y - position2.y); 
     var _z: number = Math.abs(position1.z - position2.z); 
     return Math.sqrt(_x * _x + _y * _y+ _z * _z); 
 }


 /**
  * 执行自动lod
  * @param mesh 
  * @returns 
  */
 export  function autoLOD(mesh){
    return new Promise((success) => {
        if(mesh["simplify"]){
           // console.log("mesh.simplify")
           console.log(mesh.name,"simplification beigin");
            mesh.simplify([
                {distance:20, quality:0.4,optimizeMesh: true}, 
                {distance:50, quality:0.2,optimizeMesh: true}, 
            ], true, BABYLON.SimplificationType.QUADRATIC, ()=> {
                console.log(mesh.name,"simplification finished");
                success(mesh.name)
            });
        }else{
            success(mesh.name)
        }
    })
}