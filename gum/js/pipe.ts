// pipe server

import readline from 'readline'
import { stdout } from 'process'

import { evaluateGum, ErrorNoCode, ErrorNoReturn, ErrorNoElement } from 'gum-jsx/eval'
import { rasterizeSvg, formatImage } from 'gum-jsx/render'

function parseError(e: Error): { error: string; message: string } {
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

function formatResult(code: string, { format, size, theme, width, height }: { format: string; size: number; theme: string; width: number; height: number }): string | Buffer {
    const elem = evaluateGum(code, { size, theme })
    const svg = elem.svg()
    if (format == 'svg') return svg
    const dat = rasterizeSvg(svg, { size: elem.size, width, height })
    if (format == 'png') return dat
    return formatImage(dat)
}

// create readline interface
const rl = readline.createInterface({ input: process.stdin })

// handle lines from stdin
rl.on('line', async (line) => {
    let message: { ok: boolean; result: string | Buffer } | undefined
    try {
        const { code, ...opts } = JSON.parse(line)
        const result = formatResult(code, opts)
        message = { ok: true, result }
    } catch (e: unknown) {
        const result = parseError(e as Error)
        message = { ok: false, result: JSON.stringify(result) }
    }
    stdout.write(JSON.stringify(message) + '\n')
})
