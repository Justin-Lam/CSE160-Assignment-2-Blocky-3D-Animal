const VSHADER_SOURCE = `
	attribute vec4 a_Position;
	uniform mat4 u_ModelMatrix;
	uniform mat4 u_GlobalRotationMatrix;
	void main() {
		gl_Position = u_GlobalRotationMatrix * u_ModelMatrix * a_Position;
	}
`;
const FSHADER_SOURCE = `
	precision mediump float;
	uniform vec4 u_FragColor;
	void main() {
		gl_FragColor = u_FragColor;
	}
`;

let canvas;
let gl;
let a_Position;
let u_ModelMatrix;
let u_FragColor;
let u_GlobalRotationMatrix;

function getCanvasAndContext() {
	canvas = document.getElementById("webgl");
	gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
	if (!gl) {
		throw new Error("Failed to get the rendering context for WebGL");
	}
	gl.enable(gl.DEPTH_TEST);
}

function compileShadersAndConnectVariables() {
	if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
		throw new Error("Failed to intialize shaders");
	}

	const identity = new Matrix4();

	a_Position = gl.getAttribLocation(gl.program, "a_Position");
	if (a_Position < 0) {
		throw new Error("Failed to get the storage location of a_Position");
	}

	u_ModelMatrix = gl.getUniformLocation(gl.program, "u_ModelMatrix");
	if (!u_ModelMatrix) {
		throw new Error("Failed to get the storage location of u_ModelMatrix");
	}
	gl.uniformMatrix4fv(u_ModelMatrix, false, identity.elements);

	u_FragColor = gl.getUniformLocation(gl.program, "u_FragColor");
	if (!u_FragColor) {
		throw new Error("Failed to get the storage location of u_FragColor");
	}

	u_GlobalRotationMatrix = gl.getUniformLocation(gl.program, "u_GlobalRotationMatrix");
	if (!u_GlobalRotationMatrix) {
		throw new Error("Failed to get the storage location of u_GlobalRotationMatrix");
	}
	gl.uniformMatrix4fv(u_GlobalRotationMatrix, false, identity.elements);
}

let g_globalRotation = 0;
let g_headRotation = 0;
let g_animation_enabled_head = false;
let g_tongueRotation = 0;
let g_animation_enabled_tongue = false;
let g_leg_front_leftRotation = 0;
let g_leg_front_rightRotation = 0;
let g_leg_back_leftRotation = 0;
let g_leg_back_rightRotation = 0;
let g_animation_enabled_legs = false;

function createUIEvents() {
	document.getElementById("globalRotationSlider").addEventListener("mousemove", function() {
		g_globalRotation = this.value;
		renderAllShapes();
	});

	document.getElementById("headRotationSlider").addEventListener("mousemove", function() {
		g_headRotation = this.value;
		renderAllShapes();
	});
	document.getElementById("toggleAnimationButton_Head").onclick = () => g_animation_enabled_head = !g_animation_enabled_head;
	document.getElementById("tongueRotationSlider").addEventListener("mousemove", function() {
		g_tongueRotation = this.value;
		renderAllShapes();
	});
	document.getElementById("toggleAnimationButton_Tongue").onclick = () => g_animation_enabled_tongue = !g_animation_enabled_tongue;

	document.getElementById("leg_front_leftRotationSlider").addEventListener("mousemove", function() {
		g_leg_front_leftRotation = this.value;
		renderAllShapes();
	});
	document.getElementById("leg_front_rightRotationSlider").addEventListener("mousemove", function() {
		g_leg_front_rightRotation = this.value;
		renderAllShapes();
	});
	document.getElementById("leg_back_leftRotationSlider").addEventListener("mousemove", function() {
		g_leg_back_leftRotation = this.value;
		renderAllShapes();
	});
	document.getElementById("leg_back_rightRotationSlider").addEventListener("mousemove", function() {
		g_leg_back_rightRotation = this.value;
		renderAllShapes();
	});
	document.getElementById("toggleAnimationButton_Legs").onclick = () => g_animation_enabled_legs = !g_animation_enabled_legs;
}

function main() {
	getCanvasAndContext();
	compileShadersAndConnectVariables();
	createUIEvents();
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	requestAnimationFrame(tick);
}

const g_startTime = currentTime();
let g_elapsedTime = 0;
function currentTime() {
	return performance.now() / 1000.0;
}
function tick() {
	g_elapsedTime = currentTime() - g_startTime;
	updateAnimationAngles();
	renderAllShapes();
	requestAnimationFrame(tick);
}

