import z from "zod";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { type UseFormReturn, type FieldPath } from "react-hook-form";
import { CircleAlert, LoaderCircle } from "lucide-react";
import { emailSchema, usernameSchema } from "@shared/schemas/user/user.schema";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form";
import { useFormWithSchema } from "@/lib/utils";
import { ROUTES } from "@/config/routes";
import { useUpdateUser } from "@/features/profile/hooks/use-update-user";
import { type User } from "@shared/types/user";


const UpdateProfileInfo = ({ user }: { user: User }) => {
    const { update, isPending } = useUpdateUser();

    const usernameSchemaObject = z.object({ username: usernameSchema });
    const emailSchemaObject = z.object({ email: emailSchema });

    const usernameForm = useFormWithSchema(usernameSchemaObject, {
        username: user?.username ?? "",
    });

    const emailForm = useFormWithSchema(emailSchemaObject, {
        email: user?.email ?? "",
    });

    type FormSectionProps<T extends z.ZodTypeAny> = {
        title: string;
        description: string;
        form: UseFormReturn<z.infer<T>>;
        name: FieldPath<z.infer<T>>;
        type: string;
        placeholder: string;
        onSubmit: (data: z.infer<T>) => void;
        footer?: React.ReactNode;
    };

    const renderFormSection = <T extends z.ZodTypeAny>({
        title,
        description,
        form,
        name,
        type,
        placeholder,
        onSubmit,
        footer,
    }: FormSectionProps<T>) => (
        <div className="grid grid-cols-3 gap-8 items-start">
            <div>
                <h3 className="font-medium">{title}</h3>
                <p className="text-sm mt-1 text-stone-400">{description}</p>
            </div>
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="col-span-2 space-y-4"
                >
                    <FormField
                        control={form.control}
                        name={name}
                        render={({ field }) => (
                            <FormItem className="grid gap-3">
                                <FormControl>
                                    <Input
                                        type={type}
                                        placeholder={placeholder}
                                        className="input no-ring"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    {footer}
                    <Button type="submit" disabled={isPending}>
                        {isPending ? (
                            <div className="flex items-center gap-3">
                                <LoaderCircle className="animate-spin" />
                                <p>Saving...</p>
                            </div>
                        ) : (
                            "Save"
                        )}
                    </Button>
                </form>
            </Form>
        </div>
    );

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-xl font-medium mb-2">Account Information</h2>
                <p className="text-sm text-stone-400">
                    Update your username and email address here.
                </p>
            </div>

            <Separator />

            {renderFormSection({
                title: "Username",
                description: "This will be your unique identifier.",
                form: usernameForm,
                name: "username",
                type: "text",
                placeholder: "John Doe",
                onSubmit: (data) => {
                    if (data.username === user?.username) {
                        return;
                    }
                    update(data);
                },
            })}

            {renderFormSection({
                title: "Email address",
                description: "This will be used for notifications and login.",
                form: emailForm,
                name: "email",
                type: "email",
                placeholder: "m@example.com",
                onSubmit: (data) => {
                    if (data.email === user?.email) {
                        return;
                    }
                    update(data);
                },
                footer: !user?.emailVerified ? (
                    <div className="flex items-center gap-2">
                        <CircleAlert size={15} className="text-yellow-500" />
                        <p className="text-yellow-500 text-xs">Email not verified</p>{" "}
                        <Link
                            to={`${ROUTES.PUBLIC.VERIFY_EMAIL}?email=${user?.email}`}
                            className="text-xs underline underline-offset-4"
                        >
                            Verify now
                        </Link>
                    </div>
                ) : null,
            })}
        </div>
    );
};

export default UpdateProfileInfo;
