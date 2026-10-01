-- ==========================================
-- Safe Future Phase 2: Monetization & CFP
-- ==========================================

-- 1. Table for CFP Partners
CREATE TABLE IF NOT EXISTS public.cfp_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- Link to Supabase Auth
    full_name TEXT NOT NULL,
    certification_number TEXT,
    phone_number TEXT,
    bio TEXT,
    commission_rate DECIMAL(5,2) DEFAULT 40.00, -- e.g., 40%
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Row Level Security for CFP Profiles
ALTER TABLE public.cfp_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "CFPs can view their own profile" 
    ON public.cfp_profiles FOR SELECT 
    USING (auth.uid() = user_id);

-- 2. Table for Level 2 Consultations (WPR) & Payments
CREATE TABLE IF NOT EXISTS public.consultations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES auth.users(id),
    cfp_id UUID REFERENCES public.cfp_profiles(id),
    level TEXT NOT NULL, -- 'Level 2' or 'Level 3'
    status TEXT DEFAULT 'pending_payment', -- pending_payment, scheduled, completed
    payment_status TEXT DEFAULT 'unpaid', -- unpaid, paid, failed
    payment_amount DECIMAL(12,2) NOT NULL,
    payment_gateway_ref TEXT, -- e.g., Midtrans Order ID
    scheduled_at TIMESTAMP WITH TIME ZONE,
    zoom_link TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Row Level Security for Consultations
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Clients can view their own consultations" 
    ON public.consultations FOR SELECT 
    USING (auth.uid() = client_id);

CREATE POLICY "CFPs can view their assigned consultations" 
    ON public.consultations FOR SELECT 
    USING (auth.uid() IN (SELECT user_id FROM public.cfp_profiles WHERE id = cfp_id));
