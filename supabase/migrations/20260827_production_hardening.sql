-- Safe Future production hardening migration — 2026-08-27
-- Applied to Supabase project iymwjyptfkvjqxeeayhj.

create or replace function public.trg_recalculate_crm_lead()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
begin
  if tg_table_name = 'wpr_results' then
    select ws.user_id into v_user_id
    from public.wpr_submissions ws
    where ws.id = coalesce(new.wpr_id, old.wpr_id);
  elsif tg_table_name = 'fhc_scores' then
    select fs.user_id into v_user_id
    from public.fhc_submissions fs
    where fs.id = coalesce(new.fhc_id, old.fhc_id);
  else
    v_user_id := coalesce(new.user_id, old.user_id);
  end if;

  if v_user_id is not null then
    perform public.recalculate_crm_lead(v_user_id);
  end if;

  return coalesce(new, old);
end;
$$;

create index if not exists idx_crm_applications_opportunity_id on public.crm_applications(opportunity_id);
create index if not exists idx_crm_applications_product_id on public.crm_applications(product_id);
create index if not exists idx_crm_automation_events_user_id on public.crm_automation_events(user_id);
create index if not exists idx_crm_message_queue_user_id on public.crm_message_queue(user_id);
create index if not exists idx_crm_policies_application_id on public.crm_policies(application_id);
create index if not exists idx_crm_revenue_application_id on public.crm_revenue(application_id);
create index if not exists idx_crm_stage_history_user_id on public.crm_stage_history(user_id);
create index if not exists idx_crm_tasks_user_id on public.crm_tasks(user_id);
create index if not exists idx_crm_touchpoints_user_id on public.crm_touchpoints(user_id);
create index if not exists idx_crm_workflow_runs_user_id on public.crm_workflow_runs(user_id);

revoke execute on function public.get_my_assessment_history() from public, anon;
grant execute on function public.get_my_assessment_history() to authenticated;
revoke execute on function public.get_my_dashboard_summary() from public, anon;
grant execute on function public.get_my_dashboard_summary() to authenticated;
revoke execute on function public.get_customer_dashboard() from public, anon;
grant execute on function public.get_customer_dashboard() to authenticated;
revoke execute on function public.submit_my_wpr(jsonb) from public, anon;
grant execute on function public.submit_my_wpr(jsonb) to authenticated;
revoke execute on function public.sync_authenticated_customer() from public, anon;
grant execute on function public.sync_authenticated_customer() to authenticated;
revoke execute on function public.sync_my_response_to_platform(bigint) from public, anon;
grant execute on function public.sync_my_response_to_platform(bigint) to authenticated;
revoke execute on function public.sf_match_knowledge(extensions.vector,double precision,integer) from public, anon;
grant execute on function public.sf_match_knowledge(extensions.vector,double precision,integer) to authenticated;
revoke execute on function public.trg_recalculate_crm_lead() from public, anon, authenticated;

grant select on public.sf_products to anon, authenticated;
grant select on public.sf_faq to anon, authenticated;
grant select on public.sf_company_profile to anon, authenticated;

drop policy if exists "Public can read active products" on public.sf_products;
create policy "Public can read active products"
on public.sf_products for select to anon, authenticated
using (active = true);

drop policy if exists "Public can read active faq" on public.sf_faq;
create policy "Public can read active faq"
on public.sf_faq for select to anon, authenticated
using (active = true);

drop policy if exists "Public can read company profile" on public.sf_company_profile;
create policy "Public can read company profile"
on public.sf_company_profile for select to anon, authenticated
using (true);
