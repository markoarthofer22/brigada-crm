import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { MIN_PASSWORD_LENGTH } from '@/api/services/authorization/const'
import { ActiveStatus } from '@/api/services/projects/schema.ts'
import {
	User,
	UserType,
	UserUpsert,
	UserUpsertSchema,
} from '@/api/services/user/schema.ts'
import { upsertUser } from '@/api/services/user/users.ts'
import { useHandleGenericError } from '@/hooks/use-handle-generic-error'
import { Button } from '@/components/ui/button.tsx'
import { Checkbox } from '@/components/ui/checkbox.tsx'
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { PasswordInput } from '@/components/password-input.tsx'

interface UserUpsertFormProps {
	initialValues?: Omit<User, 'created_at'>
	allowUserActions?: boolean
}

function UserUpsertForm({
	initialValues,
	allowUserActions = true,
}: UserUpsertFormProps) {
	const { t } = useTranslation()
	const { handleError } = useHandleGenericError()
	const queryClient = useQueryClient()
	const router = useRouter()

	const createUserMutation = useMutation({
		mutationFn: (data: UserUpsert) => upsertUser(data),
		onSuccess: async (res) => {
			await queryClient.invalidateQueries({
				queryKey: ['users'],
			})

			toast.success(
				t(
					initialValues?.id_users
						? 'Users.updateSuccess'
						: 'Users.createSuccess',
					{ value: `${res.firstname} ${res.lastname}` }
				)
			)

			router.navigate({
				to: '/admin/users',
				replace: true,
			})
		},
		onError: (error: unknown) => {
			handleError(error)
		},
	})

	const form = useForm<UserUpsert>({
		resolver: zodResolver(UserUpsertSchema),
		defaultValues: {
			id_users: initialValues?.id_users ?? undefined,
			email: initialValues?.email ?? '',
			firstname: initialValues?.firstname ?? '',
			lastname: initialValues?.lastname ?? '',
			password: '',
			admin: initialValues?.admin ?? UserType.ADMIN,
			active: initialValues?.active ?? ActiveStatus.INACTIVE,
		},
	})

	const generateRandomPassword = () => {
		const chars =
			'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+'

		const password = Array.from(
			{ length: 12 },
			() => chars[Math.floor(Math.random() * chars.length)]
		).join('')

		form.setValue('password', password)
	}

	const onSubmit = (data: UserUpsert) => {
		createUserMutation.mutate(data)
	}

	return (
		<div className='grid max-w-screen-md gap-6'>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)}>
					<div className='grid gap-4'>
						<FormField
							control={form.control}
							name='email'
							render={({ field }) => (
								<FormItem className='space-y-1'>
									<FormLabel>{t('Input.label.email')}</FormLabel>
									<FormControl>
										<Input
											disabled={createUserMutation.isPending}
											type='email'
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className='grid grid-cols-2 gap-4'>
							<FormField
								control={form.control}
								name='firstname'
								render={({ field }) => (
									<FormItem className='space-y-1'>
										<FormLabel>{t('Input.label.firstname')}</FormLabel>
										<FormControl>
											<Input
												disabled={createUserMutation.isPending}
												type='text'
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name='lastname'
								render={({ field }) => (
									<FormItem className='space-y-1'>
										<FormLabel>{t('Input.label.lastname')}</FormLabel>
										<FormControl>
											<Input
												disabled={createUserMutation.isPending}
												type='text'
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<FormField
							control={form.control}
							name='password'
							render={({ field }) => (
								<FormItem className='space-y-1'>
									<FormLabel>{t('Input.label.password')}</FormLabel>
									<div className='flex items-center gap-x-2'>
										<FormControl>
											<PasswordInput
												className='flex-1'
												disabled={createUserMutation.isPending}
												{...field}
											/>
										</FormControl>
										<Button
											disabled={createUserMutation.isPending}
											onClick={generateRandomPassword}
										>
											{t('Users.generatePassword')}
										</Button>
									</div>
									<FormMessage
										values={{
											min: MIN_PASSWORD_LENGTH,
										}}
									/>
								</FormItem>
							)}
						/>

						{allowUserActions && (
							<>
								<FormField
									control={form.control}
									name='admin'
									render={({ field }) => (
										<FormItem className='space-y-1'>
											<FormLabel>{t('Input.label.admin')}</FormLabel>
											<Select
												disabled={createUserMutation.isPending}
												onValueChange={(value) => field.onChange(Number(value))}
												defaultValue={field.value?.toString()}
											>
												<FormControl>
													<SelectTrigger>
														<SelectValue />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													<SelectItem value={UserType.REGULAR.toString()}>
														{t('Users.admin.' + UserType.REGULAR)}
													</SelectItem>
													<SelectItem value={UserType.ADMIN.toString()}>
														{t('Users.admin.' + UserType.ADMIN)}
													</SelectItem>
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name='active'
									render={({ field }) => (
										<FormItem className='flex flex-row items-center gap-x-4 space-y-0 rounded-md border border-primary/20 p-4 transition-all duration-300 hover:border-primary hover:shadow-xl'>
											<FormControl>
												<Checkbox
													id={field.name}
													className='size-5'
													checked={field.value === ActiveStatus.ACTIVE}
													onCheckedChange={(checked) => {
														field.onChange(
															checked
																? ActiveStatus.ACTIVE
																: ActiveStatus.INACTIVE
														)
													}}
												/>
											</FormControl>
											<FormLabel htmlFor={field.name}>
												<div className='cursor-pointer space-y-2 leading-4'>
													{t('Input.label.active')}
													<FormDescription>
														{t('Input.description.userActive')}
													</FormDescription>
												</div>
											</FormLabel>
										</FormItem>
									)}
								/>
							</>
						)}

						<Button
							disabled={createUserMutation.isPending}
							type='submit'
							className='ml-auto mt-2 w-full max-w-40'
						>
							{t('Actions.submit')}
						</Button>
					</div>
				</form>
			</Form>
		</div>
	)
}

export default UserUpsertForm
