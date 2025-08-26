-- Create group join requests table
-- Migration: 20250105000006_create_group_join_requests

-- Create group_join_requests table
CREATE TABLE IF NOT EXISTS public.group_join_requests (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    reviewed_by UUID REFERENCES auth.users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(group_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_group_join_requests_group_id ON public.group_join_requests(group_id);
CREATE INDEX IF NOT EXISTS idx_group_join_requests_user_id ON public.group_join_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_group_join_requests_status ON public.group_join_requests(status);

-- Enable Row Level Security
ALTER TABLE public.group_join_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for group_join_requests table
-- Users can view their own requests
CREATE POLICY "Users can view their own requests" ON public.group_join_requests
    FOR SELECT USING (auth.uid() = user_id);

-- Group admins can view requests for their groups
CREATE POLICY "Group admins can view requests for their groups" ON public.group_join_requests
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.groups 
            WHERE id = group_id AND created_by = auth.uid()
        )
    );

-- Users can create join requests
CREATE POLICY "Users can create join requests" ON public.group_join_requests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Group admins can update requests for their groups
CREATE POLICY "Group admins can update requests for their groups" ON public.group_join_requests
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.groups 
            WHERE id = group_id AND created_by = auth.uid()
        )
    );

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_group_join_requests_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_group_join_requests_updated_at
    BEFORE UPDATE ON public.group_join_requests
    FOR EACH ROW
    EXECUTE FUNCTION public.update_group_join_requests_updated_at_column();
