import Link from "next/link";
import { login } from "@/app/actions/auth";
import { AuthForm } from "@/components/auth-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <div className="flex min-h-full flex-1 items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="font-serif text-2xl">Gino</CardTitle>
          <CardDescription>Anmelden bei deinem Pferde-Management</CardDescription>
        </CardHeader>
        <CardContent>
          <AuthForm action={login} submitLabel="Anmelden" />
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Noch kein Konto?{" "}
            <Link href="/register" className="text-primary underline-offset-4 hover:underline">
              Registrieren
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
