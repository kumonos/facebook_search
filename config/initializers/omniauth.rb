require 'dotenv'
Dotenv::Railtie.load

Rails.application.config.middleware.use OmniAuth::Builder do
  scope = []
  provider :facebook, ENV['FACEBOOK_KEY'], ENV['FACEBOOK_SECRET'], client_options: {
    site: 'https://graph.facebook.com/v1.0',
    authorize_url: 'https://www.facebook.com/v1.0/dialog/oauth'
  }, scope: scope
end
