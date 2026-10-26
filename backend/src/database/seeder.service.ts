import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Role } from '../users/enums/role.enum';
import { Merchant } from '../merchants/entities/merchant.entity';
import { Product } from '../products/entities/product.entity';
import { ProductVertical } from '../products/enums/product-vertical.enum';
import { MerchantCategory } from '../merchant-categories/entities/merchant-category.entity';
import { ProductCategory } from '../products/entities/product-category.entity';
import { Outlet } from '../outlets/entities/outlet.entity';
import { OutletProduct } from '../outlets/entities/outlet-product.entity';

interface SeedCategoryNode {
  name: string;
  description?: string;
  sortOrder?: number;
  subcategories?: SeedCategoryNode[];
}

interface SeedProduct {
  name: string;
  description: string;
  price: number;
  stock: number;
  vertical: ProductVertical;
  categoryPath?: string[];
}

interface SeedMerchant {
  shopName: string;
  shopAddress: string;
  city: string;
  state: string;
  pinCode: string;
  latitude: number;
  longitude: number;
  rating: number;
  bannerUrl: string;
  openingTime: string;
  closingTime: string;
  isVerified: boolean;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  categorySlugs: string[];
  categories?: SeedCategoryNode[];
  products: SeedProduct[];
}

const SEED_CATEGORIES = [
  {
    slug: 'meats',
    name: 'Meat Shops',
    description: 'Artisanal halal butcheries and fresh cut purveyors',
  },
  {
    slug: 'restaurants',
    name: 'Restaurants',
    description: 'Curated halal dining, grills, and kitchens',
  },
  {
    slug: 'groceries',
    name: 'Groceries',
    description: 'Pantry essentials, gourmet spices, and halal dry goods',
  },
];

