// ============================================
// Products Page
// Product management with CRUD and virtualization
// ============================================

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Search, Edit2, Trash2, Filter, Loader2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  setTableState,
  selectProducts,
  selectProductsPagination,
  selectProductsTableState,
  selectProductsLoading,
  selectProductsError,
  selectProductsCategories,
  setSelectedProduct,
  selectSelectedProduct,
} from '@/features/products/productsSlice';
import { useDebounce } from '@/hooks/useDebounce';
import { usePermissions } from '@/hooks/usePermissions';
import type { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import DataTable, { Column } from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import { toast } from '@/hooks/use-toast';

// Form validation schema
const productSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(100),
  description: z.string().min(1, 'Description is required').max(500),
  category: z.string().min(1, 'Category is required'),
  price: z.coerce.number().positive('Price must be positive'),
  stock: z.coerce.number().int().min(0, 'Stock cannot be negative'),
  status: z.enum(['active', 'inactive', 'discontinued'] as const),
});

type ProductFormData = z.infer<typeof productSchema>;

const ProductsPage = () => {
  const dispatch = useAppDispatch();
  const products = useAppSelector(selectProducts);
  const pagination = useAppSelector(selectProductsPagination);
  const tableState = useAppSelector(selectProductsTableState);
  const isLoading = useAppSelector(selectProductsLoading);
  const error = useAppSelector(selectProductsError);
  const categories = useAppSelector(selectProductsCategories);
  const selectedProduct = useAppSelector(selectSelectedProduct);
  const { hasPermission } = usePermissions();

  const [searchQuery, setSearchQuery] = useState(tableState.search);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, 300);

  const canWrite = hasPermission('products:write');
  const canDelete = hasPermission('products:delete');

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      status: 'active',
    },
  });

  // Fetch products
  useEffect(() => {
    dispatch(
      fetchProducts({
        page: tableState.page,
        pageSize: tableState.pageSize,
        search: debouncedSearch,
        category: categoryFilter,
      })
    );
  }, [dispatch, tableState.page, tableState.pageSize, debouncedSearch, categoryFilter]);

  // Update search in table state
  useEffect(() => {
    dispatch(setTableState({ search: debouncedSearch, page: 1 }));
  }, [dispatch, debouncedSearch]);

  const handlePageChange = useCallback(
    (page: number) => {
      dispatch(setTableState({ page }));
    },
    [dispatch]
  );

  const handlePageSizeChange = useCallback(
    (pageSize: number) => {
      dispatch(setTableState({ pageSize, page: 1 }));
    },
    [dispatch]
  );

  const openCreateForm = () => {
    dispatch(setSelectedProduct(null));
    reset({
      name: '',
      description: '',
      category: categories[0],
      price: 0,
      stock: 0,
      status: 'active',
    });
    setIsFormOpen(true);
  };

  const openEditForm = (product: Product) => {
    dispatch(setSelectedProduct(product));
    reset({
      name: product.name,
      description: product.description,
      category: product.category,
      price: product.price,
      stock: product.stock,
      status: product.status,
    });
    setIsFormOpen(true);
  };

  const openDeleteDialog = (product: Product) => {
    setProductToDelete(product);
    setIsDeleteOpen(true);
  };

  const onSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);
    try {
      if (selectedProduct) {
        await dispatch(updateProduct({ id: selectedProduct.id, data })).unwrap();
        toast({ title: 'Product updated successfully' });
      } else {
        await dispatch(createProduct(data)).unwrap();
        toast({ title: 'Product created successfully' });
      }
      setIsFormOpen(false);
    } catch (err) {
      toast({ title: 'Error', description: String(err), variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!productToDelete) return;
    try {
      await dispatch(deleteProduct(productToDelete.id)).unwrap();
      toast({ title: 'Product deleted successfully' });
      setIsDeleteOpen(false);
      setProductToDelete(null);
    } catch (err) {
      toast({ title: 'Error', description: String(err), variant: 'destructive' });
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  // Table columns
  const columns: Column<Product>[] = useMemo(
    () => [
      {
        id: 'sku',
        header: 'SKU',
        accessor: 'sku',
        width: 140,
        cell: (value) => <span className="font-mono-data text-muted-foreground">{String(value)}</span>,
      },
      {
        id: 'name',
        header: 'Product',
        accessor: 'name',
        sortable: true,
        cell: (_, row) => (
          <div className="flex flex-col max-w-[300px]">
            <span className="font-medium text-foreground truncate">{row.name}</span>
            <span className="text-xs text-muted-foreground truncate">{row.category}</span>
          </div>
        ),
      },
      {
        id: 'price',
        header: 'Price',
        accessor: 'price',
        sortable: true,
        width: 100,
        cell: (value) => <span className="font-medium">{formatCurrency(Number(value))}</span>,
      },
      {
        id: 'stock',
        header: 'Stock',
        accessor: 'stock',
        sortable: true,
        width: 80,
        cell: (value) => {
          const stock = Number(value);
          return (
            <span className={stock < 10 ? 'text-destructive font-medium' : stock < 50 ? 'text-warning' : ''}>
              {stock.toLocaleString()}
            </span>
          );
        },
      },
      {
        id: 'status',
        header: 'Status',
        accessor: 'status',
        width: 120,
        cell: (value) => <StatusBadge status={String(value)} />,
      },
      {
        id: 'updatedAt',
        header: 'Updated',
        accessor: 'updatedAt',
        sortable: true,
        width: 100,
        cell: (value) => new Date(String(value)).toLocaleDateString(),
      },
      {
        id: 'actions',
        header: '',
        accessor: 'id',
        width: 100,
        cell: (_, row) => (
          <div className="flex items-center gap-1">
            {canWrite && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation();
                  openEditForm(row);
                }}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
            )}
            {canDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  openDeleteDialog(row);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        ),
      },
    ],
    [canWrite, canDelete]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Products</h1>
          <p className="text-muted-foreground">
            Manage your product catalog
          </p>
        </div>
        {canWrite && (
          <Button onClick={openCreateForm} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
        )}
      </div>

      {/* Search & Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              {categoryFilter || 'All Categories'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => setCategoryFilter('')}>
              All Categories
            </DropdownMenuItem>
            {categories.map((category) => (
              <DropdownMenuItem key={category} onClick={() => setCategoryFilter(category)}>
                {category}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="text-sm text-muted-foreground">
          {pagination.total.toLocaleString()} products total
        </div>
      </div>

      {/* Data Table with Virtualization for 10k+ records */}
      <DataTable
        data={products}
        columns={columns}
        isLoading={isLoading}
        error={error}
        pagination={pagination}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        rowKey="id"
        emptyTitle="No products found"
        emptyDescription="No products match your search criteria."
        enableVirtualization={products.length > 100}
        maxHeight={600}
      />

      {/* Create/Edit Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedProduct ? 'Edit Product' : 'Create Product'}</DialogTitle>
            <DialogDescription>
              {selectedProduct
                ? 'Update the product information below.'
                : 'Fill in the details to create a new product.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name</Label>
                <Input
                  id="name"
                  {...register('name')}
                  className={errors.name ? 'border-destructive' : ''}
                />
                {errors.name && (
                  <p className="text-xs text-destructive">{errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  rows={3}
                  {...register('description')}
                  className={errors.description ? 'border-destructive' : ''}
                />
                {errors.description && (
                  <p className="text-xs text-destructive">{errors.description.message}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    defaultValue={selectedProduct?.category || categories[0]}
                    onValueChange={(value) => setValue('category', value)}
                  >
                    <SelectTrigger className={errors.category ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <p className="text-xs text-destructive">{errors.category.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    defaultValue={selectedProduct?.status || 'active'}
                    onValueChange={(value) => setValue('status', value as Product['status'])}
                  >
                    <SelectTrigger className={errors.status ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="discontinued">Discontinued</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    {...register('price')}
                    className={errors.price ? 'border-destructive' : ''}
                  />
                  {errors.price && (
                    <p className="text-xs text-destructive">{errors.price.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock">Stock</Label>
                  <Input
                    id="stock"
                    type="number"
                    min="0"
                    {...register('stock')}
                    className={errors.stock ? 'border-destructive' : ''}
                  />
                  {errors.stock && (
                    <p className="text-xs text-destructive">{errors.stock.message}</p>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : selectedProduct ? (
                  'Update Product'
                ) : (
                  'Create Product'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{productToDelete?.name}"?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProductsPage;
