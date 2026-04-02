-- Supprimer l'ancien contenu
DELETE FROM course_content_chunks WHERE subject = 'histoire-geographie';

-- Insérer les 13 chapitres extraits du PDF officiel
INSERT INTO course_content_chunks (subject, chapter_number, chapter_title, content) VALUES
('histoire-geographie', 1, 'La Méditerranée antique : les empreintes grecques et romaines', 'Objectifs : Rappeler que l''Antiquité méditerranéenne est le creuset de l''Europe. Montrer comment Athènes associe régime démocratique et empire maritime. Montrer comment Rome développe un empire territorial immense. Points clés : Périclès et la démocratie athénienne, le principat d''Auguste, Constantin et la christianisation.'),

('histoire-geographie', 2, 'La Méditerranée médiévale : espace d''échanges et de conflits', 'Objectifs : Montrer comment des civilisations entrent en contact dans un espace marqué par les monothéismes. L''émergence de grands ensembles, les contacts entre Chrétienté et Islam, la circulation de biens, d''hommes et d''idées. Points clés : Bernard de Clairvaux et la deuxième croisade, Venise puissance maritime.'),

('histoire-geographie', 3, 'L''ouverture atlantique : les conséquences du Nouveau Monde', 'Objectifs : Montrer le basculement vers l''Atlantique après 1453 et 1492. La constitution d''empires coloniaux, circulation économique mondiale, l''esclavage, le devenir des populations amérindiennes. Points clés : L''or et l''argent, Bartolomé de Las Casas, l''économie sucrière.'),

('histoire-geographie', 4, 'Renaissance, Humanisme et réformes religieuses', 'Objectifs : Montrer l''effervescence intellectuelle aboutissant à la rupture avec le Moyen Âge. L''imprimerie, nouveau rapport aux textes, vision renouvelée de l''homme, réformes protestante et catholique. Points clés : Michel-Ange 1508, Érasme humaniste, Luther 1517.'),

('histoire-geographie', 5, 'L''affirmation de l''État dans le royaume de France', 'Objectifs : Montrer l''affirmation de l''État en France. Le rôle de la guerre, l''extension territoriale, les conflits religieux, l''administration royale, la soumission de la noblesse. Points clés : Ordonnance de Villers-Cotterêts 1539, Colbert et le mercantilisme, Versailles, Édit de Nantes.'),

('histoire-geographie', 6, 'Le modèle britannique et son influence', 'Objectifs : L''ébauche du gouvernement représentatif inspirant les philosophes. L''affirmation des droits du Parlement face à la couronne, l''influence sur les Lumières, la naissance des États-Unis. Points clés : Habeas Corpus 1679, Bill of Rights 1689, Voltaire et l''Angleterre, Washington président.'),

('histoire-geographie', 7, 'Les Lumières et le développement des sciences', 'Objectifs : Le rôle de l''esprit scientifique aux XVIIe-XVIIIe siècles. L''essor scientifique, l''Encyclopédie, les physiocrates, la révolution industrielle, le rôle des femmes. Points clés : Galilée, machine à vapeur de Newcomen 1712, Émilie du Châtelet.'),

('histoire-geographie', 8, 'Sociétés et environnements : des équilibres fragiles', 'Thème : Les sociétés face aux risques, ressources sous pression. Les relations sociétés-environnements, vulnérabilité, fragilité des milieux. Études de cas : changement climatique, Arctique, forêt amazonienne, Alpes. En France : valorisation et protection des milieux.'),

('histoire-geographie', 9, 'Territoires, populations et développement', 'Thème : Trajectoires démographiques différenciées, défis du nombre et vieillissement. Transition démographique et économique, développement et inégalités, pluralité des trajectoires. Études de cas : Brésil, Inde, Russie, Japon. En France : diversité des dynamiques démographiques.'),

('histoire-geographie', 10, 'Des mobilités généralisées', 'Thème : Migrations internationales, mobilités touristiques. Le monde transformé par les mobilités, flux migratoires, tourisme en essor. Études de cas : Méditerranée, Dubaï, mobilités européennes, États-Unis. En France : mobilités multiples et réseaux de transport.'),

('histoire-geographie', 11, 'L''Afrique australe : un espace en profonde mutation', 'Thème : Milieux à valoriser et ménager, défis de la transition, mobilités complexes. Grande diversité de milieux, transitions rapides, inégalités marquées, flux migratoires et tourisme (écotourisme, safaris).'),

('histoire-geographie', 12, 'Tensions et mutations de la société d''ordres', 'Objectifs : Montrer la complexité de la société d''ordres. Poids de la fiscalité, amélioration paysanne, monde urbain, noblesse, femmes d''influence. Points clés : révolte des Va Nu-pieds 1639, riches et pauvres à Paris, salons XVIIIe, traite négrière.'),

('histoire-geographie', 13, 'Les défis d''un monde en transition', 'Programme : Environnement, développement, mobilité. Bouleversements démographiques, économiques, environnementaux. Notion centrale de transition pour analyser les mutations environnementales, démographiques, économiques, technologiques et les mobilités.');
