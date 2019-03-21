const THREE = global.THREE = require( 'three' );
require( 'three/examples/js/loaders/GLTFLoader' );

const scene = new THREE.Scene();
const camera = new THREE.Camera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer( {
	alpha: true
} );
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const loader = new THREE.GLTFLoader();
loader.load( 'src/assets/mswsn3d.glb', gltf => {

	scene.add( gltf.scene );

}, undefined, error => {

	console.log(error);

} );

camera.rotateX( 90 );

// var geometry = new THREE.BoxGeometry( 1, 1, 1 );
// var material = new THREE.MeshBasicMaterial( { color: 0x000000 } );
// var cube = new THREE.Mesh( geometry, material );
// scene.add( cube );

// camera.position.z = 5;

function animate() {

	requestAnimationFrame( animate );
	renderer.render( scene, camera );

}

animate();