module.exports = {
  apps: [{
    name: 'sgst-backend',
    script: 'dist/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development',
      PORT: 4002
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 4002
    },
    error_file: './logs/error.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024',
    watch: false,
    ignore_watch: ['node_modules', 'logs', 'dist'],
    restart_delay: 4000,
    max_restarts: 10,
    min_uptime: '10s',
    kill_timeout: 5000,
    wait_ready: true,
    listen_timeout: 8000,
    // Configurações de monitoramento
    monitoring: false,
    pmx: false,
    // Configurações de log rotation
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    // Configurações de cluster
    instance_var: 'INSTANCE_ID',
    // Configurações de autorestart
    autorestart: true,
    // Configurações de cron para restart automático (opcional)
    // cron_restart: '0 2 * * *', // Restart diário às 2:00
    
    // Configurações específicas para produção
    env_staging: {
      NODE_ENV: 'staging',
      PORT: 5000,
      DATABASE_URL: process.env.DATABASE_URL,
      FRONTEND_URL: process.env.FRONTEND_URL,
      SESSION_SECRET: process.env.SESSION_SECRET
    }
  }],

  // Configurações de deploy (opcional)
  deploy: {
    production: {
      user: 'deploy',
      host: ['seu-servidor-backend.com'],
      ref: 'origin/main',
      repo: 'git@github.com:seu-usuario/sgst.git',
      path: '/var/www/sgst-backend',
      'pre-deploy-local': '',
      'post-deploy': 'npm ci --only=production && npm run build:backend:prod && npm run db:migrate && pm2 reload ecosystem.config.js --env production',
      'pre-setup': '',
      'ssh_options': 'StrictHostKeyChecking=no'
    },
    staging: {
      user: 'deploy',
      host: ['seu-servidor-staging.com'],
      ref: 'origin/develop',
      repo: 'git@github.com:seu-usuario/sgst.git',
      path: '/var/www/sgst-backend-staging',
      'post-deploy': 'npm ci && npm run build:backend && npm run db:migrate && pm2 reload ecosystem.config.js --env staging'
    }
  }
};