-- 0002_seed_data.sql
-- MaktabaYetu Default Seed Data

-- 1. Initial Categories
INSERT OR IGNORE INTO categories (id, name, slug, description, icon, sort_order, is_active, created_at, updated_at) VALUES
('cat_habari', 'Habari', 'habari', 'Taarifa za sasa, majarida ya habari na uchambuzi wa matukio mbalimbali.', 'Newspaper', 1, 1, 1700000000000, 1700000000000),
('cat_hadithi', 'Hadithi', 'hadithi', 'Riwaya za kusisimua, tamthilia, hadithi fupi za kitamaduni na kisasa.', 'BookOpen', 2, 1, 1700000000000, 1700000000000),
('cat_maisha', 'Maisha', 'maisha', 'Mwongozo wa maisha, afya, mahusiano, falsafa na maendeleo binafsi.', 'Heart', 3, 1, 1700000000000, 1700000000000),
('cat_olevel', 'O-Level', 'o-level', 'Vitabu vya kiada, mihtasari, mazoezi na maandalizi ya mitihani ya Kidato cha 1 - 4.', 'GraduationCap', 4, 1, 1700000000000, 1700000000000),
('cat_alevel', 'A-Level', 'a-level', 'Machapisho ya kitaaluma, nadharia za kina na maandalizi ya Kidato cha 5 - 6.', 'Award', 5, 1, 1700000000000, 1700000000000),
('cat_tech', 'Technologies', 'technologies', 'Sayansi ya kompyuta, mifumo ya kidijitali, programu na akili bandia.', 'Cpu', 6, 1, 1700000000000, 1700000000000),
('cat_science', 'Science', 'science', 'Biolojia, kemia, fizikia, mazingira na uvumbuzi wa kisayansi.', 'FlaskConical', 7, 1, 1700000000000, 1700000000000),
('cat_manuals', 'Manuals', 'manuals', 'Miongozo ya ufundi, utaalamu wa mikono, sera na hati za maelekezo.', 'FileText', 8, 1, 1700000000000, 1700000000000),
('cat_others', 'Others', 'others', 'Machapisho na nyaraka nyingine za kipekee za kielimu na kijamii.', 'Folder', 9, 1, 1700000000000, 1700000000000);

-- 2. Subscription Plans
INSERT OR IGNORE INTO subscription_plans (id, name, slug, description, price, currency, duration_days, billing_interval, features, is_active, created_at, updated_at) VALUES
('plan_monthly', 'Mpango wa Kila Mwezi', 'monthly', 'Kifurushi bora kwa wasomaji wanaotaka ufikiaji wa haraka wa vitabu vyote vya premium.', 10000.0, 'TZS', 30, 'monthly', '["Usomaji usio na kikomo wa vitabu vyote vya premium", "Upakuaji wa PDF kusoma nje ya mtandao", "Upatikanaji kwenye kompyuta na simu", "Msaada wa kipaumbele wa kiufundi"]', 1, 1700000000000, 1700000000000),
('plan_yearly', 'Mpango wa Mwaka Mzima', 'yearly', 'Okoa zaidi kwa malipo ya mara moja ya mwaka mzima na upate faida zote za MaktabaYetu.', 90000.0, 'TZS', 365, 'yearly', '["Uokoaji wa asilimia 25% ya ada ya kila mwezi", "Ufikiaji usio na kikomo wa vitabu vyote na majarida", "Upakuaji wa haraka na uwezo wa kuweka alamisho", "Kupata vitabu vipya mara tu vinapochapishwa", "Kusoma hadi kwenye vifaa 3 kwa wakati mmoja"]', 1, 1700000000000, 1700000000000);

-- 3. News Categories
INSERT OR IGNORE INTO news_categories (id, name, slug, created_at) VALUES
('newscat_announcements', 'Matangazo', 'matangazo', 1700000000000),
('newscat_education', 'Elimu na Maarifa', 'elimu-na-maarifa', 1700000000000),
('newscat_technology', 'Teknolojia na Ubunifu', 'teknolojia', 1700000000000);

