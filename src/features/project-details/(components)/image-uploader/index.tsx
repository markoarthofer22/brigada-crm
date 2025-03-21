import { useEffect } from 'react'
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
import { bytesToMB, convertUrlToFile } from '@/lib/utils.ts'
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
	id: number
	image?: {
		id_images: number
		name: string
	}
	path: string
}

const ImageUploader = ({ id, image, path }: ImageUploaderProps) => {
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
				queryKey: ['projects', id],
				exact: false,
			})
			toast.success(t('ProjectDetails.imageUpdated'))
		},
		onError: (error: unknown) => {
			handleError(error)
		},
	})

	const deleteImageMutation = useMutation({
		mutationFn: (id: number) => deleteImageForProject(id, image!.id_images!),
		onSuccess: () => {
			form.setValue('file', [])
		},
		onError: (error: unknown) => {
			handleError(error)
		},
	})

	const form = useForm<UpsertImageForProjectType>({
		resolver: zodResolver(UpsertImageForProject),
		defaultValues: {
			id: id ?? undefined,
			file: [],
		},
	})

	const onSubmit = async (data: UpsertImageForProjectType) => {
		await upsertImageMutation.mutateAsync(data)
	}

	useEffect(() => {
		if (image?.id_images && path) {
			const fetchFile = async () => {
				try {
					const file = await convertUrlToFile(`${path}/${image.name}`)
					if (file) {
						form.setValue('file', file)
					}
				} catch (error: unknown) {
					handleError(error)
				}
			}

			void fetchFile()
		}
	}, [form, handleError, image, path])

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
						render={({ field, fieldState }) => (
							<FormItem>
								<FormLabel>{t('Input.label.projectImage')}</FormLabel>
								<FileUploader
									name={field.name}
									value={field.value}
									onValueChange={async (value) => {
										// await handleUploadSuccess(value)
										field.onChange(value)
										// if (value?.length === 0 && defaultValues?.heroImage?.id) {
										// 	await deleteImageMutation.mutateAsync(
										// 		defaultValues.heroImage.id
										// 	)
										// }
									}}
									disabled={
										upsertImageMutation.isPending ||
										deleteImageMutation.isPending
									}
									reSelect={true}
									className='relative h-80'
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
						)}
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
