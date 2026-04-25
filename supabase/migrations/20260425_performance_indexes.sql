-- Optimization indexes for G-Aura TM Events
-- Aimed at speeding up RLS policies and common joins

-- Profiles & Roles
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON public.user_roles(role_id);

-- Orders
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_event_id ON public.orders(event_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);

-- Issued Tickets
CREATE INDEX IF NOT EXISTS idx_issued_tickets_order_id ON public.issued_tickets(order_id);
CREATE INDEX IF NOT EXISTS idx_issued_tickets_event_id ON public.issued_tickets(event_id);
CREATE INDEX IF NOT EXISTS idx_issued_tickets_status ON public.issued_tickets(status);
