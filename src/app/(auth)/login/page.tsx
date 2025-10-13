import { Metadata } from "next";
import LoginForm from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Login - Legasys",
  description: "Sign in to your Legacore account",
};

export default function LoginPage() {
  return <LoginForm />;
}
