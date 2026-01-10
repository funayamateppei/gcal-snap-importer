import type { Step } from './steps'

export const ROUTES = {
  AUTH: '/',
  API_KEY: '/api-key',
  UPLOAD: '/upload',
  PREVIEW: '/preview',
  COMPLETE: '/complete',
} as const

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES]

export const STEP_TO_ROUTE: Record<Step, RoutePath> = {
  auth: ROUTES.AUTH,
  api_key: ROUTES.API_KEY,
  upload: ROUTES.UPLOAD,
  preview: ROUTES.PREVIEW,
  complete: ROUTES.COMPLETE,
}

export const ROUTE_TO_STEP: Record<RoutePath, Step> = {
  [ROUTES.AUTH]: 'auth',
  [ROUTES.API_KEY]: 'api_key',
  [ROUTES.UPLOAD]: 'upload',
  [ROUTES.PREVIEW]: 'preview',
  [ROUTES.COMPLETE]: 'complete',
}
