var scene, renderer, camera, container, animation ,mixer, skyBox;
var hasMorph = false;
var prevTime = Date.now();
var clock = new THREE.Clock();
var canvasTexture;
var UvLayout = {INSIDE: 1, OUTSIDE: 2, OUTSIDE_MIRRORED: 3};
var currentUvLayout = UvLayout.OUTSIDE;
function render() {
try {

	//if(canvasTexture != "null")
	var checkboxWireframe = parent.document.getElementById('drawWireframe');
    var displacement = parent.document.getElementById('displacementRange');
		var displacementOffset = parent.$('#displacementOffset')[0];

    if(newRing != undefined) {
    newRing.material.wireframe = checkboxWireframe.checked;
    canvasTexture.needsUpdate = true;
    newRing.material.displacementScale = displacement.value
		newRing.material.displacementBias = displacementOffset.value
    newRing.material.bumpScale = displacement.value
    newRing.material.needsUpdate = true;

    newRing.visible = false;
		if(skyBox != undefined) {
		skyBox.visible = true;
    ringCamera.update( renderer, scene );
    newRing.visible = true;
		skyBox.visible = false;
	}
    }

    //setTimeout(function () { orbit.update(); }, 1000/60);
    if ( hasMorph ) {

        var time = Date.now();

        animation.update( time - prevTime );

        prevTime = time;

    }

renderer.render( scene, camera );
} catch (e) {
	//console.log("There was an error while rendering");
	throw(e);
}
    //orbit.update();
}

function animate() {

    requestAnimationFrame( animate );


    if ( mixer !== null ) {

        var delta = clock.getDelta();
        //mixer.update(delta);

    }
    render();


}

function onWindowResize() {

    camera.aspect = container.offsetWidth / container.offsetHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( container.offsetWidth, container.offsetHeight );

    render();

}

function setupScene( result, data ) {

    scene = new THREE.Scene();
    //scene.add( new THREE.GridHelper( 10, 8 ) );

}

function setupLights() {

    var directionalLight = new THREE.DirectionalLight( 0xb8b8b8 );
    directionalLight.position.set(1, 1, 1).normalize();
    directionalLight.intensity = 1.0;
    scene.add( directionalLight );

    directionalLight = new THREE.DirectionalLight( 0xb8b8b8 );
    directionalLight.position.set(-1, 0.6, 0.5).normalize();
    directionalLight.intensity = 0.5;
    scene.add(directionalLight);

    directionalLight = new THREE.DirectionalLight();
    directionalLight.position.set(-0.3, 0.6, -0.8).normalize( 0xb8b8b8 );
    directionalLight.intensity = 0.45;
    scene.add(directionalLight);

}

function addGoldRing( geometry ) {
    ringCamera = new THREE.CubeCamera( 0.01, 10, 512 );
    var material;
    /*var loader = new THREE.TextureLoader();
loader.load(
    // resource URL
    'layout.png',
    // Function when resource is loaded

    function ( texture ) {
        // do something with the texture
         material = new THREE.MeshBasicMaterial( {
            map: texture
         } );
});*/
        //var lmaterial = new THREE.MeshBasicMaterial();
        //canvasTexture = new THREE.TextureLoader().load( "layout.png" );
        canvasTexture = new THREE.Texture(parent.document.getElementById('drawCanvas'));

        //parent.document.getElementById('canvas').innerHTML = "Hello Test";
if(canvasTexture.image === null) {
canvasTexture = new THREE.TextureLoader().load( "layout_outside.jpg" );
}
        //var ringMaterial =
				ringMaterial =
            new THREE.MeshPhongMaterial({
                color: 0xffd700,
                shininess: 100.0,
                emissive: 0x000000,
                specular: 0xffff00 ,
                displacementMap: canvasTexture,
                displacementScale: -0.1,
								displacementBias: 0.0,
								//map: canvasTexture,
                bumpMap: canvasTexture,
                bumpScale: -0.1,
                skinning: true,
                envMap: ringCamera.renderTarget.texture ,
                wireframe: false
            });
//new THREE.BufferGeometry().fromGeometry( geometry )
    newRing = new THREE.Mesh( geometry.clone(), ringMaterial );
    newRing.geometry.name = "newRing";
    newRing.name = "newRing";
    newRing.position.set(0,0,0);
    //newRing.geometry.faceVertexUvs.splice(0,1);
    //change here to affect inner/outer side
    //newRing.geometry.faceVertexUvs.splice(0,1);
    //newRing.geometry.faceVertexUvs.move(3,0);
    newRing.geometry.faceVertexUvs[0] = newRing.geometry.faceVertexUvs[4];
    newRing.geometry.uvsNeedUpdate = true;
    newRing.rotation.x = -90 * Math.PI / 180;
    changeMaterial("gold");
    ringCamera.position.copy(newRing.position);
    scene.add(newRing);
    scene.add( ringCamera );
}

