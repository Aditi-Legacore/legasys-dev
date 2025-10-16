'use client'

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema } from "@/lib/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Form, FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User, Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import LoginBg from "../../../public/assets/images/auth/login-bg.png";
import LoginLogoBg from "../../../public/assets/images/auth/logo.png";

interface SignupFormData {
  name: string;
  email: string;
  password: string;
}

export default function SignupForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const onSubmit = async (values: SignupFormData) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (res.ok) {
        // Automatically sign in the user after successful signup
        const signInRes = await signIn("credentials", {
          email: values.email,
          password: values.password,
          redirect: false,
        });

        if (!signInRes?.error) {
          router.push("/");
        } else {
          alert("Signup successful, but login failed. Please try logging in manually.");
        }
      } else {
        alert("Signup failed");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center md:flex-row bg-white">
      {/* Left side: Illustration */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center bg-gradient-to-br">
        <div className="relative w-full h-[70vh] lg:h-[80vh] xl:h-[90vh]"> {/* adjust height as needed */}
          <Image
            src={LoginBg}
            alt="Login illustration"
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>


      {/* Right side: Form */}
      <div className="lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Logo and Title */}
          <div className="space-y-2 text-center">
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="w-10 h-10 md:w-[50px] md:h-[50px] bg-white rounded-lg flex items-center justify-center overflow-hidden">
                <Image
                  src={LoginLogoBg}
                  alt="Logo"
                  width={50}
                  height={50}
                  className="object-contain"
                  priority
                />
              </div>
              <span className="text-xl font-semibold text-gray-900">Legasys</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Create your Account</h1>
            <p className="text-gray-600">Sign up to get started with Legasys.</p>
          </div>

          {/* Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="name"
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          {...field}
                          type="text"
                          placeholder="Full Name"
                          className="pl-11 h-12 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          {...field}
                          type="email"
                          placeholder="example@gmail.com"
                          className="pl-11 h-12 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          {...field}
                          type={showPassword ? "text" : "password"}
                          placeholder="password"
                          className="pl-11 pr-11 h-12 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        {showPassword ? (
                          <EyeOff
                            className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 cursor-pointer"
                            onClick={() => setShowPassword(false)}
                          />
                        ) : (
                          <Eye
                            className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 cursor-pointer"
                            onClick={() => setShowPassword(true)}
                          />
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />


              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing Up...
                  </>
                ) : (
                  "Sign Up"
                )}
              </Button>

              <div className="text-center">
                <span className="text-sm text-gray-600">Already have an account? </span>
                <Link href="/login" className="text-sm text-blue-600 hover:underline font-medium">
                  Sign In
                </Link>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}