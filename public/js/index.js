import {hyperbolicShader} from './shaders/hyperbolicShader.js'
import {dataMaterialShader} from './shaders/dataMaterialShader.js'
import {gradientMaterialShader} from './shaders/gradientMaterialShader.js'
import {vec3, vec4, mat4} from "./gl-matrix/src/index";


if ( WEBGL.isWebGLAvailable() === false ) {
    document.body.appendChild( WEBGL.getWebGLErrorMessage() );
}

let colorScene, camera, hyperbolicMaterial; 
let renderer, controls, stats;
let mouse	= {x : 0, y : 0}
let lastTimeMsec = 0;
let mapQuad;
let Controls = function(){
    this.calls = 10;
    this.latitude = 1;
    this.longitude = 1;
    this.created = 0;
    this.closed = 10;
}
let data = [];
let dataMaterial;
let hbg;
let dataMaterials = [];

const dataEndpoint = "http://localhost:4000/data"
fetch(dataEndpoint).then((response)=>{
    response.json().then((data)=>{
        init(data);
        animate();
    })
})


function init(data) {
    let loader = new THREE.FontLoader();
    
    /* Setup gui */
    {
        hbg = new Controls()
        let gui = new dat.GUI();
        const calls = gui.add(hbg, "calls", 0.1, 10.0);
        const latitude =gui.add(hbg, "latitude", 0.0, 1.0);
        const longitude =gui.add(hbg, "longitude", 0.0, 1.0);
        const created =gui.add(hbg, "created", 0.0, 10.0);
        const closed =gui.add(hbg, "closed", 0.0, 10.0);

        calls.onFinishChange((value)=>{hbg.calls = value; reRender()})
        latitude.onFinishChange((value)=>{hbg.latitude = value; reRender()})
        longitude.onFinishChange((value)=>{hbg.longitude = value; reRender()})
        created.onFinishChange((value)=>{hbg.created = value; reRender()})
        closed.onFinishChange((value)=>{hbg.closed = value; reRender()})
    }

     /* Setup Renderer*/
     {
        renderer = new THREE.WebGLRenderer( { antialias: true, logarithmicDepthBuffer: false } );
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize( window.innerWidth, window.innerHeight );
        if ( ! renderer.extensions.get( 'WEBGL_depth_texture' ) ) {
            supportsExtension = false;
            document.querySelector( '#error' ).style.display = 'block';
            return;
        }
    }

    /* Setup cameras */
    {
        //camera = new THREE.OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );
        camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 10000 );
        camera.position.z = 1000;
        camera.position.y = 400;

    }

    /* Setup scenes */
    {
        colorScene = new THREE.Scene();
        colorScene.background = new THREE.Color( 0xffffff );
    }

    /* Setup Material */
        const mapTexture = new THREE.TextureLoader().load("images/NYMap.png");

        hyperbolicMaterial = new THREE.ShaderMaterial(hyperbolicShader);
        hyperbolicMaterial.uniforms = {
            uK: {value: 1},
            uTransX:{ value: 0.5 },
        	uTransY:{ value: 0.5 },
        	uXcntr:{ value: 0.5 },
        	uYcntr:{ value: 0.5 },
        	uScale:{ value: 0.5 },
            tDiffuse: {value: mapTexture}
        }
        
        const basicMaterial = new THREE.MeshLambertMaterial({
            color: 0xff0000,
            
        });

        const gradientMaterial = new THREE.ShaderMaterial(gradientMaterialShader)

        
        
    
    /* Setup geometry in scene */
    
    var mapPlane = new THREE.PlaneBufferGeometry( 2048, 1024, 1, 1 );
    mapQuad = new THREE.Mesh( mapPlane, hyperbolicMaterial );
    mapQuad.rotation.x =  -Math.PI / 2;

    var geometry = new THREE.BoxGeometry( 2048, 1024, 20 );
    var material = new THREE.MeshBasicMaterial( {color: 0x9fccf5} );
    var material_250 = new THREE.MeshBasicMaterial( {color: 0x7d0098} );
    var material_500 = new THREE.MeshBasicMaterial( {color: 0x0e26ff} );
    var material_750 = new THREE.MeshBasicMaterial( {color: 0x05ffc7} );
    var material_1000 = new THREE.MeshBasicMaterial( {color: 0xfed501} );
    var material_1250 = new THREE.MeshBasicMaterial( {color: 0xfe0000} );
    var material_1500 = new THREE.MeshBasicMaterial( {color: 0x8a0000} );
    var cube = new THREE.Mesh( geometry, material );
    cube.position.y = -11;
    cube.rotation.x = -Math.PI / 2;
    colorScene.add( cube );
    

    colorScene.add(mapQuad);

    {        
        for ( var i = 0; i < data.length; i ++ ) {
            let scale = 40;
            if(data[i].minutes > 0){
                const maxDiff = 0.9484706958028681;
                const mixRatio = Math.max(0.2, (data[i].closed - data[i].created))/maxDiff;
            
                var geometry = new THREE.CylinderBufferGeometry( 2, 2, data[i].num_calls*scale, 8, 1 );
                let currentMaterial = material_250;
                if(data[i].minutes < 250){
                    currentMaterial = material_250;
                }else if(data[i].minutes < 500){
                    currentMaterial = material_500;
                }else if(data[i].minutes < 750){
                    currentMaterial = material_750;
                }else if(data[i].minutes < 1000){
                    currentMaterial = material_1000;
                }else if(data[i].minutes < 1250){
                    currentMaterial = material_1250;
                }else{
                    currentMaterial = material_1500;
                }
                var mesh = new THREE.Mesh( geometry, currentMaterial );
                
                mesh.position.x = (data[i].longitude * 2048)-1024;
                mesh.position.y = data[i].num_calls*(scale/2);//( Math.random() - 0.5 ) * 1000; //
                mesh.position.z = (-data[i].latitude * 1024)+512;
                
                mesh.userData.isMyCylinder = true;
                mesh.userData.index = i;
                mesh.userData.calls = data[i].num_calls;
                mesh.userData.longitude = data[i].longitude;
                mesh.userData.latitude = data[i].latitude;
                mesh.userData.created = data[i].created;
                mesh.userData.closed = data[i].closed;

                mesh.updateMatrix();
                //mesh.matrixAutoUpdate = false;
                
                colorScene.add( mesh );
            }
        }
    }
    /* Add lights */
    {
        var light = new THREE.DirectionalLight( 0xffffff );
        light.position.set( 1, 1, 1 );
        colorScene.add( light );

        var light = new THREE.DirectionalLight( 0x002288 );
        light.position.set( - 1, - 1, - 1 );
        colorScene.add( light );

        var light = new THREE.AmbientLight( 0x222222 );
        colorScene.add( light );

    }

    document.body.appendChild( renderer.domElement );

    /* Setting up controls */
    {
        controls = new THREE.TrackballControls( camera, renderer.domElement );
        controls.rotateSpeed = 1.0;
        controls.zoomSpeed = 1.2;
        controls.panSpeed = 0.8;
        controls.noZoom = false;
        controls.noPan = false;
        controls.staticMoving = true;
        controls.dynamicDampingFactor = 0.3;
        controls.keys = [ 65, 83, 68 ];
        controls.addEventListener( 'change', render );
    }
    /* Stats */
    {
        stats = new Stats();
        document.body.appendChild( stats.dom );
    }
    
    window.addEventListener( 'resize', onWindowResize, false );
    
    render();
}
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
    controls.handleResize();
    render();
}

