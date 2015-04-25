class ChangeSomeColumnToText < ActiveRecord::Migration
  def change
    change_column :friends, :education, :text
    change_column :friends, :work, :text
  end
end
