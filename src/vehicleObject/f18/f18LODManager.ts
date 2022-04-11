import { autoLOD } from "../../base/funt";

/**
 * LOD
 */
export class F18LODManager {

    private static instance: F18LODManager;

    public static get ins(): F18LODManager {
        if (!this.instance) {
            this.instance = new F18LODManager();
        }
        return this.instance;
    }
    constructor() { }

    public init(node) {

        // console.log("node",node)
        node.getChildMeshes(false, (mesh) => {
            if (!mesh.addLODLevel) {
                //  console.log(mesh.name)
            }
            if (mesh.name.indexOf("LOD_DO_1") != -1) {
                //  console.log(mesh.name)
                mesh.addLODLevel && mesh.addLODLevel(50, null);
            }

            if (mesh.name.indexOf("LOD_DO_2") != -1) {
                mesh.addLODLevel && mesh.addLODLevel(100, null);
            }

            if (mesh.name.indexOf("LOD_DO_3") != -1) {
                mesh.addLODLevel && mesh.addLODLevel(200, null);
            }

            if (mesh.name.indexOf("LOD_DO_4") != -1) {
                mesh.addLODLevel && mesh.addLODLevel(500, null);
            }

            if (mesh.name.indexOf("LOD_DO_5") != -1) {
                mesh.addLODLevel && mesh.addLODLevel(1000, null);
            }

            if (mesh.name.indexOf("LOD_AUTO") != -1) {
                autoLOD(mesh);
            }
        })


        // for(let mesh of meshes){
        //    // console.log(mesh.addLODLevel)

        // }
    }
}

export default new F18LODManager();
