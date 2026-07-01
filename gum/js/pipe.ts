// pipe server

import readline from 'readline'
import { stdout } from 'process'

import { type ThemeName, type Size } from 'gum-jsx'
import { evaluateGum, ErrorNoCode, ErrorNoReturn, ErrorNoElement } from 'gum-jsx/eval'
import { rasterizeSvg, rasterizePixels, formatImage } from 'gum-jsx/render'

type ErrorResult = { error: string; message: string }
type PixelData = { size: Size; length: number; data: Buffer }
type PngData = { size: Size; length: number; data: Buffer }
type StringFormat = 'string' | 'kitty'
type StringResult = { format: StringFormat; data: string }
type PngResult = { format: 'png'; data: PngData }
type PixelResult = { format: 'pixels'; data: PixelData }
type GumResult = StringResult | PngResult | PixelResult

function parseError(e: Error): ErrorResult {
    const { message } = e
    if (e instanceof ErrorNoCode) {
        return { error: 'NOCODE', message }
    } else if (e instanceof ErrorNoReturn) {
        return { error: 'NORETURN', message }
    } else if (e instanceof ErrorNoElement) {
        return { error: 'NOELEMENT', message }
    }
    return { error: 'PARSE', message }
}

function handlePng(data: Buffer | string, { output_format = 'kitty' }: { output_format: 'kitty' }): GumResult {
    if (output_format == 'kitty') {
        return { format: 'kitty', data: formatImage(data) }
    } else {
        throw new Error(`Invalid output format: ${output_format}`)
    }
}

function handleSvg(data: string, { output_format = 'kitty', size, background }: { output_format: 'png' | 'pixels' | 'kitty'; size: Size, background: string }): GumResult {
    // handle pixels separately
    if (output_format == 'pixels') {
        const image = rasterizePixels(data, { size, background })
        const pixels: PixelData = {
            size: [ image.width, image.height ],
            length: image.data.byteLength,
            data: Buffer.from(image.data),
        }
        return { format: 'pixels', data: pixels }
    }

    // regular png path
    const png = rasterizeSvg(data, { size, background })
    if (output_format == 'png') {
        const png_data = {
            size,
            length: png.byteLength,
            data: png,
        }
        return { format: 'png', data: png_data }
    }

    // this must be kitty format
    return handlePng(png, { output_format })
}

function handleJsx(data: string, { output_format = 'kitty', theme, size, background }: { output_format: 'svg' | 'png' | 'kitty' | 'pixels'; theme: ThemeName; size: number | Size, background: string }): GumResult {
    const elem = evaluateGum(data, { size, theme })
    const svg = elem.svg()
    if (output_format == 'svg') return { format: 'string', data: svg }
    return handleSvg(svg, { output_format, size: elem.size, background })
}

// create readline interface
const rl = readline.createInterface({ input: process.stdin })

// handle lines from stdin
rl.on('line', (line) => {
    try {
        const { data, input_format = 'jsx', ...opts } = JSON.parse(line)

        let result: GumResult
        if (input_format == 'jsx') {
            result = handleJsx(data, opts)
        } else if (input_format == 'svg') {
            result = handleSvg(data, opts)
        } else if (input_format == 'png') {
            result = handlePng(data, opts)
        } else {
            throw new Error(`Invalid input format: ${input_format}`)
        }

        const { format, data: output_data } = result
        if (format == 'png' || format == 'pixels') {
            const { size, length, data: pixel_data } = output_data
            const image_data = { size, length }
            stdout.write(JSON.stringify({ format, data: image_data }) + '\n')
            stdout.write(pixel_data)
        } else {
            stdout.write(JSON.stringify({ format, data: output_data }) + '\n')
        }
    } catch (e: unknown) {
        const result = parseError(e as Error)
        stdout.write(JSON.stringify({ format: 'error', data: result }) + '\n')
    }
})
