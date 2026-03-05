import { useState, useEffect } from 'react'
import { contactService } from '../services'
import { fileService } from '@features/content/services'
import { ApiError } from '@shared/api'
import type { PublicInterestDTO, CreateCandidateDTO } from '../dtos'

interface CandidateForm {
  name: string
  surname: string
  email: string
  phone_number: string
  id_interest: number | null
  experience: string
  modality: string
  incorporation_time: string
  message: string
}

const EMPTY_FORM: CandidateForm = {
  name: '',
  surname: '',
  email: '',
  phone_number: '',
  id_interest: null,
  experience: '',
  modality: '',
  incorporation_time: '',
  message: '',
}

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB

export function useCandidateFormViewModel() {
  const [form, setForm] = useState<CandidateForm>({ ...EMPTY_FORM })
  const [file, setFile] = useState<File | null>(null)
  const [privacyAccepted, setPrivacyAccepted] = useState(false)
  const [interests, setInterests] = useState<PublicInterestDTO[]>([])
  const [isLoadingInterests, setIsLoadingInterests] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [step, setStep] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Cargar puestos al montar
  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const res = await contactService.getPublicInterests()
        if (!cancelled) setInterests(res.interests)
      } catch {
        if (!cancelled) setInterests([])
      } finally {
        if (!cancelled) setIsLoadingInterests(false)
      }
    }
    void load()
    return () => { cancelled = true }
  }, [])

  const setField = <K extends keyof CandidateForm>(key: K, value: CandidateForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const selectFile = (f: File | null) => {
    if (f && f.type !== 'application/pdf') {
      setError('Solo se permiten archivos PDF')
      return
    }
    if (f && f.size > MAX_FILE_SIZE) {
      setError('El archivo no puede superar los 5 MB')
      return
    }
    setError(null)
    setFile(f)
  }

  /** Validación local */
  const validate = (): string | null => {
    if (!form.name.trim()) return 'El nombre es obligatorio'
    if (!form.surname.trim()) return 'El apellido es obligatorio'
    if (!form.email.trim()) return 'El email es obligatorio'
    if (!form.id_interest) return 'Seleccioná un puesto'
    if (!form.experience.trim()) return 'La experiencia es obligatoria'
    if (!form.modality.trim()) return 'La modalidad es obligatoria'
    if (!form.incorporation_time.trim()) return 'El tiempo de incorporación es obligatorio'
    if (!file) return 'Adjuntá tu CV en formato PDF'
    if (!privacyAccepted) return 'Debés aceptar la Política de Privacidad para continuar'
    return null
  }

  const handleSubmit = async () => {
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    setIsSubmitting(true)
    setError(null)
    setSuccess(false)

    try {
      // Pasos 1-3: subir CV a R2 (endpoint público, solo PDF)
      setStep('Subiendo CV…')
      const { fileId } = await fileService.uploadPublicFile(
        file!,
        `CV ${form.name} ${form.surname}`,
      )

      // Paso 4: crear candidato
      setStep('Enviando postulación…')

      const body: CreateCandidateDTO = {
        name: form.name.trim(),
        surname: form.surname.trim(),
        email: form.email.trim(),
        id_interest: form.id_interest!,
        experience: form.experience.trim(),
        modality: form.modality.trim(),
        incorporation_time: form.incorporation_time.trim(),
        file_id: fileId,
        phone_number: form.phone_number.trim() || undefined,
        message: form.message.trim() || undefined,
      }

      await contactService.submitCandidate(body)
      setSuccess(true)
      setForm({ ...EMPTY_FORM })
      setFile(null)
      setPrivacyAccepted(false)
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 429) {
          setError('Demasiados envíos. Intentá de nuevo en 24 horas.')
        } else {
          setError(err.data.message || 'Error al enviar la postulación')
        }
      } else {
        setError('Error de conexión. Intentá de nuevo.')
      }
    } finally {
      setIsSubmitting(false)
      setStep(null)
    }
  }

  /** Whether all required form fields (except file) are filled */
  const isFormComplete =
    !!form.name.trim() &&
    !!form.surname.trim() &&
    !!form.email.trim() &&
    !!form.id_interest &&
    !!form.experience.trim() &&
    !!form.modality.trim() &&
    !!form.incorporation_time.trim()

  return {
    form,
    setField,
    file,
    selectFile,
    interests,
    isLoadingInterests,
    handleSubmit,
    isSubmitting,
    isFormComplete,
    step,
    error,
    success,
    setSuccess,
    privacyAccepted,
    setPrivacyAccepted,
  }
}
