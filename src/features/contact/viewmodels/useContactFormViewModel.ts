import { useState } from 'react'
import { contactService } from '../services'
import { ApiError, getApiErrorMessage } from '@shared/api'
import type { CreateContactDTO } from '../dtos'

const EMPTY_FORM: CreateContactDTO = {
  name: '',
  email: '',
  town: '',
  address: '',
  number_of_people: 1,
  phone_number: '',
  message: '',
}

export function useContactFormViewModel() {
  const [form, setForm] = useState<CreateContactDTO>({ ...EMPTY_FORM })
  const [privacyAccepted, setPrivacyAccepted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const setField = <K extends keyof CreateContactDTO>(key: K, value: CreateContactDTO[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  /** Validación local antes de enviar */
  const validate = (): string | null => {
    if (!form.name.trim()) return 'El nombre es obligatorio'
    if (!form.email.trim()) return 'El email es obligatorio'
    if (!form.town.trim()) return 'La localidad es obligatoria'
    if (!form.address.trim()) return 'La dirección es obligatoria'
    if (!form.number_of_people || form.number_of_people < 1)
      return 'La cantidad de personas es obligatoria'
    if (!privacyAccepted)
      return 'Debés aceptar la Política de Privacidad para continuar'
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
      await contactService.submitContact({
        name: form.name.trim(),
        email: form.email.trim(),
        town: form.town.trim(),
        address: form.address.trim(),
        number_of_people: form.number_of_people,
        phone_number: form.phone_number?.trim() || undefined,
        message: form.message?.trim() || undefined,
      })
      setSuccess(true)
      setForm({ ...EMPTY_FORM })
      setPrivacyAccepted(false)
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 429) {
          setError('Demasiados envíos. Intentá de nuevo más tarde.')
        } else {
          setError(getApiErrorMessage(err))
        }
      } else {
        setError('Error de conexión. Intentá de nuevo.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return { form, setField, handleSubmit, isSubmitting, error, success, setSuccess, privacyAccepted, setPrivacyAccepted }
}
