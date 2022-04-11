import 'babylonjs-loaders';
import { Game } from './game';
window.addEventListener('DOMContentLoaded', async () => {

   await window["Ammo"]()
   let game = new Game('renderCanvas');
   game.createScene();
  // game.animate();
});
