"use client";

import { ColumnDef } from "@tanstack/react-table";
import { PatientResponse } from "@/types/patient";
import { MoreHorizontal, Edit, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

export const columns: ColumnDef<PatientResponse>[] = [
  {
    accessorKey: "id",
    header: "id",
    enableSorting: true,
    enableColumnFilter: true,
  },
  {
    accessorKey: "patient_name",
    header: "Name",
    enableSorting: true,
    enableColumnFilter: true,
  },
  {
    accessorKey: "patient_id",
    header: "Patient ID",
    enableSorting: true,
    enableColumnFilter: true,
  },
  {
    accessorKey: "patient_sex",
    header: "Sex",
    enableSorting: true,
    enableColumnFilter: false, // Filtering not practical for sex (limited values)
  },
  {
    accessorKey: "patient_birth_date",
    header: "Birth Date",
    enableSorting: true,
    cell: ({ row }) => {
      const raw = row.getValue("patient_birth_date") as string | undefined;

      if (!raw) return "-"; // no value

      // Expect format yyyyMMdd (e.g., 19881010)
      if (/^\d{8}$/.test(raw)) {
        const year = parseInt(raw.slice(0, 4));
        const month = parseInt(raw.slice(4, 6)) - 1; // JS months are 0-based
        const day = parseInt(raw.slice(6, 8));
        const parsed = new Date(year, month, day);

        return parsed.toLocaleDateString();
      }

      return "-"; // fallback for invalid format
    },
    sortingFn: (rowA, rowB, columnId) => {
      const dateA = rowA.getValue(columnId) as string;
      const dateB = rowB.getValue(columnId) as string;
      return dateA && dateB
        ? new Date(dateA).getTime() - new Date(dateB).getTime()
        : dateA
        ? -1
        : dateB
        ? 1
        : 0;
    },
    enableColumnFilter: false, // Filtering not practical for dates
  },
  {
    accessorKey: "mobile_no",
    header: "Mobile",
    enableSorting: true,
    enableColumnFilter: true,
  },
  {
    accessorKey: "abha_no",
    header: "ABHA Number",
    enableSorting: true,
    enableColumnFilter: true,
  },
  {
    accessorKey: "last_updated",
    header: "Last Updated",
    enableSorting: true,
    cell: ({ row }) => {
      const date = row.getValue("last_updated") as string;
      return new Date(date).toLocaleString();
    },
    sortingFn: (rowA, rowB, columnId) => {
      const dateA = rowA.getValue(columnId) as string;
      const dateB = rowB.getValue(columnId) as string;
      return new Date(dateA).getTime() - new Date(dateB).getTime();
    },
    enableColumnFilter: false, // Filtering not practical for timestamps
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const patient = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() =>
                navigator.clipboard.writeText(patient.patient_id ?? "")
              }
            >
              Copy Patient ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/patients/edit/${patient?.id}`}>
                <Edit className="mr-2 h-4 w-4" /> Edit Patient
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/admissions/add/${patient.id}`}>
                <Plus className="mr-2 h-4 w-4" /> Create Admission
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
    enableSorting: false,
    enableColumnFilter: false,
  },
];
