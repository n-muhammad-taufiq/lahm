-- Project Lahm - Real Merchant & Catalog Seed Script
-- Verticals: Meat Shops, Restaurants, Groceries

-- 1. Insert Users for Merchants
INSERT INTO "user" (name, email, "phoneNumber", role)
VALUES 
  ('Al-Barakah Butcher Owner', 'barakah@lahm.app', '+919800000001', 'merchant'),
  ('Al-Aqsa Meat Owner', 'aqsa@lahm.app', '+919800000002', 'merchant'),
  ('Al-Basha Mandi Owner', 'basha@lahm.app', '+919800000003', 'merchant'),
  ('Zaitoon Dining Owner', 'zaitoon@lahm.app', '+919800000004', 'merchant'),
  ('Madina Pantry Owner', 'madina@lahm.app', '+919800000005', 'merchant')
ON CONFLICT ("phoneNumber") DO NOTHING;

-- 2. Insert Merchants (with realistic launch coordinates in Chennai)
-- Vertical 1: Meat Shops
INSERT INTO merchant (
  "shopName", "shopAddress", city, state, "pinCode",
  latitude, longitude, rating, "bannerUrl",
  "openingTime", "closingTime", "isVerified", "userId"
)
SELECT 
  'Al-Barakah Gourmet Butcher', '14 Pantheon Road, Egmore', 'Chennai', 'Tamil Nadu', '600008',
  13.0732, 80.2609, 4.9, 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80',
  '07:00 AM', '09:30 PM', true, id
FROM "user" WHERE "phoneNumber" = '+919800000001'
ON CONFLICT ("userId") DO NOTHING;

INSERT INTO merchant (
  "shopName", "shopAddress", city, state, "pinCode",
  latitude, longitude, rating, "bannerUrl",
  "openingTime", "closingTime", "isVerified", "userId"
)
SELECT 
  'Al Aqsa Fresh Halal Meat', '88 Triplicane High Road', 'Chennai', 'Tamil Nadu', '600005',
  13.0583, 80.2764, 4.8, 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&auto=format&fit=crop&q=80',
  '07:30 AM', '09:00 PM', true, id
FROM "user" WHERE "phoneNumber" = '+919800000002'
ON CONFLICT ("userId") DO NOTHING;

-- Vertical 2: Restaurants
INSERT INTO merchant (
  "shopName", "shopAddress", city, state, "pinCode",
  latitude, longitude, rating, "bannerUrl",
  "openingTime", "closingTime", "isVerified", "userId"
)
SELECT 
  'Al-Basha Mandi & Grills', '45 Anna Salai, Thousand Lights', 'Chennai', 'Tamil Nadu', '600002',
  13.0604, 80.2496, 4.9, 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80',
  '11:00 AM', '11:00 PM', true, id
FROM "user" WHERE "phoneNumber" = '+919800000003'
ON CONFLICT ("userId") DO NOTHING;

INSERT INTO merchant (
  "shopName", "shopAddress", city, state, "pinCode",
  latitude, longitude, rating, "bannerUrl",
  "openingTime", "closingTime", "isVerified", "userId"
)
SELECT 
  'Zaitoon Signature Restaurant', '22 2nd Avenue, Anna Nagar', 'Chennai', 'Tamil Nadu', '600040',
  13.0850, 80.2100, 4.8, 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80',
  '12:00 PM', '11:30 PM', true, id
FROM "user" WHERE "phoneNumber" = '+919800000004'
ON CONFLICT ("userId") DO NOTHING;

-- Vertical 3: Groceries
INSERT INTO merchant (
  "shopName", "shopAddress", city, state, "pinCode",
  latitude, longitude, rating, "bannerUrl",
  "openingTime", "closingTime", "isVerified", "userId"
)
SELECT 
  'Madina Gourmet & Halal Pantry', '102 Mount Road, Teynampet', 'Chennai', 'Tamil Nadu', '600018',
  13.0450, 80.2500, 4.9, 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&auto=format&fit=crop&q=80',
  '08:00 AM', '10:30 PM', true, id
FROM "user" WHERE "phoneNumber" = '+919800000005'
ON CONFLICT ("userId") DO NOTHING;

-- 3. Insert Products for Each Merchant
INSERT INTO product (name, description, price, stock, "isAvailable", "merchantId")
SELECT 'Prime Tender Lamb Curry Cut (500g)', 'Succulent grass-fed lamb cubes with delicate bone marrow', 580.00, 25, true, id
FROM merchant WHERE "shopName" = 'Al-Barakah Gourmet Butcher'
ON CONFLICT DO NOTHING;

INSERT INTO product (name, description, price, stock, "isAvailable", "merchantId")
SELECT 'Premium Boneless Goat Cubes (500g)', 'Hand-trimmed lean halal goat cuts ready for slow braising', 640.00, 20, true, id
FROM merchant WHERE "shopName" = 'Al-Barakah Gourmet Butcher'
ON CONFLICT DO NOTHING;

INSERT INTO product (name, description, price, stock, "isAvailable", "merchantId")
SELECT 'Tender Chicken Breast Fillet (500g)', 'Farm-fresh skinless and boneless chicken breast fillets', 260.00, 30, true, id
FROM merchant WHERE "shopName" = 'Al Aqsa Fresh Halal Meat'
ON CONFLICT DO NOTHING;

INSERT INTO product (name, description, price, stock, "isAvailable", "merchantId")
SELECT 'Royal Saffron Mandi Platter', 'Slow-cooked fragrant basmati rice infused with whole cardamom and pure saffron', 450.00, 30, true, id
FROM merchant WHERE "shopName" = 'Al-Basha Mandi & Grills'
ON CONFLICT DO NOTHING;

INSERT INTO product (name, description, price, stock, "isAvailable", "merchantId")
SELECT 'Charcoal Grilled Quarter Chicken', 'Charcoal flame-grilled chicken glazed with Arabian citrus marinade', 180.00, 40, true, id
FROM merchant WHERE "shopName" = 'Al-Basha Mandi & Grills'
ON CONFLICT DO NOTHING;

INSERT INTO product (name, description, price, stock, "isAvailable", "merchantId")
SELECT 'Dum Pukht Special Biryani', 'Layered aged basmati rice cooked in sealed handi with delicate spices', 380.00, 35, true, id
FROM merchant WHERE "shopName" = 'Zaitoon Signature Restaurant'
ON CONFLICT DO NOTHING;

INSERT INTO product (name, description, price, stock, "isAvailable", "merchantId")
SELECT 'Royal Amber Basmati Rice (5kg)', 'Extra-long grain premium aged aromatic basmati rice', 650.00, 50, true, id
FROM merchant WHERE "shopName" = 'Madina Gourmet & Halal Pantry'
ON CONFLICT DO NOTHING;

INSERT INTO product (name, description, price, stock, "isAvailable", "merchantId")
SELECT 'Medjool Premium Saudi Dates (500g)', 'Large luscious hand-picked Medjool dates with rich honey aroma', 490.00, 45, true, id
FROM merchant WHERE "shopName" = 'Madina Gourmet & Halal Pantry'
ON CONFLICT DO NOTHING;
