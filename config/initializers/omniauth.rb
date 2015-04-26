require 'dotenv'
Dotenv::Railtie.load

Rails.application.config.middleware.use OmniAuth::Builder do
  scope = %w(friends_work_history friends_relationships friends_birthday friends_education_history
             friends_hometown,friends_location,friends_photos).join(',')
  provider :facebook, ENV['FACEBOOK_KEY'], ENV['FACEBOOK_SECRET'], client_options: {
    site: 'https://graph.facebook.com/v1.0',
    authorize_url: 'https://www.facebook.com/v1.0/dialog/oauth'
  }, scope: scope
end
