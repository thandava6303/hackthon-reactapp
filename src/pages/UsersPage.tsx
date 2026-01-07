// ============================================
// Users Page
// User management with CRUD operations
// ============================================

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Search, Edit2, Trash2, X, Loader2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import {
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
  setTableState,
  selectUsers,
  selectUsersPagination,
  selectUsersTableState,
  selectUsersLoading,
  selectUsersError,
  setSelectedUser,
  selectSelectedUser,
} from '@/features/users/usersSlice';
import { useDebounce } from '@/hooks/useDebounce';
import { usePermissions } from '@/hooks/usePermissions';
import type { User, UserRole } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import DataTable, { Column } from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import { toast } from '@/hooks/use-toast';

// Form validation schema
const userSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  role: z.enum(['admin', 'manager', 'user'] as const),
  department: z.string().optional(),
});

type UserFormData = z.infer<typeof userSchema>;

const UsersPage = () => {
  const dispatch = useAppDispatch();
  const users = useAppSelector(selectUsers);
  const pagination = useAppSelector(selectUsersPagination);
  const tableState = useAppSelector(selectUsersTableState);
  const isLoading = useAppSelector(selectUsersLoading);
  const error = useAppSelector(selectUsersError);
  const selectedUser = useAppSelector(selectSelectedUser);
  const { hasPermission } = usePermissions();

  const [searchQuery, setSearchQuery] = useState(tableState.search);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, 300);

  const canWrite = hasPermission('users:write');
  const canDelete = hasPermission('users:delete');

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
  });

  // Fetch users on mount and when pagination/search changes
  useEffect(() => {
    dispatch(
      fetchUsers({
        page: tableState.page,
        pageSize: tableState.pageSize,
        search: debouncedSearch,
      })
    );
  }, [dispatch, tableState.page, tableState.pageSize, debouncedSearch]);

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
    dispatch(setSelectedUser(null));
    reset({
      email: '',
      firstName: '',
      lastName: '',
      role: 'user',
      department: '',
    });
    setIsFormOpen(true);
  };

  const openEditForm = (user: User) => {
    dispatch(setSelectedUser(user));
    reset({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      department: user.department || '',
    });
    setIsFormOpen(true);
  };

  const openDeleteDialog = (user: User) => {
    setUserToDelete(user);
    setIsDeleteOpen(true);
  };

  const onSubmit = async (data: UserFormData) => {
    setIsSubmitting(true);
    try {
      if (selectedUser) {
        await dispatch(updateUser({ id: selectedUser.id, data })).unwrap();
        toast({ title: 'User updated successfully' });
      } else {
        await dispatch(createUser(data)).unwrap();
        toast({ title: 'User created successfully' });
      }
      setIsFormOpen(false);
    } catch (err) {
      toast({ title: 'Error', description: String(err), variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    try {
      await dispatch(deleteUser(userToDelete.id)).unwrap();
      toast({ title: 'User deleted successfully' });
      setIsDeleteOpen(false);
      setUserToDelete(null);
    } catch (err) {
      toast({ title: 'Error', description: String(err), variant: 'destructive' });
    }
  };

  // Table columns configuration
  const columns: Column<User>[] = useMemo(
    () => [
      {
        id: 'name',
        header: 'Name',
        accessor: (row) => `${row.firstName} ${row.lastName}`,
        sortable: true,
        cell: (_, row) => (
          <div className="flex flex-col">
            <span className="font-medium text-foreground">
              {row.firstName} {row.lastName}
            </span>
            <span className="text-xs text-muted-foreground">{row.email}</span>
          </div>
        ),
      },
      {
        id: 'role',
        header: 'Role',
        accessor: 'role',
        sortable: true,
        cell: (value) => (
          <span className="capitalize font-medium text-foreground">{String(value)}</span>
        ),
      },
      {
        id: 'department',
        header: 'Department',
        accessor: 'department',
        cell: (value) => <span>{String(value) || '-'}</span>,
      },
      {
        id: 'status',
        header: 'Status',
        accessor: 'isActive',
        cell: (value) => <StatusBadge status={value ? 'active' : 'inactive'} />,
      },
      {
        id: 'createdAt',
        header: 'Created',
        accessor: 'createdAt',
        sortable: true,
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
          <h1 className="text-2xl font-bold text-foreground">Users</h1>
          <p className="text-muted-foreground">
            Manage user accounts and permissions
          </p>
        </div>
        {canWrite && (
          <Button onClick={openCreateForm} className="gap-2">
            <Plus className="h-4 w-4" />
            Add User
          </Button>
        )}
      </div>

      {/* Search & Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          {pagination.total.toLocaleString()} users total
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        data={users}
        columns={columns}
        isLoading={isLoading}
        error={error}
        pagination={pagination}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        rowKey="id"
        emptyTitle="No users found"
        emptyDescription="No users match your search criteria."
        enableVirtualization={users.length > 100}
      />

      {/* Create/Edit Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedUser ? 'Edit User' : 'Create User'}</DialogTitle>
            <DialogDescription>
              {selectedUser
                ? 'Update the user information below.'
                : 'Fill in the details to create a new user.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    {...register('firstName')}
                    className={errors.firstName ? 'border-destructive' : ''}
                  />
                  {errors.firstName && (
                    <p className="text-xs text-destructive">{errors.firstName.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    {...register('lastName')}
                    className={errors.lastName ? 'border-destructive' : ''}
                  />
                  {errors.lastName && (
                    <p className="text-xs text-destructive">{errors.lastName.message}</p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  className={errors.email ? 'border-destructive' : ''}
                />
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email.message}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select
                    defaultValue={selectedUser?.role || 'user'}
                    onValueChange={(value) => setValue('role', value as UserRole)}
                  >
                    <SelectTrigger className={errors.role ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.role && (
                    <p className="text-xs text-destructive">{errors.role.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input id="department" {...register('department')} />
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
                ) : selectedUser ? (
                  'Update User'
                ) : (
                  'Create User'
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
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {userToDelete?.firstName} {userToDelete?.lastName}?
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

export default UsersPage;
