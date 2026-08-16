"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  ShoppingBag,
  Package,
  MapPin,
  ArrowUpRight,
  TrendingUp,
  Clock,
  Sparkles,
} from "lucide-react";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-heading text-3xl font-light tracking-tight text-ioma-black md:text-4xl">
          Platform Overview
        </h1>
        <p className="mt-2 text-ioma-grey-500">
          Executive control panel & real-time operational metrics for IOMA Paris Dubai.
        </p>
      </div>

      {/* KPI Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-ioma-gold">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs uppercase font-medium text-ioma-grey-500">
              Pending B2B Applications
            </CardTitle>
            <Users className="h-4 w-4 text-ioma-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-light font-heading">3</div>
            <p className="text-xs text-ioma-grey-500 mt-1 flex items-center gap-1">
              <Clock className="h-3 w-3 text-amber-500" />
              Requires admin review
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-ioma-black">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs uppercase font-medium text-ioma-grey-500">
              Total Orders
            </CardTitle>
            <ShoppingBag className="h-4 w-4 text-ioma-black" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-light font-heading">14</div>
            <p className="text-xs text-ioma-grey-500 mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-emerald-500" />
              B2C + B2B Wholesale
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-600">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs uppercase font-medium text-ioma-grey-500">
              Partner Clinics
            </CardTitle>
            <MapPin className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-light font-heading">5</div>
            <p className="text-xs text-ioma-grey-500 mt-1">Dubai, Abu Dhabi, Sharjah</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-600">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs uppercase font-medium text-ioma-grey-500">
              Catalog SKUs
            </CardTitle>
            <Package className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-light font-heading">14</div>
            <p className="text-xs text-ioma-grey-500 mt-1">Retail & Cabin Formulas</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Action Shortcuts */}
      <div className="space-y-4">
        <h2 className="font-heading text-xl font-light">Management Shortcuts</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="hover:border-ioma-black transition-colors">
            <CardHeader>
              <CardTitle className="text-base font-normal flex items-center justify-between">
                <span>B2B Applicant Review</span>
                <Users className="h-4 w-4 text-ioma-grey-400" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-ioma-grey-500">
                Review pending trade licences, approve clinics, or request supplementary
                documents.
              </p>
              <Button size="sm" asChild variant="outline" className="w-full">
                <Link href="/admin/professionals">
                  Review Applications
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:border-ioma-black transition-colors">
            <CardHeader>
              <CardTitle className="text-base font-normal flex items-center justify-between">
                <span>Catalog & Stock Manager</span>
                <Package className="h-4 w-4 text-ioma-grey-400" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-ioma-grey-500">
                Manage products, inventory quantities, B2C prices, and B2B wholesale
                pricing.
              </p>
              <Button size="sm" asChild variant="outline" className="w-full">
                <Link href="/admin/products">
                  Manage Products
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:border-ioma-black transition-colors">
            <CardHeader>
              <CardTitle className="text-base font-normal flex items-center justify-between">
                <span>Audit & Security Logs</span>
                <Sparkles className="h-4 w-4 text-ioma-gold" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-ioma-grey-500">
                Inspect system audit history, administrative changes, and user actions.
              </p>
              <Button size="sm" asChild variant="outline" className="w-full">
                <Link href="/admin/audit">
                  View Audit Trail
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
