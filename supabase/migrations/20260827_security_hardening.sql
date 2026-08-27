-- Safe Future security hardening — 2026-08-27
-- Trigger-only SECURITY DEFINER functions must not be callable through PostgREST.
revoke execute on function public.claim_fhc_response(bigint,text) from anon;

revoke execute on function public.crm_log_stage_change() from public, anon, authenticated;
revoke execute on function public.handle_auth_user_crm_sync() from public, anon, authenticated;
revoke execute on function public.sf_auto_advisory() from public, anon, authenticated;
revoke execute on function public.sf_auto_fhc() from public, anon, authenticated;
revoke execute on function public.sf_auto_opportunity() from public, anon, authenticated;
revoke execute on function public.trg_crm_lead_stage_audit() from public, anon, authenticated;
