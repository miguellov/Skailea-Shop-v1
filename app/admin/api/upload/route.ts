import { NextRequest, NextResponse } from "next/server"
import { v2 as cloudinary } from "cloudinary"

export const runtime = "nodejs"

/** Preset en Cloudinary: para uploads desde este servidor (firmados con API) debe permitir “Signed uploads” o usar carpeta sin preset (ver CLOUDINARY_UPLOAD_FOLDER). Preset solo “Unsigned” sirve para subidas directas desde el navegador, no para esta ruta. */
const UPLOAD_PRESET = process.env.CLOUDINARY_UPLOAD_PRESET?.trim() || "skailea_products"
/** Si está definida, se sube con API firmada a esta carpeta sin usar preset (evita fallos si el preset no admite signed). */
const UPLOAD_FOLDER = process.env.CLOUDINARY_UPLOAD_FOLDER?.trim()
/** Vercel limita el body (~4.5 MB en muchos planes); mantener por debajo. */
const MAX_BYTES = 4 * 1024 * 1024

function configureCloudinary() {
  const cloud_name = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME?.trim()
  const api_key = process.env.CLOUDINARY_API_KEY?.trim()
  const api_secret = process.env.CLOUDINARY_API_SECRET?.trim()

  if (!cloud_name || !api_key || !api_secret) {
    throw new Error(
      "Faltan NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY o CLOUDINARY_API_SECRET"
    )
  }

  cloudinary.config({
    cloud_name,
    api_key,
    api_secret,
    secure: true,
  })
}

export async function POST(request: NextRequest) {
  try {
    configureCloudinary()
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Configuración Cloudinary inválida"
    return NextResponse.json({ error: msg }, { status: 500 })
  }

  try {
    const contentType = request.headers.get("content-type") || ""
    let buffer: Buffer
    let mime = "image/jpeg"

    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData()
      const file = form.get("file")
      if (!file || !(file instanceof File)) {
        return NextResponse.json({ error: "Falta el archivo (file)" }, { status: 400 })
      }
      if (!/^image\/(jpeg|png|webp)$/i.test(file.type)) {
        return NextResponse.json(
          { error: "Solo se permiten JPG, PNG o WebP" },
          { status: 400 }
        )
      }
      const bytes = await file.arrayBuffer()
      buffer = Buffer.from(bytes)
      mime = file.type
    } else if (contentType.includes("application/json")) {
      const body = (await request.json()) as { image?: string }
      const image = body?.image
      if (!image || typeof image !== "string") {
        return NextResponse.json(
          { error: 'Falta "image" (base64 o data URI)' },
          { status: 400 }
        )
      }
      if (image.startsWith("data:")) {
        const match = image.match(/^data:([^;]+);base64,([\s\S]+)$/)
        if (!match) {
          return NextResponse.json({ error: "Data URI base64 inválido" }, { status: 400 })
        }
        mime = match[1]
        buffer = Buffer.from(match[2], "base64")
      } else {
        buffer = Buffer.from(image, "base64")
      }
    } else {
      return NextResponse.json(
        { error: "Usa multipart/form-data o application/json" },
        { status: 415 }
      )
    }

    if (buffer.length > MAX_BYTES) {
      return NextResponse.json(
        { error: "La imagen supera el tamaño máximo (8 MB)" },
        { status: 400 }
      )
    }

    const dataUri = `data:${mime};base64,${buffer.toString("base64")}`

    let result: Awaited<ReturnType<typeof cloudinary.uploader.upload>>

    if (UPLOAD_FOLDER) {
      result = await cloudinary.uploader.upload(dataUri, {
        folder: UPLOAD_FOLDER,
        resource_type: "image",
      })
    } else {
      result = await cloudinary.uploader.upload(dataUri, {
        upload_preset: UPLOAD_PRESET,
        resource_type: "image",
      })
    }

    const secureUrl = result.secure_url || result.url
    console.log("Upload result:", secureUrl)
    if (process.env.NODE_ENV === "development") {
      console.log("[cloudinary] public_id:", result.public_id)
    }

    if (!secureUrl) {
      return NextResponse.json(
        { error: "Cloudinary no devolvió secure_url" },
        { status: 502 }
      )
    }

    return NextResponse.json({
      secure_url: secureUrl,
      public_id: result.public_id ?? undefined,
    })
  } catch (e) {
    console.error("[cloudinary upload]", e)
    const msg = e instanceof Error ? e.message : "Error al subir la imagen"
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
