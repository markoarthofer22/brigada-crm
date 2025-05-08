import path from 'path'
import { defineConfig, Plugin } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import fs from 'fs-extra'
import { VitePWA } from 'vite-plugin-pwa'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import svgr from 'vite-plugin-svgr'

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
			svgr(),
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
				injectRegister: 'auto',
				devOptions: {
					enabled: isDevelopment,
				},
				workbox: {
					maximumFileSizeToCacheInBytes: 12 * 1024 * 1024 * 10, // 120 MB
					globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
					sourcemap: true,
					cleanupOutdatedCaches: true,
					skipWaiting: true,
					clientsClaim: true,
				},
				manifest: {
					name: 'Brigada',
					start_url: '/',
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
					screenshots: [
						{
							src: '/images/screenshot-mobile.png',
							sizes: '411x899',
							type: 'image/png',
							form_factor: 'narrow', // for mobile
						},
						{
							src: '/images/screenshot-desktop.png',
							sizes: '1716x1291',
							type: 'image/png',
							form_factor: 'wide', // for desktop
						},
					],
				},
			}),
			// basicSsl(),
		],
		server: isDevelopment
			? undefined
			: {
					host: true,
					https: {
						key: fs.readFileSync(
							path.resolve(__dirname, '192.168.100.163-key.pem')
						),
						cert: fs.readFileSync(
							path.resolve(__dirname, '192.168.100.163.pem')
						),
					},
				},
		resolve: {
			alias: {
				'@': path.resolve(__dirname, './src'),
				'@tabler/icons-react': '@tabler/icons-react/dist/esm/icons/index.mjs',
			},
		},

		build: {
			outDir: 'dist',
			minify: true,
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
