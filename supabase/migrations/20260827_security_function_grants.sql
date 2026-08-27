-- Safe Future: least-privilege execution grants for SECURITY DEFINER RPCs
revoke execute on function public.create_advisory_request(text,text,text,jsonb) from public, anon;
revoke execute on function public.enqueue_crm_automation(text,uuid,jsonb,text) from public, anon;
revoke execute on function public.has_entitlement(text) from public, anon;
revoke execute on function public.is_sf_admin() from public, anon;
revoke execute on function public.rls_auto_enable() from public, anon;

grant execute on function public.create_advisory_request(text,text,text,jsonb) to authenticated;
grant execute on function public.enqueue_crm_automation(text,uuid,jsonb,text) to authenticated;
grant execute on function public.has_entitlement(text) to authenticated;
grant execute on function public.is_sf_admin() to authenticated;
