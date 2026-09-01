// NOTE: intentionally no `MainLayout` re-export here. `MainLayout` imports
// `HeaderProfileButton` from `@features/content/components/foro`, which
// imports `useForoAuth` from the `@features/foro` barrel — and that barrel's
// `createAuthClient(...)`/`createContext(...)`/`forwardRef(...)` module-scope
// calls aren't provably side-effect-free, so once Rollup has to parse
// `MainLayout.tsx` at all (which it would, merely to resolve a re-export
// here — regardless of whether admin ever uses the `MainLayout` binding),
// those calls survive tree-shaking and `better-auth` ends up in the admin
// bundle too. This barrel is shared by both apps (admin imports
// `AdminLayout`/`LoadingSpinner`/etc from it), so keep `MainLayout` OUT of
// it — `apps/main/router.tsx` imports it directly from `./MainLayout`
// instead. See Part 7 of rustling-wobbling-bentley.md.
export { default as AdminLayout } from './AdminLayout'
export { default as LoadingSpinner } from './LoadingSpinner'
export { default as AnimatedCheckbox } from './AnimatedCheckbox'
export { default as ErrorMessage } from './ErrorMessage'
export { default as QueryState } from './QueryState'
export { default as WhatsAppFab } from './WhatsAppFab'
export { default as ErrorBoundary } from './ErrorBoundary'
export { default as ErrorFallbackPage } from './ErrorFallbackPage'
