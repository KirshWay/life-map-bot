export type ThemeColors = {
  bgColor: string
  textColor: string
  hintColor: string
  livedColor: string
  currentColor: string
  futureColor: string
}

export type RenderOptions = {
  weeksLived: number
  currentWeek: number
  totalYears: number
  weeksPerYear: number
  firstName: string | null
  totalWeeks: number
  theme: ThemeColors
}

const CELL_SIZE = 6
const CELL_GAP = 1
const LABEL_WIDTH = 24
const PADDING = 16
const HEADER_HEIGHT = 56
const FOOTER_HEIGHT = 28

export const renderLifeMapCanvas = (options: RenderOptions): HTMLCanvasElement => {
  const { weeksLived, currentWeek, totalYears, weeksPerYear, firstName, totalWeeks, theme } =
    options

  const dpr = Math.min(window.devicePixelRatio || 1, 2)

  const gridWidth = weeksPerYear * CELL_SIZE + (weeksPerYear - 1) * CELL_GAP
  const gridHeight = totalYears * CELL_SIZE + (totalYears - 1) * CELL_GAP

  const canvasWidth = PADDING + LABEL_WIDTH + gridWidth + PADDING
  const canvasHeight = PADDING + HEADER_HEIGHT + gridHeight + FOOTER_HEIGHT + PADDING

  const canvas = document.createElement('canvas')
  canvas.width = canvasWidth * dpr
  canvas.height = canvasHeight * dpr

  const ctx = canvas.getContext('2d')!
  ctx.scale(dpr, dpr)

  // Background
  ctx.fillStyle = theme.bgColor
  ctx.fillRect(0, 0, canvasWidth, canvasHeight)

  // Header
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  const greetingText = firstName
    ? `${firstName}, this is week ${currentWeek} of your life`
    : `This is week ${currentWeek} of your life`

  ctx.fillStyle = theme.textColor
  ctx.font = `600 14px system-ui, -apple-system, sans-serif`
  ctx.fillText(greetingText, canvasWidth / 2, PADDING + 18)

  ctx.fillStyle = theme.hintColor
  ctx.font = `11px system-ui, -apple-system, sans-serif`
  ctx.fillText(`${weeksLived} of ${totalWeeks} weeks lived`, canvasWidth / 2, PADDING + 38)

  // Grid
  const gridOffsetX = PADDING + LABEL_WIDTH
  const gridOffsetY = PADDING + HEADER_HEIGHT

  ctx.textAlign = 'right'
  ctx.textBaseline = 'middle'
  ctx.font = `9px system-ui, -apple-system, sans-serif`

  for (let year = 0; year < totalYears; year++) {
    const rowY = gridOffsetY + year * (CELL_SIZE + CELL_GAP)

    // Year label (every 10th year)
    if (year % 10 === 0) {
      ctx.fillStyle = theme.hintColor
      ctx.fillText(String(year), gridOffsetX - 4, rowY + CELL_SIZE / 2)
    }

    for (let week = 0; week < weeksPerYear; week++) {
      const weekNumber = year * weeksPerYear + week + 1
      const cellX = gridOffsetX + week * (CELL_SIZE + CELL_GAP)

      if (weekNumber < currentWeek) {
        ctx.fillStyle = theme.livedColor
        ctx.fillRect(cellX, rowY, CELL_SIZE, CELL_SIZE)
      } else if (weekNumber === currentWeek) {
        ctx.fillStyle = theme.currentColor
        ctx.fillRect(cellX, rowY, CELL_SIZE, CELL_SIZE)
      } else {
        ctx.globalAlpha = 0.4
        ctx.strokeStyle = theme.futureColor
        ctx.lineWidth = 0.5
        ctx.strokeRect(cellX + 0.25, rowY + 0.25, CELL_SIZE - 0.5, CELL_SIZE - 0.5)
        ctx.globalAlpha = 1
      }
    }
  }

  // Footer watermark
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = theme.hintColor
  ctx.globalAlpha = 0.5
  ctx.font = `10px system-ui, -apple-system, sans-serif`
  ctx.fillText('Life Map', canvasWidth / 2, canvasHeight - PADDING - 4)
  ctx.globalAlpha = 1

  return canvas
}