function animate(nowMsec) {
    lastTimeMsec	= lastTimeMsec || nowMsec-1000/60
	var deltaMsec	= Math.min(200, nowMsec - lastTimeMsec)
	lastTimeMsec	= nowMsec
    requestAnimationFrame( animate );
    //delta = clock.getElapsedTime();
    controls.update();
    render(deltaMsec/1000, nowMsec/1000);
    stats.update();
}

function render(delta, now) {

    renderer.setRenderTarget(null);
    renderer.clear()
    renderer.render(colorScene, camera);
    //Finally, draw to the screen
}

function reRender(){
    console.log("Rerendering"); 
    colorScene.traverse((obj)=>{
        if(obj.isMesh){
            if(obj.userData.isMyCylinder){
                const callScaled = hbg.calls;
                const longitudeScaled = hbg.longitude;
                const latitudeScaled = hbg.latitude;
                const createdScaled = hbg.created;
                const closedScaled = hbg.closed;
                if(obj.userData.calls <= callScaled && obj.userData.longitude <= longitudeScaled && obj.userData.latitude <= latitudeScaled && (obj.userData.created >= createdScaled && obj.userData.closed <= closedScaled)){
                    obj.visible = true;
                }else {
                    obj.visible = false;
                }
            }
        }
    })
}
