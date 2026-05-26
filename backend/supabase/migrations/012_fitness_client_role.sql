alter table app_users
  drop constraint if exists app_users_role_check;

alter table app_users
  add constraint app_users_role_check
  check (role in ('super_admin', 'admin', 'operator', 'client'));

create unique index if not exists idx_fitness_clients_user_id_unique
  on fitness_clients(user_id)
  where user_id is not null and deleted_at is null;
