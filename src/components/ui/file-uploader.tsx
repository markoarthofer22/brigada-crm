import React, {
	createContext,
	type Dispatch,
	forwardRef,
	type SetStateAction,
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from 'react'
import { IconUpload, IconX } from '@tabler/icons-react'
import {
	ACCEPTED_TYPES,
	AVAILABLE_EXTENSIONS,
	MAX_FILE_UPLOAD_SIZE,
	MAX_FILES,
} from '@/consts/dropzone-defaults'
import {
	type DropzoneOptions,
	type DropzoneState,
	type FileRejection,
	useDropzone,
} from 'react-dropzone'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { bytesToMB, cn, getFileExtensionHelperText } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type DirectionOptions = 'rtl' | 'ltr' | undefined

type FileUploaderContextType = {
	dropzoneState: DropzoneState
	isLOF: boolean
	isFileTooBig: boolean
	removeFileFromSet: (index: number) => void
	activeIndex: number
	setActiveIndex: Dispatch<SetStateAction<number>>
	orientation: 'horizontal' | 'vertical'
	direction: DirectionOptions
	name: string
	disabled?: boolean
}

const FileUploaderContext = createContext<FileUploaderContextType | null>(null)

export const useFileUpload = () => {
	const context = useContext(FileUploaderContext)
	if (!context) {
		throw new Error('useFileUpload must be used within a FileUploaderProvider')
	}
	return context
}

type FileUploaderProps = {
	value: File[] | null
	reSelect?: boolean
	onValueChange: (value: File[] | null) => void
	dropzoneOptions?: DropzoneOptions
	orientation?: 'horizontal' | 'vertical'
	name: string
	disabled?: boolean
}

export const FileUploader = forwardRef<
	HTMLDivElement,
	FileUploaderProps & React.HTMLAttributes<HTMLDivElement>
>(
	(
		{
			className,
			dropzoneOptions,
			value,
			onValueChange,
			reSelect,
			orientation = 'vertical',
			children,
			dir,
			name,
			disabled = false,
			...props
		},
		ref
	) => {
		const { t } = useTranslation()
		const [isFileTooBig, setIsFileTooBig] = useState(false)
		const [isLOF, setIsLOF] = useState(false)
		const [activeIndex, setActiveIndex] = useState(-1)

		const {
			accept = ACCEPTED_TYPES,
			maxFiles = MAX_FILES,
			maxSize = MAX_FILE_UPLOAD_SIZE,
			multiple = true,
		} = dropzoneOptions ?? {}

		const reSelectAll = maxFiles === 1 ? true : reSelect
		const direction: DirectionOptions = dir === 'rtl' ? 'rtl' : 'ltr'

		const removeFileFromSet = useCallback(
			(i: number) => {
				if (!value) return
				const newFiles = value.filter((_, index) => index !== i)
				onValueChange(newFiles)
			},
			[value, onValueChange]
		)

		const handleKeyDown = useCallback(
			(e: React.KeyboardEvent<HTMLDivElement>) => {
				e.preventDefault()
				e.stopPropagation()

				if (!value) return

				const moveNext = () => {
					const nextIndex = activeIndex + 1
					setActiveIndex(nextIndex > value.length - 1 ? 0 : nextIndex)
				}

				const movePrev = () => {
					const nextIndex = activeIndex - 1
					setActiveIndex(nextIndex < 0 ? value.length - 1 : nextIndex)
				}

				const prevKey =
					orientation === 'horizontal'
						? direction === 'ltr'
							? 'ArrowLeft'
							: 'ArrowRight'
						: 'ArrowUp'

				const nextKey =
					orientation === 'horizontal'
						? direction === 'ltr'
							? 'ArrowRight'
							: 'ArrowLeft'
						: 'ArrowDown'

				if (e.key === nextKey) {
					moveNext()
				} else if (e.key === prevKey) {
					movePrev()
				} else if (e.key === 'Enter' || e.key === 'Space') {
					if (activeIndex === -1) {
						dropzoneState.inputRef.current?.click()
					}
				} else if (e.key === 'Delete' || e.key === 'Backspace') {
					if (activeIndex !== -1) {
						removeFileFromSet(activeIndex)
						if (value.length - 1 === 0) {
							setActiveIndex(-1)
							return
						}
						movePrev()
					}
				} else if (e.key === 'Escape') {
					setActiveIndex(-1)
				}
			},
			[value, activeIndex, removeFileFromSet]
		)

		const onDrop = useCallback(
			(acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
				const files = acceptedFiles

				if (!files) {
					toast.error(
						t('Input.validation.probablyTooBig', {
							value: bytesToMB(maxSize),
						})
					)
					return
				}

				const newValues: File[] = value ? [...value] : []

				if (reSelectAll) {
					newValues.splice(0, newValues.length)
				}

				files.forEach((file) => {
					if (newValues.length < maxFiles) {
						newValues.push(file)
					}
				})

				onValueChange(newValues)

				if (rejectedFiles.length > 0) {
					// eslint-disable-next-line @typescript-eslint/prefer-for-of
					for (let i = 0; i < rejectedFiles.length; i++) {
						if (rejectedFiles[i]?.errors[0]?.code === 'file-too-large') {
							toast.error(t('Input.validation.tooLarge', { value: maxSize }))
							break
						}

						if (rejectedFiles[i]?.errors[0]?.code === 'file-invalid-type') {
							toast.error(
								t('Input.validation.wrongExtension', {
									value: AVAILABLE_EXTENSIONS.join(','),
								})
							)
							break
						}

						if (rejectedFiles[i]?.errors[0]?.code === 'too-many-files') {
							toast.error(t('Input.validation.maxFiles', { value: maxFiles }))
							break
						}

						if (rejectedFiles[i]?.errors[0]?.message) {
							toast.error(rejectedFiles[i]?.errors[0]?.message)
							break
						}
					}
				}
			},
			[reSelectAll, value]
		)

		useEffect(() => {
			if (!value) return
			if (value.length === maxFiles) {
				setIsLOF(true)
				return
			}
			setIsLOF(false)
		}, [value, maxFiles])

		const opts = dropzoneOptions
			? dropzoneOptions
			: { accept, maxFiles, maxSize, multiple }

		const dropzoneState = useDropzone({
			...opts,
			onDrop,
			onDropRejected: () => setIsFileTooBig(true),
			onDropAccepted: () => setIsFileTooBig(false),
		})

		return (
			<FileUploaderContext.Provider
				value={{
					dropzoneState,
					isLOF,
					isFileTooBig,
					removeFileFromSet,
					activeIndex,
					setActiveIndex,
					orientation,
					direction,
					name,
					disabled,
				}}
			>
				<div
					ref={ref}
					tabIndex={0}
					onKeyDownCapture={handleKeyDown}
					className={cn(
						'w-full overflow-hidden focus:outline-none',
						className,
						{
							'gap-2': value && value.length > 0,
						},
						disabled ? 'pointer-events-none cursor-not-allowed opacity-50' : ''
					)}
					dir={dir}
					{...props}
				>
					{children}
				</div>
			</FileUploaderContext.Provider>
		)
	}
)

FileUploader.displayName = 'FileUploader'

export const FileUploaderContent = forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ children, className, ...props }, ref) => {
	const { orientation } = useFileUpload()
	const containerRef = useRef<HTMLDivElement>(null)

	return (
		<div
			className={cn('flex w-full flex-col px-1', className)}
			ref={containerRef}
			aria-description='content file holder'
		>
			<div
				{...props}
				ref={ref}
				className={cn(
					'flex h-full w-full flex-1 gap-1 rounded-xl',
					orientation === 'horizontal' ? 'flex-raw flex-wrap' : 'flex-col'
				)}
			>
				{children}
			</div>
		</div>
	)
})

