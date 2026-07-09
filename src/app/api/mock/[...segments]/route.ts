import { NextRequest, NextResponse } from "next/server";

import db from "../../../../../mock/db.json";

type DbRecord = Record<string, unknown> & {
  id?: string;
};

type DbShape = Record<string, unknown>;

export const dynamic = "force-dynamic";

const database = db as DbShape;

function getCollection(collectionName: string) {
  const collection = database[collectionName];

  return Array.isArray(collection) ? (collection as DbRecord[]) : null;
}

function matchesFilter(item: DbRecord, key: string, value: string) {
  const itemValue = item[key];

  if (Array.isArray(itemValue)) {
    return itemValue.map(String).includes(value);
  }

  return String(itemValue) === value;
}

function compareValues(a: unknown, b: unknown) {
  if (typeof a === "number" && typeof b === "number") {
    return a - b;
  }

  const aDate = typeof a === "string" ? Date.parse(a) : Number.NaN;
  const bDate = typeof b === "string" ? Date.parse(b) : Number.NaN;

  if (!Number.isNaN(aDate) && !Number.isNaN(bDate)) {
    return aDate - bDate;
  }

  return String(a ?? "").localeCompare(String(b ?? ""));
}

function applyQuery(collection: DbRecord[], request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const sortKey = searchParams.get("_sort");
  const order = searchParams.get("_order");
  const limit = searchParams.get("_limit");
  const start = searchParams.get("_start");

  let result = collection.filter((item) => {
    for (const [key, value] of searchParams.entries()) {
      if (!key.startsWith("_") && !matchesFilter(item, key, value)) {
        return false;
      }
    }

    return true;
  });

  if (sortKey) {
    result = [...result].sort((a, b) => {
      const direction = order === "desc" ? -1 : 1;

      return compareValues(a[sortKey], b[sortKey]) * direction;
    });
  }

  if (start !== null || limit !== null) {
    const startIndex = start === null ? 0 : Number(start);
    const endIndex = limit === null ? undefined : startIndex + Number(limit);

    result = result.slice(startIndex, endIndex);
  }

  return result;
}

function getRouteParts(context: { params: { segments?: string[] } }) {
  const [collectionName, id] = context.params.segments ?? [];

  return { collectionName, id };
}

export function GET(
  request: NextRequest,
  context: { params: { segments?: string[] } },
) {
  const { collectionName, id } = getRouteParts(context);

  if (!collectionName) {
    return NextResponse.json({ message: "Missing mock collection" }, { status: 404 });
  }

  const collection = getCollection(collectionName);

  if (!collection) {
    return NextResponse.json({ message: "Unknown mock collection" }, { status: 404 });
  }

  if (id) {
    const item = collection.find((entry) => entry.id === id);

    if (!item) {
      return NextResponse.json({ message: "Mock resource not found" }, { status: 404 });
    }

    return NextResponse.json(item);
  }

  return NextResponse.json(applyQuery(collection, request));
}

export async function POST(
  request: NextRequest,
  context: { params: { segments?: string[] } },
) {
  const { collectionName } = getRouteParts(context);

  if (!collectionName || !getCollection(collectionName)) {
    return NextResponse.json({ message: "Unknown mock collection" }, { status: 404 });
  }

  const body = (await request.json()) as DbRecord;

  return NextResponse.json(
    {
      id: body.id ?? `mock-${Date.now()}`,
      ...body,
    },
    { status: 201 },
  );
}

export async function PATCH(
  request: NextRequest,
  context: { params: { segments?: string[] } },
) {
  const { collectionName, id } = getRouteParts(context);
  const collection = collectionName ? getCollection(collectionName) : null;

  if (!collection || !id) {
    return NextResponse.json({ message: "Mock resource not found" }, { status: 404 });
  }

  const body = (await request.json()) as DbRecord;
  const current = collection.find((entry) => entry.id === id) ?? { id };

  return NextResponse.json({
    ...current,
    ...body,
    id,
  });
}

export function DELETE(
  _request: NextRequest,
  context: { params: { segments?: string[] } },
) {
  const { collectionName, id } = getRouteParts(context);

  if (!collectionName || !id || !getCollection(collectionName)) {
    return NextResponse.json({ message: "Mock resource not found" }, { status: 404 });
  }

  return new NextResponse(null, { status: 204 });
}