const SEED_DATA: SeedMerchant[] = [
  {
    shopName: 'Al-Barakah Gourmet Butcher',
    shopAddress: '42 MTH Road, Near Bus Terminus, Ambattur OT',
    city: 'Chennai',
    state: 'Tamil Nadu',
    pinCode: '600053',
    latitude: 13.1148,
    longitude: 80.1545,
    rating: 4.9,
    bannerUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80',
    openingTime: '07:00 AM',
    closingTime: '09:30 PM',
    isVerified: true,
    ownerName: 'Al-Barakah Butcher Owner',
    ownerEmail: 'barakah@lahm.app',
    ownerPhone: '+919800000001',
    categorySlugs: ['meats'],
    categories: [
      {
        name: 'Fresh Mutton & Goat',
        description: 'Prime pasture-fed mutton and succulent goat cuts',
        sortOrder: 1,
        subcategories: [
          {
            name: 'Curry Cut & Ribs',
            description: 'Juicy bone-in cubes perfect for kulambu and gravies',
            sortOrder: 1,
          },
          {
            name: 'Boneless & Chops',
            description: 'Hand-trimmed lean boneless cubes and tender chops',
            sortOrder: 2,
          },
        ],
      },
      {
        name: 'Fresh Country Poultry',
        description: 'Naturally raised country chicken and fresh broiler cuts',
        sortOrder: 2,
        subcategories: [
          {
            name: 'Nattu Kozhi (Country Chicken)',
            description: 'Traditional native chicken with deep rich flavor',
            sortOrder: 1,
          },
          {
            name: 'Broiler Chicken Cuts',
            description: 'Fresh daily farm-dressed chicken cuts and fillets',
            sortOrder: 2,
          },
        ],
      },
      {
        name: 'Artisanal Marinades',
        description: 'Chef-formulated rubs and authentic south Indian marinades',
        sortOrder: 3,
      },
    ],
    products: [
      {
        name: 'Prime Tender Lamb Curry Cut (500g)',
        description: 'Succulent grass-fed lamb cubes with delicate bone marrow',
        price: 580.0,
        stock: 25,
        vertical: ProductVertical.MEAT,
        categoryPath: ['Fresh Mutton & Goat', 'Curry Cut & Ribs'],
      },
      {
        name: 'Premium Boneless Goat Cubes (500g)',
        description: 'Hand-trimmed lean halal goat cuts ready for slow braising',
        price: 640.0,
        stock: 20,
        vertical: ProductVertical.MEAT,
        categoryPath: ['Fresh Mutton & Goat', 'Boneless & Chops'],
      },
      {
        name: 'Tender Nattu Kozhi / Country Chicken (1kg)',
        description: 'Traditional country chicken prepared fresh upon order',
        price: 490.0,
        stock: 15,
        vertical: ProductVertical.MEAT,
        categoryPath: ['Fresh Country Poultry', 'Nattu Kozhi (Country Chicken)'],
      },
      {
        name: 'Farm Broiler Skinless Curry Cut (500g)',
        description: 'Tender skinless broiler chicken pieces for home curries',
        price: 180.0,
        stock: 40,
        vertical: ProductVertical.MEAT,
        categoryPath: ['Fresh Country Poultry', 'Broiler Chicken Cuts'],
      },
    ],
  },
  {
    shopName: 'Al Aqsa Fresh Halal Meat',
    shopAddress: '18 Red Hills Road, Ambattur OT',
    city: 'Chennai',
    state: 'Tamil Nadu',
    pinCode: '600053',
    latitude: 13.1185,
    longitude: 80.1570,
    rating: 4.8,
    bannerUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&auto=format&fit=crop&q=80',
    openingTime: '07:30 AM',
    closingTime: '09:00 PM',
    isVerified: true,
    ownerName: 'Al-Aqsa Meat Owner',
    ownerEmail: 'aqsa@lahm.app',
    ownerPhone: '+919800000002',
    categorySlugs: ['meats'],
    categories: [
      {
        name: 'Farm-Fresh Poultry',
        description: 'Hygienically processed daily fresh poultry',
        sortOrder: 1,
        subcategories: [
          {
            name: 'Boneless & Fillets',
            description: 'Lean breast cuts and tenderloins',
            sortOrder: 1,
          },
          {
            name: 'Curry Cuts & Wings',
            description: 'Standard pieces and party wings',
            sortOrder: 2,
          },
        ],
      },
      {
        name: 'Mutton & Lamb',
        description: 'Fresh locally sourced goat cuts',
        sortOrder: 2,
        subcategories: [
          {
            name: 'Bone Marrow & Chops',
            description: 'Nalli soup bones and tender rib chops',
            sortOrder: 1,
          },
        ],
      },
    ],
    products: [
      {
        name: 'Tender Chicken Breast Fillet (500g)',
        description: 'Farm-fresh skinless and boneless chicken breast fillets',
        price: 260.0,
        stock: 30,
        vertical: ProductVertical.MEAT,
        categoryPath: ['Farm-Fresh Poultry', 'Boneless & Fillets'],
      },
      {
        name: 'Fresh Lamb Bone Marrow Nalli (500g)',
        description: 'Rich marrow bones ideal for flavorful traditional broth',
        price: 620.0,
        stock: 15,
        vertical: ProductVertical.MEAT,
        categoryPath: ['Mutton & Lamb', 'Bone Marrow & Chops'],
      },
    ],
  },
  {
    shopName: 'Al-Basha Mandi & Grills',
    shopAddress: '75 MTH Road, Opp. Rakki Cinemas, Ambattur OT',
    city: 'Chennai',
    state: 'Tamil Nadu',
    pinCode: '600053',
    latitude: 13.1125,
    longitude: 80.1530,
    rating: 4.9,
    bannerUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80',
    openingTime: '11:00 AM',
    closingTime: '11:00 PM',
    isVerified: true,
    ownerName: 'Al-Basha Mandi Owner',
    ownerEmail: 'basha@lahm.app',
    ownerPhone: '+919800000003',
    categorySlugs: ['restaurants'],
    categories: [
      {
        name: 'Arabian Mandi Platters',
        description: 'Authentic Yemeni wood-fired mandi rice platters',
        sortOrder: 1,
        subcategories: [
          {
            name: 'Special Saffron Mandi',
            description: 'Fragrant saffron-tinted basmati rice with choice meats',
            sortOrder: 1,
          },
          {
            name: 'Mutton Mandi & Madhbi',
            description: 'Tender slow-cooked mutton over hot stone and charcoal',
            sortOrder: 2,
          },
        ],
      },
      {
        name: 'Charcoal Flame Grills',
        description: 'Smoky Arabian grills and marinated skewers',
        sortOrder: 2,
        subcategories: [
          {
            name: 'Signature Arabian Grills',
            description: 'Whole and quarter charcoal grilled chickens',
            sortOrder: 1,
          },
        ],
      },
    ],
    products: [
      {
        name: 'Royal Saffron Mandi Platter',
        description: 'Slow-cooked fragrant basmati rice infused with pure saffron',
        price: 450.0,
        stock: 30,
        vertical: ProductVertical.RESTAURANT,
        categoryPath: ['Arabian Mandi Platters', 'Special Saffron Mandi'],
      },
      {
        name: 'Yemeni Mutton Madhbi Platter',
        description: 'Slow-roasted succulent goat over volcanic stones with fragrant rice',
        price: 580.0,
        stock: 20,
        vertical: ProductVertical.RESTAURANT,
        categoryPath: ['Arabian Mandi Platters', 'Mutton Mandi & Madhbi'],
      },
      {
        name: 'Charcoal Grilled Quarter Chicken',
        description: 'Charcoal flame-grilled chicken glazed with Arabian citrus marinade',
        price: 180.0,
        stock: 40,
        vertical: ProductVertical.RESTAURANT,
        categoryPath: ['Charcoal Flame Grills', 'Signature Arabian Grills'],
      },
    ],
  },
  {
    shopName: 'Zaitoon Signature Restaurant',
    shopAddress: '12 TI Cycles Road, Venkatapuram, Ambattur',
    city: 'Chennai',
    state: 'Tamil Nadu',
    pinCode: '600053',
    latitude: 13.1095,
    longitude: 80.1590,
    rating: 4.8,
    bannerUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80',
    openingTime: '12:00 PM',
    closingTime: '11:30 PM',
    isVerified: true,
    ownerName: 'Zaitoon Dining Owner',
    ownerEmail: 'zaitoon@lahm.app',
    ownerPhone: '+919800000004',
    categorySlugs: ['restaurants'],
    categories: [
      {
        name: 'Dum Biryani & Rice',
        description: 'Legendary handi-sealed dum biryani specialties',
        sortOrder: 1,
        subcategories: [
          {
            name: 'Handi Dum Pukht Specials',
            description: 'Aromatic layered basmati cooked under dough seal',
            sortOrder: 1,
          },
        ],
      },
      {
        name: 'Tandoori Kebabs & Starters',
        description: 'Clay-oven baked succulent kebabs and tikkas',
        sortOrder: 2,
      },
    ],
    products: [
      {
        name: 'Dum Pukht Special Biryani',
        description: 'Layered aged basmati rice cooked in sealed handi',
        price: 380.0,
        stock: 35,
        vertical: ProductVertical.RESTAURANT,
        categoryPath: ['Dum Biryani & Rice', 'Handi Dum Pukht Specials'],
      },
    ],
  },
  {
    shopName: 'Madina Gourmet & Halal Pantry',
    shopAddress: '31 Gandhi Main Road, Ram Nagar, Ambattur OT',
    city: 'Chennai',
    state: 'Tamil Nadu',
    pinCode: '600053',
    latitude: 13.1110,
    longitude: 80.1505,
    rating: 4.9,
    bannerUrl: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&auto=format&fit=crop&q=80',
    openingTime: '08:00 AM',
    closingTime: '10:30 PM',
    isVerified: true,
    ownerName: 'Madina Pantry Owner',
    ownerEmail: 'madina@lahm.app',
    ownerPhone: '+919800000005',
    categorySlugs: ['groceries'],
    categories: [
      {
        name: 'Aromatic Basmati & Grains',
        description: 'Select heritage rice grains and pantry essentials',
        sortOrder: 1,
        subcategories: [
          {
            name: 'Aged Long-Grain Rice',
            description: 'Premium aged aged basmati rice varieties',
            sortOrder: 1,
          },
        ],
      },
      {
        name: 'Dry Fruits, Dates & Spices',
        description: 'Exotic Middle-Eastern imports and whole spices',
        sortOrder: 2,
        subcategories: [
          {
            name: 'Premium Saudi Dates',
            description: 'Luscious Medjool, Ajwa, and Mabroom dates',
            sortOrder: 1,
          },
        ],
      },
    ],
    products: [
      {
        name: 'Royal Amber Basmati Rice (5kg)',
        description: 'Extra-long grain premium aged aromatic basmati rice',
        price: 650.0,
        stock: 50,
        vertical: ProductVertical.GROCERY,
        categoryPath: ['Aromatic Basmati & Grains', 'Aged Long-Grain Rice'],
      },
      {
        name: 'Medjool Premium Saudi Dates (500g)',
        description: 'Large luscious hand-picked Medjool dates',
        price: 490.0,
        stock: 45,
        vertical: ProductVertical.GROCERY,
        categoryPath: ['Dry Fruits, Dates & Spices', 'Premium Saudi Dates'],
      },
    ],
  },
];