FileUploaderContent.displayName = 'FileUploaderContent'

export const FileUploaderItem = forwardRef<
	HTMLDivElement,
	{ index: number } & React.HTMLAttributes<HTMLDivElement>
>(({ className, index, children, ...props }, ref) => {
	const { removeFileFromSet, activeIndex, direction } = useFileUpload()
	const isSelected = index === activeIndex
	return (
		<div
			ref={ref}
			className={cn(
				'relative h-full w-full cursor-pointer justify-between p-1',
				className,
				isSelected ? 'bg-muted' : ''
			)}
			{...props}
		>
			{children}
			<Button
				variant='outline'
				className={cn(
					'absolute !size-8 p-0',
					className,
					direction === 'rtl' ? 'left-2 top-2' : 'right-2 top-2'
				)}
				onClick={() => removeFileFromSet(index)}
			>
				<span className='sr-only'>remove item {index}</span>
				<IconX className='size-5 duration-200 ease-in-out' />
			</Button>
		</div>
	)
})

FileUploaderItem.displayName = 'FileUploaderItem'

interface FileInputProps extends React.HTMLAttributes<HTMLDivElement> {
	maxSize?: string
	availableExtensions?: string[]
}

export const FileInput = forwardRef<HTMLDivElement, FileInputProps>(
	(
		{
			className,
			availableExtensions = AVAILABLE_EXTENSIONS,
			maxSize,
			children,
			...props
		},
		ref
	) => {
		const { name, dropzoneState, isFileTooBig, isLOF } = useFileUpload()
		const rootProps = isLOF ? {} : dropzoneState.getRootProps()
		const { t } = useTranslation()

		return (
			<div
				ref={ref}
				{...props}
				className={`relative h-full w-full cursor-pointer rounded-lg border-2 border-dashed border-input bg-background ${
					isLOF ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
				} ${
					dropzoneState.isDragAccept
						? 'border-green-500'
						: dropzoneState.isDragReject || isFileTooBig
							? 'border-destructive'
							: ''
				}`}
			>
				<div
					className={cn(
						'flex h-full w-full flex-col items-center justify-center rounded-lg duration-300 ease-in-out',
						className
					)}
					{...rootProps}
				>
					{children ?? (
						<React.Fragment>
							<IconUpload className='mb-4 size-7 stroke-primary' />
							<p className='mb-2 !text-sm text-primary'>
								{t('Input.label.uploadFile')}
							</p>
							<p className='text-xs text-primary'>
								{getFileExtensionHelperText(availableExtensions)}{' '}
								{maxSize && `(max. ${maxSize}MB)`}
							</p>
							<span className='sr-only'>Select your files</span>
						</React.Fragment>
					)}
				</div>
				<Input
					ref={dropzoneState.inputRef}
					disabled={isLOF}
					{...dropzoneState.getInputProps()}
					id={name}
					className={`${isLOF ? 'cursor-not-allowed' : ''}`}
				/>
			</div>
		)
	}
)

FileInput.displayName = 'FileInput'
