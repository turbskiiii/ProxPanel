'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Users,
  Search,
  Plus,
  Edit,
  Trash2,
  Shield,
  DollarSign,
  Server,
  Clock,
  Mail,
  Phone,
  MapPin,
  UserCheck,
  UserX,
  Crown,
  AlertTriangle,
} from 'lucide-react';

interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  role: 'admin' | 'user' | 'moderator';
  status: 'active' | 'suspended' | 'pending';
  vpsCount: number;
  totalSpent: number;
  lastLogin: string;
  createdAt: string;
  location: string;
  phone?: string;
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  useEffect(() => {
    const fetchUsers = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockUsers: User[] = [
        {
          id: '1',
          username: 'john.doe',
          email: 'john.doe@example.com',
          name: 'John Doe',
          role: 'user',
          status: 'active',
          vpsCount: 3,
          totalSpent: 450.75,
          lastLogin: '2 hours ago',
          createdAt: '2023-06-15',
          location: 'New York, USA',
          phone: '+1-555-0123',
        },
        {
          id: '2',
          username: 'admin',
          email: 'admin@proxpanel.com',
          name: 'System Administrator',
          role: 'admin',
          status: 'active',
          vpsCount: 0,
          totalSpent: 0,
          lastLogin: '5 minutes ago',
          createdAt: '2023-01-01',
          location: 'Remote',
        },
        {
          id: '3',
          username: 'jane.smith',
          email: 'jane.smith@company.com',
          name: 'Jane Smith',
          role: 'user',
          status: 'active',
          vpsCount: 8,
          totalSpent: 1250.0,
          lastLogin: '1 day ago',
          createdAt: '2023-03-22',
          location: 'London, UK',
          phone: '+44-20-7946-0958',
        },
        {
          id: '4',
          username: 'bob.wilson',
          email: 'bob.wilson@startup.io',
          name: 'Bob Wilson',
          role: 'user',
          status: 'suspended',
          vpsCount: 2,
          totalSpent: 89.99,
          lastLogin: '1 week ago',
          createdAt: '2023-11-08',
          location: 'San Francisco, USA',
        },
        {
          id: '5',
          username: 'moderator',
          email: 'mod@proxpanel.com',
          name: 'Support Moderator',
          role: 'moderator',
          status: 'active',
          vpsCount: 1,
          totalSpent: 29.99,
          lastLogin: '3 hours ago',
          createdAt: '2023-02-14',
          location: 'Remote',
        },
        {
          id: '6',
          username: 'alice.brown',
          email: 'alice.brown@tech.com',
          name: 'Alice Brown',
          role: 'user',
          status: 'pending',
          vpsCount: 0,
          totalSpent: 0,
          lastLogin: 'Never',
          createdAt: '2024-01-20',
          location: 'Toronto, Canada',
        },
      ];

      setUsers(mockUsers);
      setLoading(false);
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    const matchesStatus =
      selectedStatus === 'all' || user.status === selectedStatus;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return (
          <Badge className='bg-red-100 text-red-800 border-red-200'>
            <Crown className='w-3 h-3 mr-1' />
            Admin
          </Badge>
        );
      case 'moderator':
        return (
          <Badge className='bg-blue-100 text-blue-800 border-blue-200'>
            <Shield className='w-3 h-3 mr-1' />
            Moderator
          </Badge>
        );
      case 'user':
        return (
          <Badge className='bg-green-100 text-green-800 border-green-200'>
            <Users className='w-3 h-3 mr-1' />
            User
          </Badge>
        );
      default:
        return <Badge variant='secondary'>Unknown</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge className='bg-green-100 text-green-800 border-green-200'>
            <UserCheck className='w-3 h-3 mr-1' />
            Active
          </Badge>
        );
      case 'suspended':
        return (
          <Badge className='bg-red-100 text-red-800 border-red-200'>
            <UserX className='w-3 h-3 mr-1' />
            Suspended
          </Badge>
        );
      case 'pending':
        return (
          <Badge className='bg-yellow-100 text-yellow-800 border-yellow-200'>
            <Clock className='w-3 h-3 mr-1' />
            Pending
          </Badge>
        );
      default:
        return <Badge variant='secondary'>Unknown</Badge>;
    }
  };

  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === 'active').length;
  const suspendedUsers = users.filter(u => u.status === 'suspended').length;
  const totalRevenue = users.reduce((sum, u) => sum + u.totalSpent, 0);

  if (loading) {
    return (
      <div className='space-y-6'>
        <div className='flex items-center justify-between'>
          <h2 className='text-3xl font-bold tracking-tight'>User Management</h2>
        </div>
        <div className='animate-pulse space-y-4'>
          <div className='h-32 bg-gray-200 rounded'></div>
          <div className='h-96 bg-gray-200 rounded'></div>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-3xl font-bold tracking-tight'>User Management</h2>
          <p className='text-muted-foreground'>
            Manage user accounts, roles, and permissions
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className='mr-2 h-4 w-4' />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>Create a new user account</DialogDescription>
            </DialogHeader>
            <div className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='username'>Username</Label>
                <Input id='username' placeholder='Enter username' />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='email'>Email</Label>
                <Input id='email' type='email' placeholder='Enter email' />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='name'>Full Name</Label>
                <Input id='name' placeholder='Enter full name' />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='role'>Role</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder='Select role' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='user'>User</SelectItem>
                    <SelectItem value='moderator'>Moderator</SelectItem>
                    <SelectItem value='admin'>Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className='w-full'>Create User</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* User Statistics */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Users</CardTitle>
            <Users className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{totalUsers}</div>
            <p className='text-xs text-muted-foreground'>Registered accounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Active Users</CardTitle>
            <UserCheck className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-green-600'>
              {activeUsers}
            </div>
            <p className='text-xs text-muted-foreground'>
              {((activeUsers / totalUsers) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Suspended</CardTitle>
            <AlertTriangle className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-red-600'>
              {suspendedUsers}
            </div>
            <p className='text-xs text-muted-foreground'>Require attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Revenue</CardTitle>
            <DollarSign className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              ${totalRevenue.toLocaleString()}
            </div>
            <p className='text-xs text-muted-foreground'>From all users</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>User Directory</CardTitle>
          <CardDescription>Search and filter user accounts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex gap-4 mb-4'>
            <div className='flex-1'>
              <div className='relative'>
                <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
                <Input
                  placeholder='Search users...'
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className='pl-8'
                />
              </div>
            </div>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className='w-[150px]'>
                <SelectValue placeholder='Role' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Roles</SelectItem>
                <SelectItem value='admin'>Admin</SelectItem>
                <SelectItem value='moderator'>Moderator</SelectItem>
                <SelectItem value='user'>User</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className='w-[150px]'>
                <SelectValue placeholder='Status' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Status</SelectItem>
                <SelectItem value='active'>Active</SelectItem>
                <SelectItem value='suspended'>Suspended</SelectItem>
                <SelectItem value='pending'>Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className='rounded-md border'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>VPS Count</TableHead>
                  <TableHead>Total Spent</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map(user => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className='space-y-1'>
                        <div className='font-medium'>{user.name}</div>
                        <div className='text-sm text-muted-foreground'>
                          @{user.username}
                        </div>
                        <div className='text-xs text-muted-foreground flex items-center gap-1'>
                          <Mail className='h-3 w-3' />
                          {user.email}
                        </div>
                        {user.phone && (
                          <div className='text-xs text-muted-foreground flex items-center gap-1'>
                            <Phone className='h-3 w-3' />
                            {user.phone}
                          </div>
                        )}
                        <div className='text-xs text-muted-foreground flex items-center gap-1'>
                          <MapPin className='h-3 w-3' />
                          {user.location}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>{getStatusBadge(user.status)}</TableCell>
                    <TableCell>
                      <div className='flex items-center gap-1'>
                        <Server className='h-4 w-4 text-muted-foreground' />
                        {user.vpsCount}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className='font-medium'>
                        ${user.totalSpent.toFixed(2)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className='text-sm'>{user.lastLogin}</div>
                      <div className='text-xs text-muted-foreground'>
                        Joined {user.createdAt}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className='flex gap-2'>
                        <Button size='sm' variant='outline'>
                          <Edit className='h-3 w-3' />
                        </Button>
                        <Button
                          size='sm'
                          variant='outline'
                          className='text-red-600 hover:text-red-700'
                        >
                          <Trash2 className='h-3 w-3' />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredUsers.length === 0 && (
            <div className='text-center py-8'>
              <Users className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
              <h3 className='text-lg font-semibold mb-2'>No users found</h3>
              <p className='text-muted-foreground'>
                Try adjusting your search criteria or filters.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
