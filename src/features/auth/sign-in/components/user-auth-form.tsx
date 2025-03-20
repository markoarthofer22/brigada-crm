import { HTMLAttributes } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Link, useRouter } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { login } from '@/api/services/authorization/authorization.ts'
import { MIN_PASSWORD_LENGTH } from '@/api/services/authorization/const.ts'
import {
	LoginPayload,
	LoginSchema,
} from '@/api/services/authorization/schema.ts'
import { useAuthStore } from '@/stores/authStore.ts'
import { cn } from '@/lib/utils'
import { useHandleGenericError } from '@/hooks/use-handle-generic-error.tsx'
import { Button } from '@/components/ui/button'
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/password-input'

type UserAuthFormProps = HTMLAttributes<HTMLDivElement>

export function UserAuthForm({ className, ...props }: UserAuthFormProps) {
	const { t } = useTranslation()
	const { handleError } = useHandleGenericError()
	const queryClient = useQueryClient()

	const setAccessToken = useAuthStore((state) => state.auth.setAccessToken)
	const setRefreshToken = useAuthStore((state) => state.auth.setRefreshToken)
	const setSession = useAuthStore((state) => state.auth.setSessionId)
	const router = useRouter()

	const loginMutation = useMutation({
		mutationFn: (data: LoginPayload) => login(data),
		onSuccess: async (res) => {
			setAccessToken(res.access_token)
			setRefreshToken(res.refresh_token)
			setSession(res.session_id)
			await queryClient.invalidateQueries({
				queryKey: ['globalSettings'],
			})
			router.navigate({
				to: '/',
				replace: true,
			})
		},
		onError: (error: unknown) => {
			handleError(error)
		},
	})

	const form = useForm<LoginPayload>({
		resolver: zodResolver(LoginSchema),
		defaultValues: {
			username: '',
			password: '',
		},
	})

	function onSubmit(data: LoginPayload) {
		loginMutation.mutate(data)
	}

	return (
		<div className={cn('grid gap-6', className)} {...props}>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)}>
					<div className='grid gap-2'>
						<FormField
							control={form.control}
							name='username'
							render={({ field }) => (
								<FormItem className='space-y-1'>
									<FormLabel>{t('Input.label.username')}</FormLabel>
									<FormControl>
										<Input
											autoComplete='email'
											disabled={loginMutation.isPending}
											type='text'
											placeholder={t('Input.placeholder.username')}
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name='password'
							render={({ field }) => (
								<FormItem className='space-y-1'>
									<div className='flex items-center justify-between'>
										<FormLabel>{t('Input.label.password')}</FormLabel>
										<Link
											disabled
											to='/forgot-password'
											className='text-sm font-medium text-muted-foreground transition-opacity duration-200 hover:opacity-75'
										>
											{t('Login.forgotPassword')}
										</Link>
									</div>
									<FormControl>
										<PasswordInput
											autoComplete='current-password'
											disabled={loginMutation.isPending}
											placeholder={t('Input.placeholder.password')}
											{...field}
										/>
									</FormControl>
									<FormMessage
										values={{
											min: MIN_PASSWORD_LENGTH,
										}}
									/>
								</FormItem>
							)}
						/>
						<Button
							disabled={loginMutation.isPending}
							type='submit'
							className='mt-2'
						>
							{t('Login.submit')}
						</Button>
					</div>
				</form>
			</Form>
		</div>
	)
}
