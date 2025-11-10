import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * from "zod";
import { useAuth } from "@/hookss/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/uimain/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/uimain/form";
import { Input } from "@/components/uimain/Input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/uimain/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/uimain/avatar";
import { Loader2, User, Copy, Upload, AlertTriangle, Trash2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/uimain/alert";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/uimain/alert-dialog";
import { Label } from "@/components/uimain/label";
import { useAccountDeletion } from "@/hooks/useAccountDeletion";

const profileSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be less than 30 characters")
    .regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, hyphens, and underscores")
    .optional()
    .or(z.literal("")),
  full_name: z
    .string()
    .min(1, "Full name is required")
    .max(100, "Full name must be less than 100 characters"),
  phone: z
    .string()
    .max(20, "Phone number must be less than 20 characters")
    .optional()
    .or(z.literal("")),
});



export default function ProfileSettings() {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [accountNumber, setAccountNumber] = React.useState("");
  const [avatarUrl, setAvatarUrl] = React.useState("");
  const [uploading, setUploading] = React.useState(false);
  const fileInputRef = React.useRef(null);
  
  // Delete account state
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const [deletePassword, setDeletePassword] = React.useState("");
  const [deleteConfirmText, setDeleteConfirmText] = React.useState("");
  const { deleteAccount, isDeleting } = useAccountDeletion();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: "",
      full_name: "",
      phone: "",
    },
  });

  React.useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("username, full_name, phone, account_number, avatar_url")
      .eq("id", user.id)
      .single();

    if (error) {
      toast({
        title: "Error loading profile",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    if (data) {
      form.reset({
        username: data.username || "",
        full_name: data.full_name || "",
        phone: data.phone || "",
      });
      setAccountNumber(data.account_number || "");
      setAvatarUrl(data.avatar_url || "");
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      // Convert file to base64 for simple storage
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result;
        
        const { error } = await supabase
          .from("profiles")
          .update({ avatar_url: base64String })
          .eq("id", user.id);

        if (error) throw error;

        setAvatarUrl(base64String);
        toast({
          title: "Avatar updated",
          description: "Your profile picture has been updated successfully.",
        });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const copyAccountNumber = () => {
    if (accountNumber) {
      navigator.clipboard.writeText(accountNumber);
      toast({
        title: "Copied!",
        description: "Account number copied (8 digits only)",
      });
    }
  };

  const onSubmit = async (values: ProfileFormValues) => {
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({
        username: values.username || null,
        full_name: values.full_name,
        phone: values.phone || null,
      })
      .eq("id", user.id);

    if (error) {
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Profile updated",
      description: "Your profile has been updated successfully.",
    });
  };

  const handleDeleteAccount = () => {
    deleteAccount({ password: deletePassword, confirmation: deleteConfirmText });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container max-w-2xl py-8 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-6 w-6" />
            <CardTitle>Profile Settings</CardTitle>
          </div>
          <CardDescription>
            Update your profile information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Profile Picture Section */}
              <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={avatarUrl} alt="Profile picture" />
                  <AvatarFallback className="text-2xl">
                    {form.getValues('full_name')?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleAvatarUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Photo
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    JPG, PNG or GIF (max 2MB)
                  </p>
                </div>
              </div>

              {/* Account Number Section */}
              {accountNumber && (
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Account Number</p>
                      <p className="text-2xl font-bold text-primary mt-1">
                        MFC-{accountNumber}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Use the 8 digits only ({accountNumber}) to login
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={copyAccountNumber}
                      title="Copy account number (8 digits only)"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              <FormItem>
                <FormLabel>User ID</FormLabel>
                <FormControl>
                  <Input value={user?.id || ""} disabled />
                </FormControl>
                <FormDescription>
                  Your unique user ID (cannot be changed)
                </FormDescription>
              </FormItem>

              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input value={user?.email || ""} disabled />
                </FormControl>
                <FormDescription>
                  Your email address (cannot be changed)
                </FormDescription>
              </FormItem>

              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter username" {...field} />
                    </FormControl>
                    <FormDescription>
                      Your unique username (3-30 characters)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter phone number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="w-full"
              >
                {form.formState.isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save Changes
              </Button>
            </form>
        </Form>
      </CardContent>
    </Card>

    {/* Danger Zone */}
    <Card className="border-destructive">
      <CardHeader>
        <CardTitle className="text-destructive flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Danger Zone
        </CardTitle>
        <CardDescription>
          Irreversible actions that will permanently affect your account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>
            Account deletion is permanent and cannot be undone. This will = "list-disc list-inside mt-2 space-y-1">
              <li>Delete your profile and personal information</li>
              <li>Remove all your loyalty points</li>
              <li>Delete all your messages and conversations</li>
              <li>Clear your shopping cart</li>
              <li>Anonymize (but not delete) order history for business records</li>
            </ul>
          </AlertDescription>
        </Alert>
        
        <Button
          variant="destructive"
          onClick={() => setShowDeleteDialog(true)}
          className="w-full"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete My Account
        </Button>
      </CardContent>
    </Card>

    {/* Delete Account Confirmation Dialog */}
    <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Delete Account?
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            <p className="font-semibold">This action cannot be undone.</p>
            
            <div className="space-y-2">
              <Label htmlFor="delete-password">Enter your password to confirm</Label>
              <Input
                id="delete-password"
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="Your password"
                disabled={isDeleting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="delete-confirm">Type DELETE to confirm</Label>
              <Input
                id="delete-confirm"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="Type DELETE"
                disabled={isDeleting}
              />
            </div>

            <Alert variant="destructive">
              <AlertDescription className="text-xs">
                All your data will be permanently deleted. Order history will be anonymized but kept for business compliance.
              </AlertDescription>
            </Alert>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeleteAccount}
            disabled={!deletePassword || deleteConfirmText !== 'DELETE' || isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete My Account'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
);
}
