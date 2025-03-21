import path from 'path'
import { defineConfig, Plugin } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import fs from 'fs-extra'
import { viteStaticCopy } from 'vite-plugin-static-copy'

function cleanDistExceptFilesFolder(): Plugin {
	return {
		name: 'clean-dist-except-files',
		apply: 'build', // fixed here
		buildStart() {
			const distPath = path.resolve(__dirname, 'dist')
			const keepPath = path.resolve(distPath, 'files')

			if (fs.existsSync(distPath)) {
				fs.readdirSync(distPath).forEach((file) => {
					const filePath = path.resolve(distPath, file)
					if (filePath !== keepPath) {
						fs.removeSync(filePath)
					}
				})
			}
		},
	}
}

export default defineConfig({
	plugins: [
		react(),
		TanStackRouterVite(),
		cleanDistExceptFilesFolder(),
		viteStaticCopy({
			targets: [
				{
					src: 'API',
					dest: '',
				},
			],
		}),
	],
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
			'@tabler/icons-react': '@tabler/icons-react/dist/esm/icons/index.mjs',
		},
	},
	build: {
		outDir: 'dist',
		emptyOutDir: false,
		rollupOptions: {
			output: {
				entryFileNames: 'assets/[name]-[hash].js',
				chunkFileNames: 'assets/[name]-[hash].js',
				assetFileNames: 'assets/[name]-[hash].[ext]',
				manualChunks(id) {
					if (id.includes('node_modules')) {
						return id.split('node_modules/')[1].split('/')[0]
					}
				},
			},
		},
	},
})
