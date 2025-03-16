import type React from 'react'
import { createContext, useContext, useState } from 'react'
import {
  GlobalLoader,
  type GlobalLoaderProps,
} from '@/components/global-loader'

type LoaderContextType = {
  showLoader: (options?: Omit<GlobalLoaderProps, 'visible'>) => void
  hideLoader: () => void
  isLoading: boolean
}

const LoaderContext = createContext<LoaderContextType | undefined>(undefined)

export function LoaderProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false)
  const [loaderProps, setLoaderProps] = useState<
    Omit<GlobalLoaderProps, 'visible'>
  >({})

  const showLoader = (options: Omit<GlobalLoaderProps, 'visible'> = {}) => {
    setLoaderProps(options)
    setIsLoading(true)
  }

  const hideLoader = () => {
    setIsLoading(false)
  }

  return (
    <LoaderContext.Provider value={{ showLoader, hideLoader, isLoading }}>
      <GlobalLoader visible={isLoading} {...loaderProps} />
      {children}
    </LoaderContext.Provider>
  )
}

export function useLoader() {
  const context = useContext(LoaderContext)

  if (context === undefined) {
    throw new Error('useLoader must be used within a LoaderProvider')
  }

  return context
}
