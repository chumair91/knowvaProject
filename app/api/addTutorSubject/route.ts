import prisma from "@/app/lib/prisma";
import { error } from "console";
import { NextRequest, NextResponse } from "next/server";

type SubjectInterface = {
  subjectId: string;
  levelIds: string[];
};
type TutorInterface = {
  tutorId: string;
  subjects: SubjectInterface[];
};
export async function POST(req: NextRequest) {
  try {
    const { tutorId, subjects }: TutorInterface = await req.json();
    if (!tutorId || !subjects || subjects.length === 0) {
      return NextResponse.json(
        {
          error: "tutorId and subjects are required",
        },
        { status: 400 },
      );
    }
    const tutor = await prisma.tutorProfile.findUnique({
      where: { id: tutorId },
    });
    if (!tutor) {
      return NextResponse.json({ error: "Tutor not found" }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      for (const subj of subjects) {
        let tutorSubject = await tx.tutorSubject.findUnique({
          where: {
            tutorId_subjectId: {
              tutorId,
              subjectId: subj.subjectId,
            },
          },
        });

        if (!tutorSubject) {
          tutorSubject = await tx.tutorSubject.create({
            data: {
              tutorId,
              subjectId: subj.subjectId,
            },
          });
        }

        if (subj.levelIds && subj.levelIds.length > 0) {
          await tx.tutorSubjectLevel.createMany({
            data: subj.levelIds.map((lvlid) => ({
              tutorSubjectId: tutorSubject.id,
              levelId: lvlid,
            })),
            skipDuplicates: true,
          });
        }
      }
    });
    return NextResponse.json(
      { message: "Subjects & levels added successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
