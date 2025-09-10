"use client"

import * as React from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  date?: Date
  onDateChange?: (date: Date | undefined) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function DatePicker({
  date,
  onDateChange,
  placeholder = "Selecionar data",
  className,
  disabled = false
}: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "dd/MM/yyyy", { locale: ptBR }) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={onDateChange}
          initialFocus
          locale={ptBR}
        />
      </PopoverContent>
    </Popover>
  )
}

interface DateRangePickerProps {
  dateFrom?: Date
  dateTo?: Date
  onDateFromChange?: (date: Date | undefined) => void
  onDateToChange?: (date: Date | undefined) => void
  placeholderFrom?: string
  placeholderTo?: string
  className?: string
  disabled?: boolean
}

export function DateRangePicker({
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  placeholderFrom = "Data inicial",
  placeholderTo = "Data final",
  className,
  disabled = false
}: DateRangePickerProps) {
  return (
    <div className={cn("flex gap-2", className)}>
      <DatePicker
        date={dateFrom}
        onDateChange={onDateFromChange}
        placeholder={placeholderFrom}
        disabled={disabled}
        className="flex-1"
      />
      <DatePicker
        date={dateTo}
        onDateChange={onDateToChange}
        placeholder={placeholderTo}
        disabled={disabled}
        className="flex-1"
      />
    </div>
  )
}