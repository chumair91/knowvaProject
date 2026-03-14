import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    message: "API is running",
    endpoints: {
      createUser: {
        method: "POST",
        path: "/api/createUser",
      },
    },
  });
}