function setupSkyBox() {
    //own

    console.log("Setting up skybox");
    //var textures = getTexturesFromAtlasFile( "sun_temple_stripe.jpg", 6 );
    //var textures = getTexturesFromAtlasFile( "studio_panorama.jpg", 6 );
    var materials = new THREE.MeshBasicMaterial();
    //materials.map = THREE.ImageUtils.loadTexture("studio_panorama.jpg");


    var loader = new THREE.TextureLoader();

    loader.load(
        // resource URL
        'studio_panorama.jpg',
        // Function when resource is loaded
        function ( texture ) {
            // do something with the texture
            //		materials.map = texture;
            //materials.map = texture;
            materials = new THREE.MeshBasicMaterial( {
                map: texture
            } );

            var sphere = new THREE.SphereGeometry(10, 10, 40);
            sphere.applyMatrix(new THREE.Matrix4().makeScale(-1, 1, 1));

            skyBox = new THREE.Mesh(sphere, materials);
            scene.add( skyBox );
        });
}

function loadObject( data ) {
    console.log("Loading object");
    //setupScene();
    var loader = new THREE.ObjectLoader();
    scene = loader.parse( data );

    var hasLights = false;

    // TODO: RectAreaLight support
    var lights = ['AmbientLight', 'DirectionalLight',
        'PointLight', 'SpotLight', 'RectAreaLight', 'HemisphereLight'];

    var cameras = ['OrthographicCamera', 'PerspectiveCamera'];

    for ( var i = 0; i < scene.children.length; i ++ ) {

        var lightIndex = lights.indexOf( scene.children[ i ].type );

        if ( lightIndex > -1 ) {

            hasLights = true;
            continue;

        }

        var cameraIndex = cameras.indexOf( scene.children[ i ].type );

        if ( cameraIndex > -1 ) {

            camera = scene.children[ i ];
            var container = document.getElementById( 'viewport' );

            orbit = new THREE.OrbitControls( camera, container );
            orbit.addEventListener( 'change', render );
            //orbit.autoRotate=true;
            orbit.enableDamping=true;
            orbit.dampingFactor = 0.1;
            orbit.maxDistance = 10
            orbit.autoRotate = false;
            // stop autorotate after the first interaction
            orbit.addEventListener('start', function(){
                orbit.autoRotate = false;
            });

            orbit.addEventListener( 'change', render );

            var aspect = container.offsetWidth / container.offsetHeight;
            camera.aspect = aspect;
            camera.updateProjectionMatrix();
        }

        if( scene.children[i].name == "Ring") {
            addGoldRing(scene.children[i].geometry);
            scene.remove(scene.children[i]);

        }
    }

    if ( ! ( hasLights ) ) setupLights();

    //scene.add( new THREE.GridHelper( 10, 10 ) );

    //render();


}

