const MAX_FILE_UPLOAD_SIZE = 10 * 1024 * 1024
const ACCEPTED_TYPES = {
	'image/*': ['.jpg', '.jpeg', '.png'],
}
const AVAILABLE_EXTENSIONS = ['.jpg', '.jpeg', '.png']
const MAX_FILES = 1

export { MAX_FILES, MAX_FILE_UPLOAD_SIZE, ACCEPTED_TYPES, AVAILABLE_EXTENSIONS }
