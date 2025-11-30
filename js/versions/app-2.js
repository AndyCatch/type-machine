let font
let tilesX = 4
let tilesY = 4
let tileW, tileH
let vw // 1% of window width

// Composite offscreen graphics (merged repeats)
let compositeBuffer

// UI / params
let pane // Tweakpane instance
let visible = true // UI visibility toggle

// Sketch state
let message = 'BASS'
let multiplier = 100
let wave = 0.125
let wordRepeat = 3
let fontsize = 30

// Color state (HSL hue only; background is complementary)
let textHue = 80
let backgroundColor = textHue + 180
let hslCol

// Debounce for re-rendering composite graphics
let updateGraphicsTimeout

// --- Tweakpane params object (single source of truth for UI) ---
const params = {
	textSize: 30, // 10..45 step1
	colorHue: 80, // 0..360 step20
	repeats: 3, // 1..9 step1
	track: 'BASS', // dropdown
	numColumns: 4, // 2..80 step2
	numRows: 4, // 2..80 step2
	amplitude: 100, // 50..500 step10
	tempo: 0.025, // 0.025..0.55 step0.025
}

function preload() {
	font = loadFont('font/graphik-medium.otf')
}

function setup() {
	colorMode(HSL)
	frameRate(30)

	vw = window.innerWidth * 0.01
	tileW = windowWidth / tilesX
	tileH = windowHeight / tilesY

	pixelDensity(1)
	createCanvas(windowWidth, windowHeight)

	// Seed sketch state from params
	applyParamsToState()
	setUpGraphics()

	// Build Tweakpane UI
	setupPane()
}

function setupPane() {
	// Create pane
	pane = new Tweakpane.Pane({ title: 'Controls' })

	// You can group controls in folders (nice for organization)
	const layout = pane.addFolder({ title: 'Layout', expanded: true })
	const style = pane.addFolder({ title: 'Style', expanded: true })
	const motion = pane.addFolder({ title: 'Motion', expanded: true })

	// --- Inputs ---
	style
		.addInput(params, 'textSize', {
			label: 'Text Size',
			min: 10,
			max: 45,
			step: 1,
		})
		.on('change', (ev) => {
			fontsize = ev.value
			debounceSetUpGraphics()
		})

	style
		.addInput(params, 'colorHue', {
			label: 'Color Hue',
			min: 0,
			max: 360,
			step: 20,
		})
		.on('change', (ev) => {
			textHue = ev.value
			debounceSetUpGraphics()
		})

	style
		.addInput(params, 'repeats', {
			label: 'Repeats',
			min: 1,
			max: 9,
			step: 1,
		})
		.on('change', (ev) => {
			wordRepeat = ev.value
			debounceSetUpGraphics()
		})

	style
		.addInput(params, 'track', {
			label: 'Track',
			options: {
				BASS: 'BASS',
				SNARE: 'SNARE',
				KICK: 'KICK',
				PERC: 'PERC',
				ARPEG: 'ARPEG',
				LEAD: 'LEAD',
				CHORD: 'CHORD',
			},
		})
		.on('change', (ev) => {
			message = ev.value
			debounceSetUpGraphics()
		})

	layout
		.addInput(params, 'numColumns', {
			label: 'Num Columns',
			min: 2,
			max: 80,
			step: 2,
		})
		.on('change', (ev) => {
			tilesX = ev.value
			// tile sizes update in draw()
		})

	layout
		.addInput(params, 'numRows', {
			label: 'Num Rows',
			min: 2,
			max: 80,
			step: 2,
		})
		.on('change', (ev) => {
			tilesY = ev.value
			// tile sizes update in draw()
		})

	motion
		.addInput(params, 'amplitude', {
			label: 'Amplitude',
			min: 50,
			max: 500,
			step: 10,
		})
		.on('change', (ev) => {
			multiplier = ev.value
		})

	motion
		.addInput(params, 'tempo', {
			label: 'Tempo',
			min: 0.025,
			max: 0.55,
			step: 0.025,
		})
		.on('change', (ev) => {
			wave = ev.value
		})
}

function applyParamsToState() {
	fontsize = params.textSize
	textHue = params.colorHue
	wordRepeat = params.repeats
	message = params.track
	tilesX = params.numColumns
	tilesY = params.numRows
	multiplier = params.amplitude
	wave = params.tempo
}

function debounceSetUpGraphics() {
	if (updateGraphicsTimeout) clearTimeout(updateGraphicsTimeout)
	updateGraphicsTimeout = setTimeout(setUpGraphics, 100)
}

function setUpGraphics() {
	// update complementary background given current hue
	if (textHue < 180 || textHue === 0) {
		backgroundColor = textHue + 180
	} else {
		backgroundColor = textHue - 180
	}

	hslCol = color(`hsl(${textHue}, 100%, 50%)`)

	// composite buffer with all repeats merged
	compositeBuffer = createGraphics(windowWidth, windowHeight)
	compositeBuffer.push()
	compositeBuffer.textFont(font)
	compositeBuffer.textSize(vw * fontsize)
	compositeBuffer.translate(windowWidth / 2, windowHeight / 2)
	compositeBuffer.textAlign(CENTER, CENTER)

	// base filled layer
	compositeBuffer.noStroke()
	compositeBuffer.fill(hslCol)
	compositeBuffer.text(message, 0, 0)

	// additional offset stroked layers
	for (let i = 1; i < wordRepeat; i++) {
		compositeBuffer.noFill()
		compositeBuffer.stroke(hslCol)
		compositeBuffer.strokeWeight(3)
		compositeBuffer.text(message, i * 200, i * -100)
	}
	compositeBuffer.pop()
}

function draw() {
	// recompute responsive units
	vw = window.innerWidth * 0.01
	tileW = windowWidth / tilesX
	tileH = windowHeight / tilesY

	background(color(`hsl(${backgroundColor}, 100%, 20%)`))

	// precompute time for inner loops
	const baseTime = frameCount * wave

	for (let yDir = 0; yDir < tilesY; yDir++) {
		for (let xDir = 0; xDir < tilesX; xDir++) {
			const distortionX =
				tan(baseTime * 0.125 + xDir * wave + yDir * wave) * multiplier
			const distortionY = tan(baseTime * 0.5 + xDir * yDir * wave) * multiplier

			// source rect
			const sx = xDir * tileW + distortionX
			const sy = yDir * tileH + distortionY
			const sw = tileW
			const sh = tileH

			// destination rect
			const dx = xDir * tileW
			const dy = yDir * tileH
			const dw = tileW
			const dh = tileH

			image(compositeBuffer, dx, dy, dw, dh, sx, sy, sw, sh)
		}
	}
}

function windowResized() {
	resizeCanvas(windowWidth, windowHeight)
	vw = window.innerWidth * 0.01
	setUpGraphics()
}

// Toggle UI with UP_ARROW (same behavior as before)
function keyPressed() {
	if (keyCode === UP_ARROW && pane && pane.element) {
		visible = !visible
		pane.element.style.display = visible ? 'block' : 'none'
	}
	return false
}
