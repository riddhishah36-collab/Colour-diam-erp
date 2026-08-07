const now = new Date();

const iso = (daysAgo) => {
  const d = new Date(now.getTime() - daysAgo * 86400000);
  return d.toISOString().split("T")[0];
};

const isoF = (daysFromNow) => {
  const d = new Date(now.getTime() + daysFromNow * 86400000);
  return d.toISOString().split("T")[0];
};

export default function buildSeed() {
  const users = [
    { id: "u1", name: "Valentina Rossi", email: "valentina@colourdiam.com", role: "admin", title: "Managing Director", phone: "+41 79 111 22 33", active: true, createdAt: iso(420) },
    { id: "u2", name: "Daniel Cho", email: "daniel@colourdiam.com", role: "manager", title: "Operations Manager", phone: "+41 79 222 33 44", active: true, createdAt: iso(380) },
    { id: "u3", name: "Amara Ndiaye", email: "amara@colourdiam.com", role: "sales", title: "Sales Director", phone: "+44 7700 900123", active: true, createdAt: iso(300) },
    { id: "u4", name: "Priya Sharma", email: "priya@colourdiam.com", role: "inventory", title: "Inventory Manager", phone: "+91 98 1000 2000", active: true, createdAt: iso(260) },
    { id: "u5", name: "James Whitfield", email: "james@colourdiam.com", role: "viewer", title: "Finance", phone: "+44 7700 900456", active: true, createdAt: iso(200) }
  ];

  const diamonds = [
    { id: "d1", sku: "FD-PK-3021", name: "Fancy Vivid Pink", shape: "Round", carat: 3.02, color: "Fancy Vivid Pink", clarity: "VS1", cut: "Excellent", polish: "Excellent", symmetry: "Excellent", fluorescence: "None", lab: "GIA", certNumber: "GIA 2201345567", origin: "Argyle", quantity: 1, location: "Geneva Vault", pricePerCarat: 85000, costPerCarat: 61000, price: 256700, cost: 184220, status: "in-stock", photos: [], notes: "Rare Argyle pink, investment grade.", createdAt: iso(90) },
    { id: "d2", sku: "FD-BL-2147", name: "Fancy Intense Blue", shape: "Cushion", carat: 2.14, color: "Fancy Intense Blue", clarity: "VS2", cut: "Very Good", polish: "Excellent", symmetry: "Very Good", fluorescence: "None", lab: "GIA", certNumber: "GIA 2201889023", origin: "Cullinan", quantity: 1, location: "Geneva Vault", pricePerCarat: 98000, costPerCarat: 72000, price: 209720, cost: 154080, status: "in-stock", photos: [], notes: "Boutique blue, Type IIb.", createdAt: iso(75) },
    { id: "d3", sku: "FD-YW-5051", name: "Fancy Deep Yellow", shape: "Radiant", carat: 5.05, color: "Fancy Deep Yellow", clarity: "SI1", cut: "Excellent", polish: "Very Good", symmetry: "Excellent", fluorescence: "Faint", lab: "GIA", certNumber: "GIA 2202233401", origin: "South Africa", quantity: 1, location: "Antwerp Office", pricePerCarat: 22500, costPerCarat: 15800, price: 113625, cost: 79790, status: "in-stock", photos: [], notes: "Strong saturation, canopy cut.", createdAt: iso(60) },
    { id: "d4", sku: "FD-GR-1802", name: "Fancy Vivid Green", shape: "Emerald", carat: 1.8, color: "Fancy Vivid Green", clarity: "VVS2", cut: "Excellent", polish: "Excellent", symmetry: "Excellent", fluorescence: "None", lab: "GIA", certNumber: "GIA 2203044120", origin: "South America", quantity: 1, location: "Geneva Vault", pricePerCarat: 120000, costPerCarat: 88000, price: 216000, cost: 158400, status: "in-stock", photos: [], notes: "Chameleon candidate, natural color.", createdAt: iso(55) },
    { id: "d5", sku: "FD-OR-1650", name: "Fancy Orange", shape: "Pear", carat: 1.65, color: "Fancy Orange", clarity: "VS1", cut: "Very Good", polish: "Excellent", symmetry: "Very Good", fluorescence: "None", lab: "GIA", certNumber: "GIA 2203117788", origin: "South Africa", quantity: 1, location: "Antwerp Office", pricePerCarat: 68000, costPerCarat: 49000, price: 112200, cost: 80850, status: "in-stock", photos: [], notes: "", createdAt: iso(48) },
    { id: "d6", sku: "FD-PP-2020", name: "Fancy Intense Purple-Pink", shape: "Oval", carat: 2.02, color: "Fancy Intense Purple-Pink", clarity: "VS1", cut: "Excellent", polish: "Excellent", symmetry: "Excellent", fluorescence: "None", lab: "GIA", certNumber: "GIA 2204012334", origin: "Argyle", quantity: 1, location: "Geneva Vault", pricePerCarat: 76000, costPerCarat: 54000, price: 153520, cost: 109080, status: "in-stock", photos: [], notes: "", createdAt: iso(40) },
    { id: "d7", sku: "FD-YL-4200", name: "Fancy Light Yellow", shape: "Round", carat: 4.2, color: "Fancy Light Yellow", clarity: "VS2", cut: "Excellent", polish: "Excellent", symmetry: "Excellent", fluorescence: "None", lab: "GIA", certNumber: "GIA 2204155600", origin: "South Africa", quantity: 1, location: "Antwerp Office", pricePerCarat: 14500, costPerCarat: 10200, price: 60900, cost: 42840, status: "in-stock", photos: [], notes: "", createdAt: iso(35) },
    { id: "d8", sku: "FD-BR-6110", name: "Fancy Brownish-Orange", shape: "Cushion", carat: 6.11, color: "Fancy Brownish-Orange", clarity: "SI1", cut: "Very Good", polish: "Very Good", symmetry: "Very Good", fluorescence: "Faint", lab: "GIA", certNumber: "GIA 2204288899", origin: "South Africa", quantity: 1, location: "Antwerp Office", pricePerCarat: 9800, costPerCarat: 6600, price: 59878, cost: 40326, status: "in-stock", photos: [], notes: "Chocolate diamond, designer favorite.", createdAt: iso(30) },
    { id: "d9", sku: "WH-D-2011", name: "D Flawless Round", shape: "Round", carat: 2.01, color: "D", clarity: "FL", cut: "Excellent", polish: "Excellent", symmetry: "Excellent", fluorescence: "None", lab: "GIA", certNumber: "GIA 2205087600", origin: "Botswana", quantity: 1, location: "Geneva Vault", pricePerCarat: 38000, costPerCarat: 27500, price: 76380, cost: 55275, status: "in-stock", photos: [], notes: "Investment white diamond.", createdAt: iso(26) },
    { id: "d10", sku: "WH-E-1500", name: "E VS1 Round", shape: "Round", carat: 1.5, color: "E", clarity: "VS1", cut: "Excellent", polish: "Excellent", symmetry: "Excellent", fluorescence: "None", lab: "GIA", certNumber: "GIA 2205183456", origin: "Botswana", quantity: 1, location: "Antwerp Office", pricePerCarat: 24000, costPerCarat: 17000, price: 36000, cost: 25500, status: "in-stock", photos: [], notes: "", createdAt: iso(22) },
    { id: "d11", sku: "FD-YW-3750", name: "Fancy Vivid Yellow", shape: "Princess", carat: 3.75, color: "Fancy Vivid Yellow", clarity: "VS1", cut: "Excellent", polish: "Excellent", symmetry: "Very Good", fluorescence: "None", lab: "GIA", certNumber: "GIA 2206012234", origin: "South Africa", quantity: 1, location: "Antwerp Office", pricePerCarat: 19800, costPerCarat: 14000, price: 74250, cost: 52500, status: "in-stock", photos: [], notes: "", createdAt: iso(18) },
    { id: "d12", sku: "FD-GB-1120", name: "Fancy Gray-Blue", shape: "Marquise", carat: 1.12, color: "Fancy Gray-Blue", clarity: "VS2", cut: "Very Good", polish: "Very Good", symmetry: "Very Good", fluorescence: "None", lab: "GIA", certNumber: "GIA 2206159001", origin: "Cullinan", quantity: 1, location: "Geneva Vault", pricePerCarat: 42000, costPerCarat: 30000, price: 47040, cost: 33600, status: "in-stock", photos: [], notes: "", createdAt: iso(15) },
    { id: "d13", sku: "FD-RP-0920", name: "Fancy Red-Pink", shape: "Radiant", carat: 0.92, color: "Fancy Red-Pink", clarity: "VS1", cut: "Excellent", polish: "Excellent", symmetry: "Excellent", fluorescence: "None", lab: "GIA", certNumber: "GIA 2207011122", origin: "Argyle", quantity: 1, location: "Geneva Vault", pricePerCarat: 135000, costPerCarat: 97000, price: 124200, cost: 89240, status: "in-stock", photos: [], notes: "Exceptional saturation.", createdAt: iso(12) },
    { id: "d14", sku: "FD-PK-1301", name: "Fancy Intense Pink", shape: "Heart", carat: 1.3, color: "Fancy Intense Pink", clarity: "VS2", cut: "Very Good", polish: "Excellent", symmetry: "Very Good", fluorescence: "None", lab: "GIA", certNumber: "GIA 2207134567", origin: "Argyle", quantity: 1, location: "Geneva Vault", pricePerCarat: 72000, costPerCarat: 51000, price: 93600, cost: 66300, status: "in-stock", photos: [], notes: "", createdAt: iso(9) },
    { id: "d15", sku: "WH-G-1010", name: "G SI1 Emerald", shape: "Emerald", carat: 1.01, color: "G", clarity: "SI1", cut: "Very Good", polish: "Very Good", symmetry: "Good", fluorescence: "Faint", lab: "IGI", certNumber: "IGI 4455221100", origin: "Botswana", quantity: 1, location: "Antwerp Office", pricePerCarat: 8900, costPerCarat: 6200, price: 8989, cost: 6262, status: "reserved", photos: [], notes: "On hold for Maison Aurelle.", createdAt: iso(8) },
    { id: "d16", sku: "FD-BP-1050", name: "Fancy Vivid Blue-Purple", shape: "Asscher", carat: 1.05, color: "Fancy Vivid Blue-Purple", clarity: "VVS2", cut: "Excellent", polish: "Excellent", symmetry: "Excellent", fluorescence: "None", lab: "GIA", certNumber: "GIA 2208056789", origin: "Cullinan", quantity: 1, location: "Geneva Vault", pricePerCarat: 112000, costPerCarat: 80000, price: 117600, cost: 84000, status: "sold", photos: [], notes: "", createdAt: iso(40) },
    { id: "d17", sku: "FD-YW-8021", name: "Fancy Yellow Cushion", shape: "Cushion", carat: 8.02, color: "Fancy Yellow", clarity: "SI1", cut: "Very Good", polish: "Very Good", symmetry: "Very Good", fluorescence: "None", lab: "GIA", certNumber: "GIA 2208189900", origin: "South Africa", quantity: 1, location: "Antwerp Office", pricePerCarat: 9800, costPerCarat: 6800, price: 78596, cost: 54536, status: "pending", photos: [], notes: "Awaiting client confirmation.", createdAt: iso(6) },
    { id: "d18", sku: "WH-H-0880", name: "H VS2 Oval", shape: "Oval", carat: 0.88, color: "H", clarity: "VS2", cut: "Excellent", polish: "Excellent", symmetry: "Excellent", fluorescence: "None", lab: "GIA", certNumber: "GIA 2209012334", origin: "Botswana", quantity: 1, location: "Antwerp Office", pricePerCarat: 7200, costPerCarat: 5100, price: 6336, cost: 4488, status: "sold", photos: [], notes: "", createdAt: iso(35) }
  ];

  const gemstones = [
    { id: "g1", sku: "GS-RB-3201", name: "Burmese Ruby", stoneType: "Ruby", carat: 3.2, color: "Pigeon Blood Red", clarity: "Eye Clean", cut: "Oval", treatment: "Heated", lab: "Gubelin", certNumber: "GBL 8812", origin: "Mogok, Burma", quantity: 1, location: "Geneva Vault", pricePerCarat: 45000, costPerCarat: 31000, price: 144000, cost: 99200, status: "in-stock", notes: "", createdAt: iso(70) },
    { id: "g2", sku: "GS-SP-4052", name: "Kashmir Sapphire", stoneType: "Sapphire", carat: 4.05, color: "Cornflower Blue", clarity: "Eye Clean", cut: "Cushion", treatment: "None", lab: "Gubelin", certNumber: "GBL 8911", origin: "Kashmir", quantity: 1, location: "Geneva Vault", pricePerCarat: 68000, costPerCarat: 47000, price: 275400, cost: 190350, status: "in-stock", notes: "Historical Kashmir material.", createdAt: iso(64) },
    { id: "g3", sku: "GS-EM-5501", name: "Colombian Emerald", stoneType: "Emerald", carat: 5.5, color: "Muzo Green", clarity: "Minor Inclusions", cut: "Emerald", treatment: "Minor Oil", lab: "SSEF", certNumber: "SSEF 90211", origin: "Muzo, Colombia", quantity: 1, location: "Antwerp Office", pricePerCarat: 32000, costPerCarat: 22000, price: 176000, cost: 121000, status: "in-stock", notes: "", createdAt: iso(58) },
    { id: "g4", sku: "GS-PD-2401", name: "Ceylon Padparadscha Sapphire", stoneType: "Sapphire", carat: 2.4, color: "Padparadscha", clarity: "Eye Clean", cut: "Oval", treatment: "None", lab: "Gubelin", certNumber: "GBL 9012", origin: "Sri Lanka", quantity: 1, location: "Geneva Vault", pricePerCarat: 21000, costPerCarat: 14500, price: 50400, cost: 34800, status: "in-stock", notes: "", createdAt: iso(50) },
    { id: "g5", sku: "GS-TM-1802", name: "Paraiba Tourmaline", stoneType: "Tourmaline", carat: 1.8, color: "Neon Blue-Green", clarity: "Eye Clean", cut: "Cushion", treatment: "None", lab: "AGL", certNumber: "AGL 1188", origin: "Paraiba, Brazil", quantity: 1, location: "Antwerp Office", pricePerCarat: 35000, costPerCarat: 24000, price: 63000, cost: 43200, status: "in-stock", notes: "", createdAt: iso(44) },
    { id: "g6", sku: "GS-AL-1403", name: "Alexandrite", stoneType: "Alexandrite", carat: 1.4, color: "Color-Change", clarity: "Eye Clean", cut: "Round", treatment: "None", lab: "AGL", certNumber: "AGL 1190", origin: "Brazil", quantity: 1, location: "Geneva Vault", pricePerCarat: 18000, costPerCarat: 12500, price: 25200, cost: 17500, status: "in-stock", notes: "", createdAt: iso(38) },
    { id: "g7", sku: "GS-TV-2101", name: "Tsavorite Garnet", stoneType: "Garnet", carat: 2.1, color: "Vivid Green", clarity: "Eye Clean", cut: "Round", treatment: "None", lab: "GIA", certNumber: "GIA 6612", origin: "Tanzania", quantity: 1, location: "Antwerp Office", pricePerCarat: 4200, costPerCarat: 2900, price: 8820, cost: 6090, status: "in-stock", notes: "", createdAt: iso(30) },
    { id: "g8", sku: "GS-SP-1901", name: "Jedi Spinel", stoneType: "Spinel", carat: 1.9, color: "Neon Pink", clarity: "Eye Clean", cut: "Oval", treatment: "None", lab: "GIA", certNumber: "GIA 6620", origin: "Mogok, Burma", quantity: 1, location: "Geneva Vault", pricePerCarat: 9500, costPerCarat: 6600, price: 18050, cost: 12540, status: "in-stock", notes: "", createdAt: iso(25) }
  ];

  const jewellery = [
    { id: "j1", sku: "JW-NK-001", name: "Riviere Diamond Necklace", jewelleryType: "Necklace", material: "18k White Gold", totalCarat: 12.4, primaryStone: "Fancy White Diamonds", colour: "White", price: 385000, cost: 268000, quantity: 1, location: "Geneva Vault", status: "in-stock", photos: [], notes: "Sautoir design, 28 stones.", createdAt: iso(120) },
    { id: "j2", sku: "JW-RG-001", name: "Solitaire Pink Ring", jewelleryType: "Ring", material: "Platinum", totalCarat: 3.02, primaryStone: "Fancy Vivid Pink Diamond", colour: "Pink", price: 320000, cost: 230000, quantity: 1, location: "Geneva Vault", status: "in-stock", photos: [], notes: "Center stone FD-PK-3021.", createdAt: iso(100) },
    { id: "j3", sku: "JW-BR-001", name: "Eternal Tennis Bracelet", jewelleryType: "Bracelet", material: "18k Yellow Gold", totalCarat: 8.5, primaryStone: "Fancy Yellow Diamonds", colour: "Yellow", price: 148000, cost: 104000, quantity: 1, location: "Antwerp Office", status: "in-stock", photos: [], notes: "", createdAt: iso(95) },
    { id: "j4", sku: "JW-ER-001", name: "Halo Stud Earrings", jewelleryType: "Earrings", material: "18k White Gold", totalCarat: 2.1, primaryStone: "White Diamonds", colour: "White", price: 24500, cost: 16800, quantity: 1, location: "Antwerp Office", status: "in-stock", photos: [], notes: "", createdAt: iso(85) },
    { id: "j5", sku: "JW-RG-002", name: "Sapphire Cocktail Ring", jewelleryType: "Ring", material: "18k White Gold", totalCarat: 5.4, primaryStone: "Kashmir Sapphire", colour: "Blue", price: 310000, cost: 218000, quantity: 1, location: "Geneva Vault", status: "in-stock", photos: [], notes: "Center stone GS-SP-4052.", createdAt: iso(78) },
    { id: "j6", sku: "JW-PD-001", name: "Classique Diamond Pendant", jewelleryType: "Pendant", material: "18k Rose Gold", totalCarat: 1.2, primaryStone: "Fancy Pink Diamond", colour: "Pink", price: 42000, cost: 29500, quantity: 1, location: "Antwerp Office", status: "in-stock", photos: [], notes: "", createdAt: iso(72) },
    { id: "j7", sku: "JW-HP-001", name: "Grace Hoop Earrings", jewelleryType: "Earrings", material: "Platinum", totalCarat: 3.6, primaryStone: "White Diamonds", colour: "White", price: 36000, cost: 25200, quantity: 1, location: "Geneva Vault", status: "in-stock", photos: [], notes: "", createdAt: iso(66) },
    { id: "j8", sku: "JW-BG-001", name: "Atelier Diamond Bangle", jewelleryType: "Bangle", material: "18k Yellow Gold", totalCarat: 6.2, primaryStone: "White Diamonds", colour: "White", price: 78000, cost: 54600, quantity: 1, location: "Antwerp Office", status: "in-stock", photos: [], notes: "", createdAt: iso(60) },
    { id: "j9", sku: "JW-NK-002", name: "Pearl & Diamond Necklace", jewelleryType: "Necklace", material: "18k White Gold", totalCarat: 4.8, primaryStone: "South Sea Pearls", colour: "White", price: 54000, cost: 38000, quantity: 1, location: "Antwerp Office", status: "in-stock", photos: [], notes: "", createdAt: iso(52) },
    { id: "j10", sku: "JW-CF-001", name: "Couture Cufflinks", jewelleryType: "Cufflinks", material: "18k White Gold", totalCarat: 0.9, primaryStone: "White Diamonds", colour: "White", price: 12800, cost: 8900, quantity: 1, location: "Antwerp Office", status: "in-stock", photos: [], notes: "", createdAt: iso(45) }
  ];

  const customers = [
    { id: "c1", code: "C-001", name: "Maison Aurelle", company: "Maison Aurelle SA", contact: "Isabelle Marchand", email: "isabelle@maisonaurelle.com", phone: "+33 1 42 68 10 20", address: "18 Rue de la Paix", city: "Paris", country: "France", segment: "retail", tier: "VIP", tags: ["private", "high-value"], source: "Referral", status: "active", creditLimit: 500000, balance: 210000, notes: "Repeat client, purchases annually.", createdAt: iso(300) },
    { id: "c2", code: "C-002", name: "Vantory Fine Jewels", company: "Vantory Ltd", contact: "Marcus Vance", email: "marcus@vantory.com", phone: "+1 212 555 0142", address: "640 Fifth Avenue", city: "New York", country: "USA", segment: "wholesale", tier: "Gold", tags: ["trade"], source: "Trade show", status: "active", creditLimit: 250000, balance: 75000, notes: "", createdAt: iso(280) },
    { id: "c3", code: "C-003", name: "Sterling & Sloan", company: "Sterling & Sloan Co", contact: "Penelope Sloan", email: "p.sloan@sterlingsloan.com", phone: "+44 20 7946 0810", address: "75 Brompton Road", city: "London", country: "UK", segment: "retail", tier: "Gold", tags: ["boutique"], source: "Website", status: "active", creditLimit: 150000, balance: 12000, notes: "", createdAt: iso(260) },
    { id: "c4", code: "C-004", name: "Ashford Collection", company: "Ashford Collection Ltd", contact: "Rajiv Ashford", email: "rajiv@ashfordcollection.com", phone: "+44 20 7946 0958", address: "14 Old Bond Street", city: "London", country: "UK", segment: "trade", tier: "Silver", tags: ["trade"], source: "Referral", status: "active", creditLimit: 100000, balance: 35000, notes: "", createdAt: iso(240) },
    { id: "c5", code: "C-005", name: "The Lumiere House", company: "Lumiere House LLC", contact: "Camille Renard", email: "camille@lumierehouse.com", phone: "+1 305 555 0192", address: "2 Alton Road", city: "Miami", country: "USA", segment: "retail", tier: "Silver", tags: ["boutique"], source: "Social media", status: "active", creditLimit: 80000, balance: 0, notes: "", createdAt: iso(220) },
    { id: "c6", code: "C-006", name: "Kira Montanari", company: "Private Client", contact: "Kira Montanari", email: "kira.m@icloud.com", phone: "+39 333 811 0000", address: "Via Montenapoleone 8", city: "Milan", country: "Italy", segment: "retail", tier: "VIP", tags: ["private", "high-value"], source: "Referral", status: "active", creditLimit: 300000, balance: 0, notes: "Collects fancy pinks.", createdAt: iso(200) },
    { id: "c7", code: "C-007", name: "Jonathan Hayes", company: "Private Client", contact: "Jonathan Hayes", email: "jhayes@proton.me", phone: "+65 9123 4567", address: "Marina Bay Residences", city: "Singapore", country: "Singapore", segment: "retail", tier: "Gold", tags: ["private", "investor"], source: "Website", status: "active", creditLimit: 200000, balance: 60000, notes: "Investment focus.", createdAt: iso(180) },
    { id: "c8", code: "C-008", name: "Emerald Bay Luxury", company: "Emerald Bay Ltd", contact: "Hana Kim", email: "hana@emeraldbaylux.com", phone: "+82 2 3444 8890", address: "Cheongdam-dong 96", city: "Seoul", country: "South Korea", segment: "trade", tier: "Silver", tags: ["trade"], source: "Trade show", status: "active", creditLimit: 90000, balance: 18000, notes: "", createdAt: iso(160) },
    { id: "c9", code: "C-009", name: "Bellerose Atelier", company: "Bellerose Atelier BV", contact: "Nadia Bellerose", email: "nadia@bellerose.com", phone: "+31 20 555 0132", address: "PC Hooftstraat 120", city: "Amsterdam", country: "Netherlands", segment: "wholesale", tier: "Gold", tags: ["designer"], source: "Referral", status: "active", creditLimit: 180000, balance: 45000, notes: "", createdAt: iso(140) },
    { id: "c10", code: "C-010", name: "Crown & Crescent", company: "Crown & Crescent Inc", contact: "Omar Al-Farsi", email: "omar@crowncrescent.com", phone: "+971 4 555 0100", address: "Dubai Mall, Ground", city: "Dubai", country: "UAE", segment: "retail", tier: "Gold", tags: ["boutique", "gcc"], source: "Trade show", status: "active", creditLimit: 160000, balance: 0, notes: "", createdAt: iso(120) },
    { id: "c11", code: "C-011", name: "Daimler & Fitch", company: "Daimler & Fitch AG", contact: "Sven Daimler", email: "sven@daimlerfitch.ch", phone: "+41 44 555 0170", address: "Bahnhofstrasse 33", city: "Zurich", country: "Switzerland", segment: "trade", tier: "Silver", tags: ["trade", "europe"], source: "Website", status: "active", creditLimit: 70000, balance: 5000, notes: "", createdAt: iso(100) },
    { id: "c12", code: "C-012", name: "Sofia Laurent", company: "Private Client", contact: "Sofia Laurent", email: "sofia.laurent@gmail.com", phone: "+33 6 12 34 56 78", address: "Avenue Montaigne", city: "Paris", country: "France", segment: "retail", tier: "VIP", tags: ["private"], source: "Referral", status: "lead", creditLimit: 0, balance: 0, notes: "Evaluating engagement ring.", createdAt: iso(30) }
  ];

  const leads = [
    { id: "l1", name: "Lucas Fontaine", company: "Private Client", email: "lucas.f@outlook.com", phone: "+41 79 888 77 66", source: "Referral", status: "qualified", value: 180000, owner: "u3", nextAction: "Send pink diamond dossier", nextActionDate: isoF(2), notes: "Wants >1.5ct fancy pink.", createdAt: iso(12) },
    { id: "l2", name: "Aiko Tanaka", company: "Tanaka Fine Jewels", email: "aiko@tanakajewels.jp", phone: "+81 90 1234 5678", source: "Trade show", status: "proposal", value: 95000, owner: "u3", nextAction: "Follow up on blue diamond quote", nextActionDate: isoF(3), notes: "Tokyo boutique, first order.", createdAt: iso(20) },
    { id: "l3", name: "Elena Petrov", company: "Private Client", email: "elena.p@mail.ru", phone: "+7 903 555 0000", source: "Website", status: "contacted", value: 40000, owner: "u3", nextAction: "Intro call", nextActionDate: isoF(5), notes: "Engagement ring, white diamond.", createdAt: iso(9) },
    { id: "l4", name: "David Cho", company: "Cho & Sons Jewellers", email: "david@chosons.kr", phone: "+82 10 9999 0000", source: "Referral", status: "negotiation", value: 260000, owner: "u2", nextAction: "Final terms on emerald parcel", nextActionDate: isoF(1), notes: "Interested in multiple stones.", createdAt: iso(25) },
    { id: "l5", name: "Isabela Costa", company: "Costa Joalheria", email: "isabela@costajoalheria.com.br", phone: "+55 11 98888 7777", source: "Social media", status: "new", value: 30000, owner: "u3", nextAction: "Qualification call", nextActionDate: isoF(7), notes: "", createdAt: iso(3) },
    { id: "l6", name: "Henryk Nowak", company: "Nowak Atelier", email: "h.nowak@nowakatelier.pl", phone: "+48 601 555 999", source: "Trade show", status: "won", value: 117600, owner: "u3", nextAction: "", nextActionDate: null, notes: "Purchased FD-BP-1050.", createdAt: iso(45) }
  ];

  const suppliers = [
    { id: "s1", code: "S-001", name: "Argyle Legacy", contact: "Miles Thornton", email: "miles@argylelegacy.com", phone: "+61 8 5550 1100", type: "rough-supplier", city: "Perth", country: "Australia", terms: "Net 30", leadTime: 21, rating: 5, balance: 145000, notes: "Exclusive pink rough allocation.", createdAt: iso(300) },
    { id: "s2", code: "S-002", name: "Cullinan House", contact: "Pieter Botha", email: "p.botha@cullinanhouse.com", phone: "+27 12 555 0140", type: "rough-supplier", city: "Pretoria", country: "South Africa", terms: "Net 60", leadTime: 30, rating: 4, balance: 94000, notes: "Blue and white rough.", createdAt: iso(280) },
    { id: "s3", code: "S-003", name: "Antwerp Brilliant Cutters", contact: "Jan De Vries", email: "jan@antwerpcutters.com", phone: "+32 3 555 0100", type: "cutter", city: "Antwerp", country: "Belgium", terms: "50% Deposit", leadTime: 14, rating: 5, balance: 15000, notes: "Preferred cutting house.", createdAt: iso(260) },
    { id: "s4", code: "S-004", name: "Mogok Stone Traders", contact: "U Kyaw Win", email: "kyaw@mogoktraders.com", phone: "+95 9 555 0123", type: "gem-supplier", city: "Mandalay", country: "Myanmar", terms: "Net 30", leadTime: 45, rating: 4, balance: 0, notes: "Ruby and spinel source.", createdAt: iso(240) },
    { id: "s5", code: "S-005", name: "Ceylon Blue Trading", contact: "Nimal Fernando", email: "nimal@ceylonblue.lk", phone: "+94 77 555 8899", type: "gem-supplier", city: "Colombo", country: "Sri Lanka", terms: "Net 30", leadTime: 35, rating: 5, balance: 52000, notes: "Sapphires, including padparadscha.", createdAt: iso(220) },
    { id: "s6", code: "S-006", name: "Muzo Emerald Group", contact: "Carlos Mendez", email: "carlos@muzoemeralds.co", phone: "+57 1 555 0180", type: "gem-supplier", city: "Bogota", country: "Colombia", terms: "100% Advance", leadTime: 28, rating: 4, balance: 88000, notes: "Certified Muzo material.", createdAt: iso(200) }
  ];

  const quoteItems1 = [
    { inventoryType: "diamond", inventoryId: "d6", name: "Fancy Intense Purple-Pink Oval 2.02ct", qty: 1, unitPrice: 153520 },
    { inventoryType: "diamond", inventoryId: "d14", name: "Fancy Intense Pink Heart 1.30ct", qty: 1, unitPrice: 93600 }
  ];
  const quoteItems2 = [
    { inventoryType: "diamond", inventoryId: "d2", name: "Fancy Intense Blue Cushion 2.14ct", qty: 1, unitPrice: 209720 }
  ];
  const quoteItems3 = [
    { inventoryType: "gemstone", inventoryId: "g5", name: "Paraiba Tourmaline 1.80ct", qty: 1, unitPrice: 63000 },
    { inventoryType: "gemstone", inventoryId: "g6", name: "Alexandrite 1.40ct", qty: 1, unitPrice: 25200 }
  ];
  const quoteItems4 = [
    { inventoryType: "diamond", inventoryId: "d9", name: "D Flawless Round 2.01ct", qty: 1, unitPrice: 76380 }
  ];
  const quoteItems5 = [
    { inventoryType: "jewellery", inventoryId: "j4", name: "Halo Stud Earrings", qty: 1, unitPrice: 24500 }
  ];

  const compute = (items, discountPct = 0, taxRate = 0) => {
    const subtotal = items.reduce((s, it) => s + it.qty * it.unitPrice, 0);
    const discount = Math.round(subtotal * discountPct);
    const tax = Math.round((subtotal - discount) * taxRate);
    return { subtotal, discount, tax, total: subtotal - discount + tax };
  };

  const q1 = compute(quoteItems1, 0.05, 0);
  const q2 = compute(quoteItems2, 0, 0);
  const q3 = compute(quoteItems3, 0.1, 0);
  const q4 = compute(quoteItems4, 0.02, 0);
  const q5 = compute(quoteItems5, 0, 0.08);

  const quotes = [
    { id: "qt1", number: "QT-2026-0008", customerId: "c6", customerName: "Kira Montanari", date: iso(6), validUntil: isoF(24), status: "sent", items: quoteItems1, discountPct: 5, taxRate: 0, ...q1, notes: "Offer includes private viewing in Geneva.", createdAt: iso(6) },
    { id: "qt2", number: "QT-2026-0007", customerId: "c2", customerName: "Vantory Fine Jewels", date: iso(10), validUntil: isoF(20), status: "approved", items: quoteItems2, discountPct: 0, taxRate: 0, ...q2, notes: "", createdAt: iso(10) },
    { id: "qt3", number: "QT-2026-0006", customerId: "c9", customerName: "Bellerose Atelier", date: iso(12), validUntil: isoF(18), status: "negotiation", items: quoteItems3, discountPct: 10, taxRate: 0, ...q3, notes: "Client countered at 8% off.", createdAt: iso(12) },
    { id: "qt4", number: "QT-2026-0005", customerId: "c7", customerName: "Jonathan Hayes", date: iso(15), validUntil: isoF(15), status: "draft", items: quoteItems4, discountPct: 2, taxRate: 0, ...q4, notes: "", createdAt: iso(15) },
    { id: "qt5", number: "QT-2026-0004", customerId: "c5", customerName: "The Lumiere House", date: iso(18), validUntil: isoF(12), status: "expired", items: quoteItems5, discountPct: 0, taxRate: 8, ...q5, notes: "Expired without response.", createdAt: iso(18) },
    { id: "qt6", number: "QT-2026-0003", customerId: "c6", customerName: "Kira Montanari", date: iso(20), validUntil: isoF(10), status: "converted", items: quoteItems1, discountPct: 5, taxRate: 0, ...q1, notes: "Converted to order SO-2026-0006.", createdAt: iso(20) },
    { id: "qt7", number: "QT-2026-0002", customerId: "c1", customerName: "Maison Aurelle", date: iso(25), validUntil: isoF(5), status: "converted", items: quoteItems4, discountPct: 2, taxRate: 0, ...q4, notes: "Converted to order SO-2026-0005.", createdAt: iso(25) },
    { id: "qt8", number: "QT-2026-0001", customerId: "c12", customerName: "Sofia Laurent", date: iso(28), validUntil: isoF(2), status: "draft", items: quoteItems5, discountPct: 0, taxRate: 8, ...q5, notes: "", createdAt: iso(28) }
  ];

  const orderItems1 = [
    { inventoryType: "diamond", inventoryId: "d16", name: "Fancy Vivid Blue-Purple Asscher 1.05ct", qty: 1, unitPrice: 117600 },
    { inventoryType: "diamond", inventoryId: "d18", name: "H VS2 Oval 0.88ct", qty: 1, unitPrice: 6336 }
  ];
  const orderItems2 = [
    { inventoryType: "jewellery", inventoryId: "j3", name: "Eternal Tennis Bracelet", qty: 1, unitPrice: 148000 }
  ];
  const orderItems3 = [
    { inventoryType: "diamond", inventoryId: "d5", name: "Fancy Orange Pear 1.65ct", qty: 1, unitPrice: 112200 }
  ];
  const orderItems4 = [
    { inventoryType: "diamond", inventoryId: "d9", name: "D Flawless Round 2.01ct", qty: 1, unitPrice: 76380 }
  ];
  const orderItems5 = [
    { inventoryType: "gemstone", inventoryId: "g7", name: "Tsavorite Garnet 2.10ct", qty: 1, unitPrice: 8820 }
  ];
  const orderItems6 = [
    { inventoryType: "jewellery", inventoryId: "j6", name: "Classique Diamond Pendant", qty: 1, unitPrice: 42000 }
  ];
  const orderItems7 = [
    { inventoryType: "diamond", inventoryId: "d11", name: "Fancy Vivid Yellow Princess 3.75ct", qty: 1, unitPrice: 74250 }
  ];
  const orderItems8 = [
    { inventoryType: "gemstone", inventoryId: "g8", name: "Jedi Spinel 1.90ct", qty: 1, unitPrice: 18050 },
    { inventoryType: "jewellery", inventoryId: "j7", name: "Grace Hoop Earrings", qty: 1, unitPrice: 36000 }
  ];
  const orderItems9 = [
    { inventoryType: "diamond", inventoryId: "d15", name: "G SI1 Emerald 1.01ct", qty: 1, unitPrice: 8989 }
  ];
  const orderItems10 = [
    { inventoryType: "jewellery", inventoryId: "j8", name: "Atelier Diamond Bangle", qty: 1, unitPrice: 78000 }
  ];

  const o1 = compute(orderItems1, 0, 0);
  const o2 = compute(orderItems2, 0, 0);
  const o3 = compute(orderItems3, 0.05, 0);
  const o4 = compute(orderItems4, 0.02, 0);
  const o5 = compute(orderItems5, 0, 0.08);
  const o6 = compute(orderItems6, 0, 0.08);
  const o7 = compute(orderItems7, 0, 0);
  const o8 = compute(orderItems8, 0, 0.08);
  const o9 = compute(orderItems9, 0, 0.08);
  const o10 = compute(orderItems10, 0, 0);

  const orders = [
    { id: "so1", number: "SO-2026-0009", customerId: "c1", customerName: "Maison Aurelle", date: iso(2), expectedDate: isoF(10), status: "in-production", items: orderItems1, discountPct: 0, taxRate: 0, ...o1, paymentStatus: "partial", paymentMethod: "Wire Transfer", notes: "Commissioned set.", createdAt: iso(2) },
    { id: "so2", number: "SO-2026-0008", customerId: "c2", customerName: "Vantory Fine Jewels", date: iso(4), expectedDate: isoF(6), status: "shipped", items: orderItems2, discountPct: 0, taxRate: 0, ...o2, paymentStatus: "paid", paymentMethod: "Wire Transfer", notes: "", createdAt: iso(4) },
    { id: "so3", number: "SO-2026-0007", customerId: "c1", customerName: "Maison Aurelle", date: iso(7), expectedDate: isoF(14), status: "in-production", items: orderItems3, discountPct: 5, taxRate: 0, ...o3, paymentStatus: "partial", paymentMethod: "Bank Transfer", notes: "", createdAt: iso(7) },
    { id: "so4", number: "SO-2026-0006", customerId: "c6", customerName: "Kira Montanari", date: iso(11), expectedDate: isoF(5), status: "shipped", items: orderItems4, discountPct: 2, taxRate: 0, ...o4, paymentStatus: "paid", paymentMethod: "Card", notes: "From quote QT-2026-0003.", createdAt: iso(11) },
    { id: "so5", number: "SO-2026-0005", customerId: "c1", customerName: "Maison Aurelle", date: iso(14), expectedDate: isoF(3), status: "delivered", items: orderItems5, discountPct: 0, taxRate: 8, ...o5, paymentStatus: "paid", paymentMethod: "Wire Transfer", notes: "From quote QT-2026-0002.", createdAt: iso(14) },
    { id: "so6", number: "SO-2026-0004", customerId: "c9", customerName: "Bellerose Atelier", date: iso(18), expectedDate: isoF(20), status: "approved", items: orderItems6, discountPct: 0, taxRate: 8, ...o6, paymentStatus: "unpaid", paymentMethod: "", notes: "", createdAt: iso(18) },
    { id: "so7", number: "SO-2026-0003", customerId: "c7", customerName: "Jonathan Hayes", date: iso(22), expectedDate: isoF(8), status: "in-production", items: orderItems7, discountPct: 0, taxRate: 0, ...o7, paymentStatus: "partial", paymentMethod: "Wire Transfer", notes: "", createdAt: iso(22) },
    { id: "so8", number: "SO-2026-0002", customerId: "c10", customerName: "Crown & Crescent", date: iso(27), expectedDate: isoF(9), status: "shipped", items: orderItems8, discountPct: 0, taxRate: 8, ...o8, paymentStatus: "paid", paymentMethod: "Card", notes: "", createdAt: iso(27) },
    { id: "so9", number: "SO-2026-0001", customerId: "c3", customerName: "Sterling & Sloan", date: iso(31), expectedDate: isoF(2), status: "delivered", items: orderItems9, discountPct: 0, taxRate: 8, ...o9, paymentStatus: "paid", paymentMethod: "Wire Transfer", notes: "", createdAt: iso(31) },
    { id: "so10", number: "SO-2025-0048", customerId: "c12", customerName: "Sofia Laurent", date: iso(45), expectedDate: isoF(0), status: "cancelled", items: orderItems10, discountPct: 0, taxRate: 0, ...o10, paymentStatus: "unpaid", paymentMethod: "", notes: "Cancelled at client request.", createdAt: iso(45) }
  ];

  const mkInvoice = (id, number, order, index, dateShift, dueShift, paidShare) => {
    const total = order.total;
    const paidAmount = Math.round(total * paidShare);
    const status = paidAmount >= total ? "paid" : paidAmount > 0 ? "partial" : index < 2 ? "overdue" : "issued";
    return {
      id, number, orderId: order.id, orderNumber: order.number, customerId: order.customerId,
      customerName: order.customerName, date: iso(dateShift), dueDate: iso(dueShift), items: order.items,
      subtotal: order.subtotal, tax: order.tax, total, paidAmount, balance: total - paidAmount, status, createdAt: iso(dateShift)
    };
  };

  const invoices = [
    mkInvoice("inv1", "INV-2026-0009", orders[0], 0, 1, 16, 0.4),
    mkInvoice("inv2", "INV-2026-0008", orders[1], 1, 3, 18, 1),
    mkInvoice("inv3", "INV-2026-0007", orders[2], 2, 6, 21, 0.5),
    mkInvoice("inv4", "INV-2026-0006", orders[3], 3, 10, 25, 1),
    mkInvoice("inv5", "INV-2026-0005", orders[4], 4, 13, 28, 1),
    mkInvoice("inv6", "INV-2026-0004", orders[5], 5, 17, 32, 0),
    mkInvoice("inv7", "INV-2026-0003", orders[6], 6, 21, 36, 0.3),
    mkInvoice("inv8", "INV-2026-0002", orders[7], 7, 26, 41, 1),
    mkInvoice("inv9", "INV-2026-0001", orders[8], 8, 30, 45, 1),
    mkInvoice("inv10", "INV-2025-0048", orders[9], 9, 44, 59, 0)
  ];

  const payments = [
    { id: "p1", number: "PAY-2026-0018", invoiceId: "inv1", invoiceNumber: "INV-2026-0009", customerId: "c1", customerName: "Maison Aurelle", date: iso(4), method: "Wire Transfer", amount: 49574, reference: "SWIFT MT103 8832", createdAt: iso(4) },
    { id: "p2", number: "PAY-2026-0017", invoiceId: "inv2", invoiceNumber: "INV-2026-0008", customerId: "c2", customerName: "Vantory Fine Jewels", date: iso(5), method: "Wire Transfer", amount: 148000, reference: "VAN-7781", createdAt: iso(5) },
    { id: "p3", number: "PAY-2026-0016", invoiceId: "inv3", invoiceNumber: "INV-2026-0007", customerId: "c1", customerName: "Maison Aurelle", date: iso(8), method: "Bank Transfer", amount: 53295, reference: "MA-1122", createdAt: iso(8) },
    { id: "p4", number: "PAY-2026-0015", invoiceId: "inv4", invoiceNumber: "INV-2026-0006", customerId: "c6", customerName: "Kira Montanari", date: iso(12), method: "Card", amount: 74852, reference: "CARD 3344", createdAt: iso(12) },
    { id: "p5", number: "PAY-2026-0014", invoiceId: "inv5", invoiceNumber: "INV-2026-0005", customerId: "c1", customerName: "Maison Aurelle", date: iso(15), method: "Wire Transfer", amount: 9525, reference: "SWIFT MT103 8840", createdAt: iso(15) },
    { id: "p6", number: "PAY-2026-0013", invoiceId: "inv7", invoiceNumber: "INV-2026-0003", customerId: "c7", customerName: "Jonathan Hayes", date: iso(23), method: "Wire Transfer", amount: 22275, reference: "JOH-0091", createdAt: iso(23) },
    { id: "p7", number: "PAY-2026-0012", invoiceId: "inv8", invoiceNumber: "INV-2026-0002", customerId: "c10", customerName: "Crown & Crescent", date: iso(28), method: "Card", amount: 58374, reference: "CARD 8812", createdAt: iso(28) },
    { id: "p8", number: "PAY-2026-0011", invoiceId: "inv9", invoiceNumber: "INV-2026-0001", customerId: "c3", customerName: "Sterling & Sloan", date: iso(32), method: "Wire Transfer", amount: 9708, reference: "SS-5540", createdAt: iso(32) }
  ];

  const poItems1 = [
    { inventoryType: "gemstone", inventoryId: null, name: "Certified Muzo Emerald parcel (4 stones)", qty: 1, unitPrice: 88000 }
  ];
  const poItems2 = [
    { inventoryType: "diamond", inventoryId: null, name: "Pink rough parcel 3.1ct", qty: 1, unitPrice: 145000 }
  ];
  const poItems3 = [
    { inventoryType: "gemstone", inventoryId: null, name: "Blue sapphire rough lot", qty: 1, unitPrice: 52000 }
  ];
  const poItems4 = [
    { inventoryType: "jewellery", inventoryId: null, name: "Custom gold alloy lot", qty: 1, unitPrice: 15000 }
  ];
  const poItems5 = [
    { inventoryType: "diamond", inventoryId: null, name: "White rough parcel 8.2ct", qty: 1, unitPrice: 94000 }
  ];

  const p1 = compute(poItems1, 0, 0);
  const p2 = compute(poItems2, 0, 0);
  const p3 = compute(poItems3, 0, 0);
  const p4 = compute(poItems4, 0, 0);
  const p5 = compute(poItems5, 0, 0);

  const purchaseOrders = [
    { id: "po1", number: "PO-2026-0006", supplierId: "s6", supplierName: "Muzo Emerald Group", date: iso(5), expectedDate: isoF(23), status: "ordered", items: poItems1, ...p1, notes: "Four certified stones.", createdAt: iso(5) },
    { id: "po2", number: "PO-2026-0005", supplierId: "s1", supplierName: "Argyle Legacy", date: iso(12), expectedDate: isoF(9), status: "ordered", items: poItems2, ...p2, notes: "", createdAt: iso(12) },
    { id: "po3", number: "PO-2026-0004", supplierId: "s5", supplierName: "Ceylon Blue Trading", date: iso(20), expectedDate: isoF(15), status: "received", items: poItems3, ...p3, notes: "Received, grading pending.", createdAt: iso(20) },
    { id: "po4", number: "PO-2026-0003", supplierId: "s3", supplierName: "Antwerp Brilliant Cutters", date: iso(26), expectedDate: isoF(2), status: "approved", items: poItems4, ...p4, notes: "", createdAt: iso(26) },
    { id: "po5", number: "PO-2026-0002", supplierId: "s2", supplierName: "Cullinan House", date: iso(33), expectedDate: iso(3), status: "received", items: poItems5, ...p5, notes: "", createdAt: iso(33) },
    { id: "po6", number: "PO-2026-0001", supplierId: "s4", supplierName: "Mogok Stone Traders", date: iso(48), expectedDate: iso(18), status: "draft", items: poItems1, ...p1, notes: "Draft, awaiting confirmation.", createdAt: iso(48) }
  ];

  const activities = [
    { id: "a1", type: "order", message: "Sales order SO-2026-0009 placed by Maison Aurelle", userId: "u3", userName: "Amara Ndiaye", target: "so1", createdAt: isoF(0) + "T10:12:00" },
    { id: "a2", type: "payment", message: "Payment PAY-2026-0018 received from Maison Aurelle", userId: "u5", userName: "James Whitfield", target: "p1", createdAt: iso(4) + "T15:40:00" },
    { id: "a3", type: "inventory", message: "New diamond FD-RP-0920 added to inventory", userId: "u4", userName: "Priya Sharma", target: "d13", createdAt: iso(12) + "T09:05:00" },
    { id: "a4", type: "quote", message: "Quote QT-2026-0008 sent to Kira Montanari", userId: "u3", userName: "Amara Ndiaye", target: "qt1", createdAt: iso(6) + "T14:22:00" },
    { id: "a5", type: "lead", message: "Lead Elena Petrov moved to Contacted", userId: "u3", userName: "Amara Ndiaye", target: "l3", createdAt: iso(9) + "T11:03:00" },
    { id: "a6", type: "purchase", message: "Purchase order PO-2026-0006 placed with Muzo Emerald Group", userId: "u2", userName: "Daniel Cho", target: "po1", createdAt: iso(5) + "T16:18:00" },
    { id: "a7", type: "invoice", message: "Invoice INV-2026-0009 issued", userId: "u5", userName: "James Whitfield", target: "inv1", createdAt: iso(1) + "T08:55:00" },
    { id: "a8", type: "inventory", message: "Diamond FD-BP-1050 marked as sold", userId: "u4", userName: "Priya Sharma", target: "d16", createdAt: iso(40) + "T17:30:00" },
    { id: "a9", type: "customer", message: "New customer Sofia Laurent added", userId: "u3", userName: "Amara Ndiaye", target: "c12", createdAt: iso(30) + "T10:47:00" },
    { id: "a10", type: "settings", message: "Company profile updated", userId: "u1", userName: "Valentina Rossi", target: null, createdAt: iso(3) + "T12:00:00" }
  ];

  const KNOWN_COLOURS = ["Pink", "Blue", "Yellow", "Green", "Orange", "Purple", "Red", "Gray", "Grey", "Brown", "White", "Black"];
  const KNOWN_INTENSITY = ["Vivid", "Intense", "Deep", "Light", "Medium", "Faint", "Dark"];

  const enrichDiamond = (d) => {
    let colour = String(d.color);
    let intensity = "";
    let modifier = "";
    if (colour.startsWith("Fancy ")) {
      const rest = colour.replace("Fancy ", "").split(" ");
      if (KNOWN_INTENSITY.includes(rest[0])) {
        intensity = rest.shift();
      }
      colour = rest.join(" ");
      if (colour.includes("-")) {
        const parts = colour.split("-");
        const main = parts.find((p) => KNOWN_COLOURS.includes(p)) || parts[parts.length - 1];
        modifier = parts.filter((p) => p !== main).join(" ");
        colour = main;
      }
    }
    const c = Number(d.carat) || 1;
    const dia = 6.5 * Math.pow(c, 1 / 3);
    const height = 4.1 * Math.pow(c, 1 / 3);
    return Object.assign(d, {
      colourIntensity: intensity,
      colourModifier: modifier,
      measurements: `${dia.toFixed(2)} × ${dia.toFixed(2)} × ${height.toFixed(2)} mm`,
      depth: Number((Math.random() * 2.2 + 60.5).toFixed(1)),
      table: Number((Math.random() * 3 + 56).toFixed(1))
    });
  };

  diamonds.forEach(enrichDiamond);

  const products = [
    { id: "p1", sku: "PR-AUR-001", name: "Aurelle Diamond Ring", category: "Ring", material: "18k White Gold", description: "Signature pavé-set diamond ring with central solitaire.", price: 18900, cost: 12800, quantity: 2, location: "Geneva Vault", status: "in-stock", tags: ["signature", "pavé"], photos: [], notes: "", createdAt: iso(180) },
    { id: "p2", sku: "PR-ATL-002", name: "Atelier Sterling Bangle", category: "Bangle", material: "Sterling Silver", description: "Hand-finished bangle from the Atelier collection.", price: 4200, cost: 2600, quantity: 5, location: "Antwerp Office", status: "in-stock", tags: ["atelier"], photos: [], notes: "", createdAt: iso(160) },
    { id: "p3", sku: "PR-CUF-003", name: "Colour Diam Cufflinks", category: "Cufflinks", material: "18k Yellow Gold", description: "Engraved cufflinks with champagne-gold inlay.", price: 5800, cost: 3700, quantity: 3, location: "Antwerp Office", status: "in-stock", tags: ["accessory"], photos: [], notes: "", createdAt: iso(140) },
    { id: "p4", sku: "PR-RIV-004", name: "Riviere Choker", category: "Necklace", material: "18k White Gold", description: "Graduated diamond choker, 9.8 ctw.", price: 148000, cost: 102000, quantity: 1, location: "Geneva Vault", status: "in-stock", tags: ["high-jewellery"], photos: [], notes: "", createdAt: iso(120) },
    { id: "p5", sku: "PR-ECL-005", name: "Eclat Stud Earrings", category: "Earrings", material: "18k White Gold", description: "Screw-back diamond studs, 1.1 ctw each.", price: 18500, cost: 12600, quantity: 4, location: "Antwerp Office", status: "in-stock", tags: ["everyday"], photos: [], notes: "", createdAt: iso(100) },
    { id: "p6", sku: "PR-SIG-006", name: "Signature Bracelet", category: "Bracelet", material: "18k Rose Gold", description: "Sliding diamond bead bracelet.", price: 9600, cost: 6400, quantity: 3, location: "Antwerp Office", status: "in-stock", tags: ["signature"], photos: [], notes: "", createdAt: iso(80) },
    { id: "p7", sku: "PR-MUS-007", name: "Muse Pendant", category: "Pendant", material: "18k Yellow Gold", description: "Diamond set pendant with adjustable chain.", price: 12400, cost: 8200, quantity: 2, location: "Geneva Vault", status: "in-stock", tags: [], photos: [], notes: "", createdAt: iso(60) },
    { id: "p8", sku: "PR-HER-008", name: "Heritage Brooch", category: "Brooch", material: "Platinum", description: "Vintage-inspired platinum brooch, 3.4 ctw.", price: 26500, cost: 18000, quantity: 1, location: "Geneva Vault", status: "reserved", tags: ["vintage"], photos: [], notes: "Reserved for Maison Aurelle.", createdAt: iso(45) }
  ];

  const memos = [
    { id: "m1", number: "MEM-2026-0005", customerId: "c8", customerName: "Emerald Bay Luxury", date: iso(3), dueDate: isoF(27), items: [{ inventoryType: "jewellery", inventoryId: "j2", name: "Solitaire Pink Ring", qty: 1, unitPrice: 320000 }], totalValue: 320000, status: "out-standing", notes: "On approval for a private client.", createdAt: iso(3) },
    { id: "m2", number: "MEM-2026-0004", customerId: "c9", customerName: "Bellerose Atelier", date: iso(8), dueDate: isoF(22), items: [{ inventoryType: "diamond", inventoryId: "d4", name: "Fancy Vivid Green Emerald 1.80ct", qty: 1, unitPrice: 216000 }], totalValue: 216000, status: "sold", notes: "Converted to sale after approval.", createdAt: iso(8) },
    { id: "m3", number: "MEM-2026-0003", customerId: "c6", customerName: "Kira Montanari", date: iso(14), dueDate: iso(16), items: [{ inventoryType: "diamond", inventoryId: "d13", name: "Fancy Red-Pink Radiant 0.92ct", qty: 1, unitPrice: 124200 }], totalValue: 124200, status: "returned", notes: "Returned in original condition.", createdAt: iso(14) },
    { id: "m4", number: "MEM-2026-0002", customerId: "c2", customerName: "Vantory Fine Jewels", date: iso(20), dueDate: isoF(10), items: [{ inventoryType: "jewellery", inventoryId: "j3", name: "Eternal Tennis Bracelet", qty: 1, unitPrice: 148000 }], totalValue: 148000, status: "partial-return", notes: "Two stones returned for restringing.", createdAt: iso(20) },
    { id: "m5", number: "MEM-2026-0001", customerId: "c1", customerName: "Maison Aurelle", date: iso(28), dueDate: isoF(2), items: [{ inventoryType: "diamond", inventoryId: "d1", name: "Fancy Vivid Pink Round 3.02ct", qty: 1, unitPrice: 256700 }, { inventoryType: "gemstone", inventoryId: "g2", name: "Kashmir Sapphire 4.05ct", qty: 1, unitPrice: 275400 }], totalValue: 532100, status: "out-standing", notes: "Extended approval — VIP client.", createdAt: iso(28) }
  ];

  const returns = [
    { id: "r1", number: "RET-2026-0003", orderId: "so8", orderNumber: "SO-2026-0002", customerId: "c10", customerName: "Crown & Crescent", date: iso(2), items: [{ inventoryType: "jewellery", inventoryId: "j7", name: "Grace Hoop Earrings", qty: 1, unitPrice: 36000 }], reason: "Damaged during transit", condition: "Minor damage — clasp", status: "inspected", refundAmount: 36000, notes: "Awaiting repair decision.", createdAt: iso(2) },
    { id: "r2", number: "RET-2026-0002", orderId: "so9", orderNumber: "SO-2026-0001", customerId: "c3", customerName: "Sterling & Sloan", date: iso(6), items: [{ inventoryType: "diamond", inventoryId: "d15", name: "G SI1 Emerald 1.01ct", qty: 1, unitPrice: 8989 }], reason: "Client preference", condition: "Pristine", status: "pending", refundAmount: 8989, notes: "Waiting for inspection sign-off.", createdAt: iso(6) },
    { id: "r3", number: "RET-2026-0001", orderId: "so6", orderNumber: "SO-2026-0004", customerId: "c9", customerName: "Bellerose Atelier", date: iso(12), items: [{ inventoryType: "jewellery", inventoryId: "j6", name: "Classique Diamond Pendant", qty: 1, unitPrice: 42000 }], reason: "Size adjustment", condition: "Pristine", status: "approved", refundAmount: 0, notes: "Exchange for larger size, no refund.", createdAt: iso(12) }
  ];

  const expenses = [
    { id: "e1", number: "EXP-2026-0016", date: iso(1), category: "Security & Insurance", vendor: "Lloyd's of London", description: "Vault insurance premium — Q3", amount: 12400, paymentMethod: "Wire Transfer", status: "recorded", notes: "", createdAt: iso(1) },
    { id: "e2", number: "EXP-2026-0015", date: iso(4), category: "Marketing", vendor: "Baselworld", description: "Exhibition booth — Baselworld 2026", amount: 18500, paymentMethod: "Card", status: "approved", notes: "Confirmed for June.", createdAt: iso(4) },
    { id: "e3", number: "EXP-2026-0014", date: iso(7), category: "Freight & Shipping", vendor: "Brink's", description: "Insured courier — Geneva to Antwerp", amount: 1120, paymentMethod: "Card", status: "recorded", notes: "", createdAt: iso(7) },
    { id: "e4", number: "EXP-2026-0013", date: iso(10), category: "Laboratory Fees", vendor: "GIA", description: "Grading reports — 12 diamonds", amount: 3850, paymentMethod: "Bank Transfer", status: "approved", notes: "", createdAt: iso(10) },
    { id: "e5", number: "EXP-2026-0012", date: iso(15), category: "Office & Facilities", vendor: "Rue du Rhône Properties", description: "Office rent — monthly", amount: 6200, paymentMethod: "Standing Order", status: "recorded", notes: "", createdAt: iso(15) },
    { id: "e6", number: "EXP-2026-0011", date: iso(20), category: "Professional Services", vendor: "Auren Legal", description: "Import licensing advisory", amount: 4100, paymentMethod: "Wire Transfer", status: "reimbursed", notes: "", createdAt: iso(20) },
    { id: "e7", number: "EXP-2026-0010", date: iso(26), category: "Travel", vendor: "Swiss Air", description: "Client visit — Dubai", amount: 2380, paymentMethod: "Card", status: "recorded", notes: "", createdAt: iso(26) }
  ];

  const tasks = [
    { id: "t1", title: "Send pink diamond dossier to Lucas Fontaine", description: "Compile GIA reports and photography for 1.5ct+ fancy pink options.", assignee: "u3", assigneeName: "Amara Ndiaye", dueDate: isoF(2), priority: "high", status: "in-progress", module: "lead", relatedId: "l1", relatedName: "Lucas Fontaine", createdAt: iso(3) },
    { id: "t2", title: "Finalise emerald parcel terms", description: "Confirm pricing and delivery with Muzo Emerald Group before PO goes out.", assignee: "u2", assigneeName: "Daniel Cho", dueDate: isoF(1), priority: "high", status: "todo", module: "purchase", relatedId: "po1", relatedName: "Muzo Emerald Group", createdAt: iso(4) },
    { id: "t3", title: "Renew vault insurance", description: "Collect updated valuation list and send to broker.", assignee: "u1", assigneeName: "Valentina Rossi", dueDate: isoF(10), priority: "medium", status: "todo", module: null, relatedId: null, relatedName: null, createdAt: iso(6) },
    { id: "t4", title: "Grading appointment for new rough", description: "Book GIA grading for the received emerald parcel (PO-2026-0004).", assignee: "u4", assigneeName: "Priya Sharma", dueDate: isoF(5), priority: "medium", status: "in-progress", module: "purchase", relatedId: "po3", relatedName: "PO-2026-0004", createdAt: iso(8) },
    { id: "t5", title: "Quarterly stock take — Antwerp", description: "Physical count of Antwerp office stock, reconcile system quantities.", assignee: "u4", assigneeName: "Priya Sharma", dueDate: isoF(12), priority: "high", status: "todo", module: "stock", relatedId: null, relatedName: "Antwerp Office", createdAt: iso(9) },
    { id: "t6", title: "Follow up invoice INV-2026-0007", description: "Chase partial payment from Jonathan Hayes.", assignee: "u5", assigneeName: "James Whitfield", dueDate: isoF(3), priority: "low", status: "todo", module: "invoice", relatedId: "inv7", relatedName: "INV-2026-0007", createdAt: iso(10) }
  ];

  const messages = [
    { id: "msg1", subject: "Availability — fancy pinks over 1.5ct", body: "Dear Colour Diam, are there currently any Argyle provenance fancy pinks above 1.5 carats available for a private viewing next month?", partyType: "customer", partyId: "c6", partyName: "Kira Montanari", direction: "inbound", channel: "email", owner: "u3", ownerName: "Amara Ndiaye", status: "unread", date: iso(2), createdAt: iso(2) },
    { id: "msg2", subject: "Pink diamond dossier", body: "Lucas, please find the compiled dossier of fancy pink options within your range. Happy to arrange a Geneva viewing.", partyType: "lead", partyId: "l1", partyName: "Lucas Fontaine", direction: "outbound", channel: "email", owner: "u3", ownerName: "Amara Ndiaye", status: "read", date: iso(1), createdAt: iso(1) },
    { id: "msg3", subject: "Price confirmation — FD-BL-2147", body: "Confirming final price of USD 209,720 for the intense blue cushion. Please hold until Friday.", partyType: "customer", partyId: "c2", partyName: "Vantory Fine Jewels", direction: "inbound", channel: "email", owner: "u3", ownerName: "Amara Ndiaye", status: "replied", date: iso(4), createdAt: iso(4) },
    { id: "msg4", subject: "Team note", body: "Remember to log all memo releases in the Memos module before items leave the vault.", partyType: "team", partyId: null, partyName: "Operations", direction: "inbound", channel: "in-person", owner: "u2", ownerName: "Daniel Cho", status: "read", date: iso(5), createdAt: iso(5) },
    { id: "msg5", subject: "Enquiry — engagement ring", body: "Hi, I am looking for a 1ct round brilliant white diamond, G colour or better. What is your current selection?", partyType: "lead", partyId: "l3", partyName: "Elena Petrov", direction: "inbound", channel: "website", owner: "u3", ownerName: "Amara Ndiaye", status: "unread", date: iso(3), createdAt: iso(3) },
    { id: "msg6", subject: "Memo agreement confirmation", body: "We acknowledge the consignment of FD-PK-3021 and GS-SP-4052 under MEM-2026-0001. Returning by the due date.", partyType: "customer", partyId: "c1", partyName: "Maison Aurelle", direction: "inbound", channel: "email", owner: "u4", ownerName: "Priya Sharma", status: "read", date: iso(6), createdAt: iso(6) }
  ];

  const documents = [
    { id: "doc1", name: "GIA 2201345567 — FD-PK-3021", type: "certificate", partyType: "inventory", partyName: "Fancy Vivid Pink", date: iso(90), tags: ["GIA", "pink"], url: null, notes: "Original certificate for the Argyle pink.", createdAt: iso(90) },
    { id: "doc2", name: "Invoice INV-2026-0009", type: "invoice", partyType: "customer", partyName: "Maison Aurelle", date: iso(1), tags: ["billing"], url: null, notes: "", createdAt: iso(1) },
    { id: "doc3", name: "Memo agreement MEM-2026-0001", type: "memo", partyType: "customer", partyName: "Maison Aurelle", date: iso(28), tags: ["consignment"], url: null, notes: "Signed consignment agreement.", createdAt: iso(28) },
    { id: "doc4", name: "Vault insurance policy 2026", type: "contract", partyType: "company", partyName: "Colour Diam", date: iso(30), tags: ["insurance"], url: null, notes: "", createdAt: iso(30) },
    { id: "doc5", name: "Brand guidelines — colour palette", type: "media", partyType: "company", partyName: "Colour Diam", date: iso(60), tags: ["brand"], url: null, notes: "Champagne gold on neutral palette.", createdAt: iso(60) },
    { id: "doc6", name: "Import licence — EU export permit", type: "regulatory", partyType: "company", partyName: "Colour Diam", date: iso(40), tags: ["compliance"], url: null, notes: "", createdAt: iso(40) }
  ];

  return {
    meta: { company: { name: "Colour Diam", website: "www.colourdiam.com", currency: "USD", taxRate: 8, address: "Rue du Rhône 62, 1204 Geneva, Switzerland", phone: "+41 22 555 0100", email: "hello@colourdiam.com" } },
    users,
    diamonds,
    gemstones,
    jewellery,
    products,
    customers,
    leads,
    suppliers,
    memos,
    returns,
    expenses,
    tasks,
    messages,
    documents,
    quotes,
    orders,
    invoices,
    payments,
    purchaseOrders,
    activities,
    settings: { currency: "USD", taxRate: 8, lowStockThreshold: 0, notificationsEnabled: true, invoicePrefix: "INV-2026-", orderPrefix: "SO-2026-", quotePrefix: "QT-2026-", poPrefix: "PO-2026-", paymentPrefix: "PAY-2026-" }
  };
}
