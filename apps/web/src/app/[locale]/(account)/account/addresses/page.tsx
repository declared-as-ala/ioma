"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import { EMIRATES, type Locale } from "@ioma/config";
import type { Address } from "@ioma/types";
import { addressSchema, type AddressInput } from "@ioma/validation";
import {
  useAddressesQuery,
  useCreateAddressMutation,
  useDeleteAddressMutation,
  useUpdateAddressMutation,
} from "@/hooks/use-account";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const EMPTY_ADDRESS: AddressInput = {
  type: "shipping",
  label: "",
  fullName: "",
  phone: "",
  line1: "",
  line2: undefined,
  emirate: "DXB",
  city: "",
  isDefault: false,
};

function toInput(address: Address): AddressInput {
  return {
    type: address.type,
    label: address.label,
    fullName: address.fullName,
    phone: address.phone,
    line1: address.line1,
    line2: address.line2 ?? undefined,
    emirate: address.emirate,
    city: address.city,
    isDefault: address.isDefault,
  };
}

export default function AddressesPage() {
  const t = useTranslations("Account");
  const locale = useLocale() as Locale;
  const addresses = useAddressesQuery();
  const createAddress = useCreateAddressMutation();
  const updateAddress = useUpdateAddressMutation();
  const deleteAddress = useDeleteAddressMutation();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Address | null>(null);
  const form = useForm<AddressInput>({
    resolver: zodResolver(addressSchema),
    defaultValues: EMPTY_ADDRESS,
  });
  const saving = createAddress.isPending || updateAddress.isPending;

  function startAdd() {
    setEditingId(null);
    form.reset(EMPTY_ADDRESS);
    createAddress.reset();
    updateAddress.reset();
    setFormOpen(true);
  }

  function startEdit(address: Address) {
    setEditingId(address._id);
    form.reset(toInput(address));
    createAddress.reset();
    updateAddress.reset();
    setFormOpen(true);
  }

  function submit(input: AddressInput) {
    const mutation = editingId ? updateAddress : createAddress;
    mutation.mutate(
      { id: editingId ?? undefined, input },
      { onSuccess: () => setFormOpen(false) },
    );
  }

  return (
    <section aria-labelledby="addresses-title">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 id="addresses-title" className="font-display text-3xl">
          {t("addresses.title")}
        </h1>
        {!formOpen && <Button onClick={startAdd}>{t("addresses.addNew")}</Button>}
      </div>

      {formOpen && (
        <form
          className="mt-8 border border-border p-5 sm:p-8"
          noValidate
          onSubmit={form.handleSubmit(submit)}
        >
          <h2 className="font-display text-xl">
            {editingId ? t("addresses.editTitle") : t("addresses.addNew")}
          </h2>
          <FieldGroup className="mt-6">
            <div className="grid gap-5 sm:grid-cols-2">
              <Controller
                name="type"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="address-type">{t("addresses.type")}</FieldLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger
                        id="address-type"
                        className="min-h-11 w-full"
                        aria-invalid={fieldState.invalid}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="shipping">
                          {t("addresses.shipping")}
                        </SelectItem>
                        <SelectItem value="billing">{t("addresses.billing")}</SelectItem>
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Controller
                name="label"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="address-label">
                      {t("addresses.label")}
                    </FieldLabel>
                    <Input
                      {...field}
                      id="address-label"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <Controller
                name="fullName"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="address-full-name">
                      {t("addresses.fullName")}
                    </FieldLabel>
                    <Input
                      {...field}
                      id="address-full-name"
                      autoComplete="name"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Controller
                name="phone"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="address-phone">
                      {t("addresses.phone")}
                    </FieldLabel>
                    <Input
                      {...field}
                      id="address-phone"
                      type="tel"
                      autoComplete="tel"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </div>
            <Controller
              name="line1"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="address-line-1">
                    {t("addresses.addressLine1")}
                  </FieldLabel>
                  <Input
                    {...field}
                    id="address-line-1"
                    autoComplete="address-line1"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              name="line2"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="address-line-2">
                    {t("addresses.addressLine2")}
                  </FieldLabel>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    id="address-line-2"
                    autoComplete="address-line2"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <div className="grid gap-5 sm:grid-cols-2">
              <Controller
                name="emirate"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="address-emirate">
                      {t("addresses.emirate")}
                    </FieldLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger
                        id="address-emirate"
                        className="min-h-11 w-full"
                        aria-invalid={fieldState.invalid}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {EMIRATES.map((emirate) => (
                          <SelectItem key={emirate.code} value={emirate.code}>
                            {emirate.name[locale]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Controller
                name="city"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="address-city">{t("addresses.city")}</FieldLabel>
                    <Input
                      {...field}
                      id="address-city"
                      autoComplete="address-level2"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </div>
            <Controller
              name="isDefault"
              control={form.control}
              render={({ field }) => (
                <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm">
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={(value) => field.onChange(Boolean(value))}
                  />
                  {t("addresses.setDefault")}
                </label>
              )}
            />
            {(createAddress.isError || updateAddress.isError) && (
              <p role="alert" className="text-sm text-destructive">
                {t("saveError")}
              </p>
            )}
            <div className="flex flex-wrap gap-3">
              <Button type="submit" disabled={saving}>
                {saving ? t("addresses.saving") : t("addresses.save")}
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={saving}
                onClick={() => setFormOpen(false)}
              >
                {t("addresses.cancel")}
              </Button>
            </div>
          </FieldGroup>
        </form>
      )}

      {addresses.isLoading ? (
        <div className="mt-8 h-40 animate-pulse bg-ioma-grey-100" aria-busy="true" />
      ) : addresses.isError ? (
        <div className="mt-8" role="alert">
          <p className="text-sm text-destructive">{t("loadError")}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => addresses.refetch()}
          >
            {t("retry")}
          </Button>
        </div>
      ) : addresses.data?.length === 0 ? (
        <p className="mt-8 text-sm text-muted-foreground">{t("addresses.empty")}</p>
      ) : (
        <ul className="mt-8 grid gap-px border border-border bg-border sm:grid-cols-2">
          {addresses.data?.map((address) => (
            <li key={address._id} className="flex flex-col bg-background p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-medium">{address.label}</h2>
                  <p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">
                    {t(`addresses.${address.type}`)}
                  </p>
                </div>
                {address.isDefault && (
                  <span className="border border-border px-2 py-1 text-xs">
                    {t("addresses.defaultBadge")}
                  </span>
                )}
              </div>
              <address className="mt-5 flex-1 text-sm not-italic leading-6 text-muted-foreground">
                {address.fullName}
                <br />
                {address.line1}
                <br />
                {address.line2 ? (
                  <>
                    {address.line2}
                    <br />
                  </>
                ) : null}
                {address.city},{" "}
                {EMIRATES.find((item) => item.code === address.emirate)?.name[locale]}
                <br />
                {address.phone}
              </address>
              <div className="mt-6 flex flex-wrap gap-2 border-t border-border pt-4">
                <Button variant="outline" size="sm" onClick={() => startEdit(address)}>
                  {t("addresses.edit")}
                </Button>
                {!address.isDefault && (
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={updateAddress.isPending}
                    onClick={() =>
                      updateAddress.mutate({
                        id: address._id,
                        input: { ...toInput(address), isDefault: true },
                      })
                    }
                  >
                    {t("addresses.setDefault")}
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => setDeleteTarget(address)}
                >
                  {t("addresses.remove")}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Dialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("addresses.removeTitle")}</DialogTitle>
            <DialogDescription>
              {t("addresses.removeWarning", { label: deleteTarget?.label ?? "" })}
            </DialogDescription>
          </DialogHeader>
          {deleteAddress.isError && (
            <p role="alert" className="text-sm text-destructive">
              {t("deleteError")}
            </p>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">{t("addresses.cancel")}</Button>
            </DialogClose>
            <Button
              variant="destructive"
              disabled={deleteAddress.isPending}
              onClick={() =>
                deleteTarget &&
                deleteAddress.mutate(deleteTarget._id, {
                  onSuccess: () => setDeleteTarget(null),
                })
              }
            >
              {deleteAddress.isPending
                ? t("addresses.removing")
                : t("addresses.removeConfirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
