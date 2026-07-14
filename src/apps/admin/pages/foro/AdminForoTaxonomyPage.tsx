import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  useCategories,
  useCategoryMutations,
  useTags,
  useTagMutations,
} from '@features/foro'
import { LoadingSpinner, ErrorMessage } from '@shared/components'

function slugify(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export default function AdminForoTaxonomyPage() {
  // ── Categorías ──
  const { data: categories, isLoading: loadingCategories, error: categoriesError } = useCategories()
  const categoryMutations = useCategoryMutations()
  const [newCategoryName, setNewCategoryName] = useState('')

  // ── Etiquetas ──
  const { data: tags, isLoading: loadingTags, error: tagsError } = useTags()
  const tagMutations = useTagMutations()
  const [newTagName, setNewTagName] = useState('')

  const handleCreateCategory = () => {
    const name = newCategoryName.trim()
    if (!name) return
    categoryMutations.create.mutate(
      { name, slug: slugify(name) },
      { onSuccess: () => setNewCategoryName('') },
    )
  }

  const handleDeleteCategory = (id: number) => {
    if (!confirm('¿Eliminar esta categoría?')) return
    categoryMutations.remove.mutate(id)
  }

  const handleCreateTag = () => {
    const name = newTagName.trim()
    if (!name) return
    tagMutations.create.mutate({ name }, { onSuccess: () => setNewTagName('') })
  }

  const handleDeleteTag = (id: number) => {
    if (!confirm('¿Eliminar esta etiqueta?')) return
    tagMutations.remove.mutate(id)
  }

  return (
    <div className="space-y-10">
      <div>
        <Link to="/foro" className="text-sm text-blue-600 hover:underline">
          ← Volver a publicaciones
        </Link>
        <h1 className="mt-2 text-xl font-bold text-gray-900 sm:text-2xl">Categorías y etiquetas</h1>
        <p className="mt-1 text-sm text-gray-500">
          Gestioná la taxonomía usada para clasificar las publicaciones del Foro.
        </p>
      </div>

      {/* ═══════════════ Categorías ═══════════════ */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Categorías</h2>

        <div className="flex gap-2">
          <input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreateCategory()}
            placeholder="Nombre de la categoría nueva…"
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-teal-500"
          />
          <button
            onClick={handleCreateCategory}
            disabled={categoryMutations.create.isPending || !newCategoryName.trim()}
            className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50"
          >
            {categoryMutations.create.isPending ? 'Creando…' : 'Crear categoría'}
          </button>
        </div>

        {loadingCategories && <LoadingSpinner size="sm" className="py-4" />}
        {categoriesError && (
          <ErrorMessage
            message={categoriesError instanceof Error ? categoriesError.message : 'Error cargando categorías'}
          />
        )}

        {categories && categories.length > 0 && (
          <div className="divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white shadow-sm">
            {categories.map((c) => (
              <div key={c.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div>
                  <span className="text-sm font-medium text-gray-900">{c.name}</span>
                  <span className="ml-2 text-xs text-gray-400">{c.slug}</span>
                </div>
                <button
                  onClick={() => handleDeleteCategory(c.id)}
                  disabled={categoryMutations.remove.isPending}
                  className="rounded bg-red-50 px-3 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50"
                >
                  Eliminar
                </button>
              </div>
            ))}
          </div>
        )}

        {categories && categories.length === 0 && !loadingCategories && (
          <p className="py-4 text-center text-sm text-gray-400">No hay categorías todavía.</p>
        )}

        {categoryMutations.create.isError && (
          <ErrorMessage
            message={
              categoryMutations.create.error instanceof Error
                ? categoryMutations.create.error.message
                : 'Error al crear la categoría'
            }
          />
        )}
      </section>

      {/* ═══════════════ Etiquetas ═══════════════ */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Etiquetas</h2>

        <div className="flex gap-2">
          <input
            type="text"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreateTag()}
            placeholder="Nombre de la etiqueta nueva…"
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-blue-500"
          />
          <button
            onClick={handleCreateTag}
            disabled={tagMutations.create.isPending || !newTagName.trim()}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {tagMutations.create.isPending ? 'Creando…' : 'Crear etiqueta'}
          </button>
        </div>

        {loadingTags && <LoadingSpinner size="sm" className="py-4" />}
        {tagsError && (
          <ErrorMessage message={tagsError instanceof Error ? tagsError.message : 'Error cargando etiquetas'} />
        )}

        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((t) => (
              <span
                key={t.id}
                className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700"
              >
                {t.name}
                <button
                  onClick={() => handleDeleteTag(t.id)}
                  disabled={tagMutations.remove.isPending}
                  className="text-red-500 hover:text-red-700 disabled:opacity-50"
                  aria-label={`Eliminar etiqueta ${t.name}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}

        {tags && tags.length === 0 && !loadingTags && (
          <p className="py-4 text-center text-sm text-gray-400">No hay etiquetas todavía.</p>
        )}

        {tagMutations.create.isError && (
          <ErrorMessage
            message={
              tagMutations.create.error instanceof Error
                ? tagMutations.create.error.message
                : 'Error al crear la etiqueta'
            }
          />
        )}
      </section>
    </div>
  )
}
