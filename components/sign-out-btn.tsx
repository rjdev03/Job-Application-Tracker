'use client'

import { signOut } from "@/lib/auth/auth-client";
import { DropdownMenuItem } from "./ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export default function SignOutButton() {
    const router = useRouter();

    return (
      <DropdownMenuItem 
        className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer flex items-center gap-2 font-medium text-xs"
        onClick={async () => {
          const result = await signOut();
          
          if (result.data) {
            router.push("/sign-in");
          } else {
            alert("Error Signing Out");
          }
        }}
      >
        <LogOut className="h-3.5 w-3.5" />
        Log Out
      </DropdownMenuItem>
    );
}