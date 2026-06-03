// Generates a multi-resolution build/icon.ico from build/icon.png.
// A proper multi-size .ico downscales far better than electron-builder's
// automatic single-PNG conversion (especially for fine details at 16/32px).
'use strict'
const sharp = require('sharp')
const pngToIcoMod = require('png-to-ico')
const pngToIco = pngToIcoMod.default || pngToIcoMod   // ESM default interop
const fs = require('fs')
const path = require('path')

const src = path.join(__dirname, '..', 'build', 'icon.png')
const out = path.join(__dirname, '..', 'build', 'icon.ico')
const sizes = [256, 128, 64, 48, 32, 16]

;(async () => {
  const buffers = await Promise.all(
    sizes.map((s) => sharp(src).resize(s, s, { kernel: 'lanczos3' }).png().toBuffer()),
  )
  fs.writeFileSync(out, await pngToIco(buffers))
  console.log('wrote', out, fs.statSync(out).size, 'bytes')
})().catch((e) => { console.error(e); process.exit(1) })
