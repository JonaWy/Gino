import Link from "next/link";
import { register } from "@/app/actions/auth";
import { AuthForm } from "@/components/auth-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function RegisterPage() {
  return (
    <div className="flex min-h-full flex-1 items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="font-serif text-2xl">Gino</CardTitle>
          <CardDescription>Neues Konto erstellen</CardDescription>
        </CardHeader>
        <CardContent>
          <AuthForm action={register} submitLabel="Registrieren" minPasswordLength={6} />
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Bereits registriert?{" "}
            <Link href="/login" className="text-primary underline-offset-4 hover:underline">
              Anmelden
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
