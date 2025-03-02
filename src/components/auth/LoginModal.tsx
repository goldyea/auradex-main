import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Lock, User } from "lucide-react";

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
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
});

interface LoginModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  onLogin?: (data: z.infer<typeof formSchema>) => void;
}

const LoginModal = ({
  isOpen = true,
  onClose = () => {},
  onLogin = (data) => console.log("Login attempt:", data),
}: LoginModalProps) => {
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    setError(null);
    console.log("Login form submitted with:", data);
    try {
      await onLogin(data);
    } catch (err) {
      console.error("Login form error:", err);
      setError("Authentication failed. Please try again.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-gray-800 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center text-white">
            Login to Auradex
          </DialogTitle>
          <DialogDescription className="text-center text-gray-400">
            Enter your credentials to access your account and Aura balance
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
                        placeholder="Enter your username"
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
                        placeholder="Enter your password"
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
              Login
            </Button>

            <div className="text-center text-sm text-gray-500 mt-4">
              <p>
                Don't have an account?{" "}
                <button
                  onClick={() => onClose()}
                  className="text-blue-400 hover:underline"
                >
                  Sign up
                </button>
              </p>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;
