import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "../../lib/prisma";
import validator from "validator";
// import { error } from "node:console";

// export const runtime = "nodejs";

type CreateUserBody = {
  name?: string;
  email?: string;
  password?: string;
};

export async function POST(req: NextRequest) {
  try {
      const { name, email, password }: CreateUserBody = await req.json();

  if (!name || !email || !password) {
    return NextResponse.json(
      { error: "Name, email, and password are required" },
      { status: 400 },
    );
  }

  if (!validator.isEmail(email)) {
    return NextResponse.json(
      {
        message: "Invalid Email format",
      },
      {
        status: 400,
      },
    );
  }

  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters" },
      { status: 400 },
    );
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return NextResponse.json(
      { error: "Email already registered" },
      { status: 409 },
    );
  }

  const hashPassword = await bcrypt.hash(password, 10);
  const regUser = await prisma.user.create({
    data: {
      name: name,
      email: email,
      password: hashPassword,
    },
  });
  if (regUser) {
    return NextResponse.json(
      { message: "You are registered", regUser },
      { status: 200 },
    );
  }
  } catch (error) {
    console.error("Error aa gya hai",error);
    return NextResponse.json(
      {error: "Intenal Server Error"},
      {status: 500}
    )
  }

}
// const { name, email, password } = await req.json();
// if (!name || !email || !password) {
//   return NextResponse.json(
//     { error: "name,email,password are required" },
//     { status: 400 },
//   );
// }
// if (validator) {

// }

// const regUser = await prisma.user.create({
//   data: {
//     name: user.name,
//     email: user.email,
//     password: user.password,
//   },
// });

// const regUser=await prisma.user.deleteMany();
// return NextResponse.json(
//   { message: "you are registered", regUser },
//   { status: 200 },
// );
// }
