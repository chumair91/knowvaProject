import { NextRequest, NextResponse } from "next/server";
import prisma from "../../lib/prisma";
import { TeachingMode } from "@/app/generated/prisma/enums";

// type TeachingMode={
// teachingMode=' ONLINE',
//   'HOME',
//   'BOTH'
// }
type TutorExperienceInput = {
  title: string;
  organization: string;
  subject?: string;
  startDate: string; // ISO date string e.g. "2020-01-01"
  endDate?: string;
  currentlyWorking?: boolean;
  description?: string;
};

type RegisterTutorBody = {
  userId: string;
  hourlyRate: number;
  city: string;
  country: string;
  teachingMode: TeachingMode;
  bio?: string;
 
  street?: string;
  latitude?: number;
  longitude?: number;
  subjectIds?: string[];
  experiences?: TutorExperienceInput[]; // ← added
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
    
      street,
      latitude,
      longitude,
      subjectIds,
      experiences,
    } = body;

    // 1. Validate required fields
    if (!userId || !hourlyRate || !city || !country || !teachingMode) {
      return NextResponse.json(
        { error: "userId, hourlyRate, city, country, and teachingMode are required" },
        { status: 400 }
      );
    }

    // 2. Check user exists
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 3. Check tutor profile doesn't already exist
    const existingTutor = await prisma.tutorProfile.findUnique({ where: { userId } });
    if (existingTutor) {
      return NextResponse.json(
        { error: "User already has a tutor profile" },
        { status: 409 }
      );
    }

    // 4. Validate hourlyRate
    if (hourlyRate <= 0) {
      return NextResponse.json(
        { error: "Hourly rate must be greater than 0" },
        { status: 400 }
      );
    }

    // 5. Validate experiences if provided
    if (experiences && experiences.length > 0) {
      for (const exp of experiences) {
        if (!exp.title || !exp.organization || !exp.startDate) {
          return NextResponse.json(
            { error: "Each experience must have title, organization, and startDate" },
            { status: 400 }
          );
        }
        if (!exp.currentlyWorking && !exp.endDate) {
          return NextResponse.json(
            { error: "endDate is required if currentlyWorking is false" },
            { status: 400 }
          );
        }
      }
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
       
        street,
        latitude,
        longitude,
      },
    });

    // 7. Add subjects if provided
    if (subjectIds && subjectIds.length > 0) {
      for (const subjectId of subjectIds) {
        await prisma.tutorSubject.create({
          data: { tutorId: tutorProfile.id, subjectId },
        });
      }
    }

    // 8. Add experiences if provided
    if (experiences && experiences.length > 0) {
      for (const exp of experiences) {
        await prisma.tutorExperience.create({
          data: {
            tutorId: tutorProfile.id,
            title: exp.title,
            organization: exp.organization,
            subject: exp.subject,
            startDate: new Date(exp.startDate),
            endDate: exp.endDate ? new Date(exp.endDate) : null,
            currentlyWorking: exp.currentlyWorking ?? false,
            description: exp.description,
          },
        });
      }
    }

    // 9. Update user role to TUTOR
    await prisma.user.update({
      where: { id: userId },
      data: { role: "TUTOR" },
    });

    return NextResponse.json(
      { message: "Tutor registered successfully", tutorProfile },
      { status: 201 }
    );
  } catch (error) {
    console.error("Tutor registration error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
