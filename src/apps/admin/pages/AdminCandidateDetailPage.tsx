import { useParams, useNavigate } from 'react-router-dom'
import {
  useCandidateDetail,
  useDeleteCandidate,
  useDownloadCV,
} from '@features/contact/viewmodels'
import { LoadingSpinner, ErrorMessage } from '@shared/components'
import { useState } from 'react'

const FILE_STATE_LABELS: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-700' },
  QUARANTINE: { label: 'En escaneo', color: 'bg-orange-100 text-orange-700' },
  VERIFIED: { label: 'Verificado', color: 'bg-green-100 text-green-700' },
  REJECTED: { label: 'Rechazado', color: 'bg-red-100 text-red-700' },
}

export default function AdminCandidateDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const candidateId = Number(id)

  const { data: candidate, isLoading, error } = useCandidateDetail(candidateId)
  const deleteMutation = useDeleteCandidate()
  const downloadCV = useDownloadCV()
  const [confirmDelete, setConfirmDelete] = useState(false)

  const handleDelete = () => {
    deleteMutation.mutate(candidateId, {
      onSuccess: () => navigate('/candidates', { replace: true }),
    })
  }

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

  if (isLoading) return <LoadingSpinner className="py-24" />
  if (error)
    return (
      <ErrorMessage
        message={error instanceof Error ? error.message : 'Error cargando candidato'}
      />
    )
  if (!candidate) return <p className="py-12 text-center text-gray-400">Candidato no encontrado.</p>

  const fileState = candidate.file?.state ?? 'PENDING'
  const stateInfo = FILE_STATE_LABELS[fileState] ?? FILE_STATE_LABELS.PENDING
  const canDownload = fileState === 'VERIFIED'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate('/candidates')}
            className="mb-2 text-sm text-blue-600 hover:underline"
          >
            ← Volver a postulaciones
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            {candidate.name} {candidate.surname}
          </h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Postulación del {fmtDate(candidate.created_at)}
          </p>
        </div>
      </div>

      {/* Info card */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">Email</dt>
            <dd className="mt-1 text-sm text-gray-900">
              <a href={`mailto:${candidate.email}`} className="text-blue-600 hover:underline">
                {candidate.email}
              </a>
            </dd>
          </div>

          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">Teléfono</dt>
            <dd className="mt-1 text-sm text-gray-900">{candidate.phone_number ?? '—'}</dd>
          </div>

          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">Puesto</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {candidate.interest?.name ?? '—'}
            </dd>
          </div>

          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Experiencia
            </dt>
            <dd className="mt-1 text-sm text-gray-900">{candidate.experience ?? '—'}</dd>
          </div>

          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Modalidad
            </dt>
            <dd className="mt-1 text-sm text-gray-900">{candidate.modality ?? '—'}</dd>
          </div>

          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Incorporación
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {candidate.incorporation_time ?? '—'}
            </dd>
          </div>

          {candidate.message && (
            <div className="sm:col-span-2">
              <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Mensaje
              </dt>
              <dd className="mt-1 whitespace-pre-line text-sm text-gray-900">
                {candidate.message}
              </dd>
            </div>
          )}
        </dl>
      </div>

      {/* CV & acciones */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Estado del CV */}
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${stateInfo.color}`}>
          CV: {stateInfo.label}
        </span>

        {/* Descargar CV */}
        <button
          onClick={() => downloadCV.mutate(candidate.file_id)}
          disabled={!canDownload || downloadCV.isPending}
          title={canDownload ? 'Descargar CV' : `CV en estado: ${stateInfo.label}`}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {downloadCV.isPending ? 'Abriendo…' : 'Descargar CV'}
        </button>

        {downloadCV.isError && (
          <span className="text-xs text-red-600">
            Error al obtener enlace de descarga
          </span>
        )}

        {/* Descartar */}
        {confirmDelete ? (
          <span className="inline-flex gap-2">
            <button
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="rounded bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
            >
              {deleteMutation.isPending ? 'Descartando…' : 'Confirmar descarte'}
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="rounded bg-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300"
            >
              Cancelar
            </button>
          </span>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            className="rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-100"
          >
            Descartar candidato
          </button>
        )}
      </div>
    </div>
  )
}
