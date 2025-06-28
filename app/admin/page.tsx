import AdminDashboard from '@/components/admin-dashboard';
import EnterpriseDashboard from '@/components/enterprise-dashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AdminPage() {
  return (
    <div className='container mx-auto p-6'>
      <div className='mb-6'>
        <h1 className='text-3xl font-bold'>ProxPanel Administration</h1>
        <p className='text-muted-foreground'>
          Manage your enterprise VPS infrastructure with advanced tools and
          analytics
        </p>
      </div>

      <Tabs defaultValue='enterprise' className='space-y-6'>
        <TabsList className='grid w-full grid-cols-2'>
          <TabsTrigger value='enterprise'>Enterprise Dashboard</TabsTrigger>
          <TabsTrigger value='admin'>Admin Dashboard</TabsTrigger>
        </TabsList>

        <TabsContent value='enterprise' className='space-y-6'>
          <EnterpriseDashboard />
        </TabsContent>

        <TabsContent value='admin' className='space-y-6'>
          <AdminDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
}
