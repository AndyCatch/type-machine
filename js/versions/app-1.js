let font
let tilesX = 4
let tilesY = 4
let tileW, tileH
let vw // 1% of window width

// Composite offscreen graphics
let compositeBuffer

// QuickSettings globals
let settings
let message = 'BASS' // Initial text
let multiplier = 100
let wave = 0.1
let wordRepeat = 3
let fontsize = 10
let visible = true

// Colors
let textHue = 80
let backgroundColor = textHue + 180
let hslCol

// Debounce timer for graphics update
let updateGraphicsTimeout

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

	// Initialize composite graphics
	setUpGraphics()

	// Setup QuickSettings (declared globally so key controls can toggle it)
	QuickSettings.useExtStyleSheet()
	settings = QuickSettings.create(20, 20, 'Controls')
		.addRange('Text Size', 10, 45, fontsize, 1, setTextSize)
		.addRange('Color', 0, 360, textHue, 20, setTextCol)
		.addRange('Repeats', 1, 20, wordRepeat, 1, setRepeater)
		.addDropDown(
			'Track',
			['BASS', 'SNARE', 'KICK', 'PERC', 'ARPEG', 'LEAD', 'CHORD'],
			setDropDown
		)
		.addRange('Num Columns', 2, 80, tilesX, 2, setTileX)
		.addRange('Num Rows', 2, 80, tilesY, 2, setTileY)
		.addRange('Amplitude', 50, 500, multiplier, 10, setMultiplier)
		.addRange('Tempo', 0.025, 0.5, wave, 0.025, setWave)
}

function debounceSetUpGraphics() {
	if (updateGraphicsTimeout) clearTimeout(updateGraphicsTimeout)
	updateGraphicsTimeout = setTimeout(setUpGraphics, 50)
}

function setUpGraphics() {
	// Create a composite offscreen graphic that combines all text layers
	compositeBuffer = createGraphics(windowWidth, windowHeight)
	compositeBuffer.push()
	compositeBuffer.textFont(font)
	compositeBuffer.textSize(vw * fontsize)
	compositeBuffer.translate(windowWidth / 2, windowHeight / 2)
	compositeBuffer.textAlign(CENTER, CENTER)

	// Set text and background colors
	hslCol = color(`hsl(${textHue}, 100%, 50%)`)
	if (textHue < 180 || textHue === 0) {
		backgroundColor = textHue + 180
	} else {
		backgroundColor = textHue - 180
	}

	// First layer: filled text
	compositeBuffer.noStroke()
	compositeBuffer.fill(hslCol)
	compositeBuffer.text(message, 0, 0)

	// Subsequent layers: stroked text with offsets
	for (let i = 1; i < wordRepeat; i++) {
		compositeBuffer.noFill()
		compositeBuffer.stroke(hslCol)
		compositeBuffer.strokeWeight(3)
		compositeBuffer.text(
			message,
			i * Math.round(Math.random() * 200),
			i * Math.round(Math.random() * -100)
		)
	}
	compositeBuffer.pop()
}

function setRepeater(value) {
	wordRepeat = value
	debounceSetUpGraphics()
}

function setTextSize(value) {
	fontsize = value
	debounceSetUpGraphics()
}

function setTextCol(value) {
	textHue = value
	debounceSetUpGraphics()
}

function setTileY(value) {
	tilesY = value
	// tile height will update on the next draw()
}

function setTileX(value) {
	tilesX = value
	// tile width will update on the next draw()
}

function setMessage(value) {
	message = value
	debounceSetUpGraphics()
}

function setDropDown(track) {
	message = track.value
	debounceSetUpGraphics()
}

function setMultiplier(value) {
	multiplier = value
	return multiplier
}

function setWave(value) {
	wave = value
	return wave
}

function draw() {
	// Update responsive measurements
	vw = window.innerWidth * 0.01
	tileW = windowWidth / tilesX
	tileH = windowHeight / tilesY

	// Set the background color based on current hue values
	background(color(`hsl(${backgroundColor}, 100%, 20%)`))

	// Precompute a common time-based value
	let baseTime = frameCount * wave

	// Loop over a grid and draw the composite image with distortion
	for (let yDir = 0; yDir < tilesY; yDir++) {
		for (let xDir = 0; xDir < tilesX; xDir++) {
			// Calculate distortion offsets
			let distortionX = tan(baseTime + xDir * wave + yDir * wave) * multiplier
			let distortionY = tan(baseTime * 0.5 + xDir * yDir * wave) * multiplier

			// Source rectangle from the composite image
			let sx = xDir * tileW + distortionX
			let sy = yDir * tileH + distortionY
			let sw = tileW
			let sh = tileH

			// Destination rectangle on the canvas
			let dx = xDir * tileW
			let dy = yDir * tileH
			let dw = tileW
			let dh = tileH

			image(compositeBuffer, dx, dy, dw, dh, sx, sy, sw, sh)
		}
	}
}

function windowResized() {
	resizeCanvas(windowWidth, windowHeight)
	vw = window.innerWidth * 0.01
	setUpGraphics()
}

function keyPressed() {
	if (keyCode === UP_ARROW) {
		visible = !visible
		if (visible) {
			settings.hide()
		} else {
			settings.show()
		}
	}
	return false
}
