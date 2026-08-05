/** Image embedded in a PublicationDTO's `images[]` */
export interface PublicationImageDTO {
  id: number
  url: string
  alt_text?: string | null
}

/** POST /images/upload-url body is `{}` */
export type RequestImageUploadUrlDTO = Record<string, never>

/** POST /images/upload-url response */
export interface ImageUploadUrlResponseDTO {
  upload_url: string
  public_url: string
  image_id: string
}

/** POST /images body — after the direct Cloudflare upload completes */
export interface ConfirmImageDTO {
  image_id: string
  alt_text?: string
}

/** POST /images response */
export interface ConfirmImageResponseDTO {
  id: number
  url: string
  alt_text?: string | null
}
