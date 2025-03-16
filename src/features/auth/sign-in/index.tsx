import { Trans, useTranslation } from 'react-i18next'
import { UserAuthForm } from './components/user-auth-form'

export default function SignIn() {
	const { t } = useTranslation()

	return (
		<div className='container relative grid h-svh flex-col items-center justify-center lg:max-w-none lg:grid-cols-2 lg:px-0'>
			<div className='relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex'>
				<div className='absolute inset-0 bg-zinc-900' />
				<div className='relative z-20 flex items-center text-lg font-medium'>
					{t('Login.image.title')}
				</div>

				<div className='relative z-20 mt-auto'>
					<blockquote className='space-y-2'>
						<p className='text-lg'>{t('Login.image.quote')}</p>
						<footer className='text-sm'>{t('Login.image.author')}</footer>
					</blockquote>
				</div>
			</div>
			<div className='lg:p-8'>
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
	)
}
