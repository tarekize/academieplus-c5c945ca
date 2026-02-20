import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker, CaptionProps } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function CustomCaption({ displayMonth }: CaptionProps) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
  const months = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
  ];

  return (
    <div className="flex gap-2 justify-center mb-2">
      <Select
        value={months[displayMonth.getMonth()]}
        onValueChange={(value) => {
          const monthIndex = months.indexOf(value);
          const newDate = new Date(displayMonth.getFullYear(), monthIndex, 1);
          // This is handled by react-day-picker internally
        }}
      >
        <SelectTrigger className="w-[120px] h-8">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {months.map((month) => (
            <SelectItem key={month} value={month}>
              {month}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Select
        value={displayMonth.getFullYear().toString()}
        onValueChange={(value) => {
          const newDate = new Date(parseInt(value), displayMonth.getMonth(), 1);
          // This is handled by react-day-picker internally
        }}
      >
        <SelectTrigger className="w-[100px] h-8">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="max-h-[200px]">
          {years.map((year) => (
            <SelectItem key={year} value={year.toString()}>
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  const [month, setMonth] = React.useState<Date>(props.selected as Date || new Date());

  const handleMonthChange = (value: string) => {
    const months = [
      "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
      "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
    ];
    const monthIndex = months.indexOf(value);
    const newDate = new Date(month.getFullYear(), monthIndex, 1);
    setMonth(newDate);
  };

  const handleYearChange = (value: string) => {
    const newDate = new Date(parseInt(value), month.getMonth(), 1);
    setMonth(newDate);
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
  const months = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
  ];

  return (
    <div className="space-y-3">
      <div className="flex gap-2 justify-center">
        <Select value={months[month.getMonth()]} onValueChange={handleMonthChange}>
          <SelectTrigger className="w-[120px] h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {months.map((monthName) => (
              <SelectItem key={monthName} value={monthName}>
                {monthName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={month.getFullYear().toString()} onValueChange={handleYearChange}>
          <SelectTrigger className="w-[100px] h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-h-[200px]">
            {years.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <DayPicker
        month={month}
        onMonthChange={setMonth}
        showOutsideDays={showOutsideDays}
        className={cn("p-3", className)}
        classNames={{
          months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
          month: "space-y-4",
          caption: "hidden",
          caption_label: "text-sm font-medium",
          nav: "hidden",
          nav_button: cn(
            buttonVariants({ variant: "outline" }),
            "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
          ),
          nav_button_previous: "absolute left-1",
          nav_button_next: "absolute right-1",
          table: "w-full border-collapse space-y-1",
          head_row: "flex",
          head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
          row: "flex w-full mt-2",
          cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
          day: cn(buttonVariants({ variant: "ghost" }), "h-9 w-9 p-0 font-normal aria-selected:opacity-100"),
          day_range_end: "day-range-end",
          day_selected:
            "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
          day_today: "bg-accent text-accent-foreground",
          day_outside:
            "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
          day_disabled: "text-muted-foreground opacity-50",
          day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
          day_hidden: "invisible",
          ...classNames,
        }}
        components={{
          IconLeft: ({ ..._props }) => <ChevronLeft className="h-4 w-4" />,
          IconRight: ({ ..._props }) => <ChevronRight className="h-4 w-4" />,
        }}
        {...props}
      />
    </div>
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
