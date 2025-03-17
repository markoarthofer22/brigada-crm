import { useEffect } from 'react'
import { useRouter } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/authStore.ts'

interface Props {
	children: React.ReactNode
}

export default function AuthLayout({ children }: Props) {
	const authToken = useAuthStore((state) => state.auth.accessToken)
	const router = useRouter()

	useEffect(() => {
		if (authToken) {
			router.navigate({
				to: '/',
				replace: true,
			})
		}
	}, [router, authToken])

	return (
		<div className='container grid h-svh flex-col items-center justify-center bg-primary-foreground lg:max-w-none lg:px-0'>
			<div className='mx-auto flex w-full flex-col justify-center space-y-2 sm:w-[480px] lg:p-8'>
				<div className='mb-4 flex items-center justify-center'>Logo</div>
				{children}
			</div>
		</div>
	)
}
