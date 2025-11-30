/**
 * Build and return the Tweakpane controls for the sketch.
 * @param {object} params - reactive params object shared with the sketch.
 * @param {object} callbacks - handlers to sync pane changes back to sketch state.
 */
export function setupPane(params, callbacks = {}) {
	const pane = new Tweakpane.Pane({ title: 'Controls' })

	const {
		onTextSizeChange,
		onColorHueChange,
		onRepeatsChange,
		onTrackChange,
		onColumnsChange,
		onRowsChange,
		onSineInfluenceChange,
		onAmplitudeChange,
		onTempoChange,
		onModeChange,
		onLoopSecondsChange,
		onFpsChange,
		onNoiseRadiusChange,
		onNoiseScaleChange,
		onNoiseAmpChange,
		onSeedChange,
	} = callbacks

	const layout = pane.addFolder({ title: 'Layout', expanded: true })
	const style = pane.addFolder({ title: 'Style', expanded: true })
	const motion = pane.addFolder({ title: 'Motion', expanded: true })
	const loop = pane.addFolder({ title: 'Loop (Noise)', expanded: true })

	style
		.addInput(params, 'textSize', {
			label: 'Text Size',
			min: 10,
			max: 45,
			step: 1,
		})
		.on('change', (ev) => onTextSizeChange?.(ev.value))

	style
		.addInput(params, 'colorHue', {
			label: 'Color Hue',
			min: 0,
			max: 360,
			step: 1,
		})
		.on('change', (ev) => onColorHueChange?.(ev.value))

	style
		.addInput(params, 'repeats', {
			label: 'Repeats',
			min: 1,
			max: 9,
			step: 1,
		})
		.on('change', (ev) => onRepeatsChange?.(ev.value))

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
		.on('change', (ev) => onTrackChange?.(ev.value))

	layout
		.addInput(params, 'numColumns', {
			label: 'Num Columns',
			min: 2,
			max: 80,
			step: 2,
		})
		.on('change', (ev) => onColumnsChange?.(ev.value))

	layout
		.addInput(params, 'numRows', {
			label: 'Num Rows',
			min: 2,
			max: 80,
			step: 2,
		})
		.on('change', (ev) => onRowsChange?.(ev.value))

	motion
		.addInput(params, 'sineInfluence', {
			label: 'Influence',
			min: 1,
			max: 10,
			step: 0.125,
		})
		.on('change', (ev) => onSineInfluenceChange?.(ev.value))

	motion
		.addInput(params, 'amplitude', {
			label: 'Amplitude',
			min: 50,
			max: 500,
			step: 10,
		})
		.on('change', (ev) => onAmplitudeChange?.(ev.value))

	motion
		.addInput(params, 'tempo', {
			label: 'Tempo',
			min: 0.025,
			max: 0.55,
			step: 0.025,
		})
		.on('change', (ev) => onTempoChange?.(ev.value))

	motion
		.addInput(params, 'mode', {
			label: 'Mode',
			options: { Sine: 'Sine', 'Noise Loop': 'Noise Loop', Sweep: 'Sweep' },
		})
		.on('change', (ev) => onModeChange?.(ev.value))

	loop.addInput(params, 'loopSeconds', {
		label: 'Loop Seconds',
		min: 1,
		max: 12,
		step: 0.5,
	}).on('change', (ev) => onLoopSecondsChange?.(ev.value))

	loop
		.addInput(params, 'fps', { label: 'FPS', min: 12, max: 60, step: 1 })
		.on('change', (ev) => onFpsChange?.(ev.value))

	loop.addInput(params, 'noiseRadius', {
		label: 'Noise Radius',
		min: 0.1,
		max: 8,
		step: 0.05,
	}).on('change', (ev) => onNoiseRadiusChange?.(ev.value))

	loop.addInput(params, 'noiseScale', {
		label: 'Noise Scale',
		min: 0.0005,
		max: 0.02,
		step: 0.0005,
	}).on('change', (ev) => onNoiseScaleChange?.(ev.value))

	loop.addInput(params, 'noiseAmp', {
		label: 'Noise Amp',
		min: 0,
		max: 2,
		step: 0.01,
	}).on('change', (ev) => onNoiseAmpChange?.(ev.value))

	loop
		.addInput(params, 'seed', { label: 'Seed', min: 1, max: 9999, step: 1 })
		.on('change', (ev) => onSeedChange?.(ev.value))

	return pane
}
