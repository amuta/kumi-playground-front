import type { Example } from '@/types';

export const userFilter: Example = {
  id: 'user-filter',
  title: 'User Filter with Select',
  mode: 'notebook',
  schema_src: `schema do
  input do
    array :users do
      hash :user do
        string :name
        string :state
      end
    end
  end

  value :users, {
    name: input.users.user.name,
    state: input.users.user.state
  }

  trait :is_john, input.users.user.name == "John"

  value :john_user, select(is_john, users, "NOT_JOHN")
end`,
  base_input: {
    users: [
      { name: 'John', state: 'CA' },
      { name: 'Jane', state: 'MI' },
    ],
  },
};
