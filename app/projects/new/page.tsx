"use client";
import dynamic from "next/dynamic";
const AppEditor = dynamic(() => import("@/components/editor").then(mod => mod.AppEditor), { ssr: false });

export default function ProjectsNewPage() {
  return <AppEditor />;
}
