import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Lock, Mail, User } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";

const formSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters.",
  }),
  email: z
    .string()
    .email({
      message: "Please enter a valid email address.",
    })
    .optional(),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
});

interface RegisterModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  onRegister?: (data: z.infer<typeof formSchema>) => void;
  onSwitchToLogin?: () => void;
}

const RegisterModal = ({
  isOpen = true,
  onClose = () => {},
  onRegister = (data) => console.log("Register attempt:", data),
  onSwitchToLogin = () => {},
}: RegisterModalProps) => {
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    setError(null);
    console.log("Register form submitted with:", data);
    try {
      await onRegister(data);
    } catch (err) {
      console.error("Register form error:", err);
      setError("Registration failed. Please try again.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-gray-800 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center text-white">
            Create an Account
          </DialogTitle>
          <DialogDescription className="text-center text-gray-400">
            Join Auradex and start your gambling journey
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
            <User className="h-8 w-8 text-white" />
          </div>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">Username</FormLabel>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                    <FormControl>
                      <Input
                        placeholder="Choose a username"
                        className="pl-10 bg-gray-800 border-gray-700 text-white"
                        {...field}
                      />
                    </FormControl>
                  </div>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">
                    Email (Optional)
                  </FormLabel>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Enter your email (optional)"
                        className="pl-10 bg-gray-800 border-gray-700 text-white"
                        {...field}
                      />
                    </FormControl>
                  </div>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">Password</FormLabel>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Create a password"
                        className="pl-10 bg-gray-800 border-gray-700 text-white"
                        {...field}
                      />
                    </FormControl>
                  </div>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />

            {error && (
              <div className="p-3 rounded-md bg-red-900/50 border border-red-800 text-red-300 text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium py-2"
            >
              Create Account
            </Button>

            <div className="text-center text-sm text-gray-500 mt-4">
              <p>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={onSwitchToLogin}
                  className="text-blue-400 hover:underline"
                >
                  Login
                </button>
              </p>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default RegisterModal;
