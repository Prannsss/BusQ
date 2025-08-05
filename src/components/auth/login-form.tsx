
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Mail, Lock } from "lucide-react";
import { useState, useEffect } from "react"; 
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

const loginFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(1, { message: "Password cannot be empty." }), 
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('busqUser');
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          if (userData.email) {
            form.setValue('email', userData.email);
          }
          if (userData.password) { 
            form.setValue('password', userData.password);
          }
        } catch (e) {
          console.error("Failed to parse user data from localStorage", e);
        }
      }
    }
  }, [form]);

  async function onSubmit(values: LoginFormValues) {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log("Login submitted:", values);

    let loginSuccess = false;
    let userName = "User";
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('busqUser');
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          if (userData.email === values.email && userData.password === values.password) {
            loginSuccess = true;
            userName = userData.name || "User";
            localStorage.setItem('busqLoggedInUser', JSON.stringify({ email: values.email, name: userName })); 
          }
        } catch (e) {
          console.error("Error during mock login check:", e);
        }
      }
    }

    if (loginSuccess) {
      toast({
        title: "Login Successful",
        description: `Welcome back, ${userName}!`,
      });
      router.push('/'); 
    } else {
      toast({
        title: "Login Failed",
        description: "Invalid email or password, or no local user found. Please sign up if you haven't.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground">Email</FormLabel>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <FormControl>
                  <Input
                    type="email"
                    placeholder="jtamad@gmail.com"
                    {...field}
                    className="pl-10 bg-input border-border focus:ring-primary"
                  />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground">Password</FormLabel>
               <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Password"
                    {...field}
                    className="pl-10 bg-input border-border focus:ring-primary"
                  />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isLoading}>
          {isLoading ? "Logging in..." : "Login"}
        </Button>
      </form>
    </Form>
  );
}
