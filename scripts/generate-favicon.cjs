/**
 * Genera app/favicon.ico desde public/logo.png (sharp + png-to-ico).
 * Ejecutar: npm run generate-favicon
 */
const fs = require("fs")
const path = require("path")
const sharp = require("sharp")

const root = path.join(__dirname, "..")
const logoPath = path.join(root, "public", "logo.png")
const tmpDir = path.join(__dirname, ".favicon-tmp")
const outIco = path.join(root, "app", "favicon.ico")

async function main() {
  const { default: pngToIco } = await import("png-to-ico")

  if (!fs.existsSync(logoPath)) {
    console.error("Missing public/logo.png")
    process.exit(1)
  }
  fs.mkdirSync(tmpDir, { recursive: true })
  const sizes = [16, 32, 48]
  const paths = []
  for (const s of sizes) {
    const p = path.join(tmpDir, `${s}.png`)
    await sharp(logoPath)
      .resize(s, s, {
        fit: "contain",
        background: { r: 255, g: 255, b: 255, alpha: 0 },
      })
      .png()
      .toFile(p)
    paths.push(p)
  }
  const buf = await pngToIco(paths)
  fs.writeFileSync(outIco, buf)
  fs.rmSync(tmpDir, { recursive: true })
  console.log("Wrote app/favicon.ico")
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
