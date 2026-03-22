import { SubjectCategory } from "@/app/generated/prisma/enums";
import prisma from "@/app/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

type LevelBody = {
  name: string;
  category: SubjectCategory;
};

type ReqBody = {
  levels: LevelBody[];
};

export async function POST(req: NextRequest) {
  const body: ReqBody = await req.json();
  const { levels } = body;

  if (!levels || levels.length === 0) {
    return NextResponse.json(
      {
        message: "No data found",
      },
      { status: 400 },
    );
  }

  for (const level of levels) {
    if (!level.name || !level.category) {
      return NextResponse.json(
        {
          message: "name or category missing",
        },
        { status: 400 },
      );
    }
  }
  const regLevel = await prisma.level.createMany({
    data: levels,
    skipDuplicates:true
  });

  return NextResponse.json(
    {
      message: "level registered",
      regLevel,
    },
    { status: 200 },
  );
}