function updateAnimationAngles() {
	if (g_animation_enabled_head) {
		g_headRotation = 45 * Math.sin(g_elapsedTime);
	}
	if (g_animation_enabled_tongue) {
		g_tongueRotation = 30 * Math.sin(g_elapsedTime * 20);
	}
	if (g_animation_enabled_legs) {
		g_leg_front_leftRotation = 45 * Math.sin(g_elapsedTime * 4);
		g_leg_back_leftRotation = 45 * Math.sin(g_elapsedTime * 4);
		g_leg_front_rightRotation = 45 * Math.sin(g_elapsedTime * 4 + Math.PI);
		g_leg_back_rightRotation = 45 * Math.sin(g_elapsedTime * 4 + Math.PI);
	}
}

function renderAllShapes() {
	const globalRotationMatrix = new Matrix4();
	globalRotationMatrix.rotate(g_globalRotation, 0, 1, 0);
	gl.uniformMatrix4fv(u_GlobalRotationMatrix, false, globalRotationMatrix.elements);

	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	const body = new Cube();
	body.color = [1, 0, 0.8, 1];	// pink
	body.matrix.translate(-0.25, -0.25, 0);
	body.matrix.scale(0.5, 0.5, 1);
	body.render();

	const leg_front_left = new Cube();
	leg_front_left.color = [1, 0, 0, 1];	// red
	leg_front_left.matrix.translate(0.15, -0.2, 0.2);
	leg_front_left.matrix.rotate(-g_leg_front_leftRotation, 1, 0, 0);
	leg_front_left.matrix.scale(0.2, 0.3, 0.2);
	leg_front_left.matrix.translate(-0.5, -1, -0.5);
	leg_front_left.render();

	const leg_front_right = new Cube();
	leg_front_right.color = [0, 0, 1, 1];	// blue
	leg_front_right.matrix.translate(-0.15, -0.2, 0.2);
	leg_front_right.matrix.rotate(-g_leg_front_rightRotation, 1, 0, 0);
	leg_front_right.matrix.scale(0.2, 0.3, 0.2);
	leg_front_right.matrix.translate(-0.5, -1, -0.5);
	leg_front_right.render();

	const leg_back_left = new Cube();
	leg_back_left.color = [1, 0, 0, 1];	// red
	leg_back_left.matrix.translate(0.15, -0.2, 0.95);
	leg_back_left.matrix.rotate(-g_leg_back_leftRotation, 1, 0, 0);
	leg_back_left.matrix.scale(0.2, 0.3, 0.2);
	leg_back_left.matrix.translate(-0.5, -1, -0.5);
	leg_back_left.render();

	const leg_back_right = new Cube();
	leg_back_right.color = [0, 0, 1, 1];	// blue
	leg_back_right.matrix.translate(-0.15, -0.2, 0.95);
	leg_back_right.matrix.rotate(-g_leg_back_rightRotation, 1, 0, 0);
	leg_back_right.matrix.scale(0.2, 0.3, 0.2);
	leg_back_right.matrix.translate(-0.5, -1, -0.5);
	leg_back_right.render();

	const head = new Cube();
	head.color = [1, 0.2, 0.8, 1];	// pink
	head.matrix.translate(0, 0.15, -0.3);
	head.matrix.rotate(g_headRotation, 0, 0, 1);
	let headCoordsMatrix = new Matrix4(head.matrix);
	head.matrix.scale(0.4, 0.4, 0.4);
	head.matrix.translate(-0.5, -0.5, 0);
	head.render();

	const eye_left = new Cube();
	eye_left.color = [0, 0, 0, 1];	// black
	eye_left.matrix = new Matrix4(headCoordsMatrix);
	eye_left.matrix.translate(0.05, 0, -0.025);
	eye_left.matrix.scale(0.1, 0.1, 0.1);
	eye_left.render();

	const eye_right = new Cube();
	eye_right.color = [0, 0, 0, 1];	// black
	eye_right.matrix = new Matrix4(headCoordsMatrix);
	eye_right.matrix.translate(-0.15, 0, -0.025);
	eye_right.matrix.scale(0.1, 0.1, 0.1);
	eye_right.render();

	const tongue = new Cube();
	tongue.color = [1, 0, 0, 1];	// red
	tongue.matrix = new Matrix4(headCoordsMatrix);
	tongue.matrix.translate(0, -0.15, 0.025);
	tongue.matrix.rotate(g_tongueRotation, 1, 0, 0);
	tongue.matrix.rotate(60, 1, 0, 0);
	tongue.matrix.scale(0.2, 0.2, 0.05);
	tongue.matrix.translate(-0.5, -1, -0.5);
	tongue.render();
}