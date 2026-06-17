class AddMeticulousFieldsToUsers < ActiveRecord::Migration[8.1]
  def change
    add_column :users, :meticulous_enabled, :boolean, default: false, null: false
    add_column :users, :meticulous_url, :string
  end
end
