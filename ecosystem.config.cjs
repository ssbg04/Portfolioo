module.exports = {
  apps: [
    {
      name: 'astro-portfolio',
      script: './dist/server/entry.mjs',
      instances: 'max', // Utilizes all CPU cores for high performance
      exec_mode: 'cluster', // Cluster mode for load balancing
      env: {
        NODE_ENV: 'production',
        PORT: 4321,
        HOST: '0.0.0.0', // Expose to the network (0.0.0.0 allows any device to connect)
        
        // Populate these variables with your credentials
        GEMINI_API_KEY: '',
        RESEND_API_KEY: '',
        CONTACT_EMAIL: '',
        
        PUBLIC_SANITY_PROJECT_ID: 'rk63yuwi',
        PUBLIC_SANITY_DATASET: 'production'
      }
    }
  ]
}
