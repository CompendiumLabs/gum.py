// pipe server

import readline from 'readline'
import { stdout } from 'process'

import { evaluateGum, ErrorNoCode, ErrorNoReturn, ErrorNoElement } from 'gum-jsx/eval'
import { rasterizeSvg, formatImage } from 'gum-jsx/render'

function parseError(e) {
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

function formatResult(code, { format, size, theme, width, height }) {
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
    let message = null
    try {
        const { code, ...opts } = JSON.parse(line)
        const result = formatResult(code, opts)
        message = { ok: true, result }
    } catch (e) {
        const result = parseError(e)
        message = { ok: false, result }
    }
    stdout.write(JSON.stringify(message) + '\n')
})
