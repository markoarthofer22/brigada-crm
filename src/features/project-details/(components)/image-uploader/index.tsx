import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { MAX_FILE_UPLOAD_SIZE } from '@/consts/dropzone-defaults'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import {
	deleteImageForProject,
	upsertImageForProject,
} from '@/api/services/projects/projects.ts'
import {
	UpsertImageForProject,
	UpsertImageForProjectType,
} from '@/api/services/projects/schema.ts'
import { bytesToMB } from '@/lib/utils.ts'
import { useHandleGenericError } from '@/hooks/use-handle-generic-error.tsx'
import { Button } from '@/components/ui/button.tsx'
import {
	FileInput,
	FileUploader,
	FileUploaderContent,
	FileUploaderItem,
} from '@/components/ui/file-uploader.tsx'
import {
	Form,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form'

interface ImageUploaderProps {
	projectId: number
	image?: {
		id_images: number
		name: string
	}
	path: string
}

const ImageUploader = ({ projectId, image, path }: ImageUploaderProps) => {
	const queryClient = useQueryClient()
	const { handleError } = useHandleGenericError()
	const { t } = useTranslation()

	const upsertImageMutation = useMutation({
		mutationFn: (data: UpsertImageForProjectType) => {
			const parsedData = UpsertImageForProject.parse(data)
			return upsertImageForProject(parsedData)
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: ['projects', projectId],
			})
			toast.success(t('ProjectDetails.imageUpdated'))
		},
		onError: (error: unknown) => {
			handleError(error)
		},
	})

	const deleteImageMutation = useMutation({
		mutationFn: () => deleteImageForProject(projectId, image!.id_images!),
		onSuccess: async () => {
			form.setValue('file', [])
			await queryClient.invalidateQueries({
				queryKey: ['projects', projectId],
			})
			toast.success(t('ProjectDetails.imageDeleted'))
		},
		onError: (error: unknown) => {
			handleError(error)
		},
	})

	const form = useForm<UpsertImageForProjectType>({
		resolver: zodResolver(UpsertImageForProject),
		defaultValues: {
			id: projectId ?? undefined,
			file: [],
		},
	})

	const onSubmit = async (data: UpsertImageForProjectType) => {
		await upsertImageMutation.mutateAsync(data)
	}

	return (
		<div>
			<Form {...form}>
				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className='flex flex-col space-y-6'
				>
					<FormField
						control={form.control}
						name='file'
						render={({ field, fieldState }) =>
							image?.name && path ? (
								<div className='h-[500px] max-w-4xl rounded-lg border-2 border-dashed border-accent p-2'>
									<img
										src={`${path}/${image.name}`}
										alt={image.name}
										className='h-full w-full rounded-lg object-contain object-center'
									/>
								</div>
							) : (
								<FormItem>
									<FormLabel>{t('Input.label.projectImage')}</FormLabel>
									<FileUploader
										name={field.name}
										value={field.value}
										onValueChange={async (value) => {
											field.onChange(value)
										}}
										disabled={
											upsertImageMutation.isPending ||
											deleteImageMutation.isPending
										}
										reSelect={true}
										className='relative h-[500px]'
									>
										{(!field.value || field.value.length === 0) && (
											<FileInput maxSize={bytesToMB(MAX_FILE_UPLOAD_SIZE)} />
										)}
										{field.value && field.value.length > 0 && (
											<FileUploaderContent className='h-full w-full rounded-lg border-2 border-dashed border-accent bg-background/80'>
												{field.value.map((file, i) => (
													<FileUploaderItem
														key={i}
														index={i}
														aria-roledescription={`file ${i + 1} containing ${
															file.name
														}`}
														className='h-full w-full'
													>
														<img
															src={URL.createObjectURL(file)}
															alt={file.name}
															className='h-full w-full rounded-md object-contain'
														/>
													</FileUploaderItem>
												))}
											</FileUploaderContent>
										)}
									</FileUploader>
									<FormDescription className='!mt-3 text-xs font-medium'>
										<sup>*</sup>
										{t('Input.description.projectImage')}
									</FormDescription>
									<FormMessage
										values={{
											value: bytesToMB(MAX_FILE_UPLOAD_SIZE),
										}}
									>
										{fieldState.error?.message}
									</FormMessage>
								</FormItem>
							)
						}
					/>

					<div className='flex flex-row gap-x-2.5'>
						<Button
							type='submit'
							disabled={
								upsertImageMutation.isPending || deleteImageMutation.isPending
							}
						>
							{t('Actions.submit')}
						</Button>

						<Button
							onClick={() => deleteImageMutation.mutate()}
							variant='destructive'
							disabled={
								upsertImageMutation.isPending ||
								deleteImageMutation.isPending ||
								!image?.id_images
							}
						>
							{t('Actions.delete')}
						</Button>
					</div>
				</form>
			</Form>
		</div>
	)
}

export default ImageUploader
