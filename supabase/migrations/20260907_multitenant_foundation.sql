-- Safe Future: multi-tenant SaaS foundation
-- Apply after reviewing live schema. Existing CRM tables are intentionally not altered here.

create table if not exists public.sf_workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) between 2 and 120),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  status text not null default 'active' check (status in ('active','suspended','archived')),
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sf_workspace_members (
  workspace_id uuid not null references public.sf_workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'viewer' check (role in ('owner','admin','advisor','viewer')),
  status text not null default 'active' check (status in ('invited','active','suspended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

create table if not exists public.sf_workspace_invitations (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.sf_workspaces(id) on delete cascade,
  email text not null check (length(trim(email)) between 5 and 320),
  role text not null default 'advisor' check (role in ('admin','advisor','viewer')),
  token_hash text not null unique,
  expires_at timestamptz not null,
  accepted_at timestamptz,
  invited_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now()
);

create table if not exists public.sf_audit_log (
  id bigint generated always as identity primary key,
  workspace_id uuid not null references public.sf_workspaces(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  action text not null check (length(trim(action)) between 2 and 100),
  entity_type text not null check (length(trim(entity_type)) between 2 and 80),
  entity_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists sf_workspace_members_user_idx on public.sf_workspace_members(user_id, status);
create index if not exists sf_workspace_invitations_lookup_idx on public.sf_workspace_invitations(workspace_id, email, expires_at);
create index if not exists sf_audit_log_workspace_idx on public.sf_audit_log(workspace_id, created_at desc);

alter table public.sf_workspaces enable row level security;
alter table public.sf_workspace_members enable row level security;
alter table public.sf_workspace_invitations enable row level security;
alter table public.sf_audit_log enable row level security;

create or replace function public.sf_is_workspace_member(target_workspace uuid)
returns boolean language sql stable security invoker set search_path = public
as $$ select exists (select 1 from public.sf_workspace_members m where m.workspace_id = target_workspace and m.user_id = auth.uid() and m.status = 'active') $$;

create or replace function public.sf_has_workspace_role(target_workspace uuid, allowed_roles text[])
returns boolean language sql stable security invoker set search_path = public
as $$ select exists (select 1 from public.sf_workspace_members m where m.workspace_id = target_workspace and m.user_id = auth.uid() and m.status = 'active' and m.role = any(allowed_roles)) $$;

create policy sf_workspace_select_member on public.sf_workspaces for select to authenticated using (public.sf_is_workspace_member(id));
create policy sf_workspace_update_admin on public.sf_workspaces for update to authenticated using (public.sf_has_workspace_role(id, array['owner','admin'])) with check (public.sf_has_workspace_role(id, array['owner','admin']));
create policy sf_member_select_member on public.sf_workspace_members for select to authenticated using (public.sf_is_workspace_member(workspace_id));
create policy sf_member_update_admin on public.sf_workspace_members for update to authenticated using (public.sf_has_workspace_role(workspace_id, array['owner','admin'])) with check (public.sf_has_workspace_role(workspace_id, array['owner','admin']));
create policy sf_invitation_select_admin on public.sf_workspace_invitations for select to authenticated using (public.sf_has_workspace_role(workspace_id, array['owner','admin']));
create policy sf_invitation_manage_admin on public.sf_workspace_invitations for all to authenticated using (public.sf_has_workspace_role(workspace_id, array['owner','admin'])) with check (public.sf_has_workspace_role(workspace_id, array['owner','admin']));
create policy sf_audit_select_admin on public.sf_audit_log for select to authenticated using (public.sf_has_workspace_role(workspace_id, array['owner','admin']));

revoke all on public.sf_workspaces, public.sf_workspace_members, public.sf_workspace_invitations, public.sf_audit_log from anon;
grant select on public.sf_workspaces, public.sf_workspace_members to authenticated;
grant select, insert, update, delete on public.sf_workspace_invitations to authenticated;
grant select on public.sf_audit_log to authenticated;
revoke execute on function public.sf_is_workspace_member(uuid), public.sf_has_workspace_role(uuid,text[]) from public, anon;
grant execute on function public.sf_is_workspace_member(uuid), public.sf_has_workspace_role(uuid,text[]) to authenticated;

comment on table public.sf_workspace_members is 'Tenant membership and RBAC. Never trust workspace_id from the client without RLS.';
comment on table public.sf_audit_log is 'Append-only operational audit trail; writes should be performed by trusted server-side functions.';

-- Note: create-workspace and invite acceptance must be implemented as audited server-side RPCs.
-- Do not expose service-role credentials in the browser.

... Content omitted to save context. You MUST use Read to get the full and current version before editing ...
