jest.mock('firebase-admin/app', () => ({
    initializeApp: jest.fn(),
    getApps: jest.fn(() => []),
    cert: jest.fn(),
}));
jest.mock('firebase-admin/auth', () => ({
    getAuth: jest.fn(() => ({
        verifyIdToken: jest.fn(),
    })),
}));

import { Test, TestingModule } from "@nestjs/testing";
import { MerchantsController } from "./merchants.controller";
import { MerchantsService } from "./merchants.service";

describe('MerchantsController', () => {
    let controller: MerchantsController;
    let service: jest.Mocked<MerchantsService>;

    const mockNearbyResults = [
        {
            id: 2,
            shopName: 'Al Madina Artisanal Butchery',
            shopAddress: 'Ambattur Industrial Estate',
            city: 'Chennai',
            state: 'Tamil Nadu',
            pinCode: '600058',
            latitude: 13.1143,
            longitude: 80.1548,
            distance: 1.2,
            deliveryTimeEstimate: '15-25 mins',
            rating: 4.8,
            bannerUrl: 'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=800&q=80',
            openingTime: '08:00 AM',
            closingTime: '09:00 PM',
            workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
            isVerified: true,
            productCount: 3,
            featuredProducts: ['Najdi Lamb Leg', 'Ribeye MB7+'],
        },
    ];

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [MerchantsController],
            providers: [
                {
                    provide: MerchantsService,
                    useValue: {
                        findNearby: jest.fn().mockResolvedValue(mockNearbyResults),
                        getStorefront: jest.fn().mockResolvedValue({
                            ...mockNearbyResults[0],
                            products: [],
                        }),
                        findById: jest.fn().mockResolvedValue(mockNearbyResults[0]),
                        findByUserId: jest.fn().mockResolvedValue(mockNearbyResults[0]),
                        updateByUserId: jest.fn(),
                        register: jest.fn(),
                    },
                },
            ],
        }).compile();

        controller = module.get<MerchantsController>(MerchantsController);
        service = module.get(MerchantsService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('getNearby', () => {
        it('should return nearby merchants ordered by distance', async () => {
            const query = { latitude: 13.1143, longitude: 80.1548, radius: 10 };
            const result = await controller.getNearby(query);

            expect(service.findNearby).toHaveBeenCalledWith(query);
            expect(result).toEqual(mockNearbyResults);
            expect(result[0].deliveryTimeEstimate).toBe('15-25 mins');
        });
    });

    describe('getStorefront', () => {
        it('should return merchant storefront with products', async () => {
            const result = await controller.getStorefront(2);

            expect(service.getStorefront).toHaveBeenCalledWith(2);
            expect(result.id).toBe(2);
            expect(result.products).toEqual([]);
        });
    });
});
