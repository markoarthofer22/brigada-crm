import path from 'path'
import { defineConfig, Plugin } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import fs from 'fs-extra'
import { VitePWA } from 'vite-plugin-pwa'
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

export default defineConfig(({ mode }) => {
	const isDevelopment = mode === 'development'

	return {
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
					{
						src: '.htaccess',
						dest: '',
					},
				],
			}),
			VitePWA({
				registerType: 'autoUpdate',
				devOptions: {
					enabled: isDevelopment,
				},
				workbox: {
					globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
					sourcemap: true,
				},
				manifest: {
					name: 'Brigada',
					short_name: 'Brigada',
					description: 'Tracking customers application',
					theme_color: '#ffffff',
					display: 'standalone',
					icons: [
						{
							src: '/images/pwa-192x192.png',
							sizes: '192x192',
							type: 'image/png',
						},
						{
							src: '/images/pwa-512x512.png',
							sizes: '512x512',
							type: 'image/png',
						},
					],
				},
			}),
			// basicSsl(),
		],
		resolve: {
			alias: {
				'@': path.resolve(__dirname, './src'),
				'@tabler/icons-react': '@tabler/icons-react/dist/esm/icons/index.mjs',
			},
		},
		// disable if you dont want to use https on dev
		server: isDevelopment
			? {
					host: true,
					https: {
						key: fs.readFileSync(path.resolve(__dirname, 'localhost-key.pem')),
						cert: fs.readFileSync(path.resolve(__dirname, 'localhost.pem')),
					},
				}
			: {},
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
	}
})
