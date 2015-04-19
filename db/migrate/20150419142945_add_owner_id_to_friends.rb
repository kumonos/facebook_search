class AddOwnerIdToFriends < ActiveRecord::Migration
  def change
    add_column :friends, :owner_id, :integer
  end
end
