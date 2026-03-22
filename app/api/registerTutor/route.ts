import { NextRequest, NextResponse } from "next/server";
import prisma from "../../lib/prisma";
import { TeachingMode } from "@/app/generated/prisma/enums";

// type TeachingMode={
// teachingMode=' ONLINE',
//   'HOME',
//   'BOTH'
// }

type RegisterTutorBody = {
  userId: string;
  hourlyRate: number;
  city: string;
  country: string;
  teachingMode: TeachingMode;
  bio?: string;
  timeZone?: string;
  street?: string;
  latitude?: number;
  longitude?: number;
  subjectIds?: string[];
};

export async function POST(req: NextRequest) {
  try {
    const body: RegisterTutorBody = await req.json();
    const {
      userId,
      hourlyRate,
      city,
      country,
      teachingMode,
      bio,
      timeZone,
      street,
      latitude,
      longitude,
    } = body;

    // 1. Validate required fields
    if (!userId || !hourlyRate || !city || !country || !teachingMode) {
      return NextResponse.json(
        {
          error:
            "userId, hourlyRate, city, country, and teachingMode are required",
        },
        { status: 400 },
      );
    }

    // 2. Check user exists
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 3. Check tutor profile doesn't already exist
    const existingTutor = await prisma.tutorProfile.findUnique({
      where: { userId },
    });
    if (existingTutor) {
      return NextResponse.json(
        { error: "User already has a tutor profile" },
        { status: 409 },
      );
    }

    // 4. Validate hourlyRate
    if (hourlyRate <= 0) {
      return NextResponse.json(
        { error: "Hourly rate must be greater than 0" },
        { status: 400 },
      );
    }

    // 6. Create tutor profile
    const tutorProfile = await prisma.tutorProfile.create({
      data: {
        userId,
        hourlyRate,
        city,
        country,
        teachingMode,
        bio,
        timeZone,
        street,
        latitude,
        longitude,
      },
    });

    // 9. Update user role to TUTOR
    await prisma.user.update({
      where: { id: userId },
      data: { role: "TUTOR" },
    });

    return NextResponse.json(
      { message: "Tutor registered successfully", tutorProfile },
      { status: 201 },
    );
  } catch (error) {
    console.error("Tutor registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
