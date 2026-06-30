export interface Color {
  hex: string
  rgb: { r: number; g: number; b: number }
}

export interface ImageAnalysisResult {
  dominantColor: Color
  palette: Color[]
  imageWidth: number
  imageHeight: number
}

export async function extractColors(
  file: File,
  maxColors: number = 8,
): Promise<ImageAnalysisResult> {
  const formData = new FormData()
  formData.append('file', file)

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

const response = await fetch(
    `${API_URL}/api/images/analyze?colors=${maxColors}`,
    {
      method: 'POST',
      body: formData,
    },
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Erro ao processar imagem')
  }

  return response.json()
}