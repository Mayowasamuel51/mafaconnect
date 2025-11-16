import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useUsers } from "@/hooks/useUsers";
import {
  Check,
  X,
  Shield,
  UserCog,
  Trash2,
  Search,
  Phone,
  Building2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function UserManagement() {
  const {
    users,
    isLoading,
    updateUserApproval,
    assignRole,
    removeRole,
    deleteUser,
  } = useUsers();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [userToDelete, setUserToDelete] = React.useState(null);
  console.log(users);
  console.log("UserManagement render:", {
    usersCount: users?.length,
    loading: isLoading,
    users: users,
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex justify-center p-8">
          <div className="animate-spin h-8 w-8 border-b-2 border-primary rounded-full" />
        </CardContent>
      </Card>
    );
  }

  if (!users || users.length === 0) {
    console.log("No users found or access denied");
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>
            Manage user accounts, roles, and approvals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center p-8">
            <p className="text-muted-foreground">
              No users found or you don't have permission to view users.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Make sure you're logged in admin.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getApprovalBadge = (status) => {
    const variants = {
      approved: "default",
      pending: "secondary",
      rejected: "destructive",
    };
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  const filteredUsers = users?.filter((user) => {
    const matchesSearch =
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone?.includes(searchQuery) ||
      user.business_name?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || user.approval_status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleDeleteUser = (userId) => {
    deleteUser(userId);
    setUserToDelete(null);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>
            Manage user accounts, roles, and approvals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, phone, or business..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User Details</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Roles</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers?.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center text-muted-foreground py-8"
                    >
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers?.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span className="font-medium">{user.full_name}</span>
                          <span className="text-xs text-muted-foreground">
                            Joined{" "}
                            {new Date(user.created_at).toLocaleDateString()}
                          </span>
                          {user.business_name && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Building2 className="h-3 w-3" />
                              {user.business_name}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1 text-sm">
                          <span>{user.email || "No email"}</span>
                          {user.phone && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              {user.phone}
                            </div>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>{getApprovalBadge(user.kyc_status)}</TableCell>

                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {user.role ? (
                            <Badge variant="outline" className="text-xs">
                              {user.role}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">
                              No role
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          {/* KYC approval buttons */}
                          {user.kyc_status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() =>
                                  updateUserApproval({
                                    userId: user.id,
                                    status: "approved",
                                  })
                                }
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() =>
                                  updateUserApproval({
                                    userId: user.id,
                                    status: "rejected",
                                  })
                                }
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          )}

                          {/* Role dropdown */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="sm" variant="outline">
                                <UserCog className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent align="end">
                              {/* Assign Roles */}
                              <DropdownMenuItem
                                onClick={() =>
                                  assignRole({
                                    userId: user.id,
                                    role: "sales_agent",
                                  })
                                }
                              >
                                <Shield className="h-4 w-4 mr-2" /> Make Sales
                                Agent
                              </DropdownMenuItem>

                              <DropdownMenuItem
                                onClick={() =>
                                  assignRole({
                                    userId: user.id,
                                    role: "manager",
                                  })
                                }
                              >
                                <Shield className="h-4 w-4 mr-2" /> Make Manager
                              </DropdownMenuItem>

                              <DropdownMenuItem
                                onClick={() =>
                                  assignRole({ userId: user.id, role: "admin" })
                                }
                              >
                                <Shield className="h-4 w-4 mr-2" /> Make Admin
                              </DropdownMenuItem>

                              {/* Remove Current Role */}
                              <DropdownMenuSeparator />

                              <DropdownMenuItem
                                onClick={() =>
                                  removeRole({
                                    userId: user.id,
                                    role: user.role,
                                  })
                                }
                                className="text-orange-600"
                              >
                                <X className="h-4 w-4 mr-2" /> Remove{" "}
                                {user.role}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>

                          {/* Delete User */}
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setUserToDelete(user.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>

                      {/* <TableCell>
                      <div className="flex flex-wrap gap-2">
                        {user.kyc_status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => updateUserApproval({ userId: user.id, status: "approved" })}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => updateUserApproval({ userId: user.id, status: "rejected" })}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="outline">
                              <UserCog className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => assignRole({ userId: user.id, role: "sales_agent" })}>
                              <Shield className="h-4 w-4 mr-2" /> Add Sales Agent
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => assignRole({ userId: user.id, role: "manager" })}>
                              <Shield className="h-4 w-4 mr-2" /> Add Manager
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => assignRole({ userId: user.id, role: "admin" })}>
                              <Shield className="h-4 w-4 mr-2" /> Add Admin
                            </DropdownMenuItem>
                            {user.user_roles?.length > 0 && (
                              <>
                                <DropdownMenuSeparator />
                                {user.user_roles.map((ur) => (
                                  <DropdownMenuItem 
                                    key={ur.role}
                                    onClick={() => removeRole({ userId: user.id, role: ur.role })}
                                    className="text-orange-600"
                                  >
                                    <X className="h-4 w-4 mr-2" /> Remove {ur.role}
                                  </DropdownMenuItem>
                                ))}
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setUserToDelete(user.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell> */}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AlertDialog
        open={!!userToDelete}
        onOpenChange={() => setUserToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this user? This action will remove
              their profile and all associated roles. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => userToDelete && handleDeleteUser(userToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
