import { LoginForm } from "@/components/widgets/auth/login-form";

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-4 sm:p-6 md:p-10">
      <div className="w-full max-w-sm sm:max-w-md">
        <LoginForm />
      </div>
    </div>
  )
}
