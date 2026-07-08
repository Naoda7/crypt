declare module 'qr-code-styling' {
    type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H'
    type DotType = 'square' | 'dots' | 'rounded' | 'classy' | 'classy-rounded'
    type CornerSquareType = 'square' | 'dot' | 'rounded'
    type CornerDotType = 'square' | 'dot'
    type Extension = 'png' | 'jpeg' | 'svg'
    type GradientType = 'linear' | 'radial'
  
    interface QRCodeOptions {
      width?: number
      height?: number
      data: string
      margin?: number
      qrOptions?: {
        errorCorrectionLevel?: ErrorCorrectionLevel
      }
      imageOptions?: {
        hideBackgroundDots?: boolean
        imageSize?: number
        margin?: number
      }
      dotsOptions?: {
        color?: string
        gradient?: {
          type: GradientType
          rotation: number
          colorStops: Array<{ offset: number; color: string }>
        }
        type?: DotType
      }
      cornersSquareOptions?: {
        color?: string
        gradient?: {
          type: GradientType
          rotation: number
          colorStops: Array<{ offset: number; color: string }>
        }
        type?: CornerSquareType
      }
      cornersDotOptions?: {
        color?: string
        gradient?: {
          type: GradientType
          rotation: number
          colorStops: Array<{ offset: number; color: string }>
        }
        type?: CornerDotType
      }
      backgroundOptions?: {
        color?: string
        gradient?: {
          type: GradientType
          rotation: number
          colorStops: Array<{ offset: number; color: string }>
        }
      }
      image?: string
    }
  
    interface DownloadOptions {
      name?: string
      extension?: Extension
    }
  
    class QRCodeStyling {
      constructor(options: QRCodeOptions)
      update(options: QRCodeOptions): void
      download(downloadOptions?: DownloadOptions): void
      append(container: HTMLElement): void
      getCanvas(): Promise<HTMLCanvasElement>
    }
  
    export default QRCodeStyling
  }