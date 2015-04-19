# -*- coding: utf-8 -*-

env = ENV['RAILS_ENV']

if env == 'production'
  worker_processes 8
else
  worker_processes 2
end

# socket
listen 3000
listen '/tmp/facebook_search_unicorn.sock'
pid '/tmp/facebook_search_unicorn.pid'

# logs
if env == 'production'
  stderr_path '/var/log/facebook_search/unicorn.log'
  stdout_path '/var/log/facebook_search/unicorn.log'
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
