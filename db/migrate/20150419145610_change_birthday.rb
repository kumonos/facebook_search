class ChangeBirthday < ActiveRecord::Migration
  def change
    change_column :friends, :birthday_date, :string
  end
end
