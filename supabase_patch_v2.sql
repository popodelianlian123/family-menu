-- Family Menu Cloud v2 patch
alter table public.dishes
add column if not exists is_active boolean not null default true;

create index if not exists dishes_active_idx
on public.dishes(household_id, category, is_active);