function loadGeometry( data, url ) {

    var loader = new THREE.JSONLoader();
    var texturePath = THREE.Loader.prototype.extractUrlBase( url );
    data = loader.parse( data, texturePath );

    if ( data.materials === undefined ) {

        console.log('using default material');
        data.materials = [new THREE.MeshLambertMaterial( { color: 0xb8b8b8 } )];

    }

    var mesh;

    if ( data.geometry.animations !== undefined && data.geometry.animations.length > 0 ) {

        console.log( 'loading animation' );
        data.materials[ 0 ].skinning = true;
        mesh = new THREE.SkinnedMesh( data.geometry, data.materials, false );

        mixer = new THREE.AnimationMixer( mesh );
        animation =  mixer.clipAction( mesh.geometry.animations[ 0 ] );

    } else {

        mesh = new THREE.Mesh( data.geometry, data.materials );

        if ( data.geometry.morphTargets.length > 0 ) {

            console.log( 'loading morph targets' );
            data.materials[ 0 ].morphTargets = true;

            mixer = new THREE.AnimationMixer( mesh );
            animation = mixer.clipAction( mesh.geometry.animations[ 0 ] );
            hasMorph = true;

        }
        animate();

    }

    setupScene();
    setupLights();
    scene.add( mesh );

    if ( animation != null ) {
    //if(true) {

        console.log( 'playing animation' );
        animation.play();
        animate();

    } else {

        render();

    }
}

function loadBufferGeometry( data ) {

    var loader = new THREE.BufferGeometryLoader();

    var bufferGeometry = loader.parse( data );

    var material = new THREE.MeshLambertMaterial( { color: 0xb8b8b8 } );
    var mesh = new THREE.Mesh( bufferGeometry, material );
    setupScene();
    setupLights();
    scene.add( mesh );

    render();

}

function loadData( data, url ) {
		setupSkyBox();
    if ( data.metadata.type === 'Geometry' ) {

        loadGeometry( data, url );

    } else if ( data.metadata.type === 'Object' ) {

        loadObject( data );

    } else if ( data.metadata.type === 'BufferGeometry' ) {

        loadBufferGeometry( data );

    } else {

        console.warn( 'can not determine type' );

    }
		//Animate
		animate();

}

function init( url ) {

    container = document.createElement( 'div' );
    container.id = 'viewport';
    document.body.appendChild( container );

    renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true  } );
    renderer.setSize( container.offsetWidth, container.offsetHeight );
    renderer.setClearColor( 0x000000, 0 );
    container.appendChild( renderer.domElement );
    renderer.gammaInput = true;
    renderer.gammaOutput = true;

    var aspect = container.offsetWidth / container.offsetHeight;
    camera = new THREE.PerspectiveCamera( 50, aspect, 0.01, 50 );
    orbit = new THREE.OrbitControls( camera, container );
    orbit.addEventListener( 'change', render );

    //orbit.autoRotate = true;
    camera.position.z = 5;
    camera.position.x = 5;
    camera.position.y = 5;
    var target = new THREE.Vector3( 0, 1, 0 );
    camera.lookAt( target );
    orbit.target = target;
    camera.updateProjectionMatrix();

    window.addEventListener( 'resize', onWindowResize, false );

    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function ( x ) {

        if ( xhr.readyState === xhr.DONE ) {

            if ( xhr.status === 200 || xhr.status === 0  ) {

                loadData( JSON.parse( xhr.responseText ), url );

            } else {

                console.error( 'could not load json ' + xhr.status );

            }

        }

    };
    xhr.open( 'GET', url, true );
    xhr.withCredentials = false;
    xhr.send( null );
    parent.document.getElementById( "exportSTL" ).setAttribute( "onClick", "javascript: exportSTL(document.getElementById('viewer').contentWindow.scene);" );
    parent.document.getElementById( "resetCanvas" ).setAttribute( "onClick", "javascript: resetCanvas();" );
    parent.document.getElementById( "drawBothSides").setAttribute( "onClick", "javascript: changeDrawingOutput();" );
		parent.document.getElementById( "mirrorInside").setAttribute( "onClick", "javascript: changeDrawingOutput();" );
    initializeImageUploader();
    initializeSlider();
    initializeMenuDropdown();

}