-- 4. Sample News Articles
INSERT OR IGNORE INTO news (id, title, slug, summary, content, cover_url, category_id, author_name, is_featured, is_published, published_at, created_at, updated_at) VALUES
('news_1', 'Uzinduzi Rasmi wa MaktabaYetu: Njia Mpya ya Kusoma Kidijitali', 'uzinduzi-rasmi-wa-maktabayetu', 'Tunajivunia kuwaletea MaktabaYetu, jukwaa la kidijitali lililoundwa kurahisisha upatikanaji wa vitabu na nyaraka za kielimu kwa Kiswahili na Kiingereza.', 'MaktabaYetu inalenga kuwa kitovu kikuu cha maarifa barani Afrika na duniani kote kwa wanafunzi, watafiti, walimu na wapenzi wa vitabu. Kwa kutumia mfumo wa kisasa wa wavuti uliounganishwa na wingu la Cloudflare, wasomaji wanaweza kufungua nyaraka za PDF papo hapo kwa kasi ya ajabu bila kupoteza ubora wowote.', 'https://images.unsplash.com/photo-1507842229451-7f01be7fe70d?auto=format&fit=crop&w=1200&q=80', 'newscat_announcements', 'Mhariri Mkuu', 1, 1, 1700000000000, 1700000000000, 1700000000000),
('news_2', 'Umuhimu wa Nyenzo za Kidijitali Katika Ufaulu wa Kidato cha Nne na Sita', 'nyenzo-za-kidijitali-na-ufaulu-wa-mitihani', 'Tathmini ya jinsi upatikanaji wa vitabu vya kielektroniki unavyosaidia wanafunzi wa O-Level na A-Level kujiandaa na mitihani ya kitaifa.', 'Upatikanaji wa vitabu vya ziada na mihtasari ya masomo ya sayansi, hisabati na sanaa umekuwa changamoto kubwa katika shule nyingi. Kupitia maktaba ya kidijitali, wanafunzi wanaweza kupakua au kusoma moja kwa moja vitabu vinavyokidhi mitaala iliyopo bila gharama kubwa za uchapishaji.', 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1200&q=80', 'newscat_education', 'Kitengo cha Elimu', 0, 1, 1700000000000, 1700000000000, 1700000000000);

-- 5. Platform Settings
INSERT OR IGNORE INTO settings (key, value, category, updated_at) VALUES
('site_name', 'MaktabaYetu', 'general', 1700000000000),
('site_tagline', 'Maktaba ya Kisasa ya Kidijitali ya Kiswahili na Maarifa', 'general', 1700000000000),
('site_description', 'Gundua, soma mtandaoni na pakua vitabu vya kidijitali, hadithi, nyenzo za O-Level, A-Level, teknolojia na miongozo ya kisasa.', 'general', 1700000000000),
('contact_email', 'info@maktabayetu.co.tz', 'contact', 1700000000000),
('contact_phone', '+255 700 123 456', 'contact', 1700000000000),
('social_twitter', 'https://twitter.com/maktabayetu', 'social', 1700000000000),
('social_facebook', 'https://facebook.com/maktabayetu', 'social', 1700000000000),
('social_instagram', 'https://instagram.com/maktabayetu', 'social', 1700000000000),
('allow_guest_downloads', '1', 'access', 1700000000000),
('selcom_enabled', '0', 'payment', 1700000000000),
('turnstile_enabled', '0', 'security', 1700000000000);

-- 6. Demo Books (Clearly marked as Demo Content with open sample files)
INSERT OR IGNORE INTO books (id, title, slug, author, description, category_id, language, publication_year, publisher, isbn, file_key, file_type, file_size, cover_url, is_premium, price, is_featured, is_published, reads_count, downloads_count, rating, created_at, updated_at) VALUES
('book_demo_1', 'Mwongozo wa Teknolojia ya Akili Bandia na Sayansi ya Data', 'mwongozo-wa-teknolojia-ya-akili-bandia', 'Dkt. Emmanuel Mrema', '[DEMO CONTENT] Kitabu hiki kinatoa muhtasari mpana kuhusu jinsi akili bandia (Artificial Intelligence) inavyobadilisha sekta mbalimbali za uchumi, elimu, na uzalishaji nchini Tanzania na Afrika kwa ujumla.', 'cat_tech', 'sw', 2024, 'MaktabaYetu Publishing', '978-9987-101-01-1', 'demo/sample-tech.pdf', 'application/pdf', 1245000, 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80', 0, 0.0, 1, 1, 342, 128, 4.9, 1700000000000, 1700000000000),

('book_demo_2', 'Hadithi za Kale na Falsafa za Jamii za Afrika Mashariki', 'hadithi-za-kale-na-falsafa-za-afrika', 'Bi. Fatma Zahra', '[DEMO CONTENT] Mkusanyiko wa hadithi za kusisimua zilizorithishwa vizazi hadi vizazi zenye mafunzo mazito ya kimaadili, ushujaa, uongozi na upendo katika jamii.', 'cat_hadithi', 'sw', 2023, 'Nuru ya Fasihi', '978-9987-202-02-2', 'demo/sample-stories.pdf', 'application/pdf', 980000, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80', 0, 0.0, 1, 1, 512, 240, 4.8, 1700000000000, 1700000000000),

('book_demo_3', 'Misingi ya Fizikia na Kemia: Muhtasari wa Kidato cha Nne', 'misingi-ya-fizikia-na-kemia-kidato-cha-nne', 'Mwl. Josephat Mwakyusa', '[DEMO CONTENT] Kitabu hiki cha mazoezi na mifano ya mitihani kinashughulikia maeneo yote magumu ya masomo ya sayansi kwa wanafunzi wanaojiandaa na mtihani wa Taifa wa CSEE.', 'cat_olevel', 'sw', 2024, 'Elimu Bora Press', '978-9987-303-03-3', 'demo/sample-physics.pdf', 'application/pdf', 2150000, 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=600&q=80', 0, 0.0, 1, 1, 890, 435, 4.9, 1700000000000, 1700000000000),

('book_demo_4', 'Mbinu za Juu za Hisabati: Advanced Pure Mathematics for A-Level', 'advanced-pure-mathematics-a-level', 'Prof. David K. Sengondo', '[DEMO CONTENT - PREMIUM] Kitabu hiki kimeundwa maalum kwa wanafunzi wa Kidato cha Tano na Sita (PCM, PCB, PGM) kikijumuisha calculus, trigonometry, algebra na coordinate geometry na mifano halisi.', 'cat_alevel', 'en', 2024, 'Academic Scholars East Africa', '978-9987-404-04-4', 'demo/sample-math.pdf', 'application/pdf', 3400000, 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=600&q=80', 1, 8500.0, 1, 1, 410, 85, 5.0, 1700000000000, 1700000000000),

('book_demo_5', 'Mwongozo wa Ufugaji Bora wa Kuku na Kilimo cha Kisasa', 'mwongozo-wa-ufugaji-bora-wa-kuku', 'Mtaalamu John Shayo', '[DEMO CONTENT] Hatua kwa hatua namna ya kuanza mradi wa kilimo na ufugaji wenye tija, kanuni za chanjo, lishe bora, na masoko ya bidhaa za kilimo.', 'cat_manuals', 'sw', 2023, 'Uchumi Press', '978-9987-505-05-5', 'demo/sample-farming.pdf', 'application/pdf', 1540000, 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=600&q=80', 0, 0.0, 0, 1, 620, 310, 4.7, 1700000000000, 1700000000000),

('book_demo_6', 'Uchumi wa Kidijitali na Ujasiriamali Tanzania', 'uchumi-wa-kidijitali-na-ujasiriamali', 'Neema Kiluwa & Frank Temba', '[DEMO CONTENT - PREMIUM] Mwongozo wa vitendo kwa wajasiriamali wachanga kujenga biashara mtandaoni, kutumia mifumo ya malipo ya kidijitali, na kufikia wateja ndani na nje ya mipaka.', 'cat_maisha', 'sw', 2024, 'Visionary Hub', '978-9987-606-06-6', 'demo/sample-economy.pdf', 'application/pdf', 1800000, 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?auto=format&fit=crop&w=600&q=80', 1, 6000.0, 1, 1, 275, 54, 4.8, 1700000000000, 1700000000000);
