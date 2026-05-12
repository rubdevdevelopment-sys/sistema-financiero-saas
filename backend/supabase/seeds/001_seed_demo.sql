insert into companies (id, name, slug, email, phone, currency, timezone, active)
values (
  '11111111-1111-1111-1111-111111111111',
  'Empresa Demo',
  'empresa-demo',
  'demo@empresa.local',
  '+57 3000000000',
  'COP',
  'America/Bogota',
  true
)
on conflict (id) do nothing;

insert into company_modules (company_id, module_key, enabled)
values
  ('11111111-1111-1111-1111-111111111111', 'dashboard', true),
  ('11111111-1111-1111-1111-111111111111', 'incomes', true),
  ('11111111-1111-1111-1111-111111111111', 'expenses', true),
  ('11111111-1111-1111-1111-111111111111', 'admin', true)
on conflict (company_id, module_key) do nothing;

insert into app_users (id, company_id, full_name, email, password_hash, role, active)
values (
  '22222222-2222-2222-2222-222222222222',
  '11111111-1111-1111-1111-111111111111',
  'Super Admin Demo',
  'superadmin@demo.local',
  '$2a$10$BSkYxFXrUoRDo.5k2uQkLeVY3EgXIfQbNrD06HbyweuDHGrZi4XQW',
  'super_admin',
  true
)
on conflict (id) do nothing;

insert into categories (id, company_id, type, name, color, active)
values
  ('33333333-3333-3333-3333-333333333331', '11111111-1111-1111-1111-111111111111', 'income', 'Ventas', '#22c55e', true),
  ('33333333-3333-3333-3333-333333333332', '11111111-1111-1111-1111-111111111111', 'income', 'Servicios', '#14b8a6', true),
  ('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'expense', 'Nomina', '#ef4444', true),
  ('33333333-3333-3333-3333-333333333334', '11111111-1111-1111-1111-111111111111', 'expense', 'Operativos', '#f97316', true)
on conflict (id) do nothing;

insert into incomes (
  company_id, category_id, title, description, amount, movement_date,
  payment_method, status, notes, responsible, created_by
)
values
  ('11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333331', 'Venta mensual cliente A', 'Cobro de servicio recurrente', 3200000, current_date - interval '10 days', 'Transferencia', 'completed', 'Ingreso principal del mes', 'Comercial', '22222222-2222-2222-2222-222222222222'),
  ('11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333332', 'Consultoria financiera', 'Asesoria especial', 1800000, current_date - interval '4 days', 'PSE', 'completed', 'Proyecto puntual', 'Direccion', '22222222-2222-2222-2222-222222222222');

insert into expenses (
  company_id, category_id, title, description, amount, movement_date,
  payment_method, status, notes, responsible, created_by
)
values
  ('11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'Pago nomina quincenal', 'Personal administrativo', 1400000, current_date - interval '7 days', 'Transferencia', 'completed', 'Pago realizado a tiempo', 'RRHH', '22222222-2222-2222-2222-222222222222'),
  ('11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333334', 'Pago internet oficina', 'Servicio hogar empresarial', 180000, current_date - interval '3 days', 'Tarjeta', 'completed', 'Proveedor local', 'Administracion', '22222222-2222-2222-2222-222222222222');
