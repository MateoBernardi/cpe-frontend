import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useCallback } from 'react'
import { contentService } from '../services'
import { contentKeys } from './useAdminSectionViewModel'
import type { GalleryMediaDTO, AssignMediaInput } from '../dtos'
import { ApiError } from '@shared/api/apiRequest'
import { resolveMediaUrl } from '../mappers'

// ── Query keys ──

export const galleryKeys = {
  all: ['gallery'] as const,
  list: () => [...galleryKeys.all, 'list'] as const,
}

// ── Modelo liviano para la galería ──

export interface GalleryMedia {
  id: number
  url: string
  mimeType: string | null
  title: string | null
  origin: string | null
  createdAt: string
  associations: {
    blockId: number
    sectionId: number
    sectionName: string
    role: string | null
  }[]
}

function mapGalleryMedia(dto: GalleryMediaDTO): GalleryMedia {
  return {
    id: dto.id,
    url: resolveMediaUrl(dto.url),
    mimeType: dto.mime_type,
    title: dto.title,
    origin: dto.origin,
    createdAt: dto.created_at,
    associations: (dto.associations ?? []).map((a) => ({
      blockId: a.block_id,
      sectionId: a.section_id,
      sectionName: a.section_name,
      role: a.role,
    })),
  }
}

// ── Hook: galería completa ──

export interface DeleteMediaError {
  mediaId: number
  message: string
  associations: GalleryMedia['associations']
}

export function useGalleryViewModel() {
  const qc = useQueryClient()
  const [deleteError, setDeleteError] = useState<DeleteMediaError | null>(null)

  const clearDeleteError = useCallback(() => setDeleteError(null), [])

  // ── Query: cargar galería ──
  const { data: gallery, isLoading, error: qErr, refetch } = useQuery({
    queryKey: galleryKeys.list(),
    queryFn: ({ signal }) => contentService.getGallery(signal),
    select: (data) => (data.media ?? []).map(mapGalleryMedia),
  })

  // ── Mutación: eliminar imagen (soft delete) ──
  const deleteMut = useMutation({
    mutationFn: (mediaId: number) => contentService.deleteMedia(mediaId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: galleryKeys.all })
      void qc.invalidateQueries({ queryKey: contentKeys.all })
      setDeleteError(null)
    },
    onError: (err, mediaId) => {
      const message =
        err instanceof ApiError
          ? err.data.message
          : err instanceof Error
            ? err.message
            : 'Error al eliminar la imagen'

      // Buscar asociaciones del item en caché para mostrar al usuario
      const item = gallery?.find((m) => m.id === mediaId)
      setDeleteError({
        mediaId,
        message,
        associations: item?.associations ?? [],
      })
    },
  })

  // ── Mutación: asignar media a sección ──
  const assignMut = useMutation({
    mutationFn: ({ sectionId, items }: { sectionId: number; items: AssignMediaInput[] }) =>
      contentService.assignMediaToSection(sectionId, items),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: galleryKeys.all })
      void qc.invalidateQueries({ queryKey: contentKeys.all })
    },
  })

  // ── Eliminar una asociación (bloque) para liberar la imagen ──
  const removeAssociationMut = useMutation({
    mutationFn: (blockId: number) => contentService.deleteBlock(blockId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: galleryKeys.all })
      void qc.invalidateQueries({ queryKey: contentKeys.all })
      setDeleteError(null)
    },
  })

  return {
    gallery: gallery ?? [],
    isLoading,
    error: qErr instanceof Error ? qErr.message : qErr ? 'Error desconocido' : null,

    deleteMedia: (mediaId: number) => deleteMut.mutate(mediaId),
    isDeleting: deleteMut.isPending,
    deleteError,
    clearDeleteError,

    assignMedia: (sectionId: number, mediaId: number, role: string, order: number) =>
      assignMut.mutate({ sectionId, items: [{ media_id: mediaId, role, order }] }),
    isAssigning: assignMut.isPending,
    assignError: assignMut.error instanceof Error ? assignMut.error.message : null,

    removeAssociation: (blockId: number) => removeAssociationMut.mutate(blockId),
    isRemovingAssociation: removeAssociationMut.isPending,

    refetch: () => void refetch(),
  }
}

// ── Hook ligero: sólo fetch de la galería (para el picker) ──

export function useGalleryList() {
  return useQuery({
    queryKey: galleryKeys.list(),
    queryFn: ({ signal }) => contentService.getGallery(signal),
    select: (data) => (data.media ?? []).map(mapGalleryMedia),
  })
}
