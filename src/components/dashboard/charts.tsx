"use client";

import { ChevronDown } from "lucide-react";
import { Area, AreaChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const appData = [
  { month: "Jan", value: 1300 },
  { month: "Feb", value: 2200 },
  { month: "Mar", value: 3700 },
  { month: "Apr", value: 4500 },
  { month: "May", value: 5050 },
  { month: "Jun", value: 6200 },
  { month: "Jul", value: 7200 }
];

const paymentData = [
  { name: "M-Pesa", value: 542300, percent: "43.4%", color: "#F5B82E" },
  { name: "Airtel Money", value: 256120, percent: "20.5%", color: "#2D9CDB" },
  { name: "Orange Money", value: 198450, percent: "15.9%", color: "#E5574F" },
  { name: "Bank Transfer", value: 201880, percent: "16.2%", color: "#32C76A" },
  { name: "Other", value: 49000, percent: "3.9%", color: "#8A96A6" }
];

const provinces = [
  ["Kinshasa", "6,245", "bg-kcs-goldLight"],
  ["Haut-Katanga", "3,456", "bg-kcs-gold"],
  ["Lualaba", "2,987", "bg-kcs-gold2"],
  ["Nord-Kivu", "2,450", "bg-[#C8A85C]"],
  ["South-Kivu", "2,230", "bg-[#E8B93F]"],
  ["Other", "7,221", "bg-[#6C7887]"]
];

export function ApplicationsChart() {
  return (
    <section className="premium-panel rounded-xl p-5">
      <PanelHeader title="Applications Overview" action="This Year" />
      <div className="mt-4 h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={appData} margin={{ left: -18, right: 8, top: 8, bottom: 0 }}>
            <defs>
              <linearGradient id="goldArea" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#F5B82E" stopOpacity={0.48} />
                <stop offset="100%" stopColor="#F5B82E" stopOpacity={0.03} />
              </linearGradient>
            </defs>
            <XAxis dataKey="month" tickLine={false} axisLine={{ stroke: "rgba(255,255,255,0.10)" }} tick={{ fill: "#D5DEEA", fontSize: 12 }} />
            <YAxis tickFormatter={(value) => `${Number(value) / 1000}K`} tickLine={false} axisLine={false} tick={{ fill: "#D5DEEA", fontSize: 12 }} />
            <Tooltip contentStyle={{ background: "#081B30", border: "1px solid rgba(255,255,255,.12)", borderRadius: 8, color: "#fff" }} />
            <Area type="monotone" dataKey="value" stroke="#F5B82E" strokeWidth={2} fill="url(#goldArea)" dot={{ r: 4, fill: "#F5B82E", stroke: "#FFD96A" }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

export function ProvincePanel() {
  return (
    <section className="premium-panel rounded-xl p-5">
      <PanelHeader title="Applications by Province" />
      <div className="mt-4 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="relative min-h-[230px] overflow-hidden rounded-lg border border-white/5 bg-[#07182B]">
          <div className="absolute inset-7 rounded-[45%_40%_46%_44%] border border-kcs-gold/35 bg-gradient-to-br from-kcs-gold/60 via-kcs-gold2/25 to-transparent shadow-glow" />
          <div className="absolute left-[18%] top-[19%] h-20 w-20 rounded-[42%] border border-kcs-gold/40 bg-black/20" />
          <div className="absolute bottom-[14%] right-[21%] h-28 w-24 rounded-[44%] border border-kcs-gold/40 bg-kcs-gold/35" />
          <div className="absolute right-[15%] top-[10%] h-24 w-24 rounded-[48%] bg-kcs-goldLight/70 blur-[1px]" />
          <p className="absolute bottom-4 left-5 text-xs font-medium text-kcs-muted">DRC provincial distribution</p>
        </div>
        <div className="space-y-4 self-center">
          {provinces.map(([name, value, color]) => (
            <div key={name} className="flex items-center justify-between gap-4 text-sm">
              <span className="flex items-center gap-3 text-kcs-text/90">
                <span className={`h-3 w-3 rounded-full ${color}`} />
                {name}
              </span>
              <span className="font-medium text-white">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function PaymentDonut() {
  return (
    <section className="premium-panel rounded-xl p-5">
      <PanelHeader title="Payment Summary" />
      <div className="mt-5 grid gap-5 md:grid-cols-[240px_1fr]">
        <div className="relative h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={paymentData} dataKey="value" innerRadius={66} outerRadius={108} paddingAngle={1}>
                {paymentData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} stroke="#061426" strokeWidth={1} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 grid place-items-center text-center">
            <div>
              <p className="text-sm text-kcs-muted">Total</p>
              <p className="font-bold">$1,248,750</p>
            </div>
          </div>
        </div>
        <div className="space-y-5 self-center">
          {paymentData.map((item) => (
            <div key={item.name} className="grid grid-cols-[1fr_auto_auto] items-center gap-4 text-sm">
              <span className="flex items-center gap-3 text-kcs-text/90">
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                {item.name}
              </span>
              <span className="font-medium">${item.value.toLocaleString()}</span>
              <span className="w-12 text-right text-kcs-muted">{item.percent}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PanelHeader({ title, action }: { title: string; action?: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <h2 className="text-lg font-bold">{title}</h2>
      {action && (
        <button className="flex h-9 items-center gap-3 rounded-lg border border-white/10 bg-white/[0.025] px-4 text-sm">
          {action}
          <ChevronDown className="h-4 w-4 text-kcs-muted" />
        </button>
      )}
    </div>
  );
}
