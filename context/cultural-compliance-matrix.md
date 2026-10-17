# Project Lahm — Regional & Cultural Compliance Matrix (India, Japan, China)

> **Purpose:** This living guideline ensures that all database models, enums, pricing calculations, UI components, and verification protocols are verified for **India, Japan, and China** at each step of development, preventing generic Western or one-country-only assumptions.

---

## 1. Regional Culinary & Meat Cut Taxonomy

| Dimension | 🇮🇳 India (South India / Tamil Nadu Launch Priority) | 🇯🇵 Japan (East Asia) | 🇨🇳 China (Qingzhen / 清真) |
| :--- | :--- | :--- | :--- |
| **Primary Meat Demands** | • **Mutton (Aatukari - Goat/Bakra & Sheep)** is the supreme delicacy<br>• **Chicken (Kozhi)**: Broiler & Nattu Kozhi (Country Chicken)<br>• **Beef (Mattukari)** & Buffalo: Fully legal & widely enjoyed across Tamil Nadu<br>• **Finfish (Meen)**: Vanjaram (Seer fish), Sankara (Red snapper), Nethili | • Halal Wagyu / Prime Beef<br>• Halal Chicken / Duck<br>• Finfish (Salmon, Tuna, Sea Bream)<br>• Lamb (*Hitsujiniku*) | • Mutton / Lamb (*Yangrou* / 羊肉)<br>• Prime Beef (*Niurou* / 牛肉)<br>• Free-range Chicken & Duck<br>• Finfish (Carp, Sea Bass) |
| **Signature Cut Styles** | • **Curry Cut / Kulambu Kari** (Standard pieces)<br>• **Biryani Cut** (Large pieces / Periya Thundu)<br>• **Fry / Sukka Cut** (Small pieces / Chinna Thundu)<br>• **Kothu Kari** (Finely chopped - NEVER use unfamiliar "Mince")<br>• **Soup Bones / Aatukkal** (Trotters & marrow bones) | • **Sukiyaki** (薄切り 1.5–2mm thin slices)<br>• **Shabu-Shabu** (しゃぶしゃぶ 1mm paper-thin)<br>• **Yakiniku** (焼肉 5mm grilled cuts)<br>• **Yakitori** (Skewers / tenderloin cubes)<br>• **Steak** (Sirloin / Tenderloin block) | • **Hotpot Sliced Roll** (羊肉卷 / 牛肉卷)<br>• **Cumin Skewer Cubes** (羊肉串)<br>• **Braised Spiced Shank** (酱牛肉)<br>• **Lamb Spine** (羊蝎子)<br>• **Soup Bone & Marrow** (肉骨) |
| **Bovine Legal Nuance** | **CRITICAL:** Cow slaughter is legally prohibited in many Indian states. **Buffalo (*Carabeef*)** must be explicitly distinguished from cow beef in the database and catalog. | Cow beef (Wagyu, Angus) is standard and legal, requiring recognized Halal slaughter verification. | Halal cattle beef and buffalo are fully legal and widely consumed in Qingzhen restaurants. |

---

## 2. Weight, Packaging & Pricing Standards

| Dimension | 🇮🇳 India | 🇯🇵 Japan | 🇨🇳 China |
| :--- | :--- | :--- | :--- |
| **Standard Consumer Unit** | Kilograms (kg) and Grams (g) | Grams (g) | The **Jin** (市斤 = 500g) and Grams/kg |
| **Pricing Display Pattern** | Flat price per pack or rate per kg (e.g. `₹480 / 500g`, `₹950 / kg`) | **Standard per 100g rate:** `¥580 / 100g` with total package weight (e.g. 240g = `¥1,392`) | Price per 500g (Jin) or flat per pack (e.g. `¥45 / 500g`) |
| **Cut Weight Steppers** | 250g, 500g, 1kg | 100g, 150g, 200g, 300g trays | 250g (Half Jin), 500g (1 Jin), 1kg (2 Jin) |

---

## 3. Financial & Currency Computation Rules

| Dimension | 🇮🇳 India | 🇯🇵 Japan | 🇨🇳 China |
| :--- | :--- | :--- | :--- |
| **ISO Currency Code** | `INR` | `JPY` | `CNY` |
| **Currency Symbol** | `₹` | `¥` | `¥` (元) |
| **Decimal Precision** | **2 decimal places** (e.g., `450.50`) | **STRICTLY 0 decimals** (Integer only, e.g. `1420`). Sub-units (Sen) are obsolete. | **2 decimal places** (e.g., `68.50`) |
| **Database Storage** | `DECIMAL(10, 2)` | Server stores integer rounded amounts for JPY | `DECIMAL(10, 2)` |
| **UI Formatting Utility** | `formatCurrency(amount, 'INR', 'en-IN')` | `formatCurrency(amount, 'JPY', 'ja-JP')` | `formatCurrency(amount, 'CNY', 'zh-CN')` |

---

## 4. Halal Legal & Regulatory Standards

| Dimension | 🇮🇳 India | 🇯🇵 Japan | 🇨🇳 China |
| :--- | :--- | :--- | :--- |
| **Regulatory Authority** | • Food Safety & Standards Authority of India (FSSAI)<br>• Halal Trust / Jamiat Ulama-i-Hind | • Japan Halal Association (JHA)<br>• Japan Muslim Association (JMA)<br>• Nippon Asia Halal Association (NAHA) | • Local Islamic Association & Ethnic / Religious Affairs Bureau (清真食品标志) |
| **Labeling Requirements** | FSSAI License number, 100% Zabihah declaration, green veg/red non-veg dot indicator. | Halal certified logo, slaughterhouse origin, temperature storage (要冷蔵 0°C–4°C). | Official Green Halal (清真) emblem, producer certificate code, slaughter date. |

---

## 5. Address & Geocoding Conventions

| Dimension | 🇮🇳 India | 🇯🇵 Japan | 🇨🇳 China |
| :--- | :--- | :--- | :--- |
| **Address Structure** | Flat/Building, Street, Landmark, Area/Locality, City, State, PIN code. | Postal code (〒), Prefecture (県/都/府), City/Ward (市/区), Town/Chome (町/丁目), Block/Number. | Province (省), City (市), District (区), Street/Road (路/街), Building/Room. |
| **Database Solution** | Open unstructured string fields anchored by **WGS-84 Coordinates (`latitude`, `longitude`)** so any international address format works without regional schema breakage. |

---

## 6. Step-by-Step Regional Verification Gate

After authoring any enum, entity, or feature:
- [ ] **Species Check:** Does the enum accommodate the animals consumed in India (e.g. Buffalo/Goat), Japan (Wagyu/Salmon/Chicken), and China (Mutton/Duck/Carp)?
- [ ] **Cut Type Check:** Does it support South Asian curry/biryani cuts, Japanese sukiyaki/yakiniku slices, and Chinese hotpot rolls/skewers?
- [ ] **Currency Check:** Does the pricing engine respect JPY's zero-decimal rule alongside INR/CNY's two decimals?
- [ ] **Language/Localization:** Are enums and labels clean, neutral constants that can be mapped to English, Japanese, and Chinese localization dictionaries?
