import Link from "next/link";
import Image from "next/image";
import { readSolutions } from "@/app/admin/solutions/solutionStore";
import { SolutionsGridClient } from "./SolutionsGridClient";

export async function SolutionsGrid({ page }: { page?: number }) {
  const allSolutions = await readSolutions();
  const activeSolutions = allSolutions.filter((s) => s.status === "active");

  return <SolutionsGridClient solutions={activeSolutions} />;
}
