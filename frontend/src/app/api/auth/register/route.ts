import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectMongo from '../../../../utils/db';
import User from '../../../../models/User';
import { z } from 'zod';

const requestSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(request: Request) {
  try {
    await connectMongo();

    const requestBody = await request.json(); // Get the body as JSON
    const result = requestSchema.safeParse(requestBody);
    if (!result.success) {
      return NextResponse.json({ message: 'Invalid request body', errors: result.error.format() }, { status: 400 });
    }
    const { name, email, password } = result.data;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ message: 'User already exists.' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();
    return NextResponse.json({ message: 'User registered successfully.' }, { status: 201 });

  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
        return NextResponse.json({ message: error.message }, {status: 500});
    }
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}