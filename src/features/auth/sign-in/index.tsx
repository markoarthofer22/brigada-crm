import { useEffect } from 'react'
import { useRouter } from '@tanstack/react-router'
import { Trans, useTranslation } from 'react-i18next'
import EuLogo from '@/assets/eu-logo.png'
import { useAuthStore } from '@/stores/authStore.ts'
import { useLoader } from '@/context/loader-provider.tsx'
import { Header } from '@/components/header.tsx'
import { UserAuthForm } from './components/user-auth-form'

export default function SignIn() {
	const { t } = useTranslation()
	const authToken = useAuthStore((state) => state.auth.accessToken)
	const { hideLoader } = useLoader()
	const router = useRouter()

	useEffect(() => {
		if (authToken) {
			router.navigate({
				to: '/',
				replace: true,
			})
		}
	}, [router, authToken])

	useEffect(() => {
		hideLoader()
	}, [])

	return (
		<div className='flex h-dvh flex-col'>
			<Header small showSidebarToggle={false} showLogo />
			<div className='container flex h-full flex-col justify-center lg:max-w-none lg:px-0'>
				<div className='flex min-w-0 flex-col items-center'>
					<h1 className='mb-20 text-[60px] font-semibold uppercase text-destructive'>
						{import.meta.env.VITE_APP_TITLE}
					</h1>
					<div className='flex flex-1 items-center justify-center lg:p-8'>
						<div className='mx-auto flex w-full flex-col justify-center space-y-2 sm:w-[350px]'>
							<div className='flex flex-col space-y-2 text-left'>
								<h1 className='text-2xl font-semibold tracking-tight'>
									{t('Login.title')}
								</h1>
								<p className='text-sm text-muted-foreground'>
									<Trans i18nKey='Login.description' components={[<br />]} />
								</p>
							</div>
							<UserAuthForm submitClassName='bg-destructive text-white' />
							<img
								alt='Financirano sredstvima iz Europske unije'
								className='mx-auto !mt-6 w-full max-w-[300px]'
								src={EuLogo}
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
