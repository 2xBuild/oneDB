"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
import type { Person } from "@/lib/types";
import PeopleSubmissionForm from "@/app/(public)/submit/components/PeopleSubmissionForm";

export default function EditPersonPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const id = params.id as string;

  const [person, setPerson] = useState<Person | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    
    if (!isAuthenticated) {
      router.push("/signin");
      return;
    }

    const fetchPerson = async () => {
      try {
        const res = await apiClient.getPerson(id);
        const personData = res.data;

        if (!personData || personData.status !== "approved") {
          router.push("/db/people");
          return;
        }

        setPerson(personData);
      } catch (error) {
        console.error("Error fetching person:", error);
        router.push("/db/people");
      } finally {
        setLoading(false);
      }
    };

    fetchPerson();
  }, [id, isAuthenticated, authLoading, router]);

  if (loading || authLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-foreground mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!person) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <p className="text-muted-foreground">Person not found.</p>
        <Button onClick={() => router.push("/db/people")} className="mt-4">
          Back to People
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Button
        variant="ghost"
        onClick={() => router.push("/db/people")}
        className="mb-4"
      >
        ← Back to People
      </Button>

      <PeopleSubmissionForm
        onSuccess={() => {
          alert("Edit request submitted. It will be reviewed by the community.");
          router.push("/db/contribution");
        }}
        onCancel={() => router.push("/db/people")}
        initialData={{
          name: person.name,
          description: person.description || "",
          socialMediaPlatform: person.socialMediaPlatform,
          socialMediaLink: person.socialMediaLink,
          image: person.image || "",
          tags: person.tags?.join(", ") || "",
          followersCount: person.followersCount?.toString() || "",
        }}
        onSubmit={async (data) => {
          await apiClient.submitPersonEdit(person.id, data);
        }}
        isEdit={true}
      />
    </div>
  );
}

