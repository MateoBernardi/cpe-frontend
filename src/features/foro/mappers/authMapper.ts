import type { ForoUserDTO } from '../dtos'
import type { ForoUser } from '../models'

export function mapForoUserDTO(dto: ForoUserDTO): ForoUser {
  return {
    id: dto.id,
    name: dto.name,
    email: dto.email,
    role: dto.role,
  }
}
