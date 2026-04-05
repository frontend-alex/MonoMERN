
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import DeleteDialog from "@/components/shared/dialogs/delete-dialog";
import { useDeleteUser } from "@/features/profile/hooks/use-delete-user";

const ProfileSettings = () => {
    const { deleteUser } = useDeleteUser();

    return (
        <Card className="bg-red-600/10 dark:bg-destructive/10 border-none shadow-none">
            <CardContent>
                <div>
                    <h3 className="font-medium text-lg text-red-600/50 dark:text-destructive">Danger Zone</h3>
                    <p className="text-sm mt-2 text-stone-400 max-w-md">
                        Deleting your account is permanent and will remove all your data.
                        This action cannot be undone.
                    </p>
                    <DeleteDialog
                        description="You're about to permanently delete your account. This action cannot be undone."
                        onConfirm={() => deleteUser(undefined)}
                    >
                        <Button variant="destructive" className="mt-5">
                            Delete Account
                        </Button>
                    </DeleteDialog>
                </div>
            </CardContent>
        </Card>
    );
};

export default ProfileSettings;
