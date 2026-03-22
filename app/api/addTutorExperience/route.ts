import prisma from "@/app/lib/prisma";
import { error } from "console";
import { NextRequest, NextResponse } from "next/server";
import { title } from "process";

type TutorExperienceInput = {
  title: string;
  organization: string;
  subject?: string;
  startDate: string; // ISO date string e.g. "2020-01-01"
  endDate?: string;
  currentlyWorking?: boolean;
  description?: string;
};
interface TutorExperienceInterface {
  tutorId: string;
  experiences: TutorExperienceInput[];
}
export async function POST(req: NextRequest) {
  const { tutorId, experiences }: TutorExperienceInterface = await req.json();

  const tutor = await prisma.tutorProfile.findUnique({
    where: { id: tutorId },
  });

  if (!tutor) {
    return NextResponse.json({ error: "Tutor not found" }, { status: 404 });
  }
  if (!experiences || experiences.length === 0) {
    return NextResponse.json(
      { error: "Experiences are required" },
      { status: 400 },
    );
  }

  if (experiences && experiences.length > 0) {
    for (const exp of experiences) {
      if (!exp.title || !exp.startDate || !exp.organization) {
        return NextResponse.json(
          {
            error: "Title,startdate or organization is missing",
          },
          { status: 400 },
        );
      }

      if (!exp.currentlyWorking && !exp.endDate) {
        return NextResponse.json(
          { error: "endDate is required if currentlyWorking is false" },
          { status: 400 },
        );
      }
    }
  }

  
    await prisma.tutorExperience.createMany({
      data: experiences.map((exp) => ({
        tutorId: tutorId,
        title: exp.title,
        organization: exp.organization,
        subject: exp.subject,
        startDate: new Date(exp.startDate),
        endDate: exp.endDate ? new Date(exp.endDate) : null,
        currentlyWorking: exp.currentlyWorking ?? false,
        description: exp.description,
      })),
      skipDuplicates:true,
    });


  return NextResponse.json(
    {
      message: "experiences added",
    },
    { status: 200 },
  );
}
