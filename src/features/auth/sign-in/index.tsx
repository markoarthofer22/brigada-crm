import { useEffect } from 'react'
import { useRouter } from '@tanstack/react-router'
import { Trans, useTranslation } from 'react-i18next'
import LoginBg from '@/assets/loginBg.svg'
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
		<div className='container relative grid h-svh flex-col justify-center lg:max-w-none lg:grid-cols-2 lg:px-0'>
			<div className='relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex'>
				<div className='absolute inset-0 bg-zinc-900' />
				<img
					src={LoginBg}
					alt='login'
					className='absolute inset-0 bottom-0 left-0 right-0 top-0 h-full w-full object-cover object-bottom'
				/>
				<div className='relative z-20 flex items-center text-lg font-medium'>
					{t('Login.image.title')}
				</div>
			</div>
			<div className='flex min-w-0 flex-col'>
				<Header small showSidebarToggle={false} />
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
						<UserAuthForm />
					</div>
				</div>
			</div>
		</div>
	)
}
