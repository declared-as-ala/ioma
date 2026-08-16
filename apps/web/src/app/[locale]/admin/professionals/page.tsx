"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  usePendingApplications,
  useApproveApplicationMutation,
  useRejectApplicationMutation,
} from "@/hooks/use-professional";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { CheckCircle, XCircle, Building2 } from "lucide-react";
import { toast } from "sonner";

const STATUS_CONFIG = {
  submitted: { color: "bg-blue-50 text-blue-700", label: "Submitted" },
  pending_review: { color: "bg-amber-50 text-amber-700", label: "Pending Review" },
  documents_requested: { color: "bg-orange-50 text-orange-700", label: "Docs Requested" },
} as const;

export default function AdminProfessionalsPage() {
  const t = useTranslations("Admin.professionals");
  const { data: applications, isLoading } = usePendingApplications();
  const approve = useApproveApplicationMutation();
  const reject = useRejectApplicationMutation();

  const [selectedApp, setSelectedApp] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [action, setAction] = useState<"approve" | "reject" | null>(null);

  const handleAction = async () => {
    if (!selectedApp || !action) return;
    try {
      if (action === "approve") {
        await approve.mutateAsync({
          id: selectedApp,
          reviewNotes: reviewNotes || undefined,
        });
        toast.success(t("toast.approved"));
      } else {
        if (!reviewNotes.trim()) {
          toast.error(t("toast.rejectionReasonRequired"));
          return;
        }
        await reject.mutateAsync({ id: selectedApp, reviewNotes });
        toast.success(t("toast.rejected"));
      }
      setSelectedApp(null);
      setReviewNotes("");
      setAction(null);
    } catch {
      toast.error(t("toast.error"));
    }
  };

  return (
    <div>
      <h1 className="font-heading text-3xl font-light tracking-tight text-ioma-black md:text-4xl">
        {t("title")}
      </h1>
      <p className="mt-2 text-ioma-grey-500">{t("subtitle")}</p>

      {isLoading ? (
        <div className="mt-8 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-lg bg-ioma-grey-100" />
          ))}
        </div>
      ) : applications && applications.length > 0 ? (
        <div className="mt-8 space-y-4">
          {applications.map((app) => {
            const config =
              STATUS_CONFIG[app.status as keyof typeof STATUS_CONFIG] ??
              STATUS_CONFIG.submitted;
            return (
              <Card key={app._id}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-ioma-grey-50 p-2">
                      <Building2 className="h-5 w-5 text-ioma-grey-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-light">
                        {app.companyName}
                      </CardTitle>
                      <p className="text-sm text-ioma-grey-500">
                        {app.contactPerson} &middot; {app.email}
                      </p>
                    </div>
                  </div>
                  <Badge className={config.color}>{config.label}</Badge>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-3 text-sm">
                    <div>
                      <span className="text-ioma-grey-400">
                        {t("field.businessType")}
                      </span>
                      <p className="mt-1 capitalize text-ioma-black">
                        {app.businessType.replace(/_/g, " ")}
                      </p>
                    </div>
                    <div>
                      <span className="text-ioma-grey-400">{t("field.emirate")}</span>
                      <p className="mt-1 text-ioma-black">{app.emirate}</p>
                    </div>
                    <div>
                      <span className="text-ioma-grey-400">
                        {t("field.tradeLicence")}
                      </span>
                      <p className="mt-1 text-ioma-black">{app.tradeLicenceNumber}</p>
                    </div>
                    <div>
                      <span className="text-ioma-grey-400">
                        {t("field.locationsCount")}
                      </span>
                      <p className="mt-1 text-ioma-black">{app.locationsCount}</p>
                    </div>
                    <div>
                      <span className="text-ioma-grey-400">
                        {t("field.expectedVolume")}
                      </span>
                      <p className="mt-1 text-ioma-black">{app.expectedOrderVolume}</p>
                    </div>
                    <div>
                      <span className="text-ioma-grey-400">{t("field.submitted")}</span>
                      <p className="mt-1 text-ioma-black">
                        {new Date(app.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {app.documents.length > 0 && (
                    <div className="mt-4">
                      <span className="text-sm text-ioma-grey-400">
                        {t("field.documents")}
                      </span>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {app.documents.map(
                          (
                            doc: { originalName: string; mimeType: string },
                            i: number,
                          ) => (
                            <Badge key={i} variant="outline">
                              {doc.originalName}
                            </Badge>
                          ),
                        )}
                      </div>
                    </div>
                  )}
                  <div className="mt-4 flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedApp(app._id);
                        setAction("approve");
                        setReviewNotes("");
                      }}
                    >
                      <CheckCircle className="mr-2 h-3 w-3" />
                      {t("actions.approve")}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        setSelectedApp(app._id);
                        setAction("reject");
                        setReviewNotes("");
                      }}
                    >
                      <XCircle className="mr-2 h-3 w-3" />
                      {t("actions.reject")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="mt-8 text-center">
          <CheckCircle className="mx-auto h-12 w-12 text-ioma-grey-300" />
          <p className="mt-4 text-ioma-grey-500">{t("noApplications")}</p>
        </div>
      )}

      {/* Review dialog */}
      <Dialog open={!!selectedApp} onOpenChange={() => setSelectedApp(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {action === "approve" ? t("dialog.approveTitle") : t("dialog.rejectTitle")}
            </DialogTitle>
          </DialogHeader>
          <div>
            <Label htmlFor="reviewNotes">{t("dialog.notes")}</Label>
            <Textarea
              id="reviewNotes"
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              className="mt-1"
              rows={3}
              placeholder={
                action === "approve"
                  ? t("dialog.approvePlaceholder")
                  : t("dialog.rejectPlaceholder")
              }
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedApp(null)}>
              {t("dialog.cancel")}
            </Button>
            <Button
              variant={action === "approve" ? "default" : "destructive"}
              onClick={handleAction}
              disabled={approve.isPending || reject.isPending}
            >
              {approve.isPending || reject.isPending
                ? t("dialog.processing")
                : action === "approve"
                  ? t("dialog.confirmApprove")
                  : t("dialog.confirmReject")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