function getTexturesFromAtlasFile( atlasImgUrl, tilesNum ) {
    var textures = [];
    for ( var i = 0; i < tilesNum; i ++ ) {
        textures[ i ] = new THREE.Texture();
    }
    var imageObj = new Image();
    imageObj.onload = function() {
        var canvas, context;
        var tileWidth = imageObj.height;
        for ( var i = 0; i < textures.length; i ++ ) {
            canvas = document.createElement( 'canvas' );
            context = canvas.getContext( '2d' );
            canvas.height = tileWidth;
            canvas.width = tileWidth;
            context.drawImage( imageObj, tileWidth * i, 0, tileWidth, tileWidth, 0, 0, tileWidth, tileWidth );
            textures[ i ].image = canvas
            //textures.side = THREE.BackSide;
            textures[ i ].needsUpdate = true;
        }
    };
    imageObj.src = atlasImgUrl;
    return textures;
}

function exportSTL(scene) {
    console.log("Exporting model");
    var exporter = new THREE.STLBinaryExporter();
    //var stlString = exporter.parse( scene );
    var newRing = scene.getObjectByName( "newRing" );
    var canvasTexture = new THREE.Texture(parent.document.getElementById('drawCanvas'));
    var buff = new THREE.BufferGeometry().fromGeometry( newRing.geometry );
    var exportRing = new THREE.Mesh(new THREE.BufferGeometry().fromGeometry( newRing.geometry ));
    applyDisplacementMap(exportRing, canvasTexture, 0,newRing.material.displacementScale);
    //createModifiedGeometry(newRing);
    var stlString = exporter.parse( exportRing);
    var blob = new Blob([stlString], {type: 'text/plain'});
	newRing.geometry.fromBufferGeometry(exportRing.geometry);
	newRing.geometry.needsUpdate = true;
    newRing.material.needsUpdate = true;

    //alert(stlString);
	saveAs(blob, "model.stl");
}

function resetCanvas() {
    var canvas = parent.document.getElementById('drawCanvas');
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0,0,1024,256);
}

function changeDrawingOutput() {
    var scene = document.getElementById('viewer').contentWindow.scene
    var newRing = scene.getObjectByName( "newRing" );
    var drawBothSides = parent.document.getElementById('drawBothSides');
    var canvas = parent.document.getElementById('drawCanvas');
		var mirrorInside = parent.$('#mirrorInside')[0];
    if(drawBothSides.checked && !(currentUvLayout==UvLayout.INSIDE))
    {
			//drawing on Both sides
			 newRing.geometry.faceVertexUvs[0] = newRing.geometry.faceVertexUvs[1];
        currentUvLayout = UvLayout.INSIDE;
        canvas.style.background ="url('layout.jpg')"
				mirrorInside.disabled = false;
    }
    if( !drawBothSides.checked && !(currentUvLayout==UvLayout.OUTSIDE))
    {
			//drawing on outside only
				newRing.geometry.faceVertexUvs[0] = newRing.geometry.faceVertexUvs[4];
        currentUvLayout = UvLayout.OUTSIDE;
        canvas.style.background ="url('layout_outside.jpg')"
				mirrorInside.disabled = true;
    }
		if(drawBothSides.checked && mirrorInside.checked && !(currentUvLayout==UvLayout.OUTSIDE_MIRRORED))
		{
			//drawing on Both sides, inside mirrored
				newRing.geometry.faceVertexUvs[0] = newRing.geometry.faceVertexUvs[3];
				currentUvLayout = UvLayout.OUTSIDE_MIRRORED;
		}
		newRing.geometry.elementsNeedUpdate = true;
}

