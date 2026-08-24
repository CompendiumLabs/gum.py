// pipe server

import { stdout, stderr } from 'process'

import { type ThemeName, type Size } from 'gum-jsx'
import { evaluateGum, ErrorNoCode, ErrorNoReturn, ErrorNoElement } from 'gum-jsx/eval'
import { rasterizeSvg, rasterizePixels, formatImage, formatPixels } from 'gum-jsx/render'

type ErrorResult = { error: string; message: string; stack?: string }
type PixelData = { size: Size; length: number; data: Buffer }
type PngData = { size: Size; length: number; data: Buffer }
type StringFormat = 'string' | 'kitty'
type StringResult = { format: StringFormat; data: string }
type PngResult = { format: 'png'; data: PngData }
type PixelResult = { format: 'pixels'; data: PixelData }
type GumResult = StringResult | PngResult | PixelResult
type PipeJson = Record<string, unknown>
type PipeMessage = { json: PipeJson; binary?: Buffer }

function createMessageParser(onMessage: (message: PipeMessage) => void): (chunk: Buffer) => void {
    let buffer = Buffer.alloc(0)
    let pendingJson: PipeJson | null = null
    let pendingLength = 0

    return (chunk: Buffer) => {
        buffer = Buffer.concat([ buffer, chunk ])

        while (true) {
            if (pendingJson == null) {
                const newline = buffer.indexOf(0x0a)
                if (newline == -1) return

                const line = buffer.subarray(0, newline).toString('utf8')
                buffer = buffer.subarray(newline + 1)
                const parsedJson = JSON.parse(line) as PipeJson
                pendingJson = parsedJson

                const bytesLength = parsedJson.bytes_length
                pendingLength = bytesLength == null ? 0 : Number(bytesLength)
                if (!Number.isInteger(pendingLength) || pendingLength < 0) {
                    throw new Error(`Invalid bytes_length: ${bytesLength}`)
                }
            }

            if (buffer.length < pendingLength) return

            const json = pendingJson as PipeJson
            const binary = pendingLength > 0 ? buffer.subarray(0, pendingLength) : undefined
            buffer = buffer.subarray(pendingLength)
            pendingJson = null
            pendingLength = 0

            onMessage({ json, binary })
        }
    }
}

function parseError(e: Error): ErrorResult {
    const { message, stack } = e
    if (e instanceof ErrorNoCode) {
        return { error: 'NOCODE', message, stack }
    } else if (e instanceof ErrorNoReturn) {
        return { error: 'NORETURN', message, stack }
    } else if (e instanceof ErrorNoElement) {
        return { error: 'NOELEMENT', message, stack }
    } else if (e.name == 'StrictError') {
        // a rendering fallback (bad tex, unknown command, missing glyph) that
        // strict mode turned into an error; only raised when strict was requested
        return { error: 'STRICT', message, stack }
    }
    return { error: 'PARSE', message, stack }
}

function printError(e: Error): void {
    const result = parseError(e)
    stdout.write(JSON.stringify({ format: 'error', data: result }) + '\n')
}

function handlePng(data: Buffer, { output_format = 'kitty' }: { output_format?: 'kitty' }): GumResult {
    if (output_format == 'kitty') {
        return { format: 'kitty', data: formatImage(data) }
    } else {
        throw new Error(`Invalid output format: ${output_format}`)
    }
}

function handlePixels(data: Buffer, { output_format = 'kitty', size }: { output_format?: 'kitty'; size: Size }): GumResult {
    if (output_format == 'kitty') {
        return { format: 'kitty', data: formatPixels(data, size) }
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

function handleJsx(data: string, { output_format = 'kitty', theme, size, background, seed, strict }: { output_format: 'svg' | 'png' | 'kitty' | 'pixels'; theme: ThemeName; size: number | Size, background: string, seed?: number, strict?: boolean }): GumResult {
    const elem = evaluateGum(data, { size, theme, seed, strict })
    const svg = elem.svg()
    if (output_format == 'svg') return { format: 'string', data: svg }
    return handleSvg(svg, { output_format, size: elem.size, background })
}

function handleMessage({ json, binary }: PipeMessage) {
    try {
        const { data, input_format = 'jsx', ...opts } = json

        let result: GumResult
        if (input_format == 'jsx') {
            result = handleJsx(data as string, opts as any)
        } else if (input_format == 'svg') {
            result = handleSvg(data as string, opts as any)
        } else if (input_format == 'png') {
            result = handlePng(binary as Buffer, opts as any)
        } else if (input_format == 'pixels') {
            result = handlePixels(binary as Buffer, opts as any)
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
        printError(e as Error)
    }
}

const parseMessage = createMessageParser(handleMessage)

process.stdin.on('data', (chunk: Buffer) => {
    try {
        parseMessage(chunk)
    } catch (e: unknown) {
        printError(e as Error)
    }
})
