import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ShiftEvent } from '../types'
import type { Step } from '../types/steps'

export interface UserProfile {
  name: string
  picture: string
}

interface AppState {
  // ステップ管理
  currentStep: Step
  setCurrentStep: (step: Step) => void
  goToNextStep: (nextStep: Step) => void
  goToPreviousStep: (prevStep: Step) => void

  // 認証
  accessToken: string | null
  setAccessToken: (token: string | null) => void

  // ユーザープロファイル
  userProfile: UserProfile | null
  setUserProfile: (profile: UserProfile | null) => void

  // API キー
  apiKey: string | null
  setApiKey: (key: string | null) => void

  // 年選択
  selectedYear: number
  setSelectedYear: (year: number) => void

  // イベント
  events: ShiftEvent[]
  setEvents: (events: ShiftEvent[]) => void

  // アップロードした画像
  uploadedImage: string | null
  setUploadedImage: (image: string | null) => void

  // ローディング状態
  loading: boolean
  setLoading: (loading: boolean) => void
  registering: boolean
  setRegistering: (registering: boolean) => void

  // メッセージ
  message: { text: string; type: 'success' | 'error' } | null
  setMessage: (message: { text: string; type: 'success' | 'error' } | null) => void

  // リセット
  reset: () => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // 初期状態
      currentStep: 'auth',
      accessToken: null,
      userProfile: null,
      apiKey: typeof window !== 'undefined' ? localStorage.getItem('gemini_api_key') : null,
      selectedYear: new Date().getFullYear(),
      events: [],
      uploadedImage: null,
      loading: false,
      registering: false,
      message: null,

      // アクション
      setCurrentStep: (step) => set({ currentStep: step }),
      goToNextStep: (nextStep) => set({ currentStep: nextStep, message: null }),
      goToPreviousStep: (prevStep) => set({ currentStep: prevStep, message: null }),

      setAccessToken: (token) => set({ accessToken: token }),
      setUserProfile: (profile) => set({ userProfile: profile }),
      setApiKey: (key) => set({ apiKey: key }),
      setSelectedYear: (year) => set({ selectedYear: year }),
      setEvents: (events) => set({ events }),
      setUploadedImage: (image) => set({ uploadedImage: image }),
      setLoading: (loading) => set({ loading }),
      setRegistering: (registering) => set({ registering }),
      setMessage: (message) => set({ message }),

      reset: () =>
        set({
          currentStep: 'auth',
          events: [],
          uploadedImage: null,
          message: null,
          loading: false,
          registering: false,
        }),
    }),
    {
      name: 'gcal-snap-importer-storage',
      storage: {
        getItem: (name) => {
          const str = sessionStorage.getItem(name)
          return str ? JSON.parse(str) : null
        },
        setItem: (name, value) => {
          sessionStorage.setItem(name, JSON.stringify(value))
        },
        removeItem: (name) => sessionStorage.removeItem(name),
      },
      partialize: (state) =>
        ({
          accessToken: state.accessToken,
          userProfile: state.userProfile,
        } as unknown as AppState),
    }
  )
)