function initializeMenuDropdown() {
this.parent.$('.dropdownMenuItems a').on('click', function () {
    var id = $(this).attr('id');
    changeMaterial(id);
});
}

function changeMaterial(material) {
    switch(material) {
        case "gold":
            console.log("Changing to gold");
//            newRing.material.color = "#ffd700";
//            newRing.material.specular = "#ffff00";
//newRing.material.color.r = 0.286;
//newRing.material.color.g = 0.264;
//newRing.material.color.b = 0.136;
//newRing.material.color.r = 1;
//newRing.material.color.g = 0.88;
//newRing.material.color.b = 0.25;
newRing.material.color = new THREE.Color(0xffd700);
newRing.material.specular = new THREE.Color("rgb(100%, 96%, 65.6%)");
            break;
        case "silver":
            console.log("Changing to silver");
newRing.material.color = new THREE.Color("rgb(67.5%, 67.5%, 75%)");
newRing.material.specular = new THREE.Color(0xffffff);
            break;

    }
}

function createModifiedGeometry(object) {
		//canvasTexture
        canvasTexture = new THREE.Texture(parent.document.getElementById('drawCanvas'));
    //var loader = new THREE.BufferGeometryLoader();
    //newRing = new THREE.Mesh( geometry.clone(), ringMaterial );
		//var newGeometry = new THREE.Geometry();
		var geometry = object.geometry;
		  for (var i = 0; i < geometry.vertices.length; i++) {
        var vertex = geometry.vertices[i];
        //vertex.z += 1;
        //vertex *= 1.01;
		//vertex += normalize( objectNormal ) * ( texture2D( object.material.displacementMap, object.geometry.facevertexuvs[0] ).x * object.material.displacementScale + object.material.displacementBias );
		//vertex +=  ( texture2D( object.material.displacementMap, object.geometry.facevertexuvs[0] ).x * object.material.displacementScale + object.material.displacementBias );
		//vertex.x +=  ( vertex.x * object.material.displacementScale + object.material.displacementBias );
              var number = Number(object.material.displacementBias );
		//vertex.x +=  ( object.material.displacementMap * object.material.displacementScale + Number(object.material.displacementBias ));
		//vertex =  ( vertex.add(number));
		//( vertex.addScalar(number));
		vertex.x += geometry.__directGeometry.normals[i].x * Number(object.material.displacementScale) +  Number(object.material.displacementBias);
		vertex.y += geometry.__directGeometry.normals[i].y * Number(object.material.displacementScale) +  Number(object.material.displacementBias);
		vertex.z += geometry.__directGeometry.normals[i].z * Number(object.material.displacementScale) +  Number(object.material.displacementBias);
		//vertex.x +=  0.1;
//              vertex.normalize();
				geometry.vertices[i] = vertex;
//newGeometry.vertices.push( new THREE.Vector3( widthsize, heightsize, 0 ) );
//newGeometry.vertices.push( vertex );
    }
    geometry.normalize();
		//transformed += normalize( objectNormal ) * ( texture2D( displacementMap, uv ).x * displacementScale + displacementBias );
				//	"vec3 dv = texture2D( tDisplacement, uv ).xyz;",
				//	"float df = uDisplacementScale * dv.x + uDisplacementBias;",
				//	"vec4 displacedPosition = vec4( vNormal.xyz * df, 0.0 ) + mvPosition;",
}

function initializeImageUploader() {
    var imageLoader = parent.document.getElementById('imageLoader');
    imageLoader.addEventListener('change', handleImage, false);
    imageLoader.addEventListener('click', function() { this.value = null; }, false);

}

function initializeSlider() {
  var slider = parent.document.getElementById('displacementRange');
	var sliderOffset = parent.document.getElementById('displacementOffset');
  var label = parent.document.getElementById('labelDisplacementRange');
	var labelOffset = parent.document.getElementById('labelDisplacementOffset');
label.textContent = "Displacement = " + slider.value + " mm";
  slider.addEventListener('change', function() { label.textContent = "Displacement = " + this.value + " mm"; }, false);
	sliderOffset.addEventListener('change', function() { labelOffset.textContent = "Displacement offset = " + this.value + " mm"; }, false);
}


