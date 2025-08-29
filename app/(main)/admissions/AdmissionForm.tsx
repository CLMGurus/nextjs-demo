"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Loader2Icon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Patient } from "@/types/patient";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { saveAdmission } from "@/services/admissionService";

const admissionSchema = z.object({
  patient_id: z.string().min(1, "Patient is required"),
  admission_type: z.enum(["inpatient", "outpatient"], {
    message: "Admission type is required",
  }),
  admission_reason: z.string().min(1, "Reason is required"),
  ward: z.string().optional(),
  bed_no: z.string().optional(),
  admission_date: z.date({ error: "Admission date is required" }),
  status: z.enum(["admitted", "discharged"], {
    message: "Status is required",
  }),
});

type AdmissionSchema = z.infer<typeof admissionSchema>;

interface AdmissionFormProps {
  userId: string;
  organizationId: string;
  patients: Array<Patient>;
  admissionData?: Partial<AdmissionSchema> & { id?: string };
}

export default function AdmissionForm({
  userId,
  admissionData,
  organizationId,
  patients,
}: AdmissionFormProps) {
  const router = useRouter();

  const form = useForm<AdmissionSchema>({
    defaultValues: {
      patient_id: admissionData?.patient_id || "",
      admission_type:
        (admissionData?.admission_type as "inpatient" | "outpatient") ||
        "inpatient",
      admission_reason: admissionData?.admission_reason || "",
      ward: admissionData?.ward || "",
      bed_no: admissionData?.bed_no || "",
      admission_date: admissionData?.admission_date
        ? new Date(admissionData.admission_date)
        : new Date(),
      status:
        (admissionData?.status as "admitted" | "discharged") || "admitted",
    },
    resolver: zodResolver(admissionSchema),
  });

  async function onSubmit(values: AdmissionSchema) {
    try {
      const formData = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        if (value) {
          if (key === "admission_date") {
            formData.append(key, format(value as Date, "yyyy-MM-dd"));
          } else {
            formData.append(key, value as string);
          }
        }
      });
      formData.append("organization_id", organizationId);
      formData.append("created_by", userId);

      const result = await saveAdmission(formData, admissionData?.id);

      if (result.success) {
        toast.success(
          admissionData?.id
            ? "Admission updated successfully!"
            : "Admission created successfully!"
        );
        router.push(`/admissions`);
      } else {
        toast.error(result.error || "Failed to save admission");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong!");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Patient Selection using Popover */}
        <FormField
          control={form.control}
          name="patient_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Patient</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={field.value ? "true" : "false"}
                    className="justify-between"
                  >
                    {patients.find((p) => p.id === field.value)?.patient_name ||
                      "Select a patient..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>

                <PopoverContent className="w-[300px] p-0">
                  <Command>
                    <CommandInput
                      placeholder="Search patients by id..."
                      className="h-9"
                    />
                    <CommandList>
                      <CommandEmpty>No patient found.</CommandEmpty>
                      <CommandGroup>
                        {patients.map((p) => (
                          <CommandItem
                            key={p.id}
                            value={p.id} // <-- set the ID here
                            onSelect={(currentValue) => {
                              field.onChange(currentValue); // <-- set the ID
                            }}
                          >
                            {p.patient_name} ({p.id})
                            <Check
                              className={cn(
                                "ml-auto",
                                field.value === p.id // <-- compare with ID
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Admission Type */}
        <FormField
          control={form.control}
          name="admission_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Admission Type</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value}
                  className="flex space-x-4"
                >
                  {["inpatient", "outpatient"].map((type) => (
                    <FormItem
                      key={type}
                      className="flex items-center space-x-2"
                    >
                      <FormControl>
                        <RadioGroupItem value={type} id={type} />
                      </FormControl>
                      <FormLabel htmlFor={type} className="font-normal">
                        {type}
                      </FormLabel>
                    </FormItem>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Admission Reason */}
        <FormField
          control={form.control}
          name="admission_reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Admission Reason</FormLabel>
              <FormControl>
                <Input placeholder="Reason for admission" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Ward */}
        <FormField
          control={form.control}
          name="ward"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ward</FormLabel>
              <FormControl>
                <Input placeholder="Ward name/number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Bed No */}
        <FormField
          control={form.control}
          name="bed_no"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bed No</FormLabel>
              <FormControl>
                <Input placeholder="Bed number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Admission Date */}
        <FormField
          control={form.control}
          name="admission_date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Admission Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-[240px] pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? format(field.value, "PPP") : "Pick a date"}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    captionLayout="dropdown"
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Status */}
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value}
                  className="flex space-x-4"
                >
                  {["admitted", "discharged"].map((status) => (
                    <FormItem
                      key={status}
                      className="flex items-center space-x-2"
                    >
                      <FormControl>
                        <RadioGroupItem value={status} id={status} />
                      </FormControl>
                      <FormLabel htmlFor={status} className="font-normal">
                        {status}
                      </FormLabel>
                    </FormItem>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting && (
            <Loader2Icon className="animate-spin" />
          )}
          Save
        </Button>
      </form>
    </Form>
  );
}
