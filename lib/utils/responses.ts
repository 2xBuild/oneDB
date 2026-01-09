import { NextResponse } from "next/server";

export function success(data: any, statusCode = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status: statusCode }
  );
}

export function error(message: string, statusCode = 400) {
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    { status: statusCode }
  );
}

