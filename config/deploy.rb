# config valid only for current version of Capistrano
lock '3.4.0'

set :application, 'whoswho'
set :repo_url, -> { 'file://' + Dir.pwd + '/.git' }
set :scm, :gitcopy
set :branch, ENV['BRANCH'] || 'master'

# set up rbenv
set :rbenv_type, :system
set :rbenv_ruby, '2.2.2'
set :rbenv_map_bins, %w(rake gem bundle ruby rails)
set :rbenv_roles, :all # default value

# set up rails
set :assets_roles, [:web, :app]
set :normalize_asset_timestamps, %(
  public/images public/javascripts public/stylesheets)

# set up unicorn
set :unicorn_pid, '/apps/whoswho/tmp/unicorn.pid'
set :linked_files, %w(.env)
set :unicorn_rack_env, 'production'

# set up whenever
set :whenever_identifier, -> { "#{fetch(:application)}_#{fetch(:stage)}" }
set :whenever_roles, :app

# add restart task
namespace :deploy do
  desc 'Upload .env'
  task :upload do
    on roles(:app) do
      execute :mkdir, '-p', shared_path
      upload!('.env', "#{shared_path}/.env")
    end
  end
  before :starting, 'deploy:upload'

  desc 'Restart application'
  task :restart do
    run_locally do
      invoke 'deploy:migrate'
      invoke 'unicorn:stop'
      execute :sleep, '3s'
      invoke 'unicorn:start'
    end
  end
  after :publishing, :restart
end
