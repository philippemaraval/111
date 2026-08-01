-- La disponibilité publique est définie par la collection réelle 111.
-- Les quartiers non disponibles restent visibles pour les votes ou les futures idées.
update public.neighborhoods
set is_available = name in (
  'La Joliette',
  'Notre-Dame-du-Mont',
  'Sainte-Anne',
  'Cinq-Avenues',
  'Mazargues'
);
