import { NextRequest, NextResponse } from "next/server";
import { PeopleService } from "@/lib/services/people.service";
import { requireAuth } from "@/lib/middleware/auth";
import { createPeopleSchema } from "@/lib/zod";
import { success, error } from "@/lib/utils/responses";
import { NotFoundError } from "@/lib/utils/errors";

const peopleService = new PeopleService();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");
    const platform = searchParams.get("platform") || undefined;
    const tags = searchParams.get("tags")?.split(",") || undefined;
    const status = searchParams.get("status") || undefined;

    const filters = {
      platform,
      tags,
      status,
    };

    const people = await peopleService.findAll(limit, offset, filters);
    return success(people);
  } catch (err) {
    return error("Internal server error", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const validated = createPeopleSchema.parse(body);
    const person = await peopleService.create(user.id, validated);
    return success(person, 201);
  } catch (err) {
    if (err instanceof Error && err.name === "ZodError") {
      return error("Validation failed", 400);
    }
    return error("Internal server error", 500);
  }
}


