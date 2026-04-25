-- Gallery Table for G-Aura TM Events
CREATE TABLE public.gallery_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  event_id UUID REFERENCES public.events(id) ON DELETE SET NULL, -- Optional link to a specific event
  order_index INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.gallery_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Gallery items are viewable by everyone" ON public.gallery_items FOR SELECT USING (is_published = true);
CREATE POLICY "Admins can manage gallery items" ON public.gallery_items FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_roles ur JOIN public.roles r ON ur.role_id = r.id WHERE ur.user_id = auth.uid() AND r.name_key IN ('super_admin', 'admin'))
);

-- Insert some dummy gallery items
INSERT INTO public.gallery_items (title, description, image_url) VALUES 
('G-Aura Opening Night', 'Une soirée inoubliable pour le lancement de la plateforme.', 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'),
('Vibe Check', 'L''énergie était au rendez-vous au Pullman.', 'https://images.unsplash.com/photo-1514525253361-bee8a187499b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'),
('Premium Guests', 'Nos invités VIP profitent de l''expérience exclusive.', 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80');
