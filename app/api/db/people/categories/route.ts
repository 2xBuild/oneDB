import { NextResponse } from "next/server";
import { PeopleService } from "@/lib/services/people.service";
import { success } from "@/lib/utils/responses";

const peopleService = new PeopleService();

export async function GET() {
  try {
    const platforms = await peopleService.getUniquePlatforms();
    return success(platforms);
  } catch (err) {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}


