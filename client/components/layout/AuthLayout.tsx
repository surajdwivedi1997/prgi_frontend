import { PropsWithChildren } from "react";

export default function AuthLayout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-background">
      <div className="hidden md:flex items-center justify-center bg-gradient-to-br from-secondary via-muted to-background relative overflow-hidden">
        <div className="absolute inset-0 [mask-image:radial-gradient(400px_circle_at_30%_30%,black,transparent)] pointer-events-none">
          <div className="absolute -top-16 -left-16 h-80 w-80 rounded-full bg-primary/10 blur-2xl" />
          <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
        </div>
        <div className="relative text-center">
          <div className="mx-auto mb-8 h-16 w-16 rounded-2xl bg-primary/10 ring-1 ring-primary/20 grid place-items-center">
            <span className="text-primary font-extrabold text-2xl">P</span>
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-emerald-600 bg-clip-text text-transparent">
            PRGI
          </h1>
          <p className="mt-2 text-muted-foreground">Press Registrar General of India — Enterprise Portal</p>
        </div>
      </div>
      <main className="flex items-center justify-center p-6 md:p-12">{children}</main>
    </div>
  );
}
