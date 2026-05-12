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

async function handleGum(data: string, { output_format = 'kitty', theme, size, background }: { output_format: 'svg' | 'png' | 'kitty'; theme: ThemeName; size: number | Size, background: string }): Promise<string | Buffer> {
    const elem = evaluateGum(data, { size, theme })
    const svg = elem.svg()
    if (output_format == 'svg') return svg
    const dat = await rasterizeSvg(svg, { size: elem.size, background })
    if (output_format == 'png') return dat
    return formatImage(dat)
}

async function handleSvg(data: string, { output_format = 'kitty', size, background }: { output_format: 'png' | 'kitty'; size: Size, background: string }): Promise<string | Buffer> {
    const dat = await rasterizeSvg(data, { size, background })
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
            result = await handleGum(data, opts)
        } else if (input_format == 'svg') {
            result = await handleSvg(data, opts)
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
