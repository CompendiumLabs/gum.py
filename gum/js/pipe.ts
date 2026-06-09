// pipe server

import readline from 'readline'
import { stdout } from 'process'

import type { ThemeName, Size } from 'gum-jsx'
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

function handlePng(data: Buffer | string): string {
    return formatImage(data)
}

function handleSvg(data: string, { output_format = 'kitty', size, background }: { output_format: 'png' | 'kitty'; size: Size, background: string }): string {
    const dat = rasterizeSvg(data, { size, background })
    if (output_format == 'png') return dat.toString('base64')
    return handlePng(dat)
}

function handleJsx(data: string, { output_format = 'kitty', theme, size, background }: { output_format: 'svg' | 'png' | 'kitty'; theme: ThemeName; size: number | Size, background: string }): string {
    const elem = evaluateGum(data, { size, theme })
    const svg = elem.svg()
    if (output_format == 'svg') return svg
    return handleSvg(svg, { output_format, size: elem.size, background })
}

// create readline interface
const rl = readline.createInterface({ input: process.stdin })

// handle lines from stdin
rl.on('line', (line) => {
    let message: { ok: boolean; result: string | ErrorResult } | undefined
    try {
        const { data, input_format = 'jsx', ...opts } = JSON.parse(line)
        let result: string
        if (input_format == 'jsx') {
            result = handleJsx(data, opts)
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
