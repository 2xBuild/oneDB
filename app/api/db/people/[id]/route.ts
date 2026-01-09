import { NextRequest, NextResponse } from "next/server";
import { PeopleService } from "@/lib/services/people.service";
import { success, error } from "@/lib/utils/responses";
import { NotFoundError } from "@/lib/utils/errors";

const peopleService = new PeopleService();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const person = await peopleService.findById(params.id);
    return success(person);
  } catch (err) {
    if (err instanceof NotFoundError) {
      return error(err.message, 404);
    }
    return error("Internal server error", 500);
  }
}


