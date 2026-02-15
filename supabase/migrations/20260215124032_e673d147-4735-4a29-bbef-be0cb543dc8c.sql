
ALTER TABLE public.seats ADD COLUMN has_electric_port boolean NOT NULL DEFAULT false;

UPDATE public.seats SET has_electric_port = true WHERE seat_number IN (1, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50);
