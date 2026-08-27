
        // ============ TANYA AI — KNOWLEDGE BASE (data dari dokumen Safe Future & Manulife) ============
        const SF_KB = [
            { k: ['founder', 'pendiri', 'founder safe future', 'siapa founder safe future', 'siapa pendiri safe future', 'yusuf bramantika situmorang'], a: 'Founder Safe Future adalah Yusuf Bramantika Situmorang. Ia merupakan Founder dan Financial Protection & Wealth Advisory di Safe Future, dengan latar belakang Finance, Accounting & Tax Professional.' },
            { k: ['apa saja layanan safe future', 'layanan safe future', 'services safe future', 'service safe future', 'layanan', 'jasa'], a: 'Safe Future memiliki tiga level layanan utama: Level 1 — Financial Health Check™ untuk memahami kondisi kesehatan finansial; Level 2 — Wealth & Protection Review gratis untuk review yang lebih mendalam bagi keluarga/nasabah yang membutuhkan analisis lebih komprehensif; dan Level 3 — Private Advisory untuk pendampingan eksklusif dan Financial Protection Blueprint jangka panjang. Safe Future juga menyediakan perencanaan Financial Protection, Health Protection, Critical Illness, Income Protection, Retirement, Education, Estate & Legacy, serta Business Protection.' },
            { k: ['perbedaan fhc wpr', 'beda fhc wpr', 'fhc dan wpr', 'fhc vs wpr', 'financial health check dan wealth protection review'], a: 'Perbedaannya ada pada kedalaman review. Financial Health Check™ (FHC) adalah diagnosis awal yang lebih ringkas dan dapat digunakan untuk memahami 7 dimensi utama: Cash Flow, Debt, Emergency, Protection, Retirement, Asset, dan Goals, lalu menghasilkan Financial Health Score dan analisis gap. Wealth & Protection Review (WPR) adalah review yang lebih mendalam, mencakup kondisi kekayaan/Net Worth, likuiditas, proteksi jiwa, pensiun, estate & succession secara preliminary, serta strategi dan rekomendasi. Sederhananya: FHC = diagnosis kesehatan finansial; WPR = review kekayaan & proteksi yang lebih komprehensif.' },
            { k: ['siapa founder', 'pendiri perusahaan', 'siapa pendirinya'], a: 'Founder Safe Future adalah Yusuf Bramantika Situmorang.' },
            { k: ['safe future', 'perusahaan', 'tentang', 'siapa', 'profil', 'apa itu safe'], a: 'Safe Future adalah perusahaan konsultan perlindungan finansial & perencanaan keuangan (Financial Protection & Wealth Advisory) yang membantu individu, keluarga, dan pemilik bisnis membangun fondasi keuangan yang lebih aman, sehat, dan berkelanjutan.\n\nTagline: "Safe Today. Secure Future."\n\nPrinsip kami: setiap keputusan finansial dimulai dari pemahaman kondisi & kebutuhan klien, bukan dari penawaran produk. Semua konsultasi diawali dengan Safe Future Financial Health Check™.' },
            { k: ['visi', 'misi', 'vision', 'mission', 'nilai', 'core value', 'brand'], a: 'Visi Safe Future: menjadi perusahaan Financial Protection & Wealth Advisory paling terpercaya di Indonesia.\n\nMisi: meningkatkan literasi financial protection, membantu keluarga memahami kesehatan finansial, memberi rekomendasi objektif berbasis kebutuhan, mendampingi strategi jangka panjang, dan menjadi partner keuangan keluarga sepanjang fase hidup.\n\nCore values: Integrity, Professionalism, Transparency, Client First, Continuous Improvement. Brand promise: "Kami tidak menjual produk. Kami membantu Anda mengambil keputusan yang tepat."' },
            { k: ['metode', 'method', 'safe future method', 'tahapan', 'alur', 'discover', 'diagnose', 'design', 'recommend', 'review', 'proses'], a: 'SAFE FUTURE METHOD™ adalah kerangka advisory kami dalam 5 tahap:\n\n1. DISCOVER — memahami kondisi & tujuan klien\n2. DIAGNOSE — menjalankan Safe Future Financial Health Check™\n3. DESIGN — menyusun Financial Protection Blueprint\n4. RECOMMEND — memberikan rekomendasi strategi & solusi\n5. REVIEW — evaluasi berkala\n\nFilosofi inti: Diagnosis Sebelum Rekomendasi (Diagnosis Before Recommendation). Kami memetakan masalah → strategi → solusi → baru produk jika sesuai kebutuhan.' },
            { k: ['pilar', '10 pilar', 'sepuluh pilar', 'framework', 'dimensi', 'penilaian'], a: 'Safe Future Financial Health Check™ menilai 10 pilar utama:\n\n1. Income Health\n2. Cash Flow Health\n3. Emergency Fund\n4. Asset Health\n5. Debt Health\n6. Protection Health\n7. Protection Gap Analysis\n8. Retirement Readiness\n9. Estate Planning\n10. Financial Goals\n\nDari 10 pilar ini dihasilkan Overall Financial Health Score, diagnosis, prioritas perbaikan, dan Protection Gap Analysis.' },
            { k: ['financial health check', 'fhc', 'cek kesehatan', 'health check', 'skor', 'score', 'hasil', 'diagnosis'], a: 'Safe Future Financial Health Check™ (FHC) adalah alat diagnosis kesehatan finansial seperti Medical Check Up — mengisi data, sistem menganalisis, lalu memberikan diagnosis & skor.\n\nFHC menganalisis: Cash Flow, Debt, Emergency Fund, Protection, Retirement, Asset, dan Goals — dengan bobot transparan (20/15/15/20/15/10/5).\n\nHasilnya: Financial Health Score (0–100), Estimated Protection Need, Estimated Life Protection Gap, Critical Illness Reserve, Retirement Funding Gap, dan rekomendasi prioritas. Semua gratis dan hanya ±5–7 menit.' },
            { k: ['wealth protection review', 'wpr', 'affluent', 'wealth', 'review', 'premium'], a: 'Wealth & Protection Review (W&PR) adalah layanan level 2 Safe Future untuk nasabah yang ingin review lebih mendalam — mencakup Net Worth, likuiditas (Liquidity Coverage), proteksi jiwa, pensiun, estate & succession (Preliminary), dan rekomendasi strategi.\n\nBerbeda dengan FHC yang mass-market, W&PR dirancang untuk segmen affluent/keluarga mapan yang ingin penilaian menyeluruh sebelum menyusun strategi.' },
            { k: ['layanan', 'service', 'konsultasi', 'private advisory', 'advisory', 'jasa'], a: 'Layanan Safe Future berjenjang:\n\nLevel 1 — Financial Health Check™ (untuk Anda & keluarga, mulai dari diagnosis)\nLevel 2 — Wealth & Protection Review (review mendalam, gratis)\nLevel 3 — Private Advisory (pendampingan eksklusif & blueprint jangka panjang)\n\nLayanan lain: Financial Protection Planning, Health Protection Planning, Critical Illness Planning, Income Protection Planning, Retirement Planning, Education Planning, Estate & Legacy Planning, Business Protection Planning.' },
            { k: ['produk', 'asuransi', 'solusi', 'manulife', 'product'], a: 'Safe Future merekomendasikan solusi dari mitra resmi (PT Asuransi Jiwa Manulife Indonesia, berizin & diawasi OJK) — tetapi HANYA setelah diagnosis kebutuhan.\n\nPeta produk berdasarkan kebutuhan:\n• Biaya rumah sakit → MiUltimate HealthCare (MiUHC)\n• Perlindungan pencari nafkah → ProActive Plus (PAP)\n• Jiwa + penyakit kritis + ICU → Dynamic Life Assurance (MDLA)\n• Investasi + jiwa → Dynamic Smart Assurance (MDSA)\n• Solusi syariah → FLEXI, MiSSION Syariah, MPPS, MiUHC Syariah\n• Pensiun & warisan → MiFuture Income Protector (MiFIP), MiPrecious\n\nIngat: produk adalah HASIL konsultasi, bukan tujuan konsultasi.' },
            { k: ['miuhc', 'miultimate healthcare', 'kesehatan', 'rumah sakit', 'rawat inap', 'bpjs', 'cashless'], a: 'MiUltimate HealthCare (MiUHC) adalah solusi perlindungan kesehatan dari Manulife yang membantu menanggung biaya rumah sakit sesuai manfaat & plan.\n\nKeunggulan: manfaat tahunan hingga Rp30 miliar, pilihan perlindungan Indonesia/Asia/seluruh dunia, cashless di Manulife Preferred Hospitals, 15 pilihan plan, manfaat rawat inap, ICU, tindakan bedah, kanker, cuci darah, ambulans, serta No Claim Bonus/Discount.\n\nCocok untuk semua orang (usia ideal 18–55). Masalah yang dijawab: "Kalau besok harus operasi Rp400 juta, uangnya mau ambil dari mana?"' },
            { k: ['miuhc syariah', 'kesehatan syariah', 'tabarru'], a: 'MiUltimate HealthCare Syariah adalah asuransi kesehatan individu berbasis syariah (Dana Tabarru\') yang menanggung biaya perawatan rumah sakit, perlindungan dapat berlanjut hingga usia 110 tahun sesuai ketentuan polis.\n\nManfaat tahunan hingga Rp20 miliar, cashless di rumah sakit rekanan, No Claim Discount/Bonus, dan prinsip saling tolong-menolong sesuai syariah.' },
            { k: ['pap', 'proactive plus', 'jiwa produktif', 'pencari nafkah', 'breadwinner', 'premi'], a: 'ProActive Plus (PAP) adalah asuransi jiwa individu untuk perlindungan pencari nafkah. Manfaat meninggal dunia 100% Uang Pertanggungan, premi tetap selama masa pembayaran sesuai ketentuan, masa pertanggungan 5–20 tahun. Poster terbaru Safe Future mencantumkan premi mulai Rp333 ribu/bulan; angka aktual mengikuti usia masuk, underwriting, plan, dan ketentuan polis.\n\nTarget: ayah/kepala keluarga/pencari nafkah usia produktif.' },
            { k: ['mdla', 'dynamic life', 'kritis', 'icu', 'penyakit kritis'], a: 'Dynamic Life Assurance (MDLA) adalah asuransi jiwa dwiguna: perlindungan jiwa + perlindungan penyakit kritis + dukungan ICU + dana akhir masa pertanggungan (sesuai plan).\n\nTarget: usia 30–55, pendapatan menengah ke atas, atau yang khawatir penyakit kritis (riwayat kanker/diabetes/stroke/jantung). Kalimat kunci: "Orang sekarang lebih takut sakit lama daripada meninggal."' },
            { k: ['mdsa', 'dynamic smart', 'investasi', 'unit link', 'payout', 'wealth'], a: 'Dynamic Smart Assurance (MDSA) adalah asuransi jiwa unit link: menggabungkan perlindungan jiwa (hingga usia 110 tahun) dengan potensi pertumbuhan investasi dalam satu polis.\n\nDapat dilengkapi rider kesehatan (MiSmart Health Care) & penyakit kritis (MiSmart Critical Care Plus). Target: investor, pebisnis, profesional mapan yang sudah punya dana darurat & proteksi dasar. Produk lanjutan, bukan produk awal.' },
            { k: ['mdwa', 'dynamic wealth', 'dwiguna', 'pendidikan', 'warisan', 'cash value'], a: 'Dynamic Wealth Assurance (MDWA) adalah asuransi jiwa dwiguna untuk berbagai tujuan: dana pendidikan, pembayaran tunai berkala, atau dana akhir masa pertanggungan — dengan perlindungan risiko meninggal dunia karena kecelakaan / ketidakmampuan total tetap.\n\nCocok untuk orang tua yang menyiapkan dana pendidikan, pasangan muda, profesional yang merencanakan pensiun, dan perencana warisan.' },
            { k: ['mifip', 'mi future', 'income protector', 'pensiun', 'dana pensiun', 'retirement'], a: 'MiFuture Income Protector (MiFIP) membantu mempersiapkan pensiun sekaligus perlindungan keluarga: Dana Mapan saat usia pensiun, pembayaran tunai tahunan selama 20 tahun, dana akhir masa pertanggungan, perlindungan jiwa, dan perencanaan warisan.\n\nCocok untuk karyawan tanpa pensiun tetap, pengusaha/profesional, dan siapa saja yang ingin tetap memiliki penghasilan setelah berhenti bekerja. Pilihan premi sekaligus atau reguler 5 tahun, mata uang IDR/USD.' },
            { k: ['miprecious', 'mi precious', 'legacy', 'warisan', 'estate'], a: 'MiPreparation Legacy For Our Assurance (MiPrecious) adalah asuransi jiwa dwiguna untuk perlindungan keluarga + perencanaan jangka panjang: perlindungan jiwa, manfaat tunai berkala, manfaat akhir masa pertanggungan, dan dapat diteruskan ke generasi berikutnya (fasilitas perubahan tertanggung sesuai syarat polis).\n\nCocok untuk keluarga muda, profesional, pebisnis, perencana pensiun & warisan.' },
            { k: ['mccp', 'critical care protection', 'kritis', 'penyakit kritis', 'ci'], a: 'Manulife Critical Care Protection (MCCP) adalah asuransi penyakit kritis dengan perlindungan sejak tahap awal hingga tahap lebih serius sampai usia 85 tahun. Tersedia Plan 1 dan Plan 2; manfaat ICU/ICCU/PICU berlaku sesuai ketentuan Plan 2. Brosur juga mencantumkan manfaat angioplasti, manfaat penyakit kritis tahap awal/akhir, manfaat meninggal dunia, dan manfaat akhir masa pertanggungan.\n\nMateri resmi yang tersedia tidak mencantumkan minimum premi; besaran mengikuti usia, UP, plan, masa bayar, underwriting, dan ketentuan polis.' },
            { k: ['flexi', 'syariah', 'perlindungan syariah', 'amanah', 'berkah', 'cermat'], a: 'Manulife Perlindungan Syariah (FLEXI) adalah asuransi jiwa berbasis syariah dengan 3 plan:\n\n• Flexi Amanah — proteksi jiwa, kontribusi mulai ±Rp4 juta/tahun\n• Flexi Berkah — proteksi jangka panjang + manfaat hidup\n• Flexi Cermat — manfaat hidup di akhir masa asuransi + proteksi jiwa\n\nSantunan mulai Rp100 juta, perlindungan hingga usia 110 tahun (sesuai plan), tersedia wakaf & peluang Surplus Underwriting. Mata uang Rupiah/USD.' },
            { k: ['mpds', 'manulife perlindungan diri syariah', 'perlindungan diri syariah', 'jiwa syariah'], a: 'Manulife Perlindungan Diri Syariah adalah asuransi jiwa dwiguna syariah. Manfaat utamanya meliputi meninggal dunia, tambahan santunan meninggal dunia karena kecelakaan sebesar 50% sesuai ketentuan, dan manfaat akhir masa asuransi. Kontribusi minimum Rp250.000/bulan; masa pembayaran 5 atau 12 tahun; masa asuransi 12 tahun.\n\nCocok sebagai langkah awal perlindungan keluarga berbasis syariah.' },
            { k: ['mpps', 'manulife perlindungan pendidikan syariah', 'pendidikan syariah', 'dana pendidikan', 'pendidikan anak', 'sekolah'], a: 'Manulife Perlindungan Pendidikan Syariah (MPPS) adalah asuransi jiwa dwiguna berbasis syariah untuk membantu menyiapkan pendidikan anak. Tersedia Plan Jiwa dan Plan Sakit Kritis. Manfaat mencakup meninggal dunia, penyakit kritis tahap akhir untuk Plan Sakit Kritis, manfaat tahapan terjadwal, serta 100% pengembalian kontribusi pada akhir masa asuransi bila polis aktif sesuai ketentuan.\n\nCocok untuk orang tua yang ingin menjaga keberlanjutan pendidikan anak.' },
            { k: ['mission', 'miSSION', 'syariah investasi', 'investasi syariah', 'tabarru investasi'], a: 'MiSmart Insurance Solution Syariah (MiSSION Syariah) menggabungkan perlindungan jiwa + investasi syariah + semangat tolong-menolong (tabarru\') dalam satu produk.\n\nJika terjadi risiko → keluarga tetap terlindungi. Jika tidak → nilai investasi berpotensi berkembang (hasil tidak dijamin, produk PAYDI). Berpeluang manfaat loyalitas & surplus underwriting. Cocok untuk Muslim yang menginginkan solusi syariah + membangun aset jangka panjang.' },
            { k: ['financial health report', 'report', 'laporan', 'blueprint', 'protection blueprint'], a: 'Setiap klien Safe Future menerima:\n\n• Safe Future Financial Health Report™ — Overall Score, diagnosis, prioritas, Protection Gap Analysis, dan Financial Blueprint\n• Protection Strategy Session™ — sesi membahas hasil & strategi\n• Financial Protection Blueprint™ — rencana perlindungan terstruktur\n• Annual Financial Review — evaluasi berkala\n\nAlur proses: FHC → Report → Strategy Session → Blueprint → Implementation → Annual Review.' },
            { k: ['dana darurat', 'emergency fund', 'tabungan darurat', 'berapa bulan'], a: 'Dana darurat ideal umumnya 3–6 bulan pengeluaran (untuk lajang) hingga 6–12 bulan pengeluaran esensial (untuk keluarga/tanggungan).\n\nDi FHC, skor Emergency Fund dihitung dari rasio dana likuid ÷ pengeluaran bulanan. Dana darurat sebaiknya disimpan di instrumen likuid (tabungan/deposito jangka pendek), BUKAN di investasi berisiko tinggi atau aset yang sulit dicairkan.' },
            { k: ['proteksi', 'protection gap', 'kebutuhan proteksi', 'celah', 'human life value', 'hlv', 'estimated protection'], a: 'Estimated Protection Need = estimasi kebutuhan perlindungan keluarga (penggantian penghasilan + pelunasan utang + dana pendidikan + biaya akhir) dikurangi proteksi yang sudah dimiliki.\n\nHasilnya disebut Estimated Life Protection Gap — INI BUKAN jumlah pertanggungan yang wajib dibeli, melainkan alat bantu perencanaan untuk memahami kebutuhan. Angka perlu ditinjau ulang berdasarkan kondisi individual.\n\nHuman Life Value (jika digunakan) hanya sebagai konsep perhitungan internal, bukan istilah utama untuk konsumen.' },
            { k: ['kritis', 'critical illness', 'ci gap', 'cadangan penyakit kritis', 'reserve'], a: 'Critical Illness Reserve adalah estimasi cadangan untuk penyakit kritis — memakai benchmark ilustratif 24 bulan pengeluaran esensial.\n\nRumus: Critical Illness Gap = Illustrative Critical Illness Reserve − Proteksi Kritis yang sudah dimiliki.\n\nAngka ini ILLUSTRATIF (bukan angka pasti yang wajib disiapkan). Biaya penyakit kritis di Indonesia bisa Rp400 jt–950 jt (kanker/ginjal) — lihat brosur resmi Manulife untuk data terkini.' },
            { k: ['pensiun', 'retirement', 'dana pensiun', 'usia pensiun', 'retirement gap'], a: 'FHC menghitung Retirement Funding Gap dengan 3 skenario (konservatif/moderat/optimal) menggunakan engine yang sama dengan W&PR: longevity 85 tahun, hanya inflasi & return yang berbeda (3%/7,5%/2,5% dst).\n\n"Illustrative assumptions only — investment returns are not guaranteed."\n\nMulai menyisihkan dana pensiun sedini mungkin; makin awal, makin kecil beban bulanan karena compounding.' },
            { k: ['skor', 'score', 'nilai', 'kategori', 'healthy', 'sehat', 'perlu perhatian', 'critical'], a: 'Financial Health Score Safe Future berkisar 0–100:\n\n• 75–100: Healthy (sehat)\n• 50–74: Moderate (perlu perhatian)\n• <50: Needs Review (perlu ditinjau serius)\n\nSkor dihitung dari dimensi berbobot: Cash Flow 20%, Debt 15%, Emergency 15%, Protection 20%, Retirement 15%, Asset 10%, Goals 5% (total 100%). Lihat panel "Bagaimana skor dihitung?" di hasil FHC.' },
            { k: ['cara mulai', 'mulai', 'daftar', 'form', 'isi', 'langkah', 'book', 'konsultasi gratis'], a: 'Cara memulai di Safe Future:\n\n1. Isi Financial Health Check™ (gratis, ±5–7 menit) — klik "Mulai Financial Health Check"\n2. Terima hasil: Financial Health Score + kebutuhan proteksi + prioritas\n3. Jadwalkan sesi konsultasi via WhatsApp (tombol "Diskusikan via WhatsApp")\n4. Dapatkan Financial Protection Blueprint™ & rekomendasi strategi\n\nKonsultasi awal gratis. Semua diawali diagnosis — bukan penawaran produk.' },
            { k: ['biaya', 'harga', 'tarif', 'premi', 'mahal', 'gratis'], a: 'Financial Health Check™ & konsultasi awal Safe Future GRATIS.\n\nPremi produk bervariasi sesuai produk & kebutuhan, contoh ilustrasi minimum: PAP mulai Rp333 ribu/bulan sesuai poster terbaru, MPDS mulai Rp250 ribu/bulan, FLEXI Amanah mulai ±Rp4 juta/tahun, dan MiSSION Syariah mulai Rp4 juta/tahun. Angka pasti ditentukan setelah analisis kebutuhan & underwriting.\n\nSafe Future tidak menjual produk; kami membantu Anda memilih solusi sesuai kebutuhan & kemampuan finansial.' },
            { k: ['whatsapp', 'wa', 'kontak', 'hubungi', 'telepon', 'instagram', 'sosial', 'media'], a: 'Hubungi Safe Future:\n\n• WhatsApp: +62 858-8783-6384 (klik tombol WhatsApp di halaman ini)\n• Instagram: @safuture.id\n\nAnda juga bisa mengisi Financial Health Check™ lalu klik "Diskusikan via WhatsApp" — hasil ringkas & jadwal konsultasi akan terkirim otomatis.' },
            { k: ['ojk', 'regulasi', 'legal', 'berizin', 'diawasi', 'resmi', 'aman'], a: 'Safe Future adalah konsultan advisory (bukan perusahaan asuransi). Solusi produk direkomendasikan melalui mitra resmi: PT Asuransi Jiwa Manulife Indonesia & PT Asuransi Jiwa Manulife Indonesia Syariah — keduanya berizin dan diawasi oleh Otoritas Jasa Keuangan (OJK).\n\nSeluruh manfaat, premi, & ketentuan mengikuti polis resmi & RIPLAY yang berlaku. Informasi di website ini untuk tujuan edukasi, bukan penawaran atau nasihat keuangan personal.' },
            { k: ['klaim', 'claim', 'proses klaim', 'cair', 'polis'], a: 'Proses klaim mengikuti ketentuan polis & perusahaan asuransi (Manulife). Umumnya: siapkan dokumen polis, formulir klaim, dan bukti pendukung sesuai jenis manfaat.\n\nSafe Future mendampingi Anda — bukan hanya saat pembelian, tetapi juga ketika membutuhkan bantuan klaim maupun evaluasi perlindungan di masa depan. Hubungi kami via WhatsApp untuk panduan klaim spesifik.' },
            { k: ['edukasi', 'literasi', 'belajar', 'tips', 'artikel', 'insight', 'blog'], a: 'Safe Future rutin membagikan edukasi keuangan: biaya rumah sakit & inflasi medis, risiko penyakit kritis, Human Life Value, perlindungan keluarga, dan perencanaan pensiun.\n\nKami percaya: keputusan finansial terbaik dimulai dari pemahaman yang benar. Ikuti Instagram @safuture.id untuk konten edukasi (≈80% edukasi, 20% produk).' },
            { k: ['aset', 'asset', 'investasi', 'saham', 'reksadana', 'properti', 'emas', 'likuid'], a: 'Kesehatan aset dinilai dari: kecukupan likuiditas (40%), diversifikasi (25%), risiko konsentrasi (20%), dan posisi aset produktif (15%).\n\nPrinsipnya: portofolio yang seimbang & likuid lebih sehat daripada konsentrasi tinggi di satu jenis aset — bukan sekadar "semakin banyak investasi semakin baik". Dana darurat harus tetap likuid sebelum berinvestasi jangka panjang.' },
            { k: ['utang', 'hutang', 'debt', 'kpr', 'cicilan', 'kartu kredit', 'pinjaman'], a: 'Skor utang dinilai dari rasio utang terhadap penghasilan & kemampuan membayar cicilan. Prinsip sehat: total cicilan (Debt Service Ratio) idealnya ≤ 30–40% penghasilan.\n\nUtang produktif (KPR/usaha) berbeda dengan utang konsumtif (kartu kredit/pinjol). FHC menganalisis keduanya untuk menilai Debt Health secara menyeluruh.' },
            { k: ['tujuan', 'goals', 'finansial goals', 'target', 'dana pendidikan anak', 'dana darurat'], a: 'Tujuan finansial (Financial Goals) di FHC bersifat multi-pilih: Perlindungan Keluarga, Dana Pendidikan Anak, Dana Pensiun, Dana Darurat, Investasi & Pertumbuhan Aset, Bebas Utang — masing-masing dengan target nominal opsional.\n\nSkor Goals dinilai dari kelengkapan tujuan + target + kapasitas pendanaan (bukan sekadar jumlah tujuan). Setiap tujuan dipetakan ke strategi & solusi terkait (pendidikan → MPPS/MDWA; pensiun → MiFIP; proteksi → PAP/FLEXI; darurat → MiUHC/RDPU; dst).' },
            { k: ['estate', 'warisan', 'wasiat', 'succession', 'ahli waris', 'beneficiary'], a: 'Estate & Succession (Preliminary) adalah penilaian awal kesiapan warisan: ahli waris/beneficiary, asuransi jiwa, wasiat, dan pembagian aset.\n\nCatatan: ini penilaian AWAL (preliminary) dan bukan nasihat hukum atau pajak. Untuk struktur warisan kompleks, disarankan konsultasi dengan profesional hukum/perpajakan.' },
            { k: ['privacy', 'privasi', 'data', 'aman data', 'kerahasiaan', 'keamanan'], a: 'Data yang Anda isi di Financial Health Check™ tersimpan di Supabase (cloud) dengan Row Level Security: publik hanya bisa MENULIS (insert), hanya admin terverifikasi yang bisa membaca.\n\nRingkasan hasil yang dikirim ke WhatsApp TIDAK memuat angka finansial sensitif — hanya nama, skor, dan area diskusi. Informasi produk bersifat edukasi; bukan nasihat keuangan personal.' },
            { k: ['terima kasih', 'makasih', 'thanks', 'oke', 'ok', 'mantap', 'bagus', 'helpful'], a: 'Sama-sama! 😊 Semoga membantu.\n\nJika ingin langkah selanjutnya, Anda bisa langsung mengisi Financial Health Check™ atau menghubungi kami via WhatsApp untuk konsultasi gratis.' },
            { k: ['hai', 'halo', 'hello', 'hi', 'pagi', 'siang', 'sore', 'malam', 'assalamualaikum', 'selamat'], a: 'Halo! 👋 Selamat datang di Safe Future — Financial Protection & Wealth Advisory.\n\nSaya bisa membantu menjawab pertanyaan tentang Financial Health Check™, produk perlindungan, dana pensiun, asuransi kesehatan, dan lainnya. Apa yang ingin Anda ketahui?' }
        ];

        // Canonical product update layer — source-aligned with the latest Safe Future materials supplied by the owner.
        const SF_LATEST_PRODUCT_UPDATE = {
            pap: { name:'Manulife ProActive Plus (PAP)', category:'life', latestPricing:'Rp333 ribu/bulan', note:'Mengacu poster terbaru Safe Future; aktual mengikuti usia masuk, underwriting, plan dan polis.' },
            miuhcs: { name:'MiUltimate HealthCare Syariah (MiUHCS)', category:'health', pricing:'Sesuai usia & plan', brochure:'assets/solusi-produk/brosur/miuhcs.pdf' },
            mpds: { name:'Manulife Perlindungan Diri Syariah', category:'life', pricing:'Mulai Rp250 ribu/bulan', brochure:'assets/solusi-produk/brosur/manulife-perlindungan-diri-syariah.pdf' },
            mccp: { name:'Manulife Critical Care Protection (MCCP)', category:'critical', pricing:'Sesuai usia, UP, plan & underwriting', brochure:'assets/solusi-produk/brosur/mccp.pdf' },
            mission: { name:'MiSmart Insurance Solution Syariah (MiSSION Syariah)', category:'investment', pricing:'Mulai Rp4 juta/tahun', brochure:'assets/solusi-produk/brosur/mission-syariah.pdf' },
            mpps: { name:'Manulife Perlindungan Pendidikan Syariah (MPPS)', category:'sharia', pricing:'Sesuai kontribusi & ketentuan produk', brochure:'assets/solusi-produk/brosur/mpps.pdf' }
        };

        const SF_CHIPS = ['Bagaimana Safe Future bisa membantu saya?', 'Apa yang dimaksud Diagnosis Sebelum Rekomendasi?', 'Apa saja yang diperiksa Financial Health Check?', 'Apa prioritas saya berdasarkan hasil FHC?', 'Produk apa yang sesuai dengan kebutuhan saya?', 'Kapan saya perlu konsultasi dengan advisor?'];

        function sfNormalize(t) {
            return (t || '').toLowerCase().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
        }

        function sfMatchScore(q, kb) {
            const STOP = ['apa','itu','yang','untuk','dengan','dari','dan','saya','anda','kamu','bagaimana','mengapa','apakah','berapa','ceritakan','jelaskan','tolong','bisa','dapat','ingin','mau','tentang','ada','akan','sudah','belum','apakah','kenapa','kapan','dimana','di','ke','pada','ini','itu','sebuah','suatu','saya','kami','kita','semua','saja','juga','apa'];
            const nq = sfNormalize(q);
            const words = nq.split(' ').filter(w => w.length > 3 && STOP.indexOf(w) === -1);
            let score = 0;
            kb.k.forEach(key => {
                const nk = sfNormalize(key);
                const kwWords = nk.split(' ').filter(w => w.length > 3 && STOP.indexOf(w) === -1);
                if (nk.length > 3 && nq.includes(nk)) { score += kwWords.length * 3 + 2; return; }
                kwWords.forEach(kw => { if (words.indexOf(kw) !== -1 || nq.includes(kw)) score += 1.5; });
            });
            return score;
        }

        function sfAnswer(q) {
            let best = null, bestScore = 0;
            SF_KB.forEach(entry => {
                const s = sfMatchScore(q, entry);
                if (s > bestScore) { bestScore = s; best = entry; }
            });
            if (best && bestScore >= 2.5) return best.a;
            return null;
        }

        function sfEscapeHtml(value) {
            return String(value ?? '')
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/\"/g, '&quot;')
                .replace(/'/g, '&#39;');
        }

        function sfInlineMarkdown(value) {
            let s = sfEscapeHtml(value);
            s = s.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
            s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
            s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
            s = s.replace(/__([^_]+)__/g, '<strong>$1</strong>');
            s = s.replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, '<em>$1</em>');
            s = s.replace(/(?<!_)_([^_\n]+)_(?!_)/g, '<em>$1</em>');
            return s;
        }

        function sfRenderMarkdown(text) {
            const source = String(text ?? '').replace(/\\n/g, '\n').replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
            if (!source) return '<div class="sfai-content"></div>';

            const lines = source.split('\n');
            const out = [];
            let paragraph = [];
            let listType = null;

            const flushParagraph = () => {
                if (!paragraph.length) return;
                const joined = paragraph.join(' ').replace(/\s{2,}/g, ' ').trim();
                if (joined) out.push('<p>' + sfInlineMarkdown(joined) + '</p>');
                paragraph = [];
            };

            const closeList = () => {
                if (listType) { out.push('</' + listType + '>'); listType = null; }
            };

            const openList = (type) => {
                if (listType === type) return;
                closeList();
                listType = type;
                out.push('<' + type + '>');
            };

            lines.forEach(rawLine => {
                const line = rawLine.trim();

                if (!line) {
                    flushParagraph();
                    closeList();
                    return;
                }

                if (/^[-*_]{3,}$/.test(line)) {
                    flushParagraph();
                    closeList();
                    out.push('<hr>');
                    return;
                }

                const heading = line.match(/^#{1,4}\s+(.+)$/);
                if (heading) {
                    flushParagraph();
                    closeList();
                    const level = heading[0].match(/^#+/)[0].length;
                    const tag = level <= 3 ? 'h3' : 'h4';
                    out.push('<' + tag + '>' + sfInlineMarkdown(heading[1]) + '</' + tag + '>');
                    return;
                }

                const ordered = line.match(/^\d+[.)]\s+(.+)$/);
                const unordered = line.match(/^[-*•]\s+(.+)$/);
                if (ordered || unordered) {
                    flushParagraph();
                    openList(ordered ? 'ol' : 'ul');
                    out.push('<li>' + sfInlineMarkdown((ordered || unordered)[1]) + '</li>');
                    return;
                }

                closeList();
                paragraph.push(line);
            });

            flushParagraph();
            closeList();
            return '<div class="sfai-content">' + out.join('') + '</div>';
        }

        function sfAddMsg(text, who) {
            const body = document.getElementById('sfaiBody');
            const div = document.createElement('div');
            div.className = 'sfai-msg ' + (who === 'user' ? 'user' : 'bot');
            div.innerHTML = sfRenderMarkdown(text);
            body.appendChild(div);
            body.scrollTop = body.scrollHeight;
        }

        function sfTyping(on, label) {
            const body = document.getElementById('sfaiBody');
            let t = document.getElementById('sfaiTyping');
            if (on) {
                if (!t) { t = document.createElement('div'); t.id = 'sfaiTyping'; t.className = 'sfai-msg bot'; t.textContent = label || 'Menganalisis…'; body.appendChild(t); body.scrollTop = body.scrollHeight; }
            } else if (t) { t.remove(); }
        }

        let sfOpened = false;
        function sfAiToggle() {
            sfOpened = !sfOpened;
            document.getElementById('tanyaAiPanel').classList.toggle('sf-hidden', !sfOpened);
            document.getElementById('tanyaAiFab').classList.toggle('sf-open', sfOpened);
            if (sfOpened) {
                const body = document.getElementById('sfaiBody');
                if (!body.children.length) {
                    sfAddMsg('Selamat datang di Tanya AI — Safe Future.\n\nSaya membantu Anda memahami kondisi keuangan, membaca hasil Financial Health Check™ dan Wealth & Protection Review, serta menjelaskan risiko, gap, dan prioritas Anda.\n\nJika Anda sedang mencari asuransi atau ingin tahu perlindungan apa yang dibutuhkan, **mulailah dari Financial Health Check™**. Anda tidak perlu memasukkan data pribadi di Tanya AI. Setelah diagnosis tersedia, saya dapat membantu menjelaskan hasilnya dan mengarahkan Anda ke solusi yang relevan.\n\nContoh pertanyaan:\n• Bagaimana Safe Future dapat membantu saya?\n• Apa arti Financial Health Score saya?\n• Apa penyebab protection gap saya?\n• Apa yang sebaiknya saya prioritaskan lebih dulu?\n• Apa perbedaan MiUHC dan MCCP?');;
                    const chips = document.getElementById('sfaiChips');
                    chips.innerHTML = '';
                    SF_CHIPS.forEach(c => { const b = document.createElement('button'); b.className = 'sfai-chip'; b.textContent = c; b.onclick = () => { document.getElementById('sfaiInput').value = c; sfAiSend(); }; chips.appendChild(b); });
                }
                document.getElementById('sfaiInput').focus();
            }
        }


        // ============ REAL AI BRIDGE — Safe Future → Supabase Edge Function → Gemini ============
        let sfAiClient = null;
        let sfAiSessionPromise = null;
        const SF_AI_ENDPOINT = (window.SUPABASE_URL || 'https://iymwjyptfkvjqxeeayhj.supabase.co') + '/functions/v1/safe-future-ai-public';

        function sfGetAiClient() {
            if (sfAiClient) return sfAiClient;
            if (!window.supabase || !window.SUPABASE_URL || !window.SUPABASE_KEY) return null;
            sfAiClient = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_KEY);
            return sfAiClient;
        }

        async function sfEnsureAiSession() {
            // AI Edge Function no longer depends on Supabase Anonymous Auth.
            return { access_token: null };
        }

        function sfBuildDiagnosisContext() {
            const f = window.__fhcScenarios || {};
            const w = window.__wprData || {};
            const diagnosis = {
                product_context: 'Safe Future Financial Health Check / Wealth & Protection Review',
                fhc: {
                    overall_score: document.getElementById('overallScore')?.textContent || null,
                    score_cashflow: f.scoreCashflow ?? null,
                    score_debt: f.scoreDebt ?? null,
                    score_emergency: f.scoreEmergency ?? null,
                    score_protection: f.scoreProtection ?? null,
                    score_retirement: f.scoreRetirement ?? null,
                    score_asset: f.scoreAsset ?? null,
                    score_goals: f.scoreGoals ?? null,
                    protection_gap: f.protectionGap ?? null,
                    insurance_protection: f.insuranceProtection ?? null,
                    critical_illness_gap: f.ciGap ?? null,
                    retirement_gap_moderate: f.gapFV?.moderat ?? null,
                    priorities: Array.isArray(f.priorities) ? f.priorities.slice(0,5).map(x => ({
                        title: x.title, score: x.score, reason: x.reason
                    })) : []
                },
                wpr: {
                    score:w.wprScore??null,status:w.wprStatus??null,name:w.nama??null,whatsapp:w.wa??null,goals:Array.isArray(w.tujuan)?w.tujuan:[],
                    net_worth:w.netWorth??null,concentration_risk:w.concRisk??null,liquidity_coverage:w.liquidMonths??null,protection_coverage:w.protCoverage??null,retirement_score:w.retScore??null,estate_score:w.estateScore??null,
                    inputs:w.inputs??{},calculations:w.calculations??{},modules:Array.isArray(w.modules)?w.modules:[],observation:w.observation??null,recommendations:Array.isArray(w.recommendations)?w.recommendations:[]
                }
            };
            return diagnosis;
        }

        function sfStarterAnswer(question){
            const q=sfNormalize(question);
            if(q.includes('bagaimana safe future bisa membantu') || q.includes('bagaimana safe future dapat membantu')){
                return null; // handled by the richer Safe Future answer below
            }
            if(q.includes('diagnosis sebelum rekomendasi')){
                return `**Diagnosis Sebelum Rekomendasi** berarti Safe Future tidak memulai konsultasi dengan menanyakan produk apa yang ingin Anda beli. Kami mulai dari kondisi, tujuan, risiko, kemampuan finansial, dan gap yang perlu diperhatikan.

Alurnya: **Discover → Diagnose → Design → Recommend → Review**.

Jadi, setelah kondisi Anda dipahami dan prioritasnya terlihat, barulah strategi dan opsi solusi dibahas. Produk hanya dipertimbangkan jika memang relevan dengan kebutuhan Anda.`;
            }
            if(q.includes('apa saja yang diperiksa financial health check') || q.includes('apa yang diperiksa financial health check')){
                return `**Financial Health Check™ menilai 7 dimensi utama:** Cash Flow, Debt, Emergency Fund, Protection, Retirement, Asset, dan Goals.

Hasilnya berupa **Financial Health Score 0–100**, estimasi kebutuhan proteksi, protection gap, critical illness gap, retirement funding gap, serta prioritas perbaikan.

Jadi FHC bukan sekadar menghitung satu angka. Tujuannya adalah membantu Anda melihat bagian keuangan mana yang sudah sehat dan mana yang perlu diperbaiki terlebih dahulu.`;
            }
            if(q.includes('prioritas saya berdasarkan hasil fhc') || q.includes('prioritas saya berdasarkan hasil financial health check')){
                const hasDiagnosis=!!(window.__fhcScenarios && (window.__fhcScenarios.priorities || window.__fhcScenarios.protectionGap!=null));
                if(!hasDiagnosis) return `Saya bisa membantu menentukan prioritas berdasarkan hasil **Financial Health Check™** Anda. Namun, saya tidak akan menebak prioritas pribadi tanpa melihat hasil diagnosis.

Secara umum, Safe Future akan melihat fondasi terlebih dahulu—**cash flow, utang, dana darurat, proteksi**, kemudian pensiun, aset, dan tujuan. Jika Anda sudah memiliki hasil FHC, saya dapat menjelaskannya satu per satu dan membantu menentukan urutan langkahnya.`;
            }
            if(q.includes('produk apa yang sesuai dengan kebutuhan saya')){
                return `Saya tidak akan langsung menyebut satu produk sebagai pilihan terbaik tanpa memahami kebutuhan Anda.

Safe Future menggunakan prinsip **Diagnosis Before Recommendation**. Kebutuhan seperti biaya rumah sakit, perlindungan penghasilan/keluarga, penyakit kritis, pensiun, pendidikan, atau legacy dapat mengarah ke kategori solusi yang berbeda.

Jika hasil FHC/W&PR Anda sudah tersedia, saya dapat menjelaskan **mengapa** suatu kategori solusi relevan, apa yang perlu dibandingkan, dan kapan sebaiknya dibahas lebih lanjut dengan advisor Safe Future.`;
            }
            if(q.includes('kapan saya perlu konsultasi dengan advisor')){
                return `Anda tidak harus menunggu sampai kondisi keuangan bermasalah untuk berkonsultasi dengan advisor.

Konsultasi biasanya semakin bermanfaat ketika Anda mengalami **perubahan besar dalam hidup**, memiliki protection gap yang perlu ditinjau, mulai merencanakan pensiun/pendidikan/warisan, memiliki beberapa polis atau aset yang perlu dievaluasi, atau membutuhkan penilaian yang sangat personal seperti kebutuhan pertanggungan dan underwriting.

Di Safe Future, konsultasi dimulai dari diagnosis dan kebutuhan—bukan tekanan untuk membeli produk tertentu.`;
            }
            return null;
        }

        function sfKnowledgeFallback(question){
            const q=sfNormalize(question);
            if(!q) return null;
            try{ const curated=sfAnswer(question); if(curated) return curated; }catch(e){ console.warn('Curated KB fallback:',e); }
            const all=[];
            try{ Object.values(productsData||{}).flat().forEach(p=>all.push(p)); }catch(_){ }
            const normalizeName=v=>String(v||'').toLowerCase().replace(/[^a-z0-9]+/g,'');
            const hits=all.filter(p=>{
                const hay=[p.id,p.title,p.badge,p.headline].map(normalizeName).join(' ');
                return q.split(/\s+/).filter(Boolean).some(tok=>tok.length>=4 && hay.includes(normalizeName(tok)));
            });
            // Prefer explicit product aliases so short questions such as "Apa MiUHC?" work offline.
            const aliases=[
              ['miuhc','miuhc'],['miultimate healthcare','miuhc'],['mccp','mccp'],['critical care protection','mccp'],
              ['miucc','miucc'],['miultimate critical care','miucc'],['pap','pap'],['proactive plus','pap'],
              ['mdla','mdla'],['dynamic life assurance','mdla'],['mdsa','mdsa'],['dynamic smart assurance','mdsa'],
              ['mifip','mifip'],['miprecious','miprecious']
            ];
            const ids=aliases.filter(([a])=>q.includes(a)).map(([,id])=>id);
            const byId=id=>all.find(p=>p.id===id);
            const selected=(ids.length?ids.map(byId).filter(Boolean):hits).slice(0,3);
            if(selected.length>=2 && /(beda|perbedaan|banding|vs|dibanding|lebih baik)/.test(q)){
                return `## Perbandingan ${selected.map(p=>p.title).join(' vs ')}\n\n`+selected.map(p=>`**${p.title}** — ${p.solution||p.headline}\n\n**Poin utama:**\n${(p.benefits||[]).slice(0,5).map(x=>`- ${x}`).join('\n')}\n\n**Cocok untuk:** ${p.fit||'—'}`).join('\n\n---\n\n')+`\n\n**Kesimpulan:** produk-produk tersebut memiliki fungsi perlindungan yang berbeda. Pilihan yang tepat bergantung pada risiko yang ingin dialihkan, perlindungan yang sudah dimiliki, tujuan, dan kemampuan finansial.`;
            }
            if(selected.length>=1){
                const p=selected[0];
                return `## ${p.title}\n\n**${p.headline||'Gambaran solusi'}**\n\n${p.solution||p.problem||''}\n\n**Poin utama:**\n${(p.benefits||[]).slice(0,6).map(x=>`- ${x}`).join('\n')||'- Informasi manfaat mengikuti materi produk yang tersedia.'}\n\n**Cocok untuk:** ${p.fit||'Disesuaikan dengan kebutuhan dan profil Anda.'}\n\n**Informasi biaya:** ${p.pricing||'Mengikuti usia, plan, dan ketentuan produk.'}\n\nUntuk memastikan kesesuaian personal, Safe Future menyarankan diagnosis kebutuhan terlebih dahulu dan konsultasi dengan advisor.`;
            }
            const starter=sfStarterAnswer(question);
            if(starter) return starter;
            return null;
        }

        function sfLocalAnswer(question){
            const q=String(question||'').toLowerCase().trim();
            if(!q) return null;
            // Keep only high-confidence, safety-critical/offline product comparison fallback.
            // All other questions should reach the reasoning model so they are interpreted in context.
            const isMiUhc = q.includes('miuhc') || q.includes('miultimate healthcare');
            const isMccp = q.includes('mccp') || q.includes('critical care protection');
            if(isMiUhc && isMccp && (q.includes('beda') || q.includes('perbedaan') || q.includes('vs') || q.includes('banding'))){
                return `## Perbedaan MiUHC dan MCCP

**MiUHC** berfokus pada **biaya dan perawatan kesehatan**, sedangkan **MCCP** berfokus pada **penyakit kritis**.

- **MiUHC:** perlindungan kesehatan/medis, termasuk manfaat rumah sakit sesuai plan.
- **MCCP:** manfaat penyakit kritis sesuai kondisi dan plan yang tercakup.
- **Intinya:** keduanya melindungi risiko yang berbeda, sehingga bukan pengganti otomatis satu sama lain.

Kesesuaian tetap perlu dilihat dari kondisi, perlindungan yang sudah dimiliki, tanggungan, kemampuan finansial, dan protection gap.`;
            }
            return sfKnowledgeFallback(question);
        }

        function sfIsSimpleCuratedQuestion(question){
            const q=sfNormalize(question);
            if(!q) return false;
            const simpleStart=/^(apa|apa itu|apa saja|apa bedanya|apa perbedaan|jelaskan|jelaskan tentang|siapa|siapa founder|siapa pendiri|bagaimana safe future|layanan safe future|services safe future)/i.test(q);
            const canonicalQuestion=/(founder|pendiri|layanan safe future|services safe future|apa saja layanan|perbedaan fhc|beda fhc|fhc dan wpr|fhc vs wpr|financial health check dan wealth protection review)/i.test(q);
            if(!simpleStart && !canonicalQuestion) return false;
            try{ return !!sfAnswer(question); }catch(e){ return false; }
        }

        function sfInsuranceNeedRedirect(question) {
            const q = sfNormalize(question);
            const personalNeed = /\b(butuh|perlu|mau|ingin|cari|pengen|harus punya|sebaiknya punya)\b/.test(q);
            const insuranceTopic = /\b(asuransi|perlindungan|proteksi|polis|jaminan kesehatan)\b/.test(q);
            const needQuestion = /\b(apakah saya|apa yang saya|asuransi apa|produk apa|mana yang|yang saya butuhkan|yang cocok untuk saya)\b/.test(q);
            return insuranceTopic && (personalNeed || needQuestion);
        }

        function sfInsuranceNeedAnswer() {
            return `Kalau Anda merasa membutuhkan asuransi atau perlindungan, sebaiknya kita **tidak langsung memilih produk**. Safe Future memulai dari diagnosis kondisi keuangan terlebih dahulu melalui **Financial Health Check™**.\n\nFHC membantu melihat cash flow, utang, dana darurat, proteksi, pensiun, aset, dan tujuan finansial Anda. Dari sana, kita bisa melihat kebutuhan dan gap yang perlu diprioritaskan.\n\nAnda **tidak perlu memasukkan data pribadi di Tanya AI**. Silakan mulai Financial Health Check™ di bagian FHC pada halaman ini. Setelah hasilnya keluar, Tanya AI dapat membantu menjelaskan hasil dan prioritas Anda.`;
        }

        async function sfCallRealAI(question) {
            // Personal insurance/protection intent is deliberately routed to FHC first.
            // This avoids unnecessary personal-data collection in chat, reduces token usage,
            // and keeps Safe Future's Diagnosis Before Recommendation principle intact.
            if (sfInsuranceNeedRedirect(question)) return sfInsuranceNeedAnswer();

            // For short, factual questions already covered by Safe Future's curated
            // knowledge base, answer from the verified local source immediately.
            // This prevents a transient model/edge failure from turning a known fact
            // such as "Apa MiUHC?" into an unhelpful generic error.
            if(sfIsSimpleCuratedQuestion(question)) return sfAnswer(question);
            await sfEnsureAiSession();

            const body = document.getElementById('sfaiBody');
            const history = Array.from(body?.querySelectorAll('.sfai-msg') || [])
                .slice(-8)
                .map(el => ({
                    role: el.classList.contains('user') ? 'user' : 'assistant',
                    content: el.textContent || ''
                }))
                .filter(x => x.content);

            const requestBody = {
                message: question,
                diagnosis: sfBuildDiagnosisContext(),
                history,
                site_context: (() => { try {
                    const q = sfNormalize(question);
                    const scoredKb = SF_KB.map(entry => ({entry, score: sfMatchScore(q, entry)})).sort((a,b)=>b.score-a.score).filter(x=>x.score>0).slice(0,14).map(x=>x.entry);
                    const compactProducts = Object.values(productsData || {}).flat().map(p => ({id:p.id,title:p.title,badge:p.badge,headline:p.headline,problem:p.problem,solution:p.solution,benefits:p.benefits,fit:p.fit,pricingLabel:p.pricingLabel,pricing:p.pricing,pricingNote:p.pricingNote,hasPoster:!!p.poster,hasBrochure:!!p.brochure}));
                    const canonical = {
                        company: {name:'Safe Future',founder:'Yusuf Bramantika Situmorang',positioning:'Financial Protection & Wealth Advisory',tagline:'Safe Today. Secure Future.',principle:'Diagnosis Sebelum Rekomendasi (Diagnosis Before Recommendation)'},
                        services: ['Financial Health Check™','Wealth & Protection Review','Private Advisory','Financial Protection Planning','Health Protection Planning','Critical Illness Planning','Income Protection Planning','Retirement Planning','Education Planning','Estate & Legacy Planning','Business Protection Planning'],
                        methodology: {name:'SAFE FUTURE METHOD™',steps:['DISCOVER','DIAGNOSE','DESIGN','RECOMMEND','REVIEW']},
                        fhc:{name:'Financial Health Check™',purpose:'diagnosis kesehatan finansial awal',dimensions:['Cash Flow','Debt','Emergency','Protection','Retirement','Asset','Goals']},
                        wpr:{name:'Wealth & Protection Review',purpose:'review kekayaan dan proteksi yang lebih mendalam',areas:['Net Worth','Liquidity Coverage','Life Protection','Retirement','Estate & Succession (Preliminary)']},
                        relevant_knowledge: scoredKb,
                        product_catalog: compactProducts.slice(0,40)
                    };
                    return JSON.stringify(canonical).slice(0,95000);
                } catch (_) { return ''; } })(),
                response_preferences: {language:'Bahasa Indonesia',style:'natural, intelligent, warm, concise, direct, structured like a high-quality financial AI consultant',web_grounding:'Gunakan Google Search jika perlu informasi terbaru atau verifikasi sumber primer; prioritaskan Manulife Indonesia/OJK/pemerintah.',service_first:'Safe Future services are the primary next step. If a user expresses a personal need for insurance, protection, or asks what insurance they need, do not collect personal data in chat and do not jump to a product. Direct them first to Financial Health Check™ for diagnosis, then explain the result in Tanya AI.',avoid:['hallucination','overclaiming','repetitive disclaimers','sales pressure','unsupported product facts','asking for personal financial details in chat when FHC is the appropriate next step'],unknown_policy:'Jika informasi tidak tersedia dalam konteks Safe Future, katakan jujur bahwa informasinya belum tersedia dan arahkan ke advisor Safe Future.',writing_rules:'Tulis seperti konsultan manusia yang sangat rapi: inti jawaban di kalimat pertama; paragraf pendek 1–3 kalimat; gunakan bullet • bila membantu; jangan gunakan tabel kecuali benar-benar diperlukan; jangan gunakan Markdown heading atau format mentah; jangan mengulang pertanyaan; jangan meminta data pribadi untuk menentukan kebutuhan asuransi bila FHC dapat digunakan; prioritaskan layanan Safe Future; selalu selesaikan kalimat dan struktur jawaban.'}
            };
            let response=null,data=null,lastError=null;
            // Prefer Supabase's native Functions client. This avoids browser CORS/network quirks that can surface as "Failed to send a request".
            for(let attempt=0;attempt<2;attempt++){
                try{
                    if(window.supabaseClient?.functions?.invoke){
                        const inv=await window.supabaseClient.functions.invoke('safe-future-ai',{body:requestBody});
                        if(!inv.error&&inv.data?.answer){data=inv.data;response={ok:true};break;}
                        lastError=inv.error||new Error('AI service error');
                    } else {
                        response=await fetch(SF_AI_ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+(window.SUPABASE_KEY||''),'apikey':window.SUPABASE_KEY},body:JSON.stringify(requestBody)});
                        data=await response.json().catch(()=>({}));
                        if(response.ok&&data?.answer) break;
                        lastError=new Error(data?.error||'AI service error');
                    }
                }catch(e){lastError=e;}
                if(attempt===0) await new Promise(r=>setTimeout(r,450));
            }
            // Last-resort direct request if the Functions client failed.
            if(!response?.ok||!data?.answer){
                try{
                    response=await fetch(SF_AI_ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+(window.SUPABASE_KEY||''),'apikey':window.SUPABASE_KEY},body:JSON.stringify(requestBody)});
                    data=await response.json().catch(()=>({}));
                }catch(e){lastError=e;}
            }
            if(!response?.ok||!data?.answer) throw lastError||new Error('AI service error');
            let answer = String(data.answer).trim();
            const weakAi = /belum memiliki informasi yang cukup|informasi yang cukup terverifikasi|tidak memiliki informasi yang cukup|silakan konsultasikan.*advisor/i.test(answer);
            if (weakAi) {
                const groundedFallback = sfKnowledgeFallback(question);
                if (groundedFallback) answer = groundedFallback;
            }
            // Normalize common model formatting issues without changing substance.
            answer = answer.replace(/\n{4,}/g, '\n\n').replace(/[ \t]+\n/g, '\n');
            if (answer.length > 11500) answer = answer.slice(0, 11500).replace(/\s+[^\s]*$/, '') + '\n\nUntuk detail yang belum tercantum, silakan konsultasikan dengan advisor Safe Future.';
            if (Array.isArray(data.sources) && data.sources.length) {
                const safeSources = data.sources.filter(x => x && /^https?:\/\//i.test(String(x.url||''))).slice(0,5);
                if (safeSources.length) {
                    answer += '\n\n---\n**Sumber yang digunakan**\n' + safeSources.map(x => `- [${String(x.title||x.url).replace(/[\[\]]/g,'')}](${x.url})`).join('\n');
                }
            }
            return answer;
        }

        // Tanya AI: Enter membuat baris baru. Ctrl/Cmd+Enter mengirim pesan.
        document.addEventListener('keydown', function (e) {
            const el = e.target;
            if (el && el.id === 'sfaiInput' && el.tagName === 'TEXTAREA') {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    sfAiSend();
                }
                // Enter biasa sengaja dibiarkan sebagai newline.
            }
        });

        async function sfAiSend() {
            const input = document.getElementById('sfaiInput');
            const q = (input.value || '').trim();
            if (!q) return;

            sfAddMsg(q, 'user');
            input.value = '';
            document.getElementById('sfaiChips').innerHTML = '';

            sfTyping(true, 'Menganalisis konteks Safe Future…');
            try {
                const ans = await sfCallRealAI(q);
                sfTyping(false);
                sfAddMsg(ans + '\n\n---\nInformasi bersifat edukatif dan bukan pengganti konsultasi dengan advisor berizin.');
                const latest = document.querySelector('#sfaiBody .sfai-msg.bot:last-child .sfai-content');
                if (latest) {
                    const ps = latest.querySelectorAll('p');
                    const last = ps[ps.length - 1];
                    if (last && /Informasi bersifat edukatif/i.test(last.textContent || '')) {
                        last.classList.add('sfai-disclaimer');
                    }
                }
            } catch (err) {
                console.warn('Real AI unavailable:', err);
                sfTyping(false);
                const fallback = sfKnowledgeFallback(q) || sfLocalAnswer(q);
                if(fallback){
                    sfAddMsg(fallback);
                } else {
                    sfAddMsg('Pertanyaan Anda membutuhkan informasi yang belum tersedia secara memadai dalam knowledge base Safe Future saat ini. Saya tidak ingin menebak. Untuk jawaban yang spesifik terhadap kondisi Anda, silakan konsultasikan dengan advisor Safe Future.');
                }
            }

            const chips = document.getElementById('sfaiChips');
            SF_CHIPS.forEach(c => {
                const b = document.createElement('button');
                b.className = 'sfai-chip';
                b.textContent = c;
                b.onclick = () => {
                    document.getElementById('sfaiInput').value = c;
                    sfAiSend();
                };
                chips.appendChild(b);
            });
        }
    