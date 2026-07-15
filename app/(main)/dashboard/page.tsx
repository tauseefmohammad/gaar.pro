"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";

import {
  Receipt,
  Wallet,
  BriefcaseBusiness,
  ShieldCheck,
  Clock3,
  CheckCircle2,
  AlertTriangle,
  PauseCircle,
  FileClock,
  BadgeCheck,
  Loader2,
} from "lucide-react";
import PageHeader from "@/app/_components/PageHeader";

type DashboardCardProps = {
  title: string;
  icon: any;
  iconBg: string;
  children: React.ReactNode;
};

type StatItemProps = {
  icon: any;
  label: string;
  value: string | number;
  color: string;
};

export default function DashboardPage() {
  const { data: session, status } = useSession();

  const orgId = (session?.user as any)?.orgId;

  const [loading, setLoading] = useState(true);

  const [receivables, setReceivables] = useState<any>(null);
  const [payments, setPayments] = useState<any>(null);
  const [workOrders, setWorkOrders] = useState<any>(null);
  const [amcWorkOrders, setAmcWorkOrders] = useState<any>(null);

  const [fundRequests, setFundRequests] = useState<any[]>([]);
  const [pendingReceivables, setPendingReceivables] = useState<any[]>([]);

  const pendingApprovalFRs = useMemo(() => {
    return fundRequests.filter((item) => item.status === "PENDING_APPROVAL");
  }, [fundRequests]);

  const pendingAuthorizationFRs = useMemo(() => {
    return fundRequests.filter(
      (item) => item.status === "PENDING_AUTHORIZATION",
    );
  }, [fundRequests]);

  useEffect(() => {
    if (status !== "authenticated" || !orgId) return;

    const fetchDashboard = async () => {
      try {
        setLoading(true);

        const [
          receivableRes,
          paymentRes,
          workOrderRes,
          amcWorkOrderRes,
          fundRequestRes,
          filteredReceivableRes,
        ] = await Promise.all([
          fetch(`/api/receivable/dashboard?orgId=${orgId}`),
          fetch(`/api/payment/dashboard?orgId=${orgId}`),
          fetch(`/api/work-order/dashboard?orgId=${orgId}`),
          fetch(`/api/work-order/dashboard/amc?orgId=${orgId}`),
          fetch(`/api/fund-request/filtered?orgId=${orgId}`),
          fetch(`/api/receivable/dashboard/filtered?orgId=${orgId}`),
        ]);

        const [
          receivableData,
          paymentData,
          workOrderData,
          amcWorkOrderData,
          fundRequestData,
          filteredReceivableData,
        ] = await Promise.all([
          receivableRes.json(),
          paymentRes.json(),
          workOrderRes.json(),
          amcWorkOrderRes.json(),
          fundRequestRes.json(),
          filteredReceivableRes.json(),
        ]);

        setReceivables(receivableData);
        setPayments(paymentData);
        setWorkOrders(workOrderData);
        setAmcWorkOrders(amcWorkOrderData);

        const getArrayData = (response: any) => {
          if (Array.isArray(response)) {
            return response;
          }

          if (Array.isArray(response?.data)) {
            return response.data;
          }

          return [];
        };

        setFundRequests(getArrayData(fundRequestData));

        const sortedReceivables = (filteredReceivableData.data || []).sort(
          (a: any, b: any) =>
            new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
        );

        setPendingReceivables(sortedReceivables);
      } catch (error) {
        console.error("Dashboard Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [status, orgId]);

  if (status === "loading" || loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-cyan-700" />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-cyan-700" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 space-y-4 px-0 md:px-4 lg:px-8">
      {/* Header */}
      <PageHeader title="Dashboard" />
      <div className="mb-8"></div>

      {/* Top Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        {/* Receivables */}
        <DashboardCard
          title="Receivables"
          icon={Receipt}
          iconBg="bg-emerald-600"
        >
          <StatItem
            icon={Wallet}
            label="Total"
            value={`₹${receivables?.totalReceivableAmount || 0}`}
            color="bg-slate-700"
          />

          <StatItem
            icon={CheckCircle2}
            label="Received"
            value={`₹${receivables?.totalReceivedAmount || 0}`}
            color="bg-emerald-600"
          />

          <StatItem
            icon={Clock3}
            label="Pending"
            value={`₹${receivables?.totalBalanceReceivableAmount || 0}`}
            color="bg-amber-500"
          />

          <StatItem
            icon={AlertTriangle}
            label="Past Due Date"
            value={`${receivables?.totalPastDueDateReceivables || 0}`}
            color="bg-red-500"
          />
        </DashboardCard>

        {/* Payments */}
        <DashboardCard title="Payments" icon={Wallet} iconBg="bg-blue-600">
          <StatItem
            icon={Wallet}
            label="Total"
            value={`₹${payments?.totalPaymentAmount || 0}`}
            color="bg-slate-700"
          />

          <StatItem
            icon={CheckCircle2}
            label="Paid"
            value={`₹${payments?.totalPaidAmount || 0}`}
            color="bg-blue-600"
          />

          <StatItem
            icon={Clock3}
            label="Pending"
            value={`₹${payments?.totalBalancePaymentAmount || 0}`}
            color="bg-amber-500"
          />

          <StatItem
            icon={AlertTriangle}
            label="Past Due Date"
            value={`${payments?.totalPastDueDatePayments || 0}`}
            color="bg-red-500"
          />
        </DashboardCard>

        {/* Work Orders */}
        <DashboardCard
          title="Work Orders"
          icon={BriefcaseBusiness}
          iconBg="bg-violet-600"
        >
          <StatItem
            icon={BriefcaseBusiness}
            label="Total"
            value={workOrders?.totalWorkOrders || 0}
            color="bg-slate-700"
          />

          <StatItem
            icon={BadgeCheck}
            label="Live"
            value={workOrders?.totalPendingWorkOrders || 0}
            color="bg-green-600"
          />

          <StatItem
            icon={CheckCircle2}
            label="Completed"
            value={workOrders?.totalCompletedWorkOrders || 0}
            color="bg-blue-600"
          />

          <StatItem
            icon={PauseCircle}
            label="Suspended"
            value={workOrders?.totalOverdueWorkOrders || 0}
            color="bg-red-500"
          />
        </DashboardCard>

        {/* AMC Work Orders */}
        <DashboardCard
          title="AMC Work Orders"
          icon={ShieldCheck}
          iconBg="bg-cyan-600"
        >
          <StatItem
            icon={ShieldCheck}
            label="Total"
            value={amcWorkOrders?.totalWorkOrders || 0}
            color="bg-slate-700"
          />

          <StatItem
            icon={BadgeCheck}
            label="Live"
            value={amcWorkOrders?.totalPendingWorkOrders || 0}
            color="bg-green-600"
          />

          <StatItem
            icon={CheckCircle2}
            label="Completed"
            value={amcWorkOrders?.totalCompletedWorkOrders || 0}
            color="bg-cyan-600"
          />
        </DashboardCard>
      </div>

      {/* Bottom Layout */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Pending Approval */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-2xl bg-amber-500 p-3">
                <FileClock className="h-5 w-5 text-white" />
              </div>

              <h2 className="text-lg font-semibold text-slate-800">
                Pending Approval FR&apos;s
              </h2>
            </div>

            <div className="space-y-3">
              {pendingApprovalFRs.length === 0 && (
                <p className="text-sm text-slate-500">No pending approvals</p>
              )}

              {pendingApprovalFRs.map((item: any) => (
                <div
                  key={item._id}
                  className="flex items-center justify-between rounded-2xl border border-slate-200 p-4"
                >
                  <div>
                    <p className="font-semibold text-slate-800">
                      {item.frNumber}
                    </p>

                    <p className="text-sm text-slate-500">
                      {item.requestedByName}
                    </p>
                  </div>

                  <span className="font-semibold text-amber-600">
                    ₹{item.amount}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Pending Authorization */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-2xl bg-rose-500 p-3">
                <ShieldCheck className="h-5 w-5 text-white" />
              </div>

              <h2 className="text-lg font-semibold text-slate-800">
                Pending Authorization FR&apos;s
              </h2>
            </div>

            <div className="space-y-3">
              {pendingAuthorizationFRs.length === 0 && (
                <p className="text-sm text-slate-500">
                  No pending authorizations
                </p>
              )}

              {pendingAuthorizationFRs.map((item: any) => (
                <div
                  key={item._id}
                  className="flex items-center justify-between rounded-2xl border border-slate-200 p-4"
                >
                  <div>
                    <p className="font-semibold text-slate-800">{item.frNo}</p>

                    <p className="text-sm text-slate-500">
                      {item.requestedByName}
                    </p>
                  </div>

                  <span className="font-semibold text-rose-600">
                    ₹{item.amount}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-2xl bg-red-500 p-3">
              <AlertTriangle className="h-5 w-5 text-white" />
            </div>

            <h2 className="text-lg font-semibold text-slate-800">
              Pending Receivables
            </h2>
          </div>

          <div className="space-y-4">
            {pendingReceivables.length === 0 && (
              <p className="text-sm text-slate-500">No pending receivables</p>
            )}

            {pendingReceivables.map((item: any) => (
              <div
                key={item._id}
                className="rounded-2xl border border-red-100 bg-red-50 p-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-800">
                      {item.paymentFrom}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      {item.invoiceNumber}
                    </p>
                  </div>

                  <span className="font-bold text-red-600">
                    ₹{item.balanceReceivableAmount}
                  </span>
                </div>

                <div className="mt-3 flex items-center gap-2 text-sm text-red-600">
                  <Clock3 className="h-4 w-4" />
                  Due Date: {new Date(item.dueDate).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   Components                               */
/* -------------------------------------------------------------------------- */

function DashboardCard({
  title,
  icon: Icon,
  iconBg,
  children,
}: DashboardCardProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="mb-5 flex items-center gap-3">
        <div className={`rounded-2xl p-3 ${iconBg}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>

        <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
      </div>

      <div className="space-y-3">{children}</div>
    </div>
  );
}

function StatItem({ icon: Icon, label, value, color }: StatItemProps) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-3">
      <div className="flex items-center gap-3">
        <div className={`rounded-xl p-2 ${color}`}>
          <Icon className="h-4 w-4 text-white" />
        </div>

        <span className="text-sm font-medium text-slate-600">{label}</span>
      </div>

      <span className="text-sm font-bold text-slate-800">{value}</span>
    </div>
  );
}
