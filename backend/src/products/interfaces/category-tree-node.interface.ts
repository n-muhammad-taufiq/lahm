export interface CategoryTreeNode {
    id: number;
    merchantId: number;
    name: string;
    description?: string;
    imageUrl?: string;
    parentId: number | null;
    depth: number;
    sortOrder: number;
    isActive: boolean;
    productCount: number;
    hasChildren: boolean;
    children: CategoryTreeNode[];
}
