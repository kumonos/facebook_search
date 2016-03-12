# -*- coding: utf-8 -*-

env = ENV['RAILS_ENV']
app_name = 'whoswho'

if env == 'production'
  worker_processes 1
else
  worker_processes 2
end

# socket
listen 3333
if env == 'production'
  listen "/apps/#{app_name}/tmp/unicorn.sock"
  pid "/apps/#{app_name}/tmp/unicorn.pid"
else
  listen File.expand_path("../../tmp/sockets/unicorn_#{env}.sock", __FILE__)
  pid File.expand_path("../../tmp/pids/unicorn_#{env}.pid", __FILE__)
end

# logs
if env == 'production'
  stderr_path "/var/log/#{app_name}/unicorn.log"
  stdout_path "/var/log/#{app_name}/unicorn.log"
else
  stderr_path File.expand_path("../../log/unicorn_#{env}.log", __FILE__)
  stdout_path File.expand_path("../../log/unicorn_#{env}.log", __FILE__)
end

preload_app true

before_fork do |server, _worker|
  defined?(ActiveRecord::Base) && ActiveRecord::Base.connection.disconnect!

  old_pid = "#{ server.config[:pid] }.oldbin"
  unless old_pid == server.pid
    begin
      Process.kill :QUIT, File.read(old_pid).to_i
    rescue Errno::ENOENT, Errno::ESRCH
      p $ERROR_INFO
    end
  end
end

after_fork do |_server, _worker|
  defined?(ActiveRecord::Base) && ActiveRecord::Base.establish_connection
end
