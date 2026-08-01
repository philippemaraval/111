-- Toutes les éditions 111 sont proposées au même prix.
update public.neighborhoods
set price = 15;

-- La nouvelle campagne de vote démarre sans historique.
delete from public.votes;