function handleImage(e){
    var canvas = parent.document.getElementById('drawCanvas');
    var ctx = canvas.getContext('2d');
    var reader = new FileReader();
    reader.onload = function(event){
        var img = new Image();
        img.onload = function(){
            //canvas.width = img.width;
            //canvas.height = img.height;
            var hRatio = canvas.width / img.width    ;
            var vRatio = canvas.height / img.height  ;
            var ratio  = Math.min ( hRatio, vRatio );
            //ctx.drawImage(img,0,0);
            ctx.drawImage(img, 0,0, img.width, img.height, 0,0,img.width*ratio, img.height*ratio);
        }
        img.src = event.target.result;
    }
    reader.readAsDataURL(e.target.files[0]);
}

Array.prototype.move = function(from, to) {
    this.splice(to, 0, this.splice(from, 1)[0]);
};

function applyDisplacementMap(mesh, heightMap, minHeight, maxHeight) {
    var uvs = mesh.geometry.attributes.uv.array;
    var positions = mesh.geometry.attributes.position.array;
    var normals = mesh.geometry.attributes.normal.array;
    var position = new THREE.Vector3();
    var normal = new THREE.Vector3();
    var uv = new THREE.Vector2();
    var width = heightMap.image.width;
    var height = heightMap.image.height;
    var canvas = parent.document.getElementById('drawCanvas');
    var context = canvas.getContext('2d');

    var buffer = context.getImageData(0, 0, width, height).data;
    for(var index = 0; index < positions.length; index+=3) {
        position.fromArray(positions,index);
        normal.fromArray(normals,index);
        uv.fromArray(uvs,((index/3)*2));
        var u = ((Math.abs(uv.x)*width)%width) | 0;
        var v = ((Math.abs(uv.y)*height)%height) | 0;
        var pos = (u+v*width) * 4;
        var r = buffer[pos] / 255.0;
        var g = buffer[pos + 1] / 255.0;
        var b = buffer[pos + 2] / 255.0;
        var gradient = r * 0.33 + g * 0.33 + b * 0.33;
        normal.normalize();
        normal.multiplyScalar(minHeight + (maxHeight - minHeight) * gradient);
        position = position.add(normal);
        position.toArray(positions, index);
    }
    mesh.geometry.needsUpdate = true;

}

/*function applyDisplacementMap(mesh, heightMap, minHeight, maxHeight) {
    var uvs = mesh.geometry.faceVertexUvs[0];
    var positions = mesh.geometry.vertices;
    var normals = mesh.geometry.faces;

    var normal = new THREE.Vector3();
    var uv = new THREE.Vector2();
    var width = heightMap.image.width;
    var height = heightMap.image.height;
    var canvas = parent.document.getElementById('drawCanvas');
    var context = canvas.getContext('2d');
    var buffer = context.getImageData(0, 0, width, height).data;
    for(var index = 0; index < positions.length; index++) {
        var position = new THREE.Vector3();
        position = positions[index];
        normal = normals[index].normal;
        uv.fromArray(uvs,(index)*2);
        var u = ((Math.abs(uv.x)*width)%width) | 0;
        var v = ((Math.abs(uv.y)*height)%height) | 0;
        var pos = (u+v*width) * 4;
        var r = buffer[pos] / 255.0;
        var g = buffer[pos + 1] / 255.0;
        var b = buffer[pos + 2] / 255.0;
        var gradient = r * 0.33 + g * 0.33 + b * 0.33;
        normal.normalize();
        normal.multiplyScalar(minHeight + (maxHeight - minHeight) * gradient);
        position = position.add(normal);
        positions[index].copy(position);
    }
    mesh.geometry.needsUpdate = true;
}*/
