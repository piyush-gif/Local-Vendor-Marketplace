import { useEffect, useState } from "react";
import { Store, Users, ShieldCheck, Clock } from "lucide-react";
import {
  getAllVendors,
  getAllUsers,
  approveVendor,
  rejectVendor,
} from "@/lib/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const vendorStatusColors = {
  pending: "bg-secondary text-secondary-foreground",
  approved: "bg-primary text-primary-foreground",
  rejected: "bg-destructive text-white",
};

export default function AdminDashboard() {
  const [vendors, setVendors] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  function load() {
    Promise.all([getAllVendors(), getAllUsers()])
      .then(([v, u]) => {
        setVendors(v);
        setUsers(u);
      })
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleApprove(id) {
    await approveVendor(id);
    load();
  }

  async function handleReject(id) {
    await rejectVendor(id);
    load();
  }

  if (loading)
    return (
      <p className="p-6 text-muted-foreground text-sm">Loading dashboard...</p>
    );

  const buyers = users.filter((u) => u.role === "buyer");
  const admins = users.filter((u) => u.role === "admin");
  const pendingVendors = vendors.filter((v) => v.status === "pending");

  const stats = [
    { label: "Total vendors", value: vendors.length, icon: Store },
    { label: "Pending approval", value: pendingVendors.length, icon: Clock },
    { label: "Buyers", value: buyers.length, icon: Users },
    { label: "Admins", value: admins.length, icon: ShieldCheck },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 pb-20">
      <h1 className="font-heading text-2xl font-semibold mb-6">
        Admin Dashboard
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="bg-card border border-border rounded-2xl p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">{label}</span>
              <Icon className="w-4 h-4 text-primary" />
            </div>
            <p className="text-2xl font-heading font-semibold">{value}</p>
          </div>
        ))}
      </div>

      <Tabs defaultValue="vendors">
        <TabsList>
          <TabsTrigger value="vendors">Vendors</TabsTrigger>
          <TabsTrigger value="buyers">Buyers</TabsTrigger>
          <TabsTrigger value="admins">Admins</TabsTrigger>
        </TabsList>

        <TabsContent value="vendors">
          <div className="bg-card border border-border rounded-2xl overflow-hidden mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Shop</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vendors.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell className="font-medium">{v.shop_name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {v.email}
                    </TableCell>
                    <TableCell>
                      <Badge className={vendorStatusColors[v.status]}>
                        {v.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(v.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {v.status === "pending" ? (
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            className="active:scale-95 transition"
                            onClick={() => handleApprove(v.id)}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="active:scale-95 transition"
                            onClick={() => handleReject(v.id)}
                          >
                            Reject
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="buyers">
          <div className="bg-card border border-border rounded-2xl overflow-hidden mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {buyers.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {u.email}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      #{u.id}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="admins">
          <div className="bg-card border border-border rounded-2xl overflow-hidden mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {admins.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {u.email}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      #{u.id}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
