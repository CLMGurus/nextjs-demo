"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Loader2Icon } from "lucide-react";
import { Patient } from "@/types/patient";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { savePatient } from "@/services/patientService";
import { parse } from "date-fns";
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

const addPatientSchema = z.object({
  patient_name: z.string().min(1, "Patient name is required"),
  patient_id: z.string().optional(),
  patient_sex: z.enum(["Male", "Female", "Other"], {
    message: "Please select a sex",
  }),
  patient_birth_date: z.date().optional(),
  mobile_no: z
    .string()
    .regex(/^\d{10}$/, "Mobile number must be 10 digits")
    .optional(),
  abha_no: z
    .string()
    .regex(/^\d{14}$/, "Abha number must be 14 digits")
    .optional(),
});

type AddPatientSchema = z.infer<typeof addPatientSchema>;

interface PatientFormProps {
  patientData?: Patient;
}

export default function PatientForm({ patientData }: PatientFormProps) {
  const router = useRouter();
  const form = useForm<AddPatientSchema>({
    defaultValues: {
      patient_name: patientData?.patient_name || "",
      patient_id: patientData?.patient_id || "",
      patient_sex: ["Male", "Female", "Other"].includes(
        patientData?.patient_sex as string
      )
        ? (patientData?.patient_sex as "Male" | "Female" | "Other")
        : "Male",
      patient_birth_date: patientData?.patient_birth_date
        ? parse(patientData.patient_birth_date, "yyyyMMdd", new Date())
        : undefined,
      mobile_no: patientData?.mobile_no || "",
      abha_no: patientData?.abha_no || "",
    },
    resolver: zodResolver(addPatientSchema),
  });

  async function onSubmit(values: AddPatientSchema) {
    try {
      const formData = new FormData();

      Object.entries(values).forEach(([key, value]) => {
        if (value) {
          if (key === "patient_birth_date") {
            formData.append(key, format(value as Date, "yyyyMMdd"));
          } else {
            formData.append(key, value as string);
          }
        }
      });

      const result = await savePatient(formData, patientData?.id);

      if (result.success) {
        toast.success(
          patientData?.id
            ? "Patient updated successfully!"
            : "Patient added successfully!"
        );
        router.push("/patients");
      } else {
        toast.error(result.error || "Failed to save patient");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong!");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Patient Name */}
        <FormField
          control={form.control}
          name="patient_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Patient Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Patient ID */}
        <FormField
          control={form.control}
          name="patient_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Patient ID (Optional)</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Sex (RadioGroup) */}
        <FormField
          control={form.control}
          name="patient_sex"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sex</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value || "Male"}
                  className="flex space-x-4"
                >
                  {["Male", "Female", "Other"].map((sex) => (
                    <FormItem key={sex} className="flex items-center space-x-2">
                      <FormControl>
                        <RadioGroupItem value={sex} id={sex.toLowerCase()} />
                      </FormControl>
                      <FormLabel
                        htmlFor={sex.toLowerCase()}
                        className="font-normal"
                      >
                        {sex}
                      </FormLabel>
                    </FormItem>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Birth Date (DatePicker) */}
        <FormField
          control={form.control}
          name="patient_birth_date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Birth Date</FormLabel>
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

        {/* Mobile Number */}
        <FormField
          control={form.control}
          name="mobile_no"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mobile Number</FormLabel>
              <FormControl>
                <Input type="tel" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* ABHA Number */}
        <FormField
          control={form.control}
          name="abha_no"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ABHA Number</FormLabel>
              <FormControl>
                <Input {...field} />
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
