set :deploy_to, '/apps/whoswho'
set :unicorn_config_path, File.join(fetch(:deploy_to), 'current', 'config', 'unicorn.rb')
set :rbenv_path, '/usr/local/anyenv/envs/rbenv'

role :app, 'localhost'
role :web, 'localhost'
role :db, 'localhost'
