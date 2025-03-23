import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { UpsertZone, UpsertZoneSchema } from '@/api/services/projects/schema.ts'
import { useHandleGenericError } from '@/hooks/use-handle-generic-error.tsx'
import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

const DEFAULT_RADIUS = 4
const DEFAULT_COLOR = '#FF5733'

interface ZoneDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	onSubmit: (data: UpsertZone) => void
	defaultValues?: Partial<UpsertZone>
	points: UpsertZone['coordinates']['points'][number][]
	id_projects?: number
	id_images?: number
	isEditing?: boolean
	isLoading?: boolean
}

export function ZoneDialog({
	open,
	onOpenChange,
	onSubmit,
	defaultValues,
	points,
	id_projects,
	id_images,
	isEditing = false,
	isLoading = false,
}: ZoneDialogProps) {
	const { t } = useTranslation()
	const { handleError } = useHandleGenericError()

	const form = useForm<UpsertZone>({
		resolver: zodResolver(UpsertZoneSchema),
		defaultValues: {
			id_projects,
			id_images,
			name: defaultValues?.name || '',
			coordinates: {
				color: defaultValues?.coordinates?.color || DEFAULT_COLOR,
				name: defaultValues?.coordinates?.name || '',
				points: points,
				radius: defaultValues?.coordinates?.radius || DEFAULT_RADIUS,
			},
			data: defaultValues?.data || {},
		},
	})

	const handleSubmit = (data: UpsertZone) => {
		if (!id_projects || !id_images) return

		onSubmit({
			...data,
			id_projects,
			id_images,
			coordinates: {
				...data.coordinates,
				points,
			},
		})
	}

	const handleDialogOpenChange = (open: boolean) => {
		onOpenChange(open)
		if (!open) {
			form.reset()
		}
	}

	useEffect(() => {
		if (!id_projects || !id_images) return

		if (!open) {
			form.reset()
		} else {
			form.setValue('id_projects', id_projects)
			form.setValue('id_images', id_images)
		}
	}, [form, id_images, id_projects, open])

	const validateJsonData = (value: string) => {
		try {
			if (!value.trim()) return true
			JSON.parse(value)
			return true
		} catch (error: unknown) {
			handleError(error)
			return false
		}
	}

	return (
		<Dialog open={open} onOpenChange={handleDialogOpenChange}>
			<DialogContent className='sm:max-w-[500px]'>
				<DialogHeader>
					<DialogTitle>
						{t(`ProjectDetails.zones.${isEditing ? 'edit' : 'add'}`)}
					</DialogTitle>
					<DialogDescription>
						{t(
							`ProjectDetails.zones.${isEditing ? 'editDescription' : 'addDescription'}`
						)}
					</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(handleSubmit)}
						className='space-y-6'
					>
						<FormField
							control={form.control}
							name='name'
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t('Input.label.zoneName')}</FormLabel>
									<FormControl>
										<Input disabled={isLoading} {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name='coordinates.name'
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t('Input.label.coordName')}</FormLabel>
									<FormControl>
										<Input disabled={isLoading} {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name='coordinates.color'
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t('Input.label.color')}</FormLabel>
									<div className='flex items-center gap-2'>
										<FormControl>
											<Input
												type='color'
												disabled={isLoading}
												className='h-10 w-16 p-1'
												{...field}
											/>
										</FormControl>
										<Input
											disabled={isLoading}
											value={field.value}
											onChange={field.onChange}
											placeholder={`${DEFAULT_COLOR}`}
											className='flex-1'
										/>
									</div>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name='coordinates.radius'
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t('Input.label.radius')}</FormLabel>
									<FormControl>
										<Input
											type='number'
											disabled={isLoading}
											min={DEFAULT_RADIUS}
											step={1}
											{...field}
											onChange={(e) => field.onChange(Number(e.target.value))}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name='data'
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t('Input.label.data')}</FormLabel>
									<FormControl>
										<Textarea
											disabled={isLoading}
											placeholder='{"key": "value"}'
											className='h-32 font-mono'
											{...field}
											value={
												field.value ? JSON.stringify(field.value, null, 2) : ''
											}
											onChange={(e) => {
												const value = e.target.value
												validateJsonData(value)
											}}
										/>
									</FormControl>
									<FormMessage>
										{!validateJsonData(JSON.stringify(field.value)) &&
											t('Input.validation.json')}
									</FormMessage>
								</FormItem>
							)}
						/>

						<DialogFooter>
							<Button
								type='button'
								disabled={isLoading}
								variant='outline'
								onClick={() => handleDialogOpenChange(false)}
							>
								{t('Actions.cancel')}
							</Button>
							<Button disabled={isLoading} type='submit'>
								{t('Actions.submit')}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	)
}
