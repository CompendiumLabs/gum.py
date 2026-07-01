// pipe server

import readline from 'readline'
import { stdout } from 'process'

import { is_string, type ThemeName, type Size } from 'gum-jsx'
import { evaluateGum, ErrorNoCode, ErrorNoReturn, ErrorNoElement } from 'gum-jsx/eval'
import { rasterizeSvg, rasterizePixels, formatImage } from 'gum-jsx/render'

type ErrorResult = { error: string; message: string }
type PixelResult = { size: Size; length: number; data: Buffer }
type GumResult = string | PixelResult

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

function handlePng(data: Buffer | string, { output_format = 'kitty' }: { output_format: 'kitty' }): string {
    if (output_format == 'kitty') {
        return formatImage(data)
    } else {
        throw new Error(`Invalid output format: ${output_format}`)
    }
}

function handleSvg(data: string, { output_format = 'kitty', size, background }: { output_format: 'png' | 'pixels' | 'kitty'; size: Size, background: string }): GumResult {
    if (output_format == 'pixels') {
        const image = rasterizePixels(data, { size, background })
        return {
            size: [ image.width, image.height ],
            length: image.data.byteLength,
            data: Buffer.from(image.data),
        }
    }

    const dat = rasterizeSvg(data, { size, background })
    if (output_format == 'png') return dat.toString('base64')
    return handlePng(dat, { output_format })
}

function handleJsx(data: string, { output_format = 'kitty', theme, size, background }: { output_format: 'svg' | 'png' | 'kitty' | 'pixels'; theme: ThemeName; size: number | Size, background: string }): GumResult {
    const elem = evaluateGum(data, { size, theme })
    const svg = elem.svg()
    if (output_format == 'svg') return svg
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

        if (is_string(result)) {
            stdout.write(JSON.stringify({ ok: true, result }) + '\n')
        } else {
            const { size, length, data } = result
            stdout.write(JSON.stringify({ ok: true, size, length }) + '\n')
            stdout.write(data)
        }
    } catch (e: unknown) {
        const result = parseError(e as Error)
        stdout.write(JSON.stringify({ ok: false, result }) + '\n')
    }
})