@Injectable()
export class SeederService {
  private readonly logger = new Logger(SeederService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Merchant)
    private readonly merchantRepository: Repository<Merchant>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(MerchantCategory)
    private readonly merchantCategoryRepository: Repository<MerchantCategory>,
    @InjectRepository(ProductCategory)
    private readonly productCategoryRepository: Repository<ProductCategory>,
    @InjectRepository(Outlet)
    private readonly outletRepository: Repository<Outlet>,
    @InjectRepository(OutletProduct)
    private readonly outletProductRepository: Repository<OutletProduct>,
  ) {}

  async seed(): Promise<void> {
    this.logger.log('Starting database seeding...');

    // 1. Seed Global Merchant Categories
    for (const cat of SEED_CATEGORIES) {
      let existing = await this.merchantCategoryRepository.findOne({ where: { slug: cat.slug } });
      if (!existing) {
        existing = this.merchantCategoryRepository.create({ ...cat, isActive: true });
        await this.merchantCategoryRepository.save(existing);
        this.logger.log(`Created merchant category: ${cat.name}`);
      }
    }

    // 2. Seed Merchants, Nested Product Categories & Products
    for (const item of SEED_DATA) {
      let user = await this.userRepository.findOne({ where: { phoneNumber: item.ownerPhone } });
      if (!user) {
        user = this.userRepository.create({
          name: item.ownerName,
          email: item.ownerEmail,
          phoneNumber: item.ownerPhone,
          role: Role.MERCHANT,
        });
        user = await this.userRepository.save(user);
        this.logger.log(`Created merchant owner user: ${user.name}`);
      }

      let merchant = await this.merchantRepository.findOne({
        where: { user: { id: user.id } },
        relations: { user: true, merchantCategories: true },
      });

      const categories = await this.merchantCategoryRepository.find({
        where: { slug: In(item.categorySlugs) },
      });

      if (!merchant) {
        merchant = this.merchantRepository.create({
          shopName: item.shopName,
          shopAddress: item.shopAddress,
          city: item.city,
          state: item.state,
          pinCode: item.pinCode,
          latitude: item.latitude,
          longitude: item.longitude,
          rating: item.rating,
          bannerUrl: item.bannerUrl,
          openingTime: item.openingTime,
          closingTime: item.closingTime,
          isVerified: item.isVerified,
          user,
          merchantCategories: categories,
        });
      } else {
        Object.assign(merchant, {
          shopName: item.shopName,
          shopAddress: item.shopAddress,
          city: item.city,
          state: item.state,
          pinCode: item.pinCode,
          latitude: item.latitude,
          longitude: item.longitude,
          rating: item.rating,
          bannerUrl: item.bannerUrl,
          openingTime: item.openingTime,
          closingTime: item.closingTime,
          isVerified: item.isVerified,
          merchantCategories: categories,
        });
      }
      merchant = await this.merchantRepository.save(merchant);
      this.logger.log(`Upserted merchant: ${merchant.shopName} with categories: ${item.categorySlugs.join(', ')}`);

      // 3. Seed Multi-level Product Categories for this merchant
      const categoryMap = new Map<string, ProductCategory>();

      if (item.categories && item.categories.length > 0) {
        const syncCategories = async (
          nodes: SeedCategoryNode[],
          parentId: number | null = null,
          depth: number = 1,
          parentPath: string[] = [],
        ) => {
          for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];
            const currentPath = [...parentPath, node.name];
            const fullPathKey = currentPath.join(' > ');

            let cat = await this.productCategoryRepository.findOne({
              where: {
                merchantId: merchant.id,
                name: node.name,
                parentId: parentId !== null ? parentId : IsNull(),
              },
            });

            if (!cat) {
              cat = this.productCategoryRepository.create({
                merchantId: merchant.id,
                name: node.name,
                description: node.description,
                parentId: parentId,
                depth,
                sortOrder: node.sortOrder ?? i + 1,
                isActive: true,
              });
            } else {
              Object.assign(cat, {
                description: node.description,
                depth,
                sortOrder: node.sortOrder ?? i + 1,
                isActive: true,
              });
            }
            cat = await this.productCategoryRepository.save(cat);
            categoryMap.set(fullPathKey, cat);
            categoryMap.set(node.name, cat);

            if (node.subcategories && node.subcategories.length > 0) {
              await syncCategories(node.subcategories, cat.id, depth + 1, currentPath);
            }
          }
        };

        await syncCategories(item.categories);
        this.logger.log(`Seeded multi-level categories for ${merchant.shopName}`);
      }

      // 4. Seed Products and link to categories
      for (const prodItem of item.products) {
        let categoryId: number | undefined;
        if (prodItem.categoryPath && prodItem.categoryPath.length > 0) {
          const fullPath = prodItem.categoryPath.join(' > ');
          const leaf = prodItem.categoryPath[prodItem.categoryPath.length - 1];
          const matchedCat = categoryMap.get(fullPath) || categoryMap.get(leaf);
          if (matchedCat) {
            categoryId = matchedCat.id;
          }
        }

        let product = await this.productRepository.findOne({
          where: { name: prodItem.name, merchantId: merchant.id },
        });

        if (!product) {
          product = this.productRepository.create({
            name: prodItem.name,
            description: prodItem.description,
            price: prodItem.price,
            stock: prodItem.stock,
            isAvailable: true,
            vertical: prodItem.vertical,
            merchantId: merchant.id,
            categoryId,
          });
        } else {
          Object.assign(product, {
            description: prodItem.description,
            price: prodItem.price,
            stock: prodItem.stock,
            vertical: prodItem.vertical,
            isAvailable: true,
            categoryId,
          });
        }
        await this.productRepository.save(product);
      }

      // 5. Seed Primary & Secondary Outlets and Link Products
      const primaryOutletName = merchant.shopAddress?.includes('Ambattur') ? 'Ambattur OT' : 'Main Branch';
      let primaryOutlet = await this.outletRepository.findOne({
        where: { merchantId: merchant.id, name: primaryOutletName },
      });

      if (!primaryOutlet) {
        primaryOutlet = this.outletRepository.create({
          merchantId: merchant.id,
          name: primaryOutletName,
          address: merchant.shopAddress || 'Main Road',
          city: merchant.city || 'Chennai',
          state: merchant.state || 'Tamil Nadu',
          pinCode: merchant.pinCode || '600053',
          latitude: merchant.latitude || 13.1125,
          longitude: merchant.longitude || 80.1530,
          phoneNumber: item.ownerPhone,
          openingTime: merchant.openingTime || '08:00 AM',
          closingTime: merchant.closingTime || '11:00 PM',
          workingDays: merchant.workingDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          isActive: true,
          rating: merchant.rating || 4.8,
        });
        primaryOutlet = await this.outletRepository.save(primaryOutlet);
        this.logger.log(`Created primary outlet '${primaryOutlet.name}' for ${merchant.shopName}`);
      }

      const allMerchantProducts = await this.productRepository.find({
        where: { merchantId: merchant.id },
      });

      for (const prod of allMerchantProducts) {
        let op = await this.outletProductRepository.findOne({
          where: { outletId: primaryOutlet.id, productId: prod.id },
        });
        if (!op) {
          op = this.outletProductRepository.create({
            outletId: primaryOutlet.id,
            productId: prod.id,
            priceOverride: undefined,
            isAvailable: true,
            stockQuantity: prod.stock || 100,
          });
          await this.outletProductRepository.save(op);
        }
      }

      if (item.shopName.includes('Al-Basha')) {
        let secondOutlet = await this.outletRepository.findOne({
          where: { merchantId: merchant.id, name: 'Anna Nagar' },
        });

        if (!secondOutlet) {
          secondOutlet = this.outletRepository.create({
            merchantId: merchant.id,
            name: 'Anna Nagar',
            address: '45, 2nd Avenue, Near Roundtana, Anna Nagar',
            city: 'Chennai',
            state: 'Tamil Nadu',
            pinCode: '600040',
            latitude: 13.0850,
            longitude: 80.2100,
            phoneNumber: '+919800000033',
            openingTime: '11:00 AM',
            closingTime: '11:30 PM',
            workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            isActive: true,
            rating: 4.9,
          });
          secondOutlet = await this.outletRepository.save(secondOutlet);
          this.logger.log(`Created 2nd outlet 'Anna Nagar' for ${merchant.shopName}`);
        }

        for (const prod of allMerchantProducts) {
          let op = await this.outletProductRepository.findOne({
            where: { outletId: secondOutlet.id, productId: prod.id },
          });
          if (!op) {
            const priceOverride = prod.name.includes('Saffron') ? Number(prod.price) + 30 : undefined;
            op = this.outletProductRepository.create({
              outletId: secondOutlet.id,
              productId: prod.id,
              priceOverride,
              isAvailable: true,
              stockQuantity: prod.stock || 50,
            });
            await this.outletProductRepository.save(op);
          }
        }
      }
    }

    this.logger.log('Database seeding completed successfully!');
  }
}
