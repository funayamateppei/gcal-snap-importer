import { useNavigate as useNavigateOriginal } from 'react-router-dom'
import type { RoutePath } from '../types/routes'

export const useTypedNavigate = () => {
  const navigate = useNavigateOriginal()

  return ((to: RoutePath | number) => {
    navigate(to as number)
  }) as {
    (to: RoutePath): void
    (delta: number): void
  }
}
