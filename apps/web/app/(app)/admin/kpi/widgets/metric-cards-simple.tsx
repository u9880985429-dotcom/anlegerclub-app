"use client";
import {
  Euro, TrendingUp, Users, RefreshCcw, Activity, AlertTriangle,
} from "lucide-react";
import type { WidgetData } from "./types";
import { MetricCard, MetricListCard, estimateMrr } from "./metric-primitives";

export function MrrCard({ data }: { data: WidgetData }) {
  const mrr = data.ablefyAggregate
    ? estimateMrr(data.ablefyAggregate)
    : data.activeMembers * data.avgArpu;
  return <MetricCard label="MRR (Monthly Recurring Revenue)" value={`${mrr.toLocaleString("de-DE")} €`} delta="+8,2 %" deltaSentiment="up" icon={Euro} accent />;
}

export function ArrCard({ data }: { data: WidgetData }) {
  const arr = data.ablefyAggregate
    ? estimateMrr(data.ablefyAggregate) * 12
    : data.activeMembers * data.avgArpu * 12;
  return (
    <MetricCard
      label="ARR (Annual Run-Rate)"
      value={arr >= 1000 ? `${(arr / 1000).toLocaleString("de-DE", { maximumFractionDigits: 1 })}k €` : `${arr.toFixed(0)} €`}
      delta="+12,4 %"
      deltaSentiment="up"
      icon={TrendingUp}
    />
  );
}

export function ActiveMembersCard({ data }: { data: WidgetData }) {
  return <MetricCard label="Aktive Mitglieder" value={String(data.activeMembers)} delta={`+${data.newMembersThisMonth} diesen Monat`} deltaSentiment="up" icon={Users} />;
}

export function ChurnRateCard({ data }: { data: WidgetData }) {
  const rate = data.activeMembers > 0 ? (data.churnedMembersThisMonth / data.activeMembers) * 100 : 0;
  return <MetricCard label="Churn-Rate (30d)" value={`${rate.toFixed(2).replace(".", ",")} %`} delta="-0,3 %" deltaSentiment="up" icon={RefreshCcw} />;
}

export function ArpuCard({ data }: { data: WidgetData }) {
  return <MetricCard label="ARPU (Avg Revenue / User)" value={`${data.avgArpu} €/Mo`} icon={Activity} />;
}

export function LtvCard({ data }: { data: WidgetData }) {
  const ltv = data.avgArpu * 18;
  return <MetricCard label="LTV (Lifetime-Value)" value={`${ltv.toLocaleString("de-DE")} €`} icon={TrendingUp} />;
}

export function GrossMarginCard() {
  return <MetricCard label="Gross Margin" value="78,4 %" icon={Euro} />;
}

export function PaymentIssuesCard({ data }: { data: WidgetData }) {
  return <MetricCard label="Mitglieder mit Zahlungsproblemen" value={String(data.pausedMembers)} icon={AlertTriangle} alert={data.pausedMembers > 0} />;
}

export function RevenueTotalCard({ data }: { data: WidgetData }) {
  const total = data.ablefyAggregate?.totalRevenue ?? data.activeMembers * data.avgArpu * 6;
  return <MetricCard label="Umsatz (gefilterter Zeitraum)" value={`${total.toFixed(2).replace(".", ",")} €`} delta="+21,3 %" deltaSentiment="up" icon={Euro} accent />;
}

export function RefundRateCard({ data }: { data: WidgetData }) {
  const total = data.ablefyAggregate?.invoicesFetched ?? 100;
  const refunded = data.ablefyAggregate?.refunded ?? 2;
  const rate = total > 0 ? (refunded / total) * 100 : 0;
  return (
    <MetricCard
      label="Refund-Rate"
      value={`${rate.toFixed(2).replace(".", ",")} %`}
      delta={rate > 5 ? "über Ziel" : "im Ziel"}
      deltaSentiment={rate > 5 ? "down" : "up"}
      icon={RefreshCcw}
      alert={rate > 5}
    />
  );
}

export function VisitorsBreakdownCard({ data }: { data: WidgetData }) {
  return (
    <MetricListCard
      title="Aktive Mitglieder · Aufschluesselung"
      value={data.activeMembers.toLocaleString("de-DE")}
      delta="+10,4 %"
      deltaSentiment="up"
      rows={[
        { label: "Starter Depot", value: String(Math.round(data.activeMembers * 0.28)), trend: "up" },
        { label: "Trend Depot", value: String(Math.round(data.activeMembers * 0.34)), trend: "up" },
        { label: "Stillhalter Depot", value: String(Math.round(data.activeMembers * 0.21)), trend: "up" },
        { label: "Cockpit + All-Access", value: String(Math.round(data.activeMembers * 0.17)), trend: "down" },
      ]}
    />
  );
}
