import { SubjectCategory } from "@/app/generated/prisma/enums";
import { NextRequest, NextResponse } from "next/server";

type levelBody = {
  name: string;
  category: SubjectCategory;
};

type reqBody = {
  levels: levelBody[];
};

export async function POST(req: NextRequest) {
  const body: reqBody = await req.json();
  const { levels } = await body;

  if (!levels || levels.length < 0) {
    return NextResponse.json(
      {
        message: "No data found",
      },
      { status: 400 },
    );
  }

  for (const level of levels) {
    console.log(level.name, level.category);
  }

  return NextResponse.json(
    {
      message: "regsitered",
    },
    { status: 200 },
  );
}
