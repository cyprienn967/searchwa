import { addToWaitlist } from "@/lib/redis";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const emailSchema = z.object({
  email: z.string().email("Please enter a valid email address format."),
});

export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error("JSON Parsing error:", parseError);
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request body",
        },
        { status: 400 }
      );
    }

    const result = emailSchema.safeParse(body);
    if (!result.success) {
      const errorMessage =
        result.error.errors[0]?.message ?? "Invalid email address format";
      return NextResponse.json(
        { success: false, message: errorMessage },
        { status: 400 }
      );
    }

    const { email } = result.data;
    const added = await addToWaitlist(email);

    if (!added) {
      return NextResponse.json(
        { success: false, message: "Email already registered" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Successfully signed up to the waitlist!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Waitlist submission error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
