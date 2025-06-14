"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { showToast } from "@/lib/toaster";
import { Loader } from "lucide-react";
import Link from "next/link";

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters long.",
  }),
});

const Page = () => {
  const [loading, setloading] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const searchParams = useSearchParams();
  const toast = searchParams.get("toast");
  const baseCallbackUrl = searchParams.get("callbackUrl") || "/courses";
  const callbackUrl = `${baseCallbackUrl}?toast=login_success`;
  const toastShown = useRef(false);

  useEffect(() => {
    if (toast === "login_required" && !toastShown.current) {
      showToast.warning("Please login to continue");
      toastShown.current = true;
    }
  }, [toast]);

  const onClick = (provider: "google" | "github") => {
    signIn(provider, {
      callbackUrl,
    });
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setloading(true);
    try {
      await signIn("credentials", {
        email: values.email,
        password: values.password,
        callbackUrl,
      });

      // if (res?.ok) {
      //   showToast.success("You are logged In");
      //   console.log("Redirecting to:", res?.url)
      //   router.push(res?.url || callbackUrl);

      //   const cleanUrl = new URL(window.location.href);
      //   cleanUrl.searchParams.delete("toast");
      //   cleanUrl.searchParams.delete("callbackUrl");
      //   router.replace(cleanUrl.pathname);
      // } else {
      //   if (typeof res.error === "string") {
      //     showToast.error(res.error);
      //   } else {
      //     showToast.error("Login Failed");
      //   }
      // }
    } catch (err: unknown) {
      let fallbackMessage = "Something went wrong. Please try again.";

      if (err instanceof Error) {
        fallbackMessage = err.message;
      }

      showToast.error(fallbackMessage);
    } finally {
      setloading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-950 via-fuchsia-700 to-purple-950 text-white">
      <div className="backdrop-blur-lg bg-white/10 border border-white/20 p-10 rounded-2xl shadow-xl w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-center">Login</h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="www@gmail.com"
                      {...field}
                      className="bg-white/10 backdrop-blur-sm text-white placeholder:text-white/70 border-white/20 focus-visible:ring-fuchsia-400"
                    />
                  </FormControl>
                  <FormDescription className="text-white/70">
                    This is your email id.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="******"
                      {...field}
                      className="bg-white/10 backdrop-blur-sm text-white placeholder:text-white/70 border-white/20 focus-visible:ring-fuchsia-400"
                    />
                  </FormControl>
                  <FormDescription className="text-white/70">
                    This is your password
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-700 to-fuchsia-600 hover:from-purple-800 hover:to-fuchsia-700 text-white font-medium px-4 py-2 rounded-lg shadow-md transition duration-300"
            >
              {loading ? <Loader className="animate-spin w-5 h-5" /> : "Submit"}
            </Button>
          </form>
        </Form>

        <div className="flex items-center justify-center gap-8 mt-6">
          <Button
          onClick={()=>{
            onClick("google")
          }}
            variant="ghost"
            className="flex items-center gap-2 px-6 py-2 rounded-xl shadow-md 
               bg-white/10 backdrop-blur-md border border-white/20 
               hover:bg-white/20 transition text-white"
          >
            <FcGoogle className="w-5 h-5 bg-white rounded-full p-0.5" />
            <span className="text-sm font-medium">Google</span>
          </Button>

          <Button
          onClick={()=>{
            onClick("github")
          }}
            variant="ghost"
            className="flex items-center gap-2 px-6 py-2 rounded-xl shadow-md 
               bg-white/10 backdrop-blur-md border border-white/20 
               hover:bg-white/20 transition text-white"
          >
            <FaGithub className="w-5 h-5" />
            <span className="text-sm font-medium">GitHub</span>
          </Button>
        </div>

        <p className="text-sm text-white/80 mt-6 text-center">
          Don&apos;t have an account?{" "}
          <Link
            href={`/auth/register?callbackUrl=${encodeURIComponent(
              callbackUrl
            )}`}
            className="text-fuchsia-400 hover:text-fuchsia-300 font-semibold underline underline-offset-4 transition"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Page;
