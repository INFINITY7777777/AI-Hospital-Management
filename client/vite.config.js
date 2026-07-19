import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

//Tailwind CSS plugin for Vite
import tailWindcss from "@tailwindcss/vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),
            tailWindcss()
  ],
})
