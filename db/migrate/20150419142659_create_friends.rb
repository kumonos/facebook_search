class CreateFriends < ActiveRecord::Migration
  def change
    create_table :friends do |t|
      t.string :uid
      t.string :uid
      t.string :name
      t.string :pic
      t.string :profile_url
      t.string :sex
      t.string :education
      t.string :work
      t.date :birthday_date
      t.string :relationship_status
      t.string :current_location

      t.timestamps null: false
    end
  end
end
