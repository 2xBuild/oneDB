import { NextRequest, NextResponse } from "next/server";
import { PeopleService } from "@/lib/services/people.service";
import { ResourcesService } from "@/lib/services/resources.service";
import { AppsService } from "@/lib/services/apps.service";
import { requireAuth } from "@/lib/middleware/auth";
import { isUserAdmin } from "@/lib/utils/admin";
import { success, error } from "@/lib/utils/responses";

const peopleService = new PeopleService();
const resourcesService = new ResourcesService();
const appsService = new AppsService();

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    
    // Check if user is admin
    if (!isUserAdmin(user)) {
      return error("Unauthorized: Admin access required", 403);
    }

    const body = await request.json();
    const { type, id } = body;

    if (!type || !id) {
      return error("Missing type or id", 400);
    }

    let result;
    if (type === "people") {
      result = await peopleService.delete(id);
    } else if (type === "resource") {
      result = await resourcesService.delete(id);
    } else if (type === "app") {
      result = await appsService.delete(id);
    } else {
      return error("Invalid type", 400);
    }

    return success({ message: "Deleted successfully", result });
  } catch (err) {
    console.error("Error deleting submission:", err);
    return error("Internal server error", 500);
  }
}

