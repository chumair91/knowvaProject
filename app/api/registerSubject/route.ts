import prisma from "@/app/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

type CreateSubjectBody = {
  name: string;
  category: "SCHOOL" | "UNIVERSITY" | "SKILL" | "LANGUAGE" | "TEST_PREP";
};

export async function POST(req: NextRequest) {
  try {
    const body: CreateSubjectBody = await req.json();
    const { name, category } = body;

    if (!name || !category) {
      return NextResponse.json(
        { error: "name and category are required" },
        { status: 400 },
      );
    }

    const existingSubject = await prisma.subject.findUnique({
      where: { name },
    });

    if (existingSubject) {
      return NextResponse.json(
        { error: "Subject already exists" },
        { status: 409 },
      );
    }

    const subject = await prisma.subject.create({
      data: {
        name,
        category,
      },
    });
    return NextResponse.json(
      { message: "Subject created successfully", subject },
      { status: 201 },
    );
  } catch (error) {
    console.error("Subject creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
