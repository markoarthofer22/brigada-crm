import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { IconPlus, IconTrash } from '@tabler/icons-react'
import { useTranslation } from 'react-i18next'
import { UpsertZone, UpsertZoneSchema } from '@/api/services/zones/schema'
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

const DEFAULT_COLOR = '#ff0000'

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
			id_zones: defaultValues?.id_zones ?? undefined,
			name: defaultValues?.name || '',
			coordinates: {
				color: defaultValues?.coordinates?.color || DEFAULT_COLOR,
				name: defaultValues?.coordinates?.name || '',
				points: points,
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
		form.reset()
	}

	const handleDialogOpenChange = (open: boolean) => {
		onOpenChange(open)
		if (!open) {
			form.reset()
		}
	}

	const validateJsonData = (value: string) => {
		try {
			if (!value?.trim()) return true
			JSON.parse(value)
			return true
		} catch (error: unknown) {
			handleError(error)
			return false
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

	useEffect(() => {
		if (defaultValues) {
			form.reset({
				id_projects,
				id_images,
				name: defaultValues?.name || '',
				id_zones: defaultValues?.id_zones ?? undefined,
				coordinates: {
					color: defaultValues?.coordinates?.color || DEFAULT_COLOR,
					name: defaultValues?.coordinates?.name || '',
					points: points,
				},
				data: defaultValues?.data || {},
			})
		}
	}, [defaultValues, form])

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
						className='space-y-2'
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
							name='data'
							render={({ field }) => (
								<FormItem className='space-y-4'>
									<div className='flex items-center justify-between'>
										<FormLabel>{t('Input.label.data')}</FormLabel>
										<Button
											type='button'
											variant='outline'
											size='icon'
											onClick={() => {
												const currentData = field.value || {}
												const newData = { ...currentData, '': '' }
												field.onChange(newData)
											}}
										>
											<IconPlus className='!size-5' />
										</Button>
									</div>
									<FormControl>
										<div className='space-y-2 rounded-md border p-4'>
											{Object.keys(field.value || {}).length === 0 ? (
												<div className='flex items-center justify-center gap-x-2 py-2 text-center text-sm text-muted-foreground'>
													{t('ProjectDetails.zones.dataEmpty1')}
													<Button
														type='button'
														variant='outline'
														size='icon'
														className='size-6'
													>
														<IconPlus className='!size-4' />
													</Button>
													{t('ProjectDetails.zones.dataEmpty2')}
												</div>
											) : (
												Object.entries(field.value || {}).map(
													([key, value], index) => (
														<div key={index} className='flex items-start gap-2'>
															<Input
																className='flex-1'
																placeholder='Key'
																value={key}
																onChange={(e) => {
																	const newKey = e.target.value
																	const currentData = { ...field.value }
																	const currentValue = currentData[key]
																	delete currentData[key]
																	currentData[newKey] = currentValue
																	field.onChange(currentData)
																}}
															/>
															<Input
																className='flex-1'
																placeholder='Value'
																value={
																	typeof value === 'object'
																		? JSON.stringify(value)
																		: String(value)
																}
																onChange={(e) => {
																	const newValue = e.target.value
																	const currentData = { ...field.value }

																	try {
																		if (
																			(newValue.startsWith('{') &&
																				newValue.endsWith('}')) ||
																			(newValue.startsWith('[') &&
																				newValue.endsWith(']'))
																		) {
																			currentData[key] = JSON.parse(newValue)
																		} else if (newValue === 'true') {
																			currentData[key] = true
																		} else if (newValue === 'false') {
																			currentData[key] = false
																		} else if (!isNaN(Number(newValue))) {
																			currentData[key] = Number(newValue)
																		} else {
																			currentData[key] = newValue
																		}
																	} catch (_e) {
																		currentData[key] = newValue
																	}

																	field.onChange(currentData)
																}}
															/>
															<Button
																type='button'
																variant='ghost'
																size='icon'
																onClick={() => {
																	const currentData = { ...field.value }
																	delete currentData[key]
																	field.onChange(currentData)
																}}
															>
																<IconTrash className='!size-5 text-destructive' />
															</Button>
														</div>
													)
												)
											)}
										</div>
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
