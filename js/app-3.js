import { setupPane } from './paneSetup.js'

let font
let tilesX = 4
let tilesY = 4
let tileW, tileH
let vw = window.innerWidth * 0.01 // 1% of window width

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

let sineInfluence = 2.125

// Color state (HSL hue only; background is complementary)
let textHue = randomInt(1, 360)
let backgroundColor = textHue + 180
let hslCol

// Debounce for re-rendering composite graphics
let updateGraphicsTimeout

// --- Looping Noise helpers ---
let noiseCenterX = 1000 // big offsets so seeds feel different from origin
let noiseCenterY = 2000

// --- Tweakpane params object (single source of truth for UI) ---
const params = {
	sineInfluence: 2.125,

	textSize: 30, // 10..45 step1
	colorHue: randomInt(1, 360), // 0..360 step20
	repeats: 3, // 1..9 step1
	track: 'BASS', // dropdown
	numColumns: 4, // 2..80 step2
	numRows: 4, // 2..80 step2
	amplitude: 100, // 50..500 step10
	tempo: 0.1, // 0.025..0.55 step0.025

	mode: 'Noise Loop', // 'Sine' | 'Noise Loop' | 'Sweep'

	// Looping noise controls
	loopSeconds: 5, // how long the loop lasts (in seconds)
	fps: 30, // your render framerate (for precise loops)
	noiseRadius: 1.25, // how far we travel around the noise circle
	noiseScale: 0.003, // zoom into noise: smaller = smoother, larger = more detail
	noiseAmp: 1.0, // scale the noise output before amplitude multiplier
	seed: 1, // reseed noise
}

function randomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min
}

function preload() {
	font = loadFont('font/graphik-medium.otf')
}

function setup() {
	// console.log()
	colorMode(HSL)
	frameRate(params.fps)

	vw = window.innerWidth * 0.01
	tileW = windowWidth / tilesX
	tileH = windowHeight / tilesY

	pixelDensity(1)
	createCanvas(windowWidth, windowHeight)

	// Seed sketch state from params
	applyParamsToState()
	setUpGraphics()

	// baseline noise settings
	noiseSeed(params.seed)
	noiseDetail(4, 0.5)

	// Build Tweakpane UI
	pane = setupPane(params, {
		onTextSizeChange: (value) => {
			fontsize = value
			debounceSetUpGraphics()
		},
		onColorHueChange: (value) => {
			textHue = value
			debounceSetUpGraphics()
		},
		onRepeatsChange: (value) => {
			wordRepeat = value
			debounceSetUpGraphics()
		},
		onTrackChange: (value) => {
			message = value
			debounceSetUpGraphics()
		},
		onColumnsChange: (value) => {
			tilesX = value
		},
		onRowsChange: (value) => {
			tilesY = value
		},
		onSineInfluenceChange: (value) => {
			sineInfluence = value
		},
		onAmplitudeChange: (value) => {
			multiplier = value
		},
		onTempoChange: (value) => {
			wave = value
		},
		onFpsChange: (value) => frameRate(value),
		onSeedChange: (value) => noiseSeed(value),
	})

	setUpEffects()
}

function applyParamsToState() {
	sineInfluence = params.sineInfluence
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
	updateGraphicsTimeout = setTimeout(setUpGraphics, 50)
}

function setUpEffects() {
	// effects, not working with windowResize?
	addEffects(
		// contrast(2),
		noiseDisplacement(10),
		celShade(2)
		// edge())
	)
	addChannels(null)
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
	/*------- DEBUG WRAPPER -------- */
	// compositeBuffer.background('rgba(255, 0, 0, 0.4)')
	// compositeBuffer.stroke('red')
	// compositeBuffer.strokeWeight(4)
	/*------- DEBUG WRAPPER -------- */
	compositeBuffer.textFont(font)
	compositeBuffer.textSize(vw * fontsize)
	compositeBuffer.translate(windowWidth / 2, windowHeight / 2)
	compositeBuffer.textAlign(CENTER, CENTER)

	// base filled layer
	compositeBuffer.noStroke()
	compositeBuffer.fill(hslCol)
	compositeBuffer.text(message, 0, 0) // sets position of first text layer

	// additional offset stroked layers
	for (let i = 1; i < wordRepeat; i++) {
		compositeBuffer.noFill()
		compositeBuffer.stroke(hslCol)
		compositeBuffer.strokeWeight(3)
		const randX = random(-windowWidth / 2, windowWidth / 2)
		const randY = random(-windowHeight / 2, windowHeight / 2)
		compositeBuffer.text(message, randX, randY)
	}
	compositeBuffer.pop()
}

/**
 * Return a perfectly looping noise value in [-1, 1]
 * t: 0..1 loop phase
 * phase: optional per-axis phase
 */
function loopNoise(t, phase = 0) {
	const theta = TWO_PI * t + phase
	// travel around a circle in noise space
	const nx = noiseCenterX + cos(theta) * (params.noiseRadius / params.noiseScale)
	const ny = noiseCenterY + sin(theta) * (params.noiseRadius / params.noiseScale)
	// p5 noise returns [0,1] — remap to [-1,1]
	return noise(nx * params.noiseScale, ny * params.noiseScale) * 2 - 1
}

function draw() {
	// responsive
	vw = window.innerWidth * 0.01
	tileW = windowWidth / tilesX
	tileH = windowHeight / tilesY

	background(color(`hsl(${backgroundColor}, 100%, 20%)`))

	// time keeping for perfect loop
	const loopFrames = max(1, floor(params.loopSeconds * params.fps))
	const frameInLoop = frameCount % loopFrames
	const t = frameInLoop / loopFrames // 0..1

	// precompute sine base time (quantized cycles per loop to stay perfectly looping)
	const sineCycles = max(1, round(params.tempo * 8)) // 1..4 cycles based on tempo
	const baseTime = TWO_PI * sineCycles * t
	const sweepPhase = TWO_PI * t

	for (let yDir = 0; yDir < tilesY; yDir++) {
		for (let xDir = 0; xDir < tilesX; xDir++) {
			// Left to right motion
			// const sineX = tan(baseTime + xDir * wave + yDir * wave)
			// const sineY = tan(baseTime * 0.5 + xDir * yDir * wave)

			// Circular-ish motion
			let sineX = sin(baseTime + xDir * wave + yDir * wave) * sineInfluence
			let sineY = cos(baseTime + HALF_PI + xDir * yDir * wave) * sineInfluence

			// Looping noise distortions (stable loop)
			// add small index-based phase offsets so tiles don't all move identically
			const phaseX = (xDir * 0.15 + yDir * 0.07) * TWO_PI
			const phaseY = (xDir * 0.09 + yDir * 0.21) * TWO_PI

			const nX = loopNoise(t, phaseX) * params.noiseAmp
			const nY = loopNoise(t, phaseY) * params.noiseAmp

			// Sweeping (mostly horizontal) loop
			const sweepX = tan(sweepPhase + xDir * wave * 0.5 + yDir * wave * 0.25) * sineInfluence
			const sweepY = tan(sweepPhase * 0.5 + (xDir + yDir) * wave * 0.1) * (sineInfluence * 0.35)

			// Select mode / blend
			let dX, dY
			if (params.mode === 'Sine') {
				dX = sineX
				dY = sineY
			} else if (params.mode === 'Sweep') {
				dX = sweepX
				dY = sweepY
			} else {
				dX = nX
				dY = nY
			}

			const distortionX = dX * multiplier
			const distortionY = dY * multiplier

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

// Need this to expose p5 functions in module context
Object.assign(window, { preload, setup, draw, windowResized, keyPressed })
