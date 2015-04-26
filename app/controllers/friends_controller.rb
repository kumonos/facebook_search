class FriendsController < ApplicationController
  before_filter :check_permission

  def index
    friends = Friend.where(owner_id: current_user.id).select(fields)
    respond_to do |format|
      format.json { render json: friends }
    end
  end

  def fb
    limit = params[:limit] || 100
    offset = params[:offset] || 0
    fql = "SELECT #{fields.join(',')} FROM user WHERE uid IN "\
          "(SELECT uid2 FROM friend WHERE uid1=me() LIMIT #{limit} OFFSET #{offset})"

    result = api.fql_query(fql, locale: 'ja_JP')
    result.each do |friend|
      Friend.from_fb_result friend, current_user.id
    end

    respond_to do |format|
      format.json { render json: result }
    end
  end

  def fb_count
    result = api.fql_query('SELECT friend_count FROM user WHERE uid = me()')
    respond_to do |format|
      format.json { render json: result.first }
    end
  end

  private

  def check_permission
    fail ActionController::RoutingError, 'not found' unless current_user
  end

  def api
    @api ||= Koala::Facebook::API.new(current_user.oauth_token)
  end

  def fields
    %w(uid name pic profile_url sex education work birthday_date relationship_status current_location)
  end
end
