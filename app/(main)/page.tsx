"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Stethoscope, Users, Activity, Calendar, User } from "lucide-react";

export default function DashboardPage() {
  const patients = [
    {
      id: "P001",
      name: "John Doe",
      age: 45,
      doctor: "Dr. Smith",
      status: "Admitted",
      date: "2025-08-20",
    },
    {
      id: "P002",
      name: "Jane Roe",
      age: 30,
      doctor: "Dr. Adams",
      status: "Discharged",
      date: "2025-08-19",
    },
    {
      id: "P003",
      name: "Sam Lee",
      age: 60,
      doctor: "Dr. Brown",
      status: "In Treatment",
      date: "2025-08-21",
    },
  ];

  const appointments = [
    {
      id: "A101",
      patient: "Mark White",
      doctor: "Dr. Evans",
      time: "10:30 AM",
    },
    {
      id: "A102",
      patient: "Anna Black",
      doctor: "Dr. Adams",
      time: "11:15 AM",
    },
    {
      id: "A103",
      patient: "Chris Green",
      doctor: "Dr. Brown",
      time: "12:00 PM",
    },
  ];

  return (
    <div className="flex min-h-screen">
      {/* Main Content */}
      <div className="flex-1 p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <div className="flex items-center space-x-3">
            <span className="text-gray-600">Admin</span>
            <User className="h-8 w-8 rounded-full p-1" />
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card className="shadow-sm border-l-4 border-blue-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total Patients
              </CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,245</div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-l-4 border-green-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Doctors</CardTitle>
              <Stethoscope className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">48</div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-l-4 border-purple-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Appointments Today
              </CardTitle>
              <Calendar className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">132</div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-l-4 border-red-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                ICU Occupancy
              </CardTitle>
              <Activity className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">76%</div>
            </CardContent>
          </Card>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recent Patients */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Patients</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Age</TableHead>
                    <TableHead>Doctor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patients.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>{p.id}</TableCell>
                      <TableCell>{p.name}</TableCell>
                      <TableCell>{p.age}</TableCell>
                      <TableCell>{p.doctor}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            p.status === "Admitted"
                              ? "bg-blue-100 text-blue-700"
                              : p.status === "Discharged"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {p.status}
                        </span>
                      </TableCell>
                      <TableCell>{p.date}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Upcoming Appointments */}
          <Card>
            <CardHeader>
              <CardTitle>Today&apos;s Appointments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {appointments.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50"
                >
                  <div>
                    <div className="font-medium">{a.patient}</div>
                    <div className="text-sm text-gray-500">{a.doctor}</div>
                  </div>
                  <span className="text-sm font-semibold text-blue-600">
                    {a.time}
                  </span>
                </div>
              ))}
              <Button className="w-full mt-2">View All Appointments</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
