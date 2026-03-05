import { apiRequest } from '@shared/api/apiRequest'
import ENV from '@shared/api/apiConfig'
import type {
  CreateContactDTO,
  CreateContactResponseDTO,
  ContactListResponseDTO,
  PublicInterestListResponseDTO,
  AdminInterestListResponseDTO,
  CreateInterestDTO,
  AdminInterestDTO,
  PatchInterestDTO,
  CreateCandidateDTO,
  CreateCandidateResponseDTO,
  CandidateListResponseDTO,
  CandidateDetailResponseDTO,
} from '../dtos'

const BASE = ENV.CONTENT_PREFIX
const PUBLIC = ENV.PUBLIC_PREFIX

export const contactService = {
  // ── Público: Contacto ──

  /** POST /public/contacts */
  submitContact(data: CreateContactDTO, signal?: AbortSignal) {
    return apiRequest<CreateContactResponseDTO, CreateContactDTO>({
      method: 'POST',
      endpoint: `${PUBLIC}/contacts`,
      body: data,
      signal,
    })
  },

  // ── Público: Intereses (puestos activos) ──

  /** GET /public/interests */
  getPublicInterests(signal?: AbortSignal) {
    return apiRequest<PublicInterestListResponseDTO>({
      method: 'GET',
      endpoint: `${PUBLIC}/interests`,
      signal,
    })
  },

  // ── Público: Candidatos ──

  /** POST /public/candidates */
  submitCandidate(data: CreateCandidateDTO, signal?: AbortSignal) {
    return apiRequest<CreateCandidateResponseDTO, CreateCandidateDTO>({
      method: 'POST',
      endpoint: `${PUBLIC}/candidates`,
      body: data,
      signal,
    })
  },

  // ── Admin: Contactos (leads) ──

  /** GET /content/contacts */
  listContacts(signal?: AbortSignal) {
    return apiRequest<ContactListResponseDTO>({
      method: 'GET',
      endpoint: `${BASE}/contacts`,
      signal,
    })
  },

  /** DELETE /content/contacts/:id */
  deleteContact(id: number) {
    return apiRequest<{ message: string }>({
      method: 'DELETE',
      endpoint: `${BASE}/contacts/${id}`,
    })
  },

  // ── Admin: Intereses (puestos) ──

  /** GET /content/interests */
  listInterests(signal?: AbortSignal) {
    return apiRequest<AdminInterestListResponseDTO>({
      method: 'GET',
      endpoint: `${BASE}/interests`,
      signal,
    })
  },

  /** POST /content/interests */
  createInterest(data: CreateInterestDTO) {
    return apiRequest<AdminInterestDTO, CreateInterestDTO>({
      method: 'POST',
      endpoint: `${BASE}/interests`,
      body: data,
    })
  },

  /** PATCH /content/interests/:id */
  patchInterest(id: number, data: PatchInterestDTO) {
    return apiRequest<AdminInterestDTO, PatchInterestDTO>({
      method: 'PATCH',
      endpoint: `${BASE}/interests/${id}`,
      body: data,
    })
  },

  // ── Admin: Candidatos ──

  /** GET /content/candidates */
  listCandidates(signal?: AbortSignal) {
    return apiRequest<CandidateListResponseDTO>({
      method: 'GET',
      endpoint: `${BASE}/candidates`,
      signal,
    })
  },

  /** GET /content/candidates/:id */
  getCandidate(id: number, signal?: AbortSignal) {
    return apiRequest<CandidateDetailResponseDTO>({
      method: 'GET',
      endpoint: `${BASE}/candidates/${id}`,
      signal,
    })
  },

  /** DELETE /content/candidates/:id */
  deleteCandidate(id: number) {
    return apiRequest<{ message: string }>({
      method: 'DELETE',
      endpoint: `${BASE}/candidates/${id}`,
    })
  },
}
