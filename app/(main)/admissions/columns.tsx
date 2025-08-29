"use client";

import { ColumnDef } from "@tanstack/react-table";
import { AdmissionResponse } from "@/types/admission";
import { MoreHorizontal, Edit, ClipboardPenLineIcon } from "lucide-react";

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

export const columns: ColumnDef<AdmissionResponse>[] = [
  {
    accessorKey: "id",
    header: "ID",
    enableSorting: true,
    enableColumnFilter: true,
  },
  {
    accessorKey: "patient_name",
    header: "Patient Name",
    enableSorting: true,
    enableColumnFilter: true,
  },
  {
    accessorKey: "admission_type",
    header: "Type",
    enableSorting: true,
    enableColumnFilter: true,
  },
  {
    accessorKey: "admission_reason",
    header: "Reason",
    enableSorting: false,
    enableColumnFilter: true,
  },
  {
    accessorKey: "ward",
    header: "Ward",
    enableSorting: true,
    enableColumnFilter: true,
  },
  {
    accessorKey: "bed_no",
    header: "Bed No",
    enableSorting: true,
    enableColumnFilter: true,
  },
  {
    accessorKey: "status",
    header: "Status",
    enableSorting: true,
    enableColumnFilter: true,
  },
  {
    accessorKey: "admission_date",
    header: "Admission Date",
    enableSorting: true,
    cell: ({ row }) => {
      const date = row.getValue("admission_date") as string;
      return date ? new Date(date).toLocaleString() : "-";
    },
    sortingFn: (rowA, rowB, columnId) => {
      const dateA = rowA.getValue(columnId) as string;
      const dateB = rowB.getValue(columnId) as string;
      return new Date(dateA).getTime() - new Date(dateB).getTime();
    },
    enableColumnFilter: false,
  },

  // {
  //   accessorKey: "organization_id",
  //   header: "Organization ID",
  //   enableSorting: true,
  //   enableColumnFilter: true,
  // },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const admission = row.original;

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
              onClick={() => navigator.clipboard.writeText(admission.id ?? "")}
            >
              Copy Admission ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/admissions/edit/${admission.id}`}>
                <Edit className="mr-2 h-4 w-4" /> Edit Admission
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/notes/${admission.id}`}>
                <ClipboardPenLineIcon className="mr-2 h-4 w-4" /> Add Notes
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
