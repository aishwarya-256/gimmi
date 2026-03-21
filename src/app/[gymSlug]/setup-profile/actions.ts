"use server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";
import { redirect } from "next/navigation";

const prisma = new PrismaClient();

export async function submitRealName(gymSlug: string, formData: FormData) {
  const { userId } = await auth();
  if (!userId) return { error: "Authentication required" };

  const fullName = formData.get("fullName")?.toString().trim();
  if (!fullName || fullName.length < 2) {
    return { error: "Please enter your real full name" };
  }

  const clerkUser = await currentUser();
  
  await prisma.user.upsert({
    where: { id: userId },
    update: { name: fullName },
    create: {
      id: userId,
      email: clerkUser?.primaryEmailAddress?.emailAddress || "",
      name: fullName,
    }
  });

  redirect(`/${gymSlug}`);
}
