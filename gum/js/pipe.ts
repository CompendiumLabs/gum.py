// pipe server

import readline from 'readline'
import { stdout } from 'process'

import { evaluateGum, ErrorNoCode, ErrorNoReturn, ErrorNoElement } from 'gum-jsx/eval'
import { rasterizeSvg, formatImage } from 'gum-jsx/render'

type ErrorResult = { error: string; message: string }
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

function handleGum(data: string, { output_format = 'kitty', theme, size, width, height }: { output_format: 'svg' | 'png' | 'kitty'; theme: string; size: number | [number, number], width: number; height: number }): string | Buffer {
    const elem = evaluateGum(data, { size, theme })
    const svg = elem.svg()
    if (output_format == 'svg') return svg
    const dat = rasterizeSvg(svg, { size: elem.size, width, height })
    if (output_format == 'png') return dat
    return formatImage(dat)
}

function handleSvg(data: string, { output_format = 'kitty', size, width, height }: { output_format: 'png' | 'kitty'; size: [number, number], width: number; height: number }): string | Buffer {
    const dat = rasterizeSvg(data, { size, width, height })
    if (output_format == 'png') return dat
    return formatImage(dat)
}

function handlePng(data: Buffer): string {
    return formatImage(data)
}

// create readline interface
const rl = readline.createInterface({ input: process.stdin })

// handle lines from stdin
rl.on('line', async (line) => {
    let message: { ok: boolean; result: string | Buffer | ErrorResult } | undefined
    try {
        const { data, input_format, ...opts } = JSON.parse(line)
        let result: string | Buffer
        if (input_format == 'jsx') {
            result = handleGum(data, opts)
        } else if (input_format == 'svg') {
            result = handleSvg(data, opts)
        } else if (input_format == 'png') {
            result = handlePng(data)
        } else {
            throw new Error(`Invalid input format: ${input_format}`)
        }
        message = { ok: true, result }
    } catch (e: unknown) {
        const result = parseError(e as Error)
        message = { ok: false, result }
    }
    stdout.write(JSON.stringify(message) + '\n')
})
