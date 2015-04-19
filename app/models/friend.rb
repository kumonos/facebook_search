class Friend < ActiveRecord::Base
  def self.from_fb_result(result, owner_id)
    where(uid: result['uid'], owner_id: owner_id).first_or_initialize.tap do |friend|
      friend.uid = result['uid']
      friend.name = result['name']
      friend.pic = result['pic']
      friend.profile_url = result['profile_url']
      friend.sex = result['sex']
      friend.education = result['education']
        .map { |e| e['school']['name'] }.join(',')
      friend.work = result['work']
        .map { |w| w['employer']['name'] }.join(',')
      friend.birthday_date = result['birthday_date']
      friend.relationship_status = result['relationship_status']
      friend.current_location = result['current_location'] && result['current_location']['name']
      friend.owner_id = owner_id
      friend.save!
    end
  end
end
